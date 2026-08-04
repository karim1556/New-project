import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { askGroq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, presetAction, apiKey } = body;

    if (!prompt && !presetAction) {
      return NextResponse.json(
        { error: "Prompt or preset action is required." },
        { status: 400 }
      );
    }

    // 1. Fetch live DB state
    const db = await readDb();

    // Create lookup maps for names
    const userNameById: Record<string, string> = {};
    db.users.forEach((u) => {
      userNameById[u.id] = u.name;
    });

    const teamNameById: Record<string, string> = {};
    db.teams.forEach((t) => {
      teamNameById[t.id] = t.name;
    });

    // 2. Prepare structured summary of operational DB
    const memberUsers = db.users.filter((u) => u.role === "member");
    const teams = db.teams;
    const projects = db.projects;
    const dailyLogs = db.dailyLogs;
    const attendance = db.attendance;
    const checkpoints = db.checkpoints;
    const checkpointSubmissions = db.checkpointSubmissions;
    const clubRegistrations = db.clubRegistrations || [];

    // Analyze Attendance (human readable)
    const totalAttendanceRecords = attendance.length;
    const presentRecords = attendance.filter((a) => a.present).length;
    const overallAttendanceRate =
      totalAttendanceRecords > 0
        ? ((presentRecords / totalAttendanceRecords) * 100).toFixed(1)
        : "N/A";

    const attendanceSummary = attendance.slice(0, 15).map((a) => ({
      date: a.date,
      teamName: teamNameById[a.teamId] || a.teamId,
      memberName: userNameById[a.memberId] || a.memberId,
      status: a.present ? "Present" : "Absent"
    }));

    // Analyze Team-Level Daily Logs Activity
    const teamLogCounts: Record<string, number> = {};
    const teamLatestLog: Record<string, string> = {};

    dailyLogs.forEach((log) => {
      const tName = teamNameById[log.teamId] || log.teamId;
      teamLogCounts[tName] = (teamLogCounts[tName] || 0) + 1;
      if (!teamLatestLog[tName]) {
        teamLatestLog[tName] = `${log.date}: ${log.taskCompleted} (${log.timeSpentHours}h)`;
      }
    });

    const teamsWithLogs = teams
      .filter((t) => (teamLogCounts[t.name] || 0) > 0)
      .map((t) => ({
        teamName: t.name,
        logCount: teamLogCounts[t.name],
        latestLog: teamLatestLog[t.name]
      }));

    const teamsWithoutLogs = teams
      .filter((t) => (teamLogCounts[t.name] || 0) === 0)
      .map((t) => t.name);

    // Human readable logs sample
    const logsSample = dailyLogs.slice(0, 15).map((l) => ({
      date: l.date,
      teamName: teamNameById[l.teamId] || l.teamId,
      memberName: userNameById[l.memberId] || l.memberId,
      projectName: l.projectName,
      taskCompleted: l.taskCompleted,
      timeSpentHours: l.timeSpentHours
    }));

    // Analyze Checkpoints
    const pendingSubmissions = checkpointSubmissions
      .filter((s) => s.status === "Pending")
      .map((s) => {
        const cp = checkpoints.find((c) => c.id === s.checkpointId);
        return {
          checkpointTitle: cp ? cp.title : "Checkpoint",
          teamName: teamNameById[s.teamId] || s.teamId,
          submittedByName: userNameById[s.submittedBy] || s.submittedBy,
          evidenceLink: s.evidence,
          submittedAt: s.submittedAt
        };
      });

    const approvedSubmissions = checkpointSubmissions
      .filter((s) => s.status === "Approved")
      .map((s) => {
        const cp = checkpoints.find((c) => c.id === s.checkpointId);
        return {
          checkpointTitle: cp ? cp.title : "Checkpoint",
          teamName: teamNameById[s.teamId] || s.teamId,
          submittedByName: userNameById[s.submittedBy] || s.submittedBy
        };
      });

    // Full teams roster with explicit member names
    const fullTeamsRoster = teams.map((t) => {
      const memberNames = t.memberIds
        .map((id) => userNameById[id] || id)
        .filter(Boolean);
      return {
        teamName: t.name,
        totalMembers: t.memberIds.length,
        members: memberNames
      };
    });

    const fullMembersList = memberUsers.map((u) => ({
      name: u.name,
      teamName: u.teamId ? (teamNameById[u.teamId] || u.teamId) : "No Team",
      role: u.isTeamLeader ? "Team Leader" : "Member"
    }));

    // Build Master System Context
    const systemContext = `
⚡ YOU ARE THE GROQ AI CHIEF OPERATING OFFICER & MASTER HACKATHON STRATEGIST FOR HACKATHON CLUB 2026 ⚡

You are an expert AI Copilot embedded inside the ClubOS Admin Control Center.
You have direct, real-time access to live operational data for 2026 Club Registrations (${clubRegistrations.length} candidates), Active Teams (${teams.length}), Member Users (${memberUsers.length}), Projects (${projects.length}), Attendance records (${totalAttendanceRecords}), Daily Logs (${dailyLogs.length}), and Checkpoints (${checkpoints.length}).

=== CRITICAL STRICT RULES FOR ALL RESPONSES ===
1. NEVER output raw database IDs or UUIDs (such as 'u_...', 't_...', 'p_...', or long hex strings). ALWAYS use the human-readable Team Name and Member Name.
2. Evaluate Daily Logging activity AT THE TEAM LEVEL. In ClubOS, Team Leaders submit daily logs on behalf of their teams. Therefore, report which TEAMS have posted daily logs and which TEAMS have NOT posted daily logs.
3. DO NOT blame or list individual team members for missing logs, because individual team members do not have separate login accounts—only Team Leaders log in for the team.
4. Format all responses using clean, beautiful GitHub-style Markdown (Bold headers, clean Markdown tables, bullet points, status indicators 🟢/🔴/⚡).

=== LIVE DATABASE OPERATIONAL CONTEXT ===
- Total 2026 Club Registrations: ${clubRegistrations.length} candidates
- Total Active Teams: ${teams.length}
- Total Member Accounts: ${memberUsers.length}
- Total Active Projects: ${projects.length}

--- FULL TEAMS ROSTER & MEMBER NAMES ---
${JSON.stringify(fullTeamsRoster, null, 2)}

--- ALL REGISTERED MEMBER ACCOUNTS ---
${JSON.stringify(fullMembersList, null, 2)}

--- TEAM-LEVEL DAILY LOGS SUMMARY ---
- Total Daily Logs Submitted: ${dailyLogs.length}
- TEAMS THAT POSTED DAILY LOGS (${teamsWithLogs.length}): ${JSON.stringify(teamsWithLogs)}
- TEAMS THAT HAVE NOT POSTED DAILY LOGS YET (${teamsWithoutLogs.length}): ${JSON.stringify(teamsWithoutLogs)}
- Recent Team Logs Sample: ${JSON.stringify(logsSample)}

--- ATTENDANCE DATA ANALYTICS ---
- Total Attendance Entries: ${totalAttendanceRecords}
- Present Records: ${presentRecords} | Absent Records: ${totalAttendanceRecords - presentRecords}
- Overall Attendance Rate: ${overallAttendanceRate}%
- Sample Attendance Records: ${JSON.stringify(attendanceSummary)}

--- CHECKPOINTS & SUBMISSIONS AUDIT ---
- Total Checkpoints Created: ${checkpoints.length}
- Pending Submissions Requiring Admin Review (${pendingSubmissions.length}): ${JSON.stringify(pendingSubmissions)}
- Approved Checkpoint Submissions (${approvedSubmissions.length}): ${JSON.stringify(approvedSubmissions)}

--- 2026 RECRUITMENT CANDIDATES SAMPLE (50+ Registrations) ---
${JSON.stringify(
  clubRegistrations.slice(0, 15).map((r) => ({
    name: r.name,
    class: `${r.class}-${r.division}`,
    lang: r.primaryLanguage,
    level: r.codingLevel,
    hackathonExp: r.hackathonExperience,
    idea: r.projectIdea
  }))
)}
`;

    let userQuery = prompt;
    if (presetAction === "attendance") {
      userQuery =
        "Give me a detailed Attendance Insights breakdown across all teams using Team Names and Member Names, and highlight overall attendance statistics.";
    } else if (presetAction === "daily_logs") {
      userQuery =
        "Which teams have posted daily logs and which teams have not posted daily logs yet? Give me a team-level logging summary using team names.";
    } else if (presetAction === "checkpoints") {
      userQuery =
        "What is the status of team checkpoints? Are there any pending submissions that need admin review? Use team names and checkpoint titles.";
    } else if (presetAction === "report") {
      userQuery =
        "Generate a comprehensive Weekly Executive Progress Report covering team daily log activity, attendance, project statuses, and pending checkpoints.";
    }

    const answer = await askGroq(userQuery, systemContext, apiKey);

    return NextResponse.json({ answer, presetAction });
  } catch (err: any) {
    console.error("Groq AI Query Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process Groq AI query." },
      { status: 500 }
    );
  }
}

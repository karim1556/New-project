import { readDb } from "@/lib/db";

export async function getAdminOverview() {
  const db = await readDb();
  const totalTeams = db.teams.length;
  const totalMembers = db.users.filter((u) => u.role === "member").length;
  const activeProjects = db.projects.filter((p) => p.status !== "Completed").length;

  const now = new Date();
  const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const hackathonsThisMonth = db.hackathons.filter((h) => h.date.startsWith(ym)).length;

  const attended = db.attendance.length;
  const present = db.attendance.filter((a) => a.present).length;
  const attendancePct = attended ? Math.round((present / attended) * 100) : 0;

  const recentLogs = db.dailyLogs.slice(0, 6);
  const recentHackathons = db.hackathons
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);
  const teamLogSummary = db.teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    totalLogs: db.dailyLogs.filter((log) => log.teamId === team.id).length,
    totalHackathons: db.hackathons.filter((entry) => entry.teamId === team.id).length
  }));

  return {
    totalTeams,
    totalMembers,
    activeProjects,
    hackathonsThisMonth,
    attendancePct,
    recentLogs,
    recentHackathons,
    teamLogSummary,
    db
  };
}

export async function getLeaderboard() {
  const db = await readDb();

  const teamMap = new Map<string, number>();
  const memberMap = new Map<string, number>();

  db.points.forEach((p) => {
    teamMap.set(p.teamId, (teamMap.get(p.teamId) ?? 0) + p.points);
    if (p.memberId) {
      memberMap.set(p.memberId, (memberMap.get(p.memberId) ?? 0) + p.points);
    }
  });

  const teamRanking = [...teamMap.entries()]
    .map(([teamId, points]) => ({
      teamId,
      teamName: db.teams.find((t) => t.id === teamId)?.name ?? teamId,
      points
    }))
    .sort((a, b) => b.points - a.points);

  const memberRanking = [...memberMap.entries()]
    .map(([memberId, points]) => ({
      memberId,
      memberName: db.users.find((u) => u.id === memberId)?.name ?? memberId,
      points
    }))
    .sort((a, b) => b.points - a.points);

  return { teamRanking, memberRanking };
}

export async function getWeeklyReport() {
  const db = await readDb();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const weekLogs = db.dailyLogs.filter((log) => new Date(log.date) >= weekAgo);
  const weekHackathons = db.hackathons.filter((h) => new Date(h.date) >= weekAgo);
  const weekAttendance = db.attendance.filter((a) => new Date(a.date) >= weekAgo);

  const byTeamTasks = new Map<string, number>();
  const byMemberTasks = new Map<string, number>();

  weekLogs.forEach((log) => {
    byTeamTasks.set(log.teamId, (byTeamTasks.get(log.teamId) ?? 0) + 1);
    byMemberTasks.set(log.memberId, (byMemberTasks.get(log.memberId) ?? 0) + 1);
  });

  const mostActiveTeam = [...byTeamTasks.entries()].sort((a, b) => b[1] - a[1])[0];
  const topContributor = [...byMemberTasks.entries()].sort((a, b) => b[1] - a[1])[0];

  const present = weekAttendance.filter((a) => a.present).length;
  const attendancePct = weekAttendance.length ? Math.round((present / weekAttendance.length) * 100) : 0;

  const teamPerformance = db.teams.map((team) => {
    const teamLogs = weekLogs.filter((log) => log.teamId === team.id);
    const teamAttendance = weekAttendance.filter((row) => row.teamId === team.id);
    const teamPresent = teamAttendance.filter((row) => row.present).length;
    return {
      teamId: team.id,
      teamName: team.name,
      tasksCompleted: teamLogs.length,
      attendancePct: teamAttendance.length
        ? Math.round((teamPresent / teamAttendance.length) * 100)
        : 0,
      hackathons: weekHackathons.filter((h) => h.teamId === team.id).length
    };
  });

  const memberPerformance = db.users
    .filter((u) => u.role === "member")
    .map((member) => ({
      memberId: member.id,
      memberName: member.name,
      teamName: db.teams.find((t) => t.id === member.teamId)?.name ?? "-",
      logsCount: weekLogs.filter((log) => log.memberId === member.id).length
    }))
    .sort((a, b) => b.logsCount - a.logsCount)
    .slice(0, 10);
  const weekHackathonsDetailed = weekHackathons.map((item) => ({
    ...item,
    teamName: db.teams.find((team) => team.id === item.teamId)?.name ?? item.teamId
  }));

  return {
    mostActiveTeam: mostActiveTeam
      ? db.teams.find((t) => t.id === mostActiveTeam[0])?.name ?? mostActiveTeam[0]
      : "No activity",
    tasksCompleted: weekLogs.length,
    attendancePct,
    hackathonsParticipated: weekHackathons.length,
    topContributor: topContributor
      ? db.users.find((u) => u.id === topContributor[0])?.name ?? topContributor[0]
      : "No contributor",
    weekLogs,
    weekHackathons: weekHackathonsDetailed,
    teamPerformance,
    memberPerformance
  };
}

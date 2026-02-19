"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, getCurrentUser, setSession } from "@/lib/auth";
import { makeId, readDb, writeDb } from "@/lib/db";
import { hackathonStatuses, projectStatuses } from "@/lib/constants";
import { HackathonStatus, ProjectStatus } from "@/lib/types";
import { toastError, toastSuccess } from "@/lib/toast";

function asNumber(value: FormDataEntryValue | null, fallback = 0): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  const db = await readDb();

  const user = db.users.find((u) => u.email.toLowerCase() === email && u.password === password);

  if (!user) {
    redirect("/login?error=invalid_credentials");
  }

  if (user.role === "member" && !user.isTeamLeader) {
    redirect("/login?error=leader_only");
  }

  setSession(user.id, user.role);
  redirect(user.role === "admin" ? "/admin" : "/member");
}

export async function logoutAction(): Promise<void> {
  clearSession();
  redirect("/login");
}

export async function createTeamAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    toastError("Unauthorized request.", "/admin/teams");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    toastError("Team name is required.", "/admin/teams");
  }

  const db = await readDb();
  db.teams.push({ id: `t_${randomUUID()}`, name, memberIds: [] });
  await writeDb(db, ["teams"]);
  revalidatePath("/admin/teams");
  revalidatePath("/admin");
  toastSuccess("Team created successfully.", "/admin/teams");
}

export async function createTeamLeaderAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    toastError("Unauthorized request.", "/admin/teams");
  }

  const teamId = String(formData.get("teamId") ?? "").trim();
  const leaderName = String(formData.get("leaderName") ?? "").trim();
  const leaderEmail = String(formData.get("leaderEmail") ?? "").trim().toLowerCase();
  const leaderPassword = String(formData.get("leaderPassword") ?? "").trim();

  if (!teamId || !leaderName || !leaderEmail || !leaderPassword) {
    toastError("All leader fields are required.", "/admin/teams");
  }

  const db = await readDb();
  const team = db.teams.find((t) => t.id === teamId);
  if (!team) {
    toastError("Selected team was not found.", "/admin/teams");
  }

  const existingLeader = db.users.find(
    (u) => u.role === "member" && u.teamId === teamId && u.isTeamLeader
  );
  const userByEmail = db.users.find((u) => u.email.toLowerCase() === leaderEmail);

  if (userByEmail && userByEmail.teamId !== teamId) {
    toastError("Email already belongs to another team.", "/admin/teams");
  }

  if (existingLeader) {
    existingLeader.name = leaderName;
    existingLeader.email = leaderEmail;
    existingLeader.password = leaderPassword;
    existingLeader.isTeamLeader = true;
  } else if (userByEmail) {
    userByEmail.name = leaderName;
    userByEmail.password = leaderPassword;
    userByEmail.role = "member";
    userByEmail.teamId = teamId;
    userByEmail.isTeamLeader = true;
    team.memberIds = Array.from(new Set([...team.memberIds, userByEmail.id]));
  } else {
    const leaderId = `u_${randomUUID()}`;
    db.users.push({
      id: leaderId,
      name: leaderName,
      email: leaderEmail,
      password: leaderPassword,
      role: "member",
      teamId,
      isTeamLeader: true
    });
    team.memberIds = Array.from(new Set([...team.memberIds, leaderId]));
  }

  db.users.forEach((u) => {
    if (u.role === "member" && u.teamId === teamId && u.email.toLowerCase() !== leaderEmail) {
      u.isTeamLeader = false;
    }
  });

  await writeDb(db, ["users", "teams"]);
  revalidatePath("/admin/teams");
  revalidatePath("/admin");
  toastSuccess("Leader login saved for team.", "/admin/teams");
}

export async function createTeamMemberAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId || !current.isTeamLeader) {
    toastError("Only team leader can add members.", "/member/members");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  if (!name || !email || !password) {
    toastError("Name, email and password are required.", "/member/members");
  }

  const db = await readDb();
  const existingEmail = db.users.find((u) => u.email.toLowerCase() === email);
  if (existingEmail) {
    toastError("Email already exists. Use another email.", "/member/members");
  }

  const memberId = makeId("u");
  db.users.push({
    id: memberId,
    name,
    email,
    password,
    role: "member",
    teamId: current.teamId,
    isTeamLeader: false
  });

  const team = db.teams.find((item) => item.id === current.teamId);
  if (team) {
    team.memberIds = Array.from(new Set([...team.memberIds, memberId]));
  }

  await writeDb(db, ["users", "teams"]);
  revalidatePath("/member/members");
  revalidatePath("/member");
  revalidatePath("/admin/teams");
  revalidatePath("/admin");
  toastSuccess("Team member added successfully.", "/member/members");
}

export async function markAttendanceAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    toastError("Unauthorized request.", "/admin/attendance");
  }

  const date = String(formData.get("date") ?? "").trim();
  if (!date) {
    toastError("Attendance date is required.", "/admin/attendance");
  }

  const db = await readDb();
  const teamIds = new Set(db.teams.map((t) => t.id));

  db.attendance = db.attendance.filter((entry) => entry.date !== date);

  db.users
    .filter((u) => u.role === "member" && u.teamId && teamIds.has(u.teamId))
    .forEach((member) => {
      const mode = String(formData.get(`mode_${member.teamId}`) ?? "custom");
      const present =
        mode === "present"
          ? true
          : mode === "absent"
            ? false
            : formData.get(`member_${member.id}`) === "on";
      db.attendance.push({
        id: makeId("at"),
        date,
        teamId: member.teamId!,
        memberId: member.id,
        present
      });
    });

  await writeDb(db, ["attendance"]);
  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
  toastSuccess("Attendance saved.", "/admin/attendance");
}

export async function createAnnouncementAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    toastError("Unauthorized request.", "/admin/announcements");
  }

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const importance = String(formData.get("importance") ?? "normal").trim().toLowerCase();
  if (!title || !message) {
    toastError("Title and message are required.", "/admin/announcements");
  }

  const titlePrefix =
    importance === "critical"
      ? "[CRITICAL] "
      : importance === "reminder"
        ? "[REMINDER] "
        : "";

  const db = await readDb();
  db.announcements.unshift({
    id: makeId("an"),
    title: `${titlePrefix}${title}`,
    message,
    createdAt: new Date().toISOString(),
    createdBy: current.id
  });

  await writeDb(db, ["announcements"]);
  revalidatePath("/admin/announcements");
  revalidatePath("/member/announcements");
  revalidatePath("/member");
  revalidatePath("/admin");
  toastSuccess("Announcement posted.", "/admin/announcements");
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId) {
    toastError("Unauthorized request.", "/member/projects");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();
  const hackathonName = String(formData.get("hackathonName") ?? "").trim();
  const progress = asNumber(formData.get("progress"), 0);
  const statusRaw = String(formData.get("status") ?? "Planning");

  if (!title || !description || !startDate || !deadline) {
    toastError("Please fill all required project fields.", "/member/projects");
  }
  const status: ProjectStatus = projectStatuses.includes(statusRaw as ProjectStatus)
    ? (statusRaw as ProjectStatus)
    : "Planning";

  const db = await readDb();
  const exists = db.projects.some(
    (project) =>
      project.teamId === current.teamId && project.title.toLowerCase() === title.toLowerCase()
  );
  if (exists) {
    toastError("Project with same title already exists.", "/member/projects");
  }

  db.projects.push({
    id: makeId("p"),
    teamId: current.teamId,
    title,
    description,
    startDate,
    deadline,
    hackathonName: hackathonName || undefined,
    progress: Math.max(0, Math.min(100, progress)),
    status
  });

  await writeDb(db, ["projects"]);
  revalidatePath("/member/projects");
  revalidatePath("/member");
  revalidatePath("/admin");
  toastSuccess("Project created.", "/member/projects");
}

export async function updateProjectProgressAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId) {
    toastError("Unauthorized request.", "/member/projects");
  }

  const projectId = String(formData.get("projectId") ?? "").trim();
  const progress = asNumber(formData.get("progress"), 0);
  const statusRaw = String(formData.get("status") ?? "Development");
  const summary = String(formData.get("summary") ?? "").trim();
  const updateDate = String(formData.get("updateDate") ?? "").trim();

  if (!projectId || !summary || !updateDate) {
    toastError("Project, summary and update date are required.", "/member/projects");
  }
  const status: ProjectStatus = projectStatuses.includes(statusRaw as ProjectStatus)
    ? (statusRaw as ProjectStatus)
    : "Development";

  const db = await readDb();
  const project = db.projects.find((item) => item.id === projectId && item.teamId === current.teamId);
  if (!project) {
    toastError("Selected project not found.", "/member/projects");
  }

  project.progress = Math.max(0, Math.min(100, progress));
  project.status = status;

  db.dailyLogs.unshift({
    id: makeId("d"),
    teamId: current.teamId,
    memberId: current.id,
    date: updateDate,
    projectName: project.title,
    taskCompleted: summary,
    timeSpentHours: asNumber(formData.get("timeSpentHours"), 0),
    progressPercent: project.progress,
    notes: String(formData.get("notes") ?? "").trim()
  });

  await writeDb(db, ["projects", "dailyLogs"]);
  revalidatePath("/member/projects");
  revalidatePath("/member/daily-logs");
  revalidatePath("/member");
  revalidatePath("/admin");
  toastSuccess("Project update saved.", "/member/projects");
}

export async function createDailyLogAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId) {
    toastError("Unauthorized request.", "/member/daily-logs");
  }

  const date = String(formData.get("date") ?? "").trim();
  const projectName = String(formData.get("projectName") ?? "").trim();
  const taskCompleted = String(formData.get("taskCompleted") ?? "").trim();
  const timeSpentHours = asNumber(formData.get("timeSpentHours"), 0);
  const progressPercent = asNumber(formData.get("progressPercent"), 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!date || !projectName || !taskCompleted) {
    toastError("Date, project name and task are required.", "/member/daily-logs");
  }

  const db = await readDb();
  db.dailyLogs.unshift({
    id: makeId("d"),
    teamId: current.teamId,
    memberId: current.id,
    date,
    projectName,
    taskCompleted,
    timeSpentHours,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    notes
  });

  await writeDb(db, ["dailyLogs"]);
  revalidatePath("/member/daily-logs");
  revalidatePath("/member");
  revalidatePath("/admin");
  toastSuccess("Daily log submitted.", "/member/daily-logs");
}

export async function createHackathonAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId) {
    toastError("Unauthorized request.", "/member/hackathons");
  }

  const hackathonName = String(formData.get("hackathonName") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "Registered");
  const resultNotes = String(formData.get("resultNotes") ?? "").trim();
  const memberCsv = String(formData.get("participantIds") ?? "").trim();

  if (!hackathonName || !platform || !date) {
    toastError("Hackathon name, platform and date are required.", "/member/hackathons");
  }

  const status: HackathonStatus = hackathonStatuses.includes(statusRaw as HackathonStatus)
    ? (statusRaw as HackathonStatus)
    : "Registered";
  const participantIds = memberCsv
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const db = await readDb();
  const teamMemberIds = db.users
    .filter((u) => u.role === "member" && u.teamId === current.teamId)
    .map((u) => u.id);

  const sanitizedParticipants = Array.from(new Set(participantIds)).filter((id) =>
    teamMemberIds.includes(id)
  );

  db.hackathons.unshift({
    id: makeId("h"),
    teamId: current.teamId,
    hackathonName,
    platform,
    date,
    status,
    resultNotes,
    participatingMemberIds:
      sanitizedParticipants.length > 0
        ? sanitizedParticipants
        : current.teamId
          ? db.teams.find((t) => t.id === current.teamId)?.memberIds ?? [current.id]
          : [current.id]
  });

  await writeDb(db, ["hackathons"]);
  revalidatePath("/member/hackathons");
  revalidatePath("/member");
  revalidatePath("/admin");
  toastSuccess("Hackathon entry saved.", "/member/hackathons");
}

export async function createFileAttachmentAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId) {
    toastError("Unauthorized request.", "/member/uploads");
  }

  const targetType = String(formData.get("targetType") ?? "").trim();
  const targetId = String(formData.get("targetId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();

  if (!targetType || !targetId || !label || !fileUrl) {
    toastError("All upload fields are required.", "/member/uploads");
  }
  if (targetType !== "project" && targetType !== "hackathon") {
    toastError("Invalid target type.", "/member/uploads");
  }

  const db = await readDb();
  db.files.unshift({
    id: makeId("f"),
    teamId: current.teamId,
    memberId: current.id,
    targetType,
    targetId,
    label,
    fileUrl,
    createdAt: new Date().toISOString()
  });

  await writeDb(db, ["files"]);
  revalidatePath("/member/uploads");
  revalidatePath("/member");
  toastSuccess("File link attached.", "/member/uploads");
}

export async function assignPointsAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    toastError("Unauthorized request.", "/admin/leaderboard");
  }

  const teamId = String(formData.get("teamId") ?? "").trim();
  const memberId = String(formData.get("memberId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const points = asNumber(formData.get("points"), 0);

  if (!teamId || !reason || points <= 0) {
    toastError("Team, reason and valid points are required.", "/admin/leaderboard");
  }

  const db = await readDb();
  db.points.unshift({
    id: makeId("pt"),
    teamId,
    memberId: memberId || undefined,
    reason,
    points,
    createdAt: new Date().toISOString(),
    createdBy: current.id
  });

  await writeDb(db, ["points"]);
  revalidatePath("/admin/leaderboard");
  revalidatePath("/admin");
  toastSuccess("Points assigned.", "/admin/leaderboard");
}

export async function createCheckpointAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    toastError("Unauthorized request.", "/admin/checkpoints");
  }

  const teamId = String(formData.get("teamId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const points = asNumber(formData.get("points"), 0);

  if (!teamId || !title || !description || !dueDate || points <= 0) {
    toastError("All checkpoint fields are required.", "/admin/checkpoints");
  }

  const db = await readDb();
  db.checkpoints.unshift({
    id: makeId("cp"),
    teamId,
    title,
    description,
    dueDate,
    points,
    createdAt: new Date().toISOString(),
    createdBy: current.id
  });

  await writeDb(db, ["checkpoints"]);
  revalidatePath("/admin/checkpoints");
  revalidatePath("/member/checkpoints");
  toastSuccess("Checkpoint created.", "/admin/checkpoints");
}

export async function submitCheckpointAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId || !current.isTeamLeader) {
    toastError("Only team leader can submit checkpoints.", "/member/checkpoints");
  }

  const checkpointId = String(formData.get("checkpointId") ?? "").trim();
  const evidence = String(formData.get("evidence") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!checkpointId || !evidence) {
    toastError("Checkpoint and evidence link are required.", "/member/checkpoints");
  }

  const db = await readDb();
  const checkpoint = db.checkpoints.find((item) => item.id === checkpointId && item.teamId === current.teamId);
  if (!checkpoint) {
    toastError("Checkpoint not found for your team.", "/member/checkpoints");
  }

  const existing = db.checkpointSubmissions.find(
    (item) => item.checkpointId === checkpointId && item.teamId === current.teamId
  );

  if (existing) {
    existing.evidence = evidence;
    existing.notes = notes;
    existing.submittedAt = new Date().toISOString();
    existing.status = "Pending";
    existing.reviewedBy = undefined;
    existing.reviewedAt = undefined;
    existing.reviewNotes = undefined;
  } else {
    db.checkpointSubmissions.unshift({
      id: makeId("cps"),
      checkpointId,
      teamId: current.teamId,
      submittedBy: current.id,
      evidence,
      notes,
      submittedAt: new Date().toISOString(),
      status: "Pending"
    });
  }

  await writeDb(db, ["checkpointSubmissions"]);
  revalidatePath("/member/checkpoints");
  revalidatePath("/admin/checkpoints");
  toastSuccess("Checkpoint submitted for review.", "/member/checkpoints");
}

export async function reviewCheckpointAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") {
    toastError("Unauthorized request.", "/admin/checkpoints");
  }

  const submissionId = String(formData.get("submissionId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const reviewNotes = String(formData.get("reviewNotes") ?? "").trim();
  if (!submissionId || (status !== "Approved" && status !== "Rejected")) {
    toastError("Invalid review request.", "/admin/checkpoints");
  }

  const db = await readDb();
  const submission = db.checkpointSubmissions.find((item) => item.id === submissionId);
  if (!submission) {
    toastError("Submission not found.", "/admin/checkpoints");
  }

  const checkpoint = db.checkpoints.find((item) => item.id === submission.checkpointId);
  if (!checkpoint) {
    toastError("Checkpoint not found.", "/admin/checkpoints");
  }

  submission.status = status;
  submission.reviewedBy = current.id;
  submission.reviewedAt = new Date().toISOString();
  submission.reviewNotes = reviewNotes;

  if (status === "Approved" && !submission.awardedPointId) {
    const pointId = makeId("pt");
    db.points.unshift({
      id: pointId,
      teamId: submission.teamId,
      reason: `Checkpoint: ${checkpoint.title}`,
      points: checkpoint.points,
      createdAt: new Date().toISOString(),
      createdBy: current.id
    });
    submission.awardedPointId = pointId;
  }

  await writeDb(db, ["checkpointSubmissions", "points"]);
  revalidatePath("/admin/checkpoints");
  revalidatePath("/admin/leaderboard");
  toastSuccess("Checkpoint review saved.", "/admin/checkpoints");
}

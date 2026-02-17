"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, getCurrentUser, setSession } from "@/lib/auth";
import { makeId, readDb, writeDb } from "@/lib/db";
import { hackathonStatuses, projectStatuses } from "@/lib/constants";
import { HackathonStatus, ProjectStatus } from "@/lib/types";

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

  setSession(user.id, user.role);
  redirect(user.role === "admin" ? "/admin" : "/member");
}

export async function logoutAction(): Promise<void> {
  clearSession();
  redirect("/login");
}

export async function createTeamAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const db = await readDb();
  db.teams.push({ id: makeId("t"), name, memberIds: [] });
  await writeDb(db);
  revalidatePath("/admin/teams");
  revalidatePath("/admin");
}

export async function markAttendanceAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") return;

  const date = String(formData.get("date") ?? "").trim();
  if (!date) return;

  const db = await readDb();
  const teamIds = new Set(db.teams.map((t) => t.id));

  db.attendance = db.attendance.filter((entry) => entry.date !== date);

  db.users
    .filter((u) => u.role === "member" && u.teamId && teamIds.has(u.teamId))
    .forEach((member) => {
      const present = formData.get(`member_${member.id}`) === "on";
      db.attendance.push({
        id: makeId("at"),
        date,
        teamId: member.teamId!,
        memberId: member.id,
        present
      });
    });

  await writeDb(db);
  revalidatePath("/admin/attendance");
  revalidatePath("/admin");
}

export async function createAnnouncementAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "admin") return;

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!title || !message) return;

  const db = await readDb();
  db.announcements.unshift({
    id: makeId("an"),
    title,
    message,
    createdAt: new Date().toISOString(),
    createdBy: current.id
  });

  await writeDb(db);
  revalidatePath("/admin/announcements");
  revalidatePath("/member/announcements");
  revalidatePath("/member");
  revalidatePath("/admin");
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId) return;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();
  const hackathonName = String(formData.get("hackathonName") ?? "").trim();
  const progress = asNumber(formData.get("progress"), 0);
  const statusRaw = String(formData.get("status") ?? "Planning");

  if (!title || !description || !startDate || !deadline) return;
  const status: ProjectStatus = projectStatuses.includes(statusRaw as ProjectStatus)
    ? (statusRaw as ProjectStatus)
    : "Planning";

  const db = await readDb();
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

  db.points.push({
    id: makeId("pt"),
    teamId: current.teamId,
    memberId: current.id,
    reason: "Project update",
    points: 8,
    createdAt: new Date().toISOString()
  });

  await writeDb(db);
  revalidatePath("/member/projects");
  revalidatePath("/member");
  revalidatePath("/admin");
}

export async function createDailyLogAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId) return;

  const date = String(formData.get("date") ?? "").trim();
  const projectName = String(formData.get("projectName") ?? "").trim();
  const taskCompleted = String(formData.get("taskCompleted") ?? "").trim();
  const timeSpentHours = asNumber(formData.get("timeSpentHours"), 0);
  const progressPercent = asNumber(formData.get("progressPercent"), 0);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!date || !projectName || !taskCompleted) return;

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

  db.points.push({
    id: makeId("pt"),
    teamId: current.teamId,
    memberId: current.id,
    reason: "Daily activity",
    points: 5,
    createdAt: new Date().toISOString()
  });

  await writeDb(db);
  revalidatePath("/member/daily-logs");
  revalidatePath("/member");
  revalidatePath("/admin");
}

export async function createHackathonAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId) return;

  const hackathonName = String(formData.get("hackathonName") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "Registered");
  const resultNotes = String(formData.get("resultNotes") ?? "").trim();
  const memberCsv = String(formData.get("participantIds") ?? "").trim();

  if (!hackathonName || !platform || !date) return;

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

  db.points.push({
    id: makeId("pt"),
    teamId: current.teamId,
    memberId: current.id,
    reason: status === "Won" ? "Hackathon win" : "Hackathon participation",
    points: status === "Won" ? 50 : 20,
    createdAt: new Date().toISOString()
  });

  await writeDb(db);
  revalidatePath("/member/hackathons");
  revalidatePath("/member");
  revalidatePath("/admin");
}

export async function createFileAttachmentAction(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (!current || current.role !== "member" || !current.teamId) return;

  const targetType = String(formData.get("targetType") ?? "").trim();
  const targetId = String(formData.get("targetId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim();

  if (!targetType || !targetId || !label || !fileUrl) return;
  if (targetType !== "project" && targetType !== "hackathon") return;

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

  await writeDb(db);
  revalidatePath("/member/uploads");
  revalidatePath("/member");
}

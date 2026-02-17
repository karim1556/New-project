import { Database } from "@/lib/types";
import { hasSupabaseConfig, supabaseRequest } from "@/lib/supabase";
import { getDemoDb } from "@/lib/seed";

type TableData<T> = T[];

export async function readDb(): Promise<Database> {
  if (!hasSupabaseConfig()) {
    return getDemoDb();
  }

  try {
    const [
      users,
      teams,
      projects,
      dailyLogs,
      hackathons,
      attendance,
      announcements,
      files,
      points,
      checkpoints,
      checkpointSubmissions
    ] = await Promise.all([
      supabaseRequest<Database["users"]>("users", { method: "GET", query: "select=*" }),
      supabaseRequest<Database["teams"]>("teams", { method: "GET", query: "select=*" }),
      supabaseRequest<Database["projects"]>("projects", { method: "GET", query: "select=*" }),
      supabaseRequest<Database["dailyLogs"]>("daily_logs", { method: "GET", query: "select=*" }),
      supabaseRequest<Database["hackathons"]>("hackathons", { method: "GET", query: "select=*" }),
      supabaseRequest<Database["attendance"]>("attendance", { method: "GET", query: "select=*" }),
      supabaseRequest<Database["announcements"]>("announcements", {
        method: "GET",
        query: "select=*"
      }),
      supabaseRequest<Database["files"]>("files", { method: "GET", query: "select=*" }),
      supabaseRequest<Database["points"]>("points", { method: "GET", query: "select=*" }),
      supabaseRequest<Database["checkpoints"]>("checkpoints", { method: "GET", query: "select=*" }),
      supabaseRequest<Database["checkpointSubmissions"]>("checkpoint_submissions", {
        method: "GET",
        query: "select=*"
      })
    ]);

    const db = {
      users,
      teams,
      projects,
      dailyLogs,
      hackathons,
      attendance,
      announcements,
      files,
      points,
      checkpoints,
      checkpointSubmissions
    };

    // If Supabase is connected but unseeded, keep demo login and UI usable.
    if (db.users.length === 0) {
      return getDemoDb();
    }

    return db;
  } catch {
    return getDemoDb();
  }
}

export async function writeDb(db: Database): Promise<void> {
  if (!hasSupabaseConfig()) {
    // Demo mode without Supabase: no persistence.
    return;
  }

  async function replaceTable<T extends { id: string }>(
    table: string,
    rows: TableData<T>
  ): Promise<void> {
    await supabaseRequest<unknown>(table, {
      method: "DELETE",
      query: "id=not.is.null",
      headers: { Prefer: "return=minimal" }
    });

    if (rows.length > 0) {
      await supabaseRequest<unknown>(table, {
        method: "POST",
        body: JSON.stringify(rows),
        headers: { Prefer: "return=minimal" }
      });
    }
  }

  await replaceTable("users", db.users);
  await replaceTable("teams", db.teams);
  await replaceTable("projects", db.projects);
  await replaceTable("daily_logs", db.dailyLogs);
  await replaceTable("hackathons", db.hackathons);
  await replaceTable("attendance", db.attendance);
  await replaceTable("announcements", db.announcements);
  await replaceTable("files", db.files);
  await replaceTable("points", db.points);
  await replaceTable("checkpoints", db.checkpoints);
  await replaceTable("checkpoint_submissions", db.checkpointSubmissions);
}

export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

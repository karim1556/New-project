import { Database } from "@/lib/types";
import { hasSupabaseConfig, supabaseRequest } from "@/lib/supabase";
import { getDemoDb } from "@/lib/seed";

type TableData<T> = T[];
type DbTableKey = keyof Pick<
  Database,
  | "users"
  | "teams"
  | "projects"
  | "dailyLogs"
  | "hackathons"
  | "attendance"
  | "announcements"
  | "files"
  | "points"
  | "checkpoints"
  | "checkpointSubmissions"
>;

const tableNameByKey: Record<DbTableKey, string> = {
  users: "users",
  teams: "teams",
  projects: "projects",
  dailyLogs: "daily_logs",
  hackathons: "hackathons",
  attendance: "attendance",
  announcements: "announcements",
  files: "files",
  points: "points",
  checkpoints: "checkpoints",
  checkpointSubmissions: "checkpoint_submissions"
};

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

export async function writeDb(db: Database, tables?: DbTableKey[]): Promise<void> {
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
      // Supabase/PostgREST requires all objects in a bulk insert to have the same keys.
      // Normalize rows so every object contains the same set of keys (missing keys set to null).
      const allKeys = new Set<string>();
      rows.forEach((r) => Object.keys(r as any).forEach((k) => allKeys.add(k)));
      const keys = Array.from(allKeys);

      const normalized = rows.map((r) => {
        const obj: Record<string, unknown> = {};
        for (const k of keys) {
          // If property exists on the row, keep it, otherwise set explicit null
          obj[k] = Object.prototype.hasOwnProperty.call(r as any, k) ? (r as any)[k] : null;
        }
        return obj;
      });

      await supabaseRequest<unknown>(table, {
        method: "POST",
        body: JSON.stringify(normalized),
        headers: { Prefer: "return=minimal" }
      });
    }
  }

  const targetTables: DbTableKey[] =
    tables && tables.length > 0
      ? tables
      : [
          "users",
          "teams",
          "projects",
          "dailyLogs",
          "hackathons",
          "attendance",
          "announcements",
          "files",
          "points",
          "checkpoints",
          "checkpointSubmissions"
        ];

  for (const table of targetTables) {
    await replaceTable(tableNameByKey[table], db[table] as TableData<{ id: string }>);
  }
}

export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

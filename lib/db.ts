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
  | "clubRegistrations"
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
  checkpointSubmissions: "checkpoint_submissions",
  clubRegistrations: "club_registrations"
};

let isDemoFallback = false;

export async function readDb(): Promise<Database> {
  if (!hasSupabaseConfig()) {
    isDemoFallback = true;
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
      checkpointSubmissions,
      clubRegistrations
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
      }),
      supabaseRequest<NonNullable<Database["clubRegistrations"]>>("club_registrations", {
        method: "GET",
        query: "select=*"
      }).catch(() => [])
    ]);

    isDemoFallback = false;

    return {
      users: users ?? [],
      teams: teams ?? [],
      projects: projects ?? [],
      dailyLogs: dailyLogs ?? [],
      hackathons: hackathons ?? [],
      attendance: attendance ?? [],
      announcements: announcements ?? [],
      files: files ?? [],
      points: points ?? [],
      checkpoints: checkpoints ?? [],
      checkpointSubmissions: checkpointSubmissions ?? [],
      clubRegistrations: clubRegistrations ?? []
    };
  } catch (err) {
    console.error("Supabase readDb connection failed, falling back to demo DB:", err);
    isDemoFallback = true;
    return getDemoDb();
  }
}

export async function writeDb(db: Database, tables?: DbTableKey[]): Promise<void> {
  if (!hasSupabaseConfig() || isDemoFallback) {
    // Demo mode or fallback: do not overwrite Supabase DB
    return;
  }

  async function upsertTable<T extends { id: string }>(
    table: string,
    rows: TableData<T>
  ): Promise<void> {
    if (!rows || rows.length === 0) return;

    const allKeys = new Set<string>();
    rows.forEach((r) => Object.keys(r as any).forEach((k) => allKeys.add(k)));
    const keys = Array.from(allKeys);

    const normalized = rows.map((r) => {
      const obj: Record<string, unknown> = {};
      for (const k of keys) {
        obj[k] = Object.prototype.hasOwnProperty.call(r as any, k) ? (r as any)[k] : null;
      }
      return obj;
    });

    await supabaseRequest<unknown>(table, {
      method: "POST",
      query: "on_conflict=id",
      body: JSON.stringify(normalized),
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" }
    });
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
          "checkpointSubmissions",
          "clubRegistrations"
        ];

  for (const table of targetTables) {
    await upsertTable(tableNameByKey[table], db[table] as TableData<{ id: string }>);
  }
}

export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

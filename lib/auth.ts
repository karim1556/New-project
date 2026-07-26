import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDb } from "@/lib/db";
import { Role, User } from "@/lib/types";

const COOKIE_NAME = "club_session";

export type Session = {
  userId: string;
  role: Role;
};

export function getSession(): Session | null {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  if (!cookie) return null;

  const [userId, role] = cookie.split(":");
  if (!userId || (role !== "admin" && role !== "member")) return null;

  return { userId, role };
}

export async function getCurrentUser(): Promise<User | null> {
  const session = getSession();
  if (!session) return null;
  const db = await readDb();
  return db.users.find((u) => u.id === session.userId) ?? null;
}

export function setSession(userId: string, role: Role): void {
  cookies().set(COOKIE_NAME, `${userId}:${role}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

export function clearSession(): void {
  cookies().delete(COOKIE_NAME);
}

export function requireRole(role: Role): Session {
  const session = getSession();
  if (!session || session.role !== role) {
    redirect("/login");
  }
  return session;
}

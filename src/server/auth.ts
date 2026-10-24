import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { getDb, schema as s } from "./db";
import { newToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "lsd_session";
export const VISITOR_COOKIE = "lsd_vid";
const SESSION_DAYS = 30;

export type SessionUser = { id: string; email: string; name: string; role: string; phone: string | null; marketing: boolean; address: Record<string, string> | null; createdAt: Date };

export async function createSession(userId: string) {
  const db = await getDb();
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(s.sessions).values({ id: sha256(token), userId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(s.sessions).where(eq(s.sessions.id, sha256(token)));
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const rows = await db
    .select({ id: s.users.id, email: s.users.email, name: s.users.name, role: s.users.role, phone: s.users.phone, marketing: s.users.marketing, address: s.users.address, createdAt: s.users.createdAt })
    .from(s.sessions)
    .innerJoin(s.users, eq(s.sessions.userId, s.users.id))
    .where(and(eq(s.sessions.id, sha256(token)), gt(s.sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

/** Server-component guard for /admin. */
export async function requireAdmin(next = "/admin") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.role !== "admin") redirect("/account");
  return user;
}

/** API guard: returns the admin or null. */
export async function adminOrNull() {
  const u = await getCurrentUser();
  return u?.role === "admin" ? u : null;
}

export async function visitorId() {
  const v = (await cookies()).get(VISITOR_COOKIE)?.value;
  return v && /^[0-9a-f-]{36}$/i.test(v) ? v : null;
}

export const isEmail = (e: unknown): e is string => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 200;

import { eq } from "drizzle-orm";
import { getDb, schema as s } from "@/server/db";
import { createSession } from "@/server/auth";
import { verifyPassword } from "@/server/crypto";
import { linkVisitor, rateLimit, recordEvent } from "@/server/track";
import { body, fail, ok, str } from "@/server/http";

export async function POST(req: Request) {
  if (!(await rateLimit("login", 10))) return fail("Too many attempts. Please wait a minute.", 429);
  const b = await body(req);
  const email = str(b?.email).toLowerCase();
  const password = typeof b?.password === "string" ? b.password : "";
  const db = await getDb();
  const [user] = await db.select().from(s.users).where(eq(s.users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) return fail("Email or password is incorrect.", 401);

  await createSession(user.id);
  await db.update(s.users).set({ lastSeenAt: new Date() }).where(eq(s.users.id, user.id));
  if (user.role !== "admin") {
    await linkVisitor(user.id);
    await recordEvent("login", { userId: user.id });
  }
  return ok({ ok: true, role: user.role });
}

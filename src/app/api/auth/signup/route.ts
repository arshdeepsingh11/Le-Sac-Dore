import { eq } from "drizzle-orm";
import { getDb, schema as s } from "@/server/db";
import { createSession, isEmail } from "@/server/auth";
import { hashPassword } from "@/server/crypto";
import { linkVisitor, rateLimit, recordEvent } from "@/server/track";
import { body, fail, ok, str } from "@/server/http";

export async function POST(req: Request) {
  if (!(await rateLimit("signup", 8))) return fail("Too many attempts. Please wait a minute.", 429);
  const b = await body(req);
  const name = str(b?.name, 80);
  const email = str(b?.email).toLowerCase();
  const password = typeof b?.password === "string" ? b.password : "";
  const marketing = b?.marketing === true;

  if (name.length < 2) return fail("Please enter your name.");
  if (!isEmail(email)) return fail("Please enter a valid email address.");
  if (password.length < 8) return fail("Your password needs at least 8 characters.");

  const db = await getDb();
  const exists = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.email, email)).limit(1);
  if (exists.length) return fail("An account with this email already exists. Please sign in.", 409);

  const role = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === email ? "admin" : "customer";
  const [user] = await db.insert(s.users).values({ name, email, passwordHash: await hashPassword(password), marketing, role, lastSeenAt: new Date() }).returning({ id: s.users.id });
  if (marketing) await db.insert(s.subscribers).values({ email, source: "signup" }).onConflictDoNothing();

  await createSession(user.id);
  await linkVisitor(user.id);
  await recordEvent("signup", { userId: user.id });
  return ok({ ok: true });
}

import { getDb, schema as s } from "@/server/db";
import { isEmail } from "@/server/auth";
import { rateLimit, recordEvent } from "@/server/track";
import { body, fail, ok, str } from "@/server/http";

export async function POST(req: Request) {
  if (!(await rateLimit("news", 5))) return fail("Too many requests.", 429);
  const b = await body(req);
  const email = str(b?.email).toLowerCase();
  if (!isEmail(email)) return fail("Please enter a valid email address.");
  const db = await getDb();
  await db.insert(s.subscribers).values({ email, source: str(b?.source, 20) || "footer" }).onConflictDoNothing();
  await recordEvent("newsletter_signup", { meta: { source: str(b?.source, 20) || "footer" } });
  return ok();
}

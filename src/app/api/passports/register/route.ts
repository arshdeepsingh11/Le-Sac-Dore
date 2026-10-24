import { eq } from "drizzle-orm";
import { getDb, schema as s } from "@/server/db";
import { getCurrentUser } from "@/server/auth";
import { recordEvent } from "@/server/track";
import { body, fail, ok, str } from "@/server/http";

/** Register a bag to your account using the serial on its authentication card. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.", 401);
  const serial = str((await body(req))?.serial, 40).toUpperCase();
  const db = await getDb();
  const [p] = await db.select().from(s.passports).where(eq(s.passports.serial, serial)).limit(1);
  if (!p || p.isSample) return fail("We couldn't find that serial. Check the number on your authentication card.", 404);
  if (p.ownerUserId && p.ownerUserId !== user.id) return fail("This bag is already registered to another client. Contact Client Services to transfer it.", 409);
  const today = new Date().toISOString().slice(0, 10);
  await db
    .update(s.passports)
    .set({ ownerUserId: user.id, registeredAt: new Date(), history: [...p.history, { date: today, type: "REGISTERED", note: "Registered to its owner. Two-year warranty active." }] })
    .where(eq(s.passports.serial, serial));
  await recordEvent("passport_register", { userId: user.id, productId: p.productId, meta: { serial } });
  return ok({ serial });
}

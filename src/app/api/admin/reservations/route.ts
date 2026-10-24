import { eq } from "drizzle-orm";
import { getDb, schema as s } from "@/server/db";
import { adminOrNull } from "@/server/auth";
import { body, fail, ok } from "@/server/http";

export async function PATCH(req: Request) {
  if (!(await adminOrNull())) return fail("Forbidden", 403);
  const b = await body(req);
  const status = String(b?.status ?? "");
  if (!["requested", "confirmed", "completed", "cancelled"].includes(status)) return fail("Invalid status.");
  const db = await getDb();
  const [r] = await db.update(s.reservations).set({ status }).where(eq(s.reservations.id, String(b?.id ?? ""))).returning({ id: s.reservations.id });
  return r ? ok() : fail("Not found.", 404);
}

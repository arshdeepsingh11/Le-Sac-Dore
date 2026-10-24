import { eq } from "drizzle-orm";
import { getDb, schema as s } from "@/server/db";
import { adminOrNull } from "@/server/auth";
import { body, fail, ok } from "@/server/http";

const LABEL = ["RECEIVED", "PREPARED", "SHIPPED", "DELIVERED"];

/** Update fulfilment status; shipping and delivery are written into each bag's passport history. */
export async function PATCH(req: Request) {
  if (!(await adminOrNull())) return fail("Forbidden", 403);
  const b = await body(req);
  const id = String(b?.id ?? "");
  const status = Number(b?.status);
  if (!id || !(status >= 0 && status <= 3)) return fail("Invalid request.");
  const db = await getDb();
  const [o] = await db.update(s.orders).set({ status }).where(eq(s.orders.id, id)).returning();
  if (!o) return fail("Order not found.", 404);
  if (status >= 2) {
    const today = new Date().toISOString().slice(0, 10);
    const ps = await db.select().from(s.passports).where(eq(s.passports.orderId, id));
    for (const p of ps) {
      if (p.history.some((h) => h.type === LABEL[status])) continue;
      await db.update(s.passports).set({ history: [...p.history, { date: today, type: LABEL[status], note: status === 2 ? `Shipped with order ${o.number}.` : "Delivered to its owner." }] }).where(eq(s.passports.serial, p.serial));
    }
  }
  return ok();
}

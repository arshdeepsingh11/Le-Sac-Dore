import { desc, eq, inArray } from "drizzle-orm";
import { getDb, schema as s } from "@/server/db";
import { getCurrentUser } from "@/server/auth";
import { body, fail, ok, str } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return ok({ user: null });
  const db = await getDb();
  const [wish, orders, reservations, passports] = await Promise.all([
    db.select({ productId: s.wishlist.productId }).from(s.wishlist).where(eq(s.wishlist.userId, user.id)).orderBy(desc(s.wishlist.createdAt)),
    db.select().from(s.orders).where(eq(s.orders.userId, user.id)).orderBy(desc(s.orders.createdAt)),
    db.select().from(s.reservations).where(eq(s.reservations.userId, user.id)).orderBy(desc(s.reservations.createdAt)),
    db.select({ serial: s.passports.serial, productId: s.passports.productId, color: s.passports.color, orderId: s.passports.orderId }).from(s.passports).where(eq(s.passports.ownerUserId, user.id)),
  ]);
  const items = orders.length ? await db.select().from(s.orderItems).where(inArray(s.orderItems.orderId, orders.map((o) => o.id))) : [];
  return ok({
    user,
    wishlist: wish.map((w) => w.productId),
    orders: orders.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id), passports: passports.filter((p) => p.orderId === o.id).map((p) => p.serial) })),
    reservations,
    passports,
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.", 401);
  const b = await body(req);
  const patch: Partial<typeof s.users.$inferInsert> = {};
  if (b?.name !== undefined) {
    const name = str(b.name, 80);
    if (name.length < 2) return fail("Please enter your name.");
    patch.name = name;
  }
  if (b?.phone !== undefined) patch.phone = str(b.phone, 30) || null;
  if (b?.marketing !== undefined) patch.marketing = b.marketing === true;
  if (b?.address && typeof b.address === "object") {
    const a = b.address as Record<string, unknown>;
    patch.address = Object.fromEntries(["address", "city", "province", "postal", "country"].map((k) => [k, str(a[k], 120)]));
  }
  const db = await getDb();
  await db.update(s.users).set(patch).where(eq(s.users.id, user.id));
  if (patch.marketing === true) await db.insert(s.subscribers).values({ email: user.email, source: "account" }).onConflictDoNothing();
  if (patch.marketing === false) await db.delete(s.subscribers).where(eq(s.subscribers.email, user.email));
  return ok();
}

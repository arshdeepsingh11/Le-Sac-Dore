import { and, eq } from "drizzle-orm";
import { getDb, schema as s } from "@/server/db";
import { getCurrentUser } from "@/server/auth";
import { body, fail, ok } from "@/server/http";
import { findProduct } from "@/lib/data";

/** Toggle one piece: { productId, on } */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.", 401);
  const b = await body(req);
  const pid = typeof b?.productId === "string" ? b.productId : "";
  if (!findProduct(pid)) return fail("Unknown piece.");
  const db = await getDb();
  if (b?.on) await db.insert(s.wishlist).values({ userId: user.id, productId: pid }).onConflictDoNothing();
  else await db.delete(s.wishlist).where(and(eq(s.wishlist.userId, user.id), eq(s.wishlist.productId, pid)));
  return ok();
}

/** Merge the device wishlist into the account after sign-in: { ids: string[] } → returns merged list */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.", 401);
  const b = await body<{ ids?: unknown }>(req);
  const ids = Array.isArray(b?.ids) ? b.ids.filter((x): x is string => typeof x === "string" && !!findProduct(x)).slice(0, 50) : [];
  const db = await getDb();
  for (const pid of ids) await db.insert(s.wishlist).values({ userId: user.id, productId: pid }).onConflictDoNothing();
  const rows = await db.select({ productId: s.wishlist.productId }).from(s.wishlist).where(eq(s.wishlist.userId, user.id));
  return ok({ wishlist: rows.map((r) => r.productId) });
}

import { getDb, schema as s } from "@/server/db";
import { getCurrentUser, isEmail, visitorId } from "@/server/auth";
import { rateLimit, recordEvent } from "@/server/track";
import { body, fail, ok, str } from "@/server/http";
import { findProduct, STORES, type ColorName } from "@/lib/data";

export async function POST(req: Request) {
  if (!(await rateLimit("reserve", 6))) return fail("Too many requests. Please wait a minute.", 429);
  const b = await body(req);
  const p = findProduct(str(b?.productId));
  const color = str(b?.color);
  const boutique = STORES.find((x) => x.city === str(b?.boutique));
  const date = str(b?.date, 10);
  const slot = str(b?.slot, 5);
  const kind = b?.kind === "video" ? "video" : "boutique";
  const name = str(b?.name, 80);
  const email = str(b?.email).toLowerCase();

  if (!p || !p.colors.includes(color as ColorName)) return fail("Please choose a piece and colour.");
  if (kind === "boutique" && !boutique) return fail("Please choose a boutique.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(slot)) return fail("Please choose a date and time.");
  const when = new Date(`${date}T${slot}:00`);
  if (isNaN(when.getTime()) || when.getTime() < Date.now() - 864e5 || when.getTime() > Date.now() + 31 * 864e5) return fail("Please choose a date within the next 30 days.");
  if (name.length < 2 || !isEmail(email)) return fail("Please enter your name and a valid email.");

  const user = await getCurrentUser();
  const db = await getDb();
  const [r] = await db
    .insert(s.reservations)
    .values({
      userId: user?.id ?? null, visitorId: await visitorId(), name, email, phone: str(b?.phone, 30) || null, productId: p.id, color, kind,
      boutique: kind === "video" ? "Video appointment" : `${boutique!.city.charAt(0) + boutique!.city.slice(1).toLowerCase()} — ${boutique!.name}`,
      date, slot, notes: str(b?.notes, 500) || null, holdUntil: new Date(when.getTime() + 48 * 3600e3),
    })
    .returning();
  await recordEvent("reservation", { userId: user?.id, productId: p.id, meta: { boutique: r.boutique, date, slot, kind } });
  return ok({ reservation: { id: r.id, boutique: r.boutique, date, slot, kind, holdUntil: r.holdUntil } });
}

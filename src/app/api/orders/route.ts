import { randomInt } from "node:crypto";
import { getDb, schema as s } from "@/server/db";
import { getCurrentUser, isEmail, visitorId } from "@/server/auth";
import { recordEvent } from "@/server/track";
import { body, fail, ok, str } from "@/server/http";
import { findProduct, fmt, HOURS, SERIAL_CODE, totals, type ColorName } from "@/lib/data";

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Matches each piece to the artisan whose speciality it is. */
function artisanFor(productId: string, i: number) {
  if (productId === "le-noir") return "cl";
  if (["le-voyage", "le-grand"].includes(productId)) return "jt";
  if (["le-rivage", "la-dune"].includes(productId)) return "na";
  return i % 2 ? "mb" : "em";
}

export async function POST(req: Request) {
  const b = await body(req);
  const lines = Array.isArray(b?.lines) ? (b.lines as unknown[]) : [];
  const f = (b?.form ?? {}) as Record<string, unknown>;
  const ship = b?.ship === "express" ? "express" : "standard";
  const pay = ["card", "apple", "google", "shop"].includes(String(b?.pay)) ? String(b?.pay) : "card";

  // Validate cart against the catalogue — never trust client prices.
  const items: { productId: string; name: string; color: string; qty: number; unitPrice: number }[] = [];
  for (const raw of lines.slice(0, 20)) {
    const l = raw as Record<string, unknown>;
    const p = findProduct(String(l.pid));
    const qty = Math.max(1, Math.min(9, Number(l.qty) || 0));
    if (!p || !p.colors.includes(l.color as ColorName)) return fail("Your bag contains an item that is no longer available.");
    items.push({ productId: p.id, name: p.name, color: String(l.color), qty, unitPrice: p.price });
  }
  if (!items.length) return fail("Your bag is empty.");

  const email = str(f.email).toLowerCase();
  const first = str(f.first, 60), last = str(f.last, 60);
  if (!isEmail(email) || !first || !last || !str(f.address) || !str(f.city)) return fail("Please complete your delivery information.");

  const t = totals(items.reduce((a, i) => a + i.unitPrice * i.qty, 0), ship);
  const user = await getCurrentUser();
  const db = await getDb();
  const number = `LSD-${randomInt(200000, 999999)}`;
  const shipTo = { address: str(f.address), city: str(f.city), province: str(f.province), postal: str(f.postal, 12).toUpperCase(), country: str(f.country) || "Canada" };

  const [order] = await db
    .insert(s.orders)
    .values({
      number, userId: user?.id ?? null, visitorId: await visitorId(), email, name: `${first} ${last}`, phone: str(f.phone, 30) || null,
      subtotal: t.sub, shipping: t.coShip, tax: t.tax, total: t.coTotal, shipMethod: ship, payMethod: pay, shipTo,
    })
    .returning();
  await db.insert(s.orderItems).values(items.map((i) => ({ ...i, orderId: order.id })));

  // Mint one Digital Passport per bag.
  const serials: { serial: string; productId: string; color: string }[] = [];
  let n = 0;
  for (const it of items) {
    for (let q = 0; q < it.qty; q++, n++) {
      const serial = `LSD-${SERIAL_CODE[it.productId] ?? "GEN"}-${randomInt(100000, 999999)}`;
      const made = new Date(Date.now() - (6 + randomInt(0, 14)) * 864e5);
      await db.insert(s.passports).values({
        serial, productId: it.productId, color: it.color, artisanId: artisanFor(it.productId, n), inspectorId: "sr", madeOn: iso(made), hours: HOURS[it.productId] ?? 30,
        orderId: order.id, ownerUserId: user?.id ?? null, registeredAt: user ? new Date() : null,
        history: [
          { date: iso(made), type: "MADE", note: "Cut, assembled and finished by hand." },
          { date: iso(new Date(made.getTime() + 2 * 864e5)), type: "INSPECTED", note: "Passed the 42-point final inspection." },
          { date: iso(new Date()), type: "ORDERED", note: `Reserved for order ${number}.` },
        ],
      });
      serials.push({ serial, productId: it.productId, color: it.color });
    }
  }

  await recordEvent("order", { userId: user?.id, meta: { number, total: t.coTotal, items: items.map((i) => `${i.name} × ${i.qty}`) } });

  const d = (k: number) => new Date(Date.now() + k * 864e5).toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long" });
  return ok({
    order: {
      number, date: new Date().toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" }), status: 0, total: t.coTotal, email,
      eta: ship === "express" ? d(1) : `${d(3)} – ${d(6)}`,
      shipTo: [`${first} ${last}`, shipTo.address, [shipTo.city, shipTo.province, shipTo.postal].filter(Boolean).join(", ")].join(", "),
      items: items.map((i) => ({ name: i.name, color: i.color, qty: i.qty, lineF: fmt(i.unitPrice * i.qty) })),
      passports: serials,
    },
  });
}

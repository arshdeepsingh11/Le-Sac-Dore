import { and, eq, sql } from "drizzle-orm";
import type { DB } from "./index";
import * as s from "./schema";
import { hashPassword } from "../crypto";
import { ARTISANS, HOURS, PRODUCTS, SERIAL_CODE, sampleSerial, byId } from "@/lib/data";

const day = 864e5;
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Runs on every boot (idempotent): sample passports + the admin account. */
export async function seedBaseline(db: DB, mode: "postgres" | "local") {
  // One public sample passport per piece, so every product page can show a real passport.
  for (const [i, p] of PRODUCTS.entries()) {
    const serial = sampleSerial(p.id);
    const made = new Date(Date.UTC(2026, 0, 12 + i * 3));
    await db
      .insert(s.passports)
      .values({
        serial,
        productId: p.id,
        color: p.colors[0],
        artisanId: ARTISANS[i % 5].id,
        inspectorId: "sr",
        madeOn: iso(made),
        hours: HOURS[p.id] ?? 30,
        isSample: true,
        history: [
          { date: iso(made), type: "MADE", note: `Cut, assembled and finished by hand.` },
          { date: iso(new Date(made.getTime() + 2 * day)), type: "INSPECTED", note: "Passed the 42-point final inspection." },
          { date: iso(new Date(made.getTime() + 3 * day)), type: "PRESENTED", note: "Placed in the signature box with its numbered card." },
        ],
      })
      .onConflictDoNothing();
  }

  // Admin account.
  let email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  let password = process.env.ADMIN_PASSWORD;
  if (!email && mode === "local") {
    email = "admin@lesacdore.com";
    password = "admin1234";
  }
  if (!email) return;
  const existing = await db.select().from(s.users).where(eq(s.users.email, email)).limit(1);
  if (existing.length) {
    if (existing[0].role !== "admin") await db.update(s.users).set({ role: "admin" }).where(eq(s.users.id, existing[0].id));
  } else if (password) {
    await db.insert(s.users).values({ email, name: "Maison Admin", passwordHash: await hashPassword(password), role: "admin" });
    if (mode === "local") console.log(`[le-sac-dore] Local admin ready → ${email} / ${password}`);
  }
}

/* ───────────────────────── Demo data (admin → "Load demo data") ───────────────────────── */

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const FIRST = ["Camille", "Olivia", "Amara", "Sophie", "Priya", "Noah", "Léa", "Isabella", "Hannah", "Maya", "Chloé", "Aisha", "Emma", "Zoe", "Julien", "Ines"];
const LAST = ["Laurent", "Chen", "Okafor", "Martin", "Sharma", "Tremblay", "Dubois", "Rossi", "Kim", "Singh", "Roy", "Haddad", "Wilson", "Nguyen", "Bernard", "Costa"];
const CITIES: [string, string][] = [["CA", "Toronto"], ["CA", "Montréal"], ["CA", "Vancouver"], ["CA", "Calgary"], ["US", "New York"], ["FR", "Paris"], ["GB", "London"], ["CA", "Ottawa"], ["US", "Los Angeles"], ["AE", "Dubai"]];
const DEVICES: [string, string, string][] = [["mobile", "Safari", "iOS"], ["mobile", "Chrome", "Android"], ["desktop", "Chrome", "macOS"], ["desktop", "Safari", "macOS"], ["desktop", "Edge", "Windows"], ["tablet", "Safari", "iPadOS"]];
const REFS = ["instagram.com", "google.com", "", "", "pinterest.com", "tiktok.com", "vogue.com", "google.com"];
const PAGES = ["/", "/collection", "/collection?filter=new", "/atelier", "/materials", "/maison", "/journal", "/services"];

export async function seedDemo(db: DB) {
  await clearDemo(db);
  const r = rng(42);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const now = Date.now();
  const pw = await hashPassword("demo-password-" + now);

  // Customers
  const users: { id: string; name: string; email: string }[] = [];
  for (let i = 0; i < 16; i++) {
    const name = `${FIRST[i]} ${LAST[i]}`;
    const email = `${FIRST[i].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.${LAST[i].toLowerCase()}@demo.lesacdore.com`;
    const created = new Date(now - Math.floor(r() * 28 + 1) * day);
    const [u] = await db
      .insert(s.users)
      .values({ email, name, passwordHash: pw, isDemo: true, marketing: r() > 0.4, createdAt: created, lastSeenAt: new Date(now - Math.floor(r() * 3) * day), phone: `+1 416 555 0${100 + i}` })
      .returning({ id: s.users.id });
    users.push({ id: u.id, name, email });
  }

  // Visitors + events
  const eventRows: (typeof s.events.$inferInsert)[] = [];
  for (let v = 0; v < 90; v++) {
    const id = crypto.randomUUID();
    const user = v < users.length ? users[v] : undefined;
    const [country, city] = pick(CITIES);
    const [device, browser, os] = pick(DEVICES);
    const first = now - Math.floor(r() * 30) * day - Math.floor(r() * day);
    let t = first;
    let pv = 0;
    const sessions = 1 + Math.floor(r() * (user ? 5 : 2));
    const fav = pick(PRODUCTS);
    for (let sIdx = 0; sIdx < sessions; sIdx++) {
      const sessionId = crypto.randomUUID();
      const steps = 3 + Math.floor(r() * 9);
      for (let k = 0; k < steps; k++) {
        t += Math.floor(20 + r() * 160) * 1000;
        if (t > now) break;
        const isProduct = r() < 0.45;
        const prod = r() < 0.55 ? fav : pick(PRODUCTS);
        const path = isProduct ? `/product/${prod.id}` : pick(PAGES);
        eventRows.push({ visitorId: id, userId: user?.id, sessionId, type: "page_view", path, createdAt: new Date(t) });
        pv++;
        if (isProduct) {
          eventRows.push({ visitorId: id, userId: user?.id, sessionId, type: "product_view", path, productId: prod.id, createdAt: new Date(t + 500) });
          if (r() < 0.18) eventRows.push({ visitorId: id, userId: user?.id, sessionId, type: "wishlist_add", path, productId: prod.id, createdAt: new Date(t + 9000) });
          if (r() < 0.14) eventRows.push({ visitorId: id, userId: user?.id, sessionId, type: "add_to_bag", path, productId: prod.id, meta: { color: prod.colors[0], qty: 1 }, createdAt: new Date(t + 15000) });
          if (r() < 0.12) eventRows.push({ visitorId: id, userId: user?.id, sessionId, type: "patina_preview", path, productId: prod.id, createdAt: new Date(t + 20000) });
          if (r() < 0.1) eventRows.push({ visitorId: id, userId: user?.id, sessionId, type: "fit_check", path, productId: prod.id, meta: { items: ["Phone", "Wallet", "Keys"] }, createdAt: new Date(t + 25000) });
        } else if (r() < 0.12) {
          eventRows.push({ visitorId: id, userId: user?.id, sessionId, type: "search", path, meta: { q: pick(["black", "leather", "travel", "evening clutch", "jute"]) }, createdAt: new Date(t + 4000) });
        } else if (r() < 0.06) {
          eventRows.push({ visitorId: id, userId: user?.id, sessionId, type: "concierge_message", path, meta: { text: pick(["Something for evening", "Which bag fits a 13\" laptop?", "A gift under $800"]) }, createdAt: new Date(t + 6000) });
        }
      }
      t += Math.floor(r() * 4 * day);
    }
    if (pv === 0) continue;
    await db.insert(s.visitors).values({
      id, userId: user?.id, firstSeen: new Date(first), lastSeen: new Date(Math.min(t, now)), country, city, device, browser, os,
      referrer: pick(REFS) || null, landingPath: pick(PAGES), utmSource: r() < 0.2 ? "instagram" : null, pageViews: pv, isDemo: true,
    });
  }
  for (let i = 0; i < eventRows.length; i += 400) await db.insert(s.events).values(eventRows.slice(i, i + 400));

  // Wishlists
  for (const u of users) {
    const n = Math.floor(r() * 4);
    const ids = new Set<string>();
    for (let k = 0; k < n; k++) ids.add(pick(PRODUCTS).id);
    for (const pid of ids) await db.insert(s.wishlist).values({ userId: u.id, productId: pid }).onConflictDoNothing();
  }

  // Orders (+ passports)
  for (let o = 0; o < 11; o++) {
    const u = users[o];
    const p = pick(PRODUCTS);
    const qty = r() < 0.85 ? 1 : 2;
    const sub = p.price * qty;
    const ship = sub >= 1000 ? 0 : 35;
    const tax = Math.round(sub * 0.13);
    const created = new Date(now - Math.floor(r() * 26) * day);
    const status = Math.min(3, Math.floor((now - created.getTime()) / (3 * day)));
    const [ord] = await db
      .insert(s.orders)
      .values({
        number: `LSD-${300000 + o * 7919}`, userId: u.id, email: u.email, name: u.name, status, subtotal: sub, shipping: ship, tax, total: sub + ship + tax,
        shipMethod: "standard", payMethod: pick(["card", "apple", "card", "shop"]), shipTo: { address: "88 Hazelton Avenue", city: "Toronto", province: "Ontario", postal: "M5R 2E2", country: "Canada" },
        isDemo: true, createdAt: created,
      })
      .returning({ id: s.orders.id });
    await db.insert(s.orderItems).values({ orderId: ord.id, productId: p.id, name: p.name, color: p.colors[0], qty, unitPrice: p.price });
    for (let q = 0; q < qty; q++) {
      await db.insert(s.passports).values({
        serial: `LSD-${SERIAL_CODE[p.id]}-D${String(o * 10 + q).padStart(3, "0")}`, productId: p.id, color: p.colors[0], artisanId: pick(ARTISANS.slice(0, 5)).id, inspectorId: "sr",
        madeOn: iso(new Date(created.getTime() - 9 * day)), hours: HOURS[p.id] ?? 30, orderId: ord.id, ownerUserId: u.id,
        history: [{ date: iso(new Date(created.getTime() - 9 * day)), type: "MADE", note: "Made by hand." }, { date: iso(created), type: "ORDERED", note: `Order ${300000 + o * 7919}.` }],
      }).onConflictDoNothing();
    }
  }

  // Reservations
  const boutiques = ["Toronto — Yorkville", "Montréal — Sherbrooke Ouest", "Vancouver — Alberni", "Paris — Faubourg Saint-Honoré", "New York — Madison Avenue", "London — Mount Street"];
  for (let i = 0; i < 7; i++) {
    const u = users[(i * 3) % users.length];
    const p = pick(PRODUCTS);
    const d = new Date(now + Math.floor(r() * 10 - 3) * day);
    await db.insert(s.reservations).values({
      userId: u.id, name: u.name, email: u.email, productId: p.id, color: p.colors[0], boutique: pick(boutiques), date: iso(d), slot: pick(["11:00", "13:30", "15:00", "17:30"]),
      kind: r() < 0.3 ? "video" : "boutique", status: pick(["requested", "confirmed", "confirmed", "completed"]), holdUntil: new Date(d.getTime() + 2 * day), isDemo: true,
      createdAt: new Date(now - Math.floor(r() * 7) * day),
    });
  }

  // Subscribers
  for (let i = 0; i < 24; i++) {
    await db.insert(s.subscribers).values({ email: `reader${i}@demo.lesacdore.com`, source: pick(["footer", "signup", "journal"]), isDemo: true, createdAt: new Date(now - Math.floor(r() * 30) * day) }).onConflictDoNothing();
  }
}

export async function clearDemo(db: DB) {
  await db.delete(s.events).where(sql`${s.events.visitorId} IN (SELECT id FROM visitors WHERE is_demo)`);
  await db.delete(s.visitors).where(eq(s.visitors.isDemo, true));
  await db.delete(s.passports).where(and(eq(s.passports.isSample, false), sql`${s.passports.orderId} IN (SELECT id FROM orders WHERE is_demo)`));
  await db.delete(s.orders).where(eq(s.orders.isDemo, true));
  await db.delete(s.reservations).where(eq(s.reservations.isDemo, true));
  await db.delete(s.subscribers).where(eq(s.subscribers.isDemo, true));
  await db.delete(s.users).where(eq(s.users.isDemo, true));
}

export const productName = (id: string) => byId(id).name;

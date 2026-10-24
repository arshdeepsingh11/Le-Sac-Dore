import { cookies, headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { getDb, schema as s } from "@/server/db";
import { getCurrentUser, VISITOR_COOKIE } from "@/server/auth";
import { BOT_RE, CONSENT_COOKIE, geo, parseUA } from "@/server/track";
import { body, ok, str } from "@/server/http";

const TYPES = new Set([
  "page_view", "product_view", "wishlist_add", "wishlist_remove", "add_to_bag", "remove_from_bag", "search", "concierge_message",
  "checkout_start", "patina_preview", "fit_check", "passport_view", "reservation_open", "journal_read", "color_select", "share",
]);

function safeMeta(m: unknown): Record<string, unknown> | null {
  if (!m || typeof m !== "object") return null;
  const json = JSON.stringify(m);
  return json.length > 2000 ? { truncated: true } : (m as Record<string, unknown>);
}

export async function POST(req: Request) {
  const jar = await cookies();
  if (jar.get(CONSENT_COOKIE)?.value !== "all") return ok({ tracked: false });
  const ua = (await headers()).get("user-agent") ?? "";
  if (BOT_RE.test(ua)) return ok({ tracked: false });

  const b = await body<{ events?: unknown[]; context?: Record<string, unknown> }>(req);
  const events = (Array.isArray(b?.events) ? b.events : []).slice(0, 30) as Record<string, unknown>[];
  const valid = events.filter((e) => TYPES.has(String(e.type)));
  if (!valid.length) return ok({ tracked: false });

  const db = await getDb();
  const user = await getCurrentUser();
  if (user?.role === "admin") return ok({ tracked: false }); // staff browsing never skews the numbers
  let vid = jar.get(VISITOR_COOKIE)?.value;
  if (!vid || !/^[0-9a-f-]{36}$/i.test(vid)) {
    vid = crypto.randomUUID();
    jar.set(VISITOR_COOKIE, vid, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 395 });
  }

  const ctx = b?.context ?? {};
  const pageViews = valid.filter((e) => e.type === "page_view").length;
  const [existing] = await db.select({ id: s.visitors.id }).from(s.visitors).where(eq(s.visitors.id, vid)).limit(1);
  if (!existing) {
    const { device, browser, os } = parseUA(ua);
    const g = await geo();
    let ref = str(ctx.referrer, 300);
    try {
      ref = ref ? new URL(ref).hostname.replace(/^www\./, "") : "";
    } catch {
      ref = "";
    }
    await db
      .insert(s.visitors)
      .values({
        id: vid, userId: user?.id ?? null, country: g.country, city: g.city, device, browser, os, referrer: ref || null,
        landingPath: str(ctx.landing, 200) || null, utmSource: str(ctx.utm_source, 60) || null, utmMedium: str(ctx.utm_medium, 60) || null, utmCampaign: str(ctx.utm_campaign, 80) || null,
        pageViews,
      })
      .onConflictDoNothing();
  } else {
    await db
      .update(s.visitors)
      .set({ lastSeen: new Date(), pageViews: sql`${s.visitors.pageViews} + ${pageViews}`, ...(user ? { userId: user.id } : {}) })
      .where(eq(s.visitors.id, vid));
  }
  if (user) await db.update(s.users).set({ lastSeenAt: new Date() }).where(eq(s.users.id, user.id));

  await db.insert(s.events).values(
    valid.map((e) => ({
      visitorId: vid!, userId: user?.id ?? null, sessionId: str(e.sessionId, 40) || null, type: String(e.type), path: str(e.path, 200) || null,
      productId: str(e.productId, 40) || null, meta: safeMeta(e.meta),
    })),
  );
  return ok({ tracked: true });
}

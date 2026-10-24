import { cookies, headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { getDb, schema as s } from "./db";
import { VISITOR_COOKIE } from "./auth";

export const CONSENT_COOKIE = "lsd_consent";

export function parseUA(ua: string) {
  const device = /iPad|Tablet/i.test(ua) ? "tablet" : /Mobi|iPhone|Android/i.test(ua) ? "mobile" : "desktop";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other";
  const os = /iPad/.test(ua) ? "iPadOS" : /iPhone|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Other";
  return { device, browser, os };
}

export const BOT_RE = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|facebookexternalhit|embedly|preview/i;

export async function geo() {
  const h = await headers();
  const country = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || null;
  const cityRaw = h.get("x-vercel-ip-city");
  return { country, city: cityRaw ? decodeURIComponent(cityRaw) : null };
}

/** True when the visitor accepted analytics cookies. */
export async function analyticsAllowed() {
  return (await cookies()).get(CONSENT_COOKIE)?.value === "all";
}

/** Record a server-side event (signup, order, reservation…). Respects consent. */
export async function recordEvent(type: string, data: { userId?: string | null; productId?: string | null; path?: string | null; meta?: Record<string, unknown> } = {}) {
  try {
    if (!(await analyticsAllowed())) return;
    const vid = (await cookies()).get(VISITOR_COOKIE)?.value ?? null;
    const db = await getDb();
    await db.insert(s.events).values({ visitorId: vid, userId: data.userId ?? null, type, path: data.path ?? null, productId: data.productId ?? null, meta: data.meta ?? null });
  } catch (e) {
    console.error("[track]", e);
  }
}

/** Link the anonymous visitor to an account after signup/login, so past browsing is attributed. */
export async function linkVisitor(userId: string) {
  const vid = (await cookies()).get(VISITOR_COOKIE)?.value;
  if (!vid) return;
  const db = await getDb();
  await db.update(s.visitors).set({ userId }).where(eq(s.visitors.id, vid));
  await db.update(s.events).set({ userId }).where(sql`${s.events.visitorId} = ${vid} AND ${s.events.userId} IS NULL`);
}

/* Tiny in-memory rate limiter (per instance) for auth endpoints. */
const buckets = new Map<string, { n: number; reset: number }>();
export async function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const k = `${key}:${ip}`;
  const now = Date.now();
  const b = buckets.get(k);
  if (!b || b.reset < now) {
    buckets.set(k, { n: 1, reset: now + windowMs });
    return true;
  }
  b.n++;
  return b.n <= limit;
}

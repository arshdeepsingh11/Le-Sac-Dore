"use client";

/**
 * First-party analytics. Events are batched and sent with sendBeacon.
 * Nothing is sent unless the visitor accepted analytics cookies.
 */

export type TrackType =
  | "page_view" | "product_view" | "wishlist_add" | "wishlist_remove" | "add_to_bag" | "remove_from_bag" | "search"
  | "concierge_message" | "checkout_start" | "patina_preview" | "fit_check" | "passport_view" | "reservation_open"
  | "journal_read" | "color_select" | "share";

interface Ev {
  type: TrackType;
  path: string;
  productId?: string;
  meta?: Record<string, unknown>;
  sessionId: string;
}

const CONSENT = "lsd_consent";
let queue: Ev[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;

export function consent(): "all" | "essential" | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )lsd_consent=([^;]+)/);
  return m ? (m[1] as "all" | "essential") : null;
}

export function setConsent(v: "all" | "essential") {
  document.cookie = `${CONSENT}=${v}; path=/; max-age=${60 * 60 * 24 * 395}; samesite=lax`;
}

function sessionId() {
  try {
    let id = sessionStorage.getItem("lsd_sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("lsd_sid", id);
    }
    return id;
  } catch {
    return "nosession";
  }
}

function context() {
  try {
    if (sessionStorage.getItem("lsd_ctx")) return undefined;
    sessionStorage.setItem("lsd_ctx", "1");
  } catch {
    return undefined;
  }
  const u = new URL(window.location.href);
  return {
    referrer: document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "",
    landing: u.pathname + u.search,
    utm_source: u.searchParams.get("utm_source") ?? "",
    utm_medium: u.searchParams.get("utm_medium") ?? "",
    utm_campaign: u.searchParams.get("utm_campaign") ?? "",
  };
}

function flush() {
  timer = undefined;
  if (!queue.length) return;
  const payload = JSON.stringify({ events: queue, context: context() });
  queue = [];
  const blob = new Blob([payload], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track", blob)) {
    fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }
}

export function track(type: TrackType, data: { productId?: string; meta?: Record<string, unknown> } = {}) {
  if (typeof window === "undefined" || consent() !== "all") return;
  queue.push({ type, path: window.location.pathname + window.location.search, sessionId: sessionId(), ...data });
  clearTimeout(timer);
  timer = setTimeout(flush, type === "page_view" ? 600 : 1200);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
}

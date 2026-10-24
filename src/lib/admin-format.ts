import { findProduct, fmt } from "./data";

export const pname = (id?: string | null) => (id ? (findProduct(id)?.name ?? id) : "");

export function timeAgo(d: string | Date | null | undefined) {
  if (!d) return "—";
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return new Date(d).toLocaleDateString("en-CA", { day: "numeric", month: "short", year: "numeric" });
}

export const fmtDateTime = (d: string | Date) => new Date(d).toLocaleString("en-CA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export const fmtDay = (d: string | Date) => new Date(d).toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long" });

const m = (meta: Record<string, unknown> | null | undefined, k: string) => (meta && meta[k] != null ? String(meta[k]) : "");

/** Human sentence for an analytics event — used across the admin. */
export function describe(e: { type: string; path?: string | null; product_id?: string | null; meta?: Record<string, unknown> | null }): { icon: string; text: string } {
  const p = pname(e.product_id);
  switch (e.type) {
    case "page_view":
      return { icon: "·", text: `Visited ${e.path || "/"}` };
    case "product_view":
      return { icon: "◉", text: `Viewed ${p}${m(e.meta, "color") ? ` in ${m(e.meta, "color")}` : ""}` };
    case "color_select":
      return { icon: "◐", text: `Tried ${p} in ${m(e.meta, "color")}` };
    case "wishlist_add":
      return { icon: "♥", text: `Saved ${p} to wishlist` };
    case "wishlist_remove":
      return { icon: "♡", text: `Removed ${p} from wishlist` };
    case "add_to_bag":
      return { icon: "＋", text: `Added ${p}${m(e.meta, "color") ? ` (${m(e.meta, "color")})` : ""} to bag` };
    case "search":
      return { icon: "⌕", text: `Searched “${m(e.meta, "q")}”` };
    case "concierge_message":
      return { icon: "✦", text: `Asked Le Concierge: “${m(e.meta, "text").slice(0, 90)}”` };
    case "checkout_start":
      return { icon: "→", text: "Started checkout" };
    case "order":
      return { icon: "★", text: `Placed order ${m(e.meta, "number")} — ${e.meta?.total ? fmt(Number(e.meta.total)) : ""}` };
    case "reservation":
      return { icon: "◇", text: `Reserved ${p} — ${m(e.meta, "boutique")}, ${m(e.meta, "date")} ${m(e.meta, "slot")}` };
    case "reservation_open":
      return { icon: "◇", text: `Opened reserve-in-boutique for ${p}` };
    case "patina_preview":
      return { icon: "◑", text: `Previewed the patina of ${p}` };
    case "fit_check":
      return { icon: "▣", text: `Checked what fits in ${p}${Array.isArray(e.meta?.items) ? `: ${(e.meta!.items as string[]).join(", ")}` : ""}` };
    case "passport_view":
      return { icon: "▤", text: `Opened passport ${m(e.meta, "serial")}` };
    case "passport_register":
      return { icon: "▤", text: `Registered bag ${m(e.meta, "serial")}` };
    case "journal_read":
      return { icon: "¶", text: `Read the journal story “${m(e.meta, "slug").replace(/-/g, " ")}”` };
    case "signup":
      return { icon: "●", text: "Created an account" };
    case "login":
      return { icon: "○", text: "Signed in" };
    case "newsletter_signup":
      return { icon: "✉", text: "Subscribed to the newsletter" };
    default:
      return { icon: "·", text: e.type.replace(/_/g, " ") };
  }
}

export const STATUS = ["Received", "Prepared", "Shipped", "Delivered"];
export const pct = (v: number) => `${(v * 100).toFixed(v < 0.1 ? 1 : 0)}%`;
export const flag = (cc?: string | null) =>
  cc && /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "";
export const shortId = (id?: string | null) => (id ? id.slice(0, 6).toUpperCase() : "—");

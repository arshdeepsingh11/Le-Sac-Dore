import { sql, type SQL } from "drizzle-orm";
import { getDb } from "./db";

/* drizzle's execute() returns rows directly (postgres-js) or { rows } (PGlite) — normalise. */
async function q<T = Record<string, unknown>>(query: SQL): Promise<T[]> {
  const db = await getDb();
  const r = (await db.execute(query)) as unknown;
  return (Array.isArray(r) ? r : (r as { rows: T[] }).rows) as T[];
}
const n = (v: unknown) => Number(v ?? 0);

/* Raw SQL params must be ISO strings, not Date objects: postgres-js (real Postgres) rejects Date
   in sql`` templates, PGlite tolerates it. Postgres casts the ISO text to timestamptz. */
export const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
export const since = (days: number) => ago(days * 864e5);

/* ───────────────────────── Overview ───────────────────────── */

export async function overview(days: number) {
  const from = since(days);
  const prev = since(days * 2);
  const [cur] = await q(sql`
    SELECT
      count(DISTINCT visitor_id) FILTER (WHERE created_at >= ${from}) AS visitors,
      count(*) FILTER (WHERE type = 'page_view' AND created_at >= ${from}) AS page_views,
      count(*) FILTER (WHERE type = 'product_view' AND created_at >= ${from}) AS product_views,
      count(*) FILTER (WHERE type = 'wishlist_add' AND created_at >= ${from}) AS wishlist_adds,
      count(*) FILTER (WHERE type = 'add_to_bag' AND created_at >= ${from}) AS bag_adds,
      count(DISTINCT visitor_id) FILTER (WHERE created_at >= ${prev} AND created_at < ${from}) AS visitors_prev,
      count(*) FILTER (WHERE type = 'page_view' AND created_at >= ${prev} AND created_at < ${from}) AS page_views_prev
    FROM events`);
  const [ord] = await q(sql`
    SELECT
      count(*) FILTER (WHERE created_at >= ${from}) AS orders,
      coalesce(sum(total) FILTER (WHERE created_at >= ${from}), 0) AS revenue,
      count(*) FILTER (WHERE created_at >= ${prev} AND created_at < ${from}) AS orders_prev,
      coalesce(sum(total) FILTER (WHERE created_at >= ${prev} AND created_at < ${from}), 0) AS revenue_prev
    FROM orders`);
  const [usr] = await q(sql`
    SELECT count(*) FILTER (WHERE created_at >= ${from} AND role <> 'admin') AS signups,
           count(*) FILTER (WHERE created_at >= ${prev} AND created_at < ${from} AND role <> 'admin') AS signups_prev,
           count(*) FILTER (WHERE role <> 'admin') AS customers
    FROM users`);
  const [live] = await q(sql`SELECT count(DISTINCT visitor_id) AS live FROM events WHERE created_at >= ${ago(5 * 60e3)}`);
  const [res] = await q(sql`SELECT count(*) FILTER (WHERE status = 'requested') AS pending, count(*) FILTER (WHERE created_at >= ${from}) AS total FROM reservations`);
  const [subs] = await q(sql`SELECT count(*) AS total, count(*) FILTER (WHERE created_at >= ${from}) AS recent FROM subscribers`);

  const visitors = n(cur.visitors), orders = n(ord.orders), revenue = n(ord.revenue);
  return {
    visitors, visitorsPrev: n(cur.visitors_prev), pageViews: n(cur.page_views), pageViewsPrev: n(cur.page_views_prev),
    productViews: n(cur.product_views), wishlistAdds: n(cur.wishlist_adds), bagAdds: n(cur.bag_adds),
    orders, ordersPrev: n(ord.orders_prev), revenue, revenuePrev: n(ord.revenue_prev),
    signups: n(usr.signups), signupsPrev: n(usr.signups_prev), customers: n(usr.customers),
    conversion: visitors ? orders / visitors : 0, aov: orders ? revenue / orders : 0,
    live: n(live.live), pendingReservations: n(res.pending), reservations: n(res.total), subscribers: n(subs.total), newSubscribers: n(subs.recent),
  };
}

export async function daily(days: number) {
  const rows = await q<{ day: string; visitors: string; views: string }>(sql`
    SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
           count(DISTINCT visitor_id) AS visitors,
           count(*) FILTER (WHERE type = 'page_view') AS views
    FROM events WHERE created_at >= ${since(days)}
    GROUP BY 1 ORDER BY 1`);
  const orders = await q<{ day: string; revenue: string; orders: string }>(sql`
    SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, sum(total) AS revenue, count(*) AS orders
    FROM orders WHERE created_at >= ${since(days)} GROUP BY 1`);
  const out: { day: string; visitors: number; views: number; revenue: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    const r = rows.find((x) => x.day === d);
    const o = orders.find((x) => x.day === d);
    out.push({ day: d, visitors: n(r?.visitors), views: n(r?.views), revenue: n(o?.revenue), orders: n(o?.orders) });
  }
  return out;
}

export async function breakdown(days: number) {
  const from = since(days);
  const [pages, products, devices, countries, referrers, searches] = await Promise.all([
    q<{ k: string; v: string }>(sql`SELECT split_part(path, '?', 1) AS k, count(*) AS v FROM events WHERE type = 'page_view' AND created_at >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
    q<{ k: string; v: string; u: string }>(sql`SELECT product_id AS k, count(*) AS v, count(DISTINCT visitor_id) AS u FROM events WHERE type = 'product_view' AND created_at >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
    q<{ k: string; v: string }>(sql`SELECT coalesce(device, 'unknown') AS k, count(*) AS v FROM visitors WHERE last_seen >= ${from} GROUP BY 1 ORDER BY 2 DESC`),
    q<{ k: string; v: string }>(sql`SELECT coalesce(country, '—') AS k, count(*) AS v FROM visitors WHERE last_seen >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
    q<{ k: string; v: string }>(sql`SELECT coalesce(referrer, 'Direct') AS k, count(*) AS v FROM visitors WHERE first_seen >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
    q<{ k: string; v: string }>(sql`SELECT lower(meta->>'q') AS k, count(*) AS v FROM events WHERE type = 'search' AND created_at >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
  ]);
  return { pages, products, devices, countries, referrers, searches };
}

export async function funnel(days: number) {
  const from = since(days);
  const [f] = await q(sql`
    SELECT
      count(DISTINCT visitor_id) AS visitors,
      count(DISTINCT visitor_id) FILTER (WHERE type = 'product_view') AS viewed,
      count(DISTINCT visitor_id) FILTER (WHERE type = 'add_to_bag') AS bagged,
      count(DISTINCT visitor_id) FILTER (WHERE type = 'checkout_start') AS checkout
    FROM events WHERE created_at >= ${from}`);
  const [o] = await q(sql`SELECT count(*) AS orders FROM orders WHERE created_at >= ${from}`);
  return [
    ["Visited", n(f.visitors)],
    ["Viewed a piece", n(f.viewed)],
    ["Added to bag", n(f.bagged)],
    ["Started checkout", n(f.checkout)],
    ["Ordered", n(o.orders)],
  ] as [string, number][];
}

/* ───────────────────────── Activity ───────────────────────── */

export type ActivityRow = {
  id: number; type: string; path: string | null; product_id: string | null; meta: Record<string, unknown> | null; created_at: string;
  visitor_id: string | null; user_id: string | null; name: string | null; email: string | null; city: string | null; country: string | null; device: string | null;
};

export async function recentActivity(limit = 30, minutes?: number) {
  const where = minutes ? sql`WHERE e.created_at >= ${ago(minutes * 60e3)}` : sql``;
  return q<ActivityRow>(sql`
    SELECT e.id, e.type, e.path, e.product_id, e.meta, e.created_at, e.visitor_id, e.user_id,
           u.name, u.email, v.city, v.country, v.device
    FROM events e
    LEFT JOIN users u ON u.id = e.user_id
    LEFT JOIN visitors v ON v.id = e.visitor_id
    ${where}
    ORDER BY e.created_at DESC LIMIT ${limit}`);
}

export async function liveVisitors() {
  return q<{ visitor_id: string; name: string | null; city: string | null; country: string | null; device: string | null; path: string; last: string; events: string }>(sql`
    SELECT DISTINCT ON (e.visitor_id) e.visitor_id, u.name, v.city, v.country, v.device, e.path, e.created_at AS last,
           (SELECT count(*) FROM events x WHERE x.visitor_id = e.visitor_id AND x.created_at >= ${ago(30 * 60e3)}) AS events
    FROM events e
    LEFT JOIN visitors v ON v.id = e.visitor_id
    LEFT JOIN users u ON u.id = coalesce(e.user_id, v.user_id)
    WHERE e.created_at >= ${ago(5 * 60e3)} AND e.visitor_id IS NOT NULL
    ORDER BY e.visitor_id, e.created_at DESC`);
}

export async function timeline(by: { userId?: string; visitorId?: string }, limit = 300) {
  const cond = by.userId ? sql`(e.user_id = ${by.userId} OR e.visitor_id IN (SELECT id FROM visitors WHERE user_id = ${by.userId}))` : sql`e.visitor_id = ${by.visitorId!}`;
  return q<ActivityRow>(sql`
    SELECT e.id, e.type, e.path, e.product_id, e.meta, e.created_at, e.visitor_id, e.user_id, null AS name, null AS email, null AS city, null AS country, null AS device
    FROM events e WHERE ${cond} ORDER BY e.created_at DESC LIMIT ${limit}`);
}

/* ───────────────────────── Interest (who wants what) ───────────────────────── */

export type InterestRow = {
  person: string; user_id: string | null; visitor_id: string | null; name: string | null; email: string | null; city: string | null;
  product_id: string; views: string; last_viewed: string; wishlisted: boolean; bagged: boolean; ordered: boolean; score: string;
};

export async function interest(opts: { userId?: string; productId?: string; hot?: boolean; limit?: number } = {}) {
  const filters: SQL[] = [];
  if (opts.userId) filters.push(sql`person_user = ${opts.userId}`);
  if (opts.productId) filters.push(sql`i.product_id = ${opts.productId}`);
  if (opts.hot) filters.push(sql`i.views >= 2 AND NOT coalesce(o.ordered, false)`);
  const where = filters.length ? sql`WHERE ${sql.join(filters, sql` AND `)}` : sql``;
  return q<InterestRow>(sql`
    WITH ev AS (
      SELECT coalesce(e.user_id, v.user_id) AS person_user, e.visitor_id, e.product_id, e.type, e.created_at
      FROM events e LEFT JOIN visitors v ON v.id = e.visitor_id
      WHERE e.product_id IS NOT NULL AND e.type IN ('product_view', 'wishlist_add', 'add_to_bag', 'patina_preview', 'fit_check', 'reservation_open')
    ),
    i AS (
      SELECT coalesce(person_user::text, 'v:' || visitor_id::text) AS person, person_user, min(visitor_id::text) AS visitor_id, product_id,
             count(*) FILTER (WHERE type = 'product_view') AS views,
             max(created_at) AS last_viewed,
             bool_or(type = 'wishlist_add') AS ev_wish,
             bool_or(type = 'add_to_bag') AS bagged,
             count(*) FILTER (WHERE type IN ('patina_preview', 'fit_check', 'reservation_open')) AS deep
      FROM ev GROUP BY 1, 2, 4
    ),
    o AS (
      SELECT o.user_id, oi.product_id, true AS ordered FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.user_id IS NOT NULL GROUP BY 1, 2
    )
    SELECT i.person, i.person_user AS user_id, i.visitor_id, u.name, u.email, vv.city, i.product_id, i.views, i.last_viewed,
           (coalesce(i.ev_wish, false) OR w.user_id IS NOT NULL) AS wishlisted, i.bagged, coalesce(o.ordered, false) AS ordered,
           (i.views + 3 * (CASE WHEN coalesce(i.ev_wish, false) OR w.user_id IS NOT NULL THEN 1 ELSE 0 END) + 4 * (CASE WHEN i.bagged THEN 1 ELSE 0 END) + 2 * i.deep) AS score
    FROM i
    LEFT JOIN users u ON u.id = i.person_user
    LEFT JOIN visitors vv ON vv.id::text = i.visitor_id
    LEFT JOIN wishlist w ON w.user_id = i.person_user AND w.product_id = i.product_id
    LEFT JOIN o ON o.user_id = i.person_user AND o.product_id = i.product_id
    ${where}
    ORDER BY score DESC, last_viewed DESC
    LIMIT ${opts.limit ?? 200}`);
}

/* ───────────────────────── People ───────────────────────── */

export async function customers(search = "") {
  const like = `%${search.toLowerCase()}%`;
  return q<{ id: string; name: string; email: string; phone: string | null; created_at: string; last_seen_at: string | null; marketing: boolean; orders: string; spent: string; wishlist: string; views: string; role: string; is_demo: boolean }>(sql`
    SELECT u.id, u.name, u.email, u.phone, u.created_at, u.last_seen_at, u.marketing, u.role, u.is_demo,
      (SELECT count(*) FROM orders o WHERE o.user_id = u.id) AS orders,
      (SELECT coalesce(sum(total), 0) FROM orders o WHERE o.user_id = u.id) AS spent,
      (SELECT count(*) FROM wishlist w WHERE w.user_id = u.id) AS wishlist,
      (SELECT count(*) FROM events e WHERE e.user_id = u.id AND e.type = 'product_view') AS views
    FROM users u
    WHERE (${search} = '' OR lower(u.name) LIKE ${like} OR lower(u.email) LIKE ${like})
    ORDER BY u.created_at DESC LIMIT 500`);
}

export async function customer(id: string) {
  const [u] = await q<{ id: string; name: string; email: string; phone: string | null; address: Record<string, string> | null; created_at: string; last_seen_at: string | null; marketing: boolean; role: string }>(
    sql`SELECT id, name, email, phone, address, created_at, last_seen_at, marketing, role FROM users WHERE id = ${id}`,
  );
  if (!u) return null;
  const [orders, wish, reservations, visitors, passports] = await Promise.all([
    q<{ id: string; number: string; total: number; status: number; created_at: string; items: string }>(sql`
      SELECT o.id, o.number, o.total, o.status, o.created_at, string_agg(oi.name || ' · ' || oi.color || ' × ' || oi.qty, ', ') AS items
      FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id WHERE o.user_id = ${id} GROUP BY o.id ORDER BY o.created_at DESC`),
    q<{ product_id: string; created_at: string }>(sql`SELECT product_id, created_at FROM wishlist WHERE user_id = ${id} ORDER BY created_at DESC`),
    q<{ id: string; product_id: string; boutique: string; date: string; slot: string; status: string; kind: string }>(sql`SELECT id, product_id, boutique, date::text, slot, status, kind FROM reservations WHERE user_id = ${id} ORDER BY created_at DESC`),
    q<{ id: string; city: string | null; country: string | null; device: string | null; browser: string | null; os: string | null; referrer: string | null; first_seen: string; page_views: number }>(sql`
      SELECT id, city, country, device, browser, os, referrer, first_seen, page_views FROM visitors WHERE user_id = ${id} ORDER BY last_seen DESC`),
    q<{ serial: string; product_id: string }>(sql`SELECT serial, product_id FROM passports WHERE owner_user_id = ${id}`),
  ]);
  return { u, orders, wish, reservations, visitors, passports };
}

export async function visitors(filter: "all" | "known" | "anonymous" = "all") {
  const where = filter === "known" ? sql`WHERE v.user_id IS NOT NULL` : filter === "anonymous" ? sql`WHERE v.user_id IS NULL` : sql``;
  return q<{ id: string; user_id: string | null; name: string | null; email: string | null; city: string | null; country: string | null; device: string | null; browser: string | null; os: string | null; referrer: string | null; utm_source: string | null; page_views: number; first_seen: string; last_seen: string; last_path: string | null }>(sql`
    SELECT v.*, u.name, u.email,
      (SELECT path FROM events e WHERE e.visitor_id = v.id ORDER BY created_at DESC LIMIT 1) AS last_path
    FROM visitors v LEFT JOIN users u ON u.id = v.user_id
    ${where}
    ORDER BY v.last_seen DESC LIMIT 300`);
}

export async function visitor(id: string) {
  const [v] = await q<{ id: string; user_id: string | null; name: string | null; email: string | null; city: string | null; country: string | null; device: string | null; browser: string | null; os: string | null; referrer: string | null; landing_path: string | null; utm_source: string | null; page_views: number; first_seen: string; last_seen: string }>(sql`
    SELECT v.*, u.name, u.email FROM visitors v LEFT JOIN users u ON u.id = v.user_id WHERE v.id = ${id}`);
  return v ?? null;
}

/* ───────────────────────── Commerce ───────────────────────── */

export async function productStats(days: number) {
  const from = since(days);
  return q<{ product_id: string; views: string; viewers: string; wishlist: string; bag: string; units: string; revenue: string }>(sql`
    WITH e AS (
      SELECT product_id,
        count(*) FILTER (WHERE type = 'product_view') AS views,
        count(DISTINCT visitor_id) FILTER (WHERE type = 'product_view') AS viewers,
        count(*) FILTER (WHERE type = 'wishlist_add') AS wishlist,
        count(*) FILTER (WHERE type = 'add_to_bag') AS bag
      FROM events WHERE product_id IS NOT NULL AND created_at >= ${from} GROUP BY 1
    ),
    s AS (
      SELECT oi.product_id, sum(oi.qty) AS units, sum(oi.qty * oi.unit_price) AS revenue
      FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.created_at >= ${from} GROUP BY 1
    )
    SELECT coalesce(e.product_id, s.product_id) AS product_id, coalesce(e.views, 0) AS views, coalesce(e.viewers, 0) AS viewers,
           coalesce(e.wishlist, 0) AS wishlist, coalesce(e.bag, 0) AS bag, coalesce(s.units, 0) AS units, coalesce(s.revenue, 0) AS revenue
    FROM e FULL OUTER JOIN s ON s.product_id = e.product_id`);
}

export async function orders() {
  return q<{ id: string; number: string; name: string; email: string; user_id: string | null; total: number; status: number; pay_method: string; ship_method: string; created_at: string; items: string; ship_to: Record<string, string> }>(sql`
    SELECT o.id, o.number, o.name, o.email, o.user_id, o.total, o.status, o.pay_method, o.ship_method, o.created_at, o.ship_to,
           string_agg(oi.name || ' · ' || oi.color || ' × ' || oi.qty, ', ') AS items
    FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id ORDER BY o.created_at DESC LIMIT 500`);
}

export async function reservations() {
  return q<{ id: string; name: string; email: string; phone: string | null; user_id: string | null; product_id: string; color: string; boutique: string; date: string; slot: string; kind: string; status: string; notes: string | null; created_at: string }>(sql`
    SELECT id, name, email, phone, user_id, product_id, color, boutique, date::text AS date, slot, kind, status, notes, created_at FROM reservations ORDER BY date DESC, slot DESC LIMIT 500`);
}

export async function subscribers() {
  return q<{ email: string; source: string; created_at: string; name: string | null }>(sql`
    SELECT s.email, s.source, s.created_at, u.name FROM subscribers s LEFT JOIN users u ON u.email = s.email ORDER BY s.created_at DESC LIMIT 2000`);
}

export async function rawExport(type: string) {
  switch (type) {
    case "customers":
      return customers();
    case "subscribers":
      return subscribers();
    case "orders":
      return orders();
    case "reservations":
      return reservations();
    case "interest":
      return interest({ limit: 5000 });
    case "events":
      return q(sql`SELECT e.created_at, e.type, e.path, e.product_id, e.meta::text AS meta, u.email, e.visitor_id, v.country, v.city, v.device FROM events e LEFT JOIN users u ON u.id = e.user_id LEFT JOIN visitors v ON v.id = e.visitor_id ORDER BY e.created_at DESC LIMIT 50000`);
    default:
      return null;
  }
}

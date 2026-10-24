import Link from "next/link";
import { AreaChart } from "@/components/admin/client";
import { Avatar, BarList, Badge, PageHead, Panel, ProductThumb, RangeTabs, rangeOf, Stat } from "@/components/admin/ui";
import { breakdown, daily, funnel, interest, overview, recentActivity } from "@/server/admin-queries";
import { describe, flag, pct, pname, timeAgo } from "@/lib/admin-format";
import { fmt } from "@/lib/data";

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const days = rangeOf((await searchParams).range);
  const [o, d, b, f, act, hot] = await Promise.all([overview(days), daily(days), breakdown(days), funnel(days), recentActivity(14), interest({ hot: true, limit: 6 })]);
  const top = f[0][1] || 1;

  return (
    <>
      <PageHead title="Overview" sub={`Last ${days} days · compared with the ${days} days before`}>
        <RangeTabs value={days} base="/admin" />
      </PageHead>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="VISITORS" value={o.visitors.toLocaleString("en-CA")} current={o.visitors} prev={o.visitorsPrev} hint={`${o.live} online now`} href="/admin/visitors" />
        <Stat label="REVENUE" value={fmt(o.revenue).replace(" CAD", "")} current={o.revenue} prev={o.revenuePrev} hint="CAD" href="/admin/orders" />
        <Stat label="ORDERS" value={String(o.orders)} current={o.orders} prev={o.ordersPrev} hint={`AOV ${fmt(Math.round(o.aov)).replace(" CAD", "")}`} href="/admin/orders" />
        <Stat label="NEW CLIENTS" value={String(o.signups)} current={o.signups} prev={o.signupsPrev} hint={`${o.customers} total`} href="/admin/customers" />
        <Stat label="PAGE VIEWS" value={o.pageViews.toLocaleString("en-CA")} current={o.pageViews} prev={o.pageViewsPrev} hint={o.visitors ? `${(o.pageViews / o.visitors).toFixed(1)} per visitor` : ""} />
        <Stat label="CONVERSION" value={pct(o.conversion)} hint="orders ÷ visitors" />
        <Stat label="WISHLIST SAVES" value={String(o.wishlistAdds)} hint={`${o.bagAdds} added to bag`} href="/admin/interest" />
        <Stat label="APPOINTMENTS" value={String(o.reservations)} hint={o.pendingReservations ? `${o.pendingReservations} to confirm` : "none pending"} href="/admin/reservations" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="TRAFFIC">
          <AreaChart
            data={d}
            series={[
              { key: "views", label: "Page views", color: "#C6A66A" },
              { key: "visitors", label: "Visitors", color: "#291A13" },
            ]}
          />
        </Panel>
        <Panel title="FUNNEL">
          <div className="flex flex-col gap-3">
            {f.map(([label, v], i) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-[12px]">
                  <span>{label}</span>
                  <span className="tabular-nums">
                    {v.toLocaleString("en-CA")} <span className="text-taupe">· {pct(v / top)}</span>
                  </span>
                </div>
                <div className="h-2 bg-ink/[.06]">
                  <div className="h-full transition-[width] duration-1000" style={{ width: `${(v / top) * 100}%`, background: i === f.length - 1 ? "#424A38" : "#C6A66A", opacity: 1 - i * 0.12 }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="HOT LEADS — VIEWED 2+ TIMES, NOT BOUGHT" action={<Link href="/admin/interest?hot=1" className="text-[10px] tracking-[.18em] text-taupe hover:text-ink">ALL →</Link>}>
          {!hot.length && <p className="m-0 text-[13px] text-taupe">No repeat interest yet.</p>}
          <ul className="m-0 flex list-none flex-col p-0">
            {hot.map((h, i) => (
              <li key={i} className="flex items-center gap-3 border-t border-ink/[.06] py-2.5 first:border-0">
                <ProductThumb id={h.product_id} size={30} />
                <div className="min-w-0 flex-1 text-[13px]">
                  <Link href={h.user_id ? `/admin/customers/${h.user_id}` : `/admin/visitors/${h.visitor_id}`} className="block truncate hover:text-burgundy">
                    {h.name ?? `Visitor ${h.visitor_id?.slice(0, 4).toUpperCase()}${h.city ? ` · ${h.city}` : ""}`}
                  </Link>
                  <span className="text-[11px] text-taupe">
                    {pname(h.product_id)} · viewed {h.views}×
                  </span>
                </div>
                {h.wishlisted && <Badge tone="gold">♥</Badge>}
                {h.bagged && <Badge tone="warn">BAG</Badge>}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="MOST VIEWED PIECES" action={<Link href="/admin/products" className="text-[10px] tracking-[.18em] text-taupe hover:text-ink">ALL →</Link>}>
          <BarList rows={b.products.map((r) => ({ label: pname(r.k), value: Number(r.v), sub: `${r.u} people`, href: `/admin/interest?product=${r.k}` }))} />
        </Panel>
        <Panel title="LIVE ACTIVITY" action={<Link href="/admin/live" className="text-[10px] tracking-[.18em] text-taupe hover:text-ink">LIVE →</Link>}>
          {!act.length && <p className="m-0 text-[13px] text-taupe">Nothing yet.</p>}
          <ul className="m-0 flex list-none flex-col p-0">
            {act.map((e) => (
              <li key={e.id} className="flex items-start gap-3 border-t border-ink/[.06] py-2 text-[12px] first:border-0">
                <Avatar name={e.name} seed={e.visitor_id} />
                <div className="min-w-0 flex-1">
                  <span className="block truncate">{describe(e).text}</span>
                  <span className="text-[11px] text-taupe">
                    {e.name ?? `Visitor ${e.visitor_id?.slice(0, 4).toUpperCase() ?? ""}`} · {flag(e.country)} {e.city ?? ""} · {timeAgo(e.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="TOP PAGES">
          <BarList rows={b.pages.map((r) => ({ label: r.k, value: Number(r.v) }))} />
        </Panel>
        <Panel title="TRAFFIC SOURCES">
          <BarList rows={b.referrers.map((r) => ({ label: r.k, value: Number(r.v) }))} />
        </Panel>
        <Panel title="COUNTRIES">
          <BarList rows={b.countries.map((r) => ({ label: `${flag(r.k)} ${r.k}`, value: Number(r.v) }))} />
        </Panel>
        <Panel title="DEVICES">
          <BarList rows={b.devices.map((r) => ({ label: r.k.charAt(0).toUpperCase() + r.k.slice(1), value: Number(r.v) }))} />
        </Panel>
        <Panel title="WHAT PEOPLE SEARCH FOR">
          <BarList rows={b.searches.map((r) => ({ label: `“${r.k}”`, value: Number(r.v) }))} empty="No searches yet." />
        </Panel>
        <Panel title="REVENUE BY DAY">
          <AreaChart data={d} series={[{ key: "revenue", label: "Revenue", color: "#424A38", money: true }]} />
        </Panel>
      </div>
    </>
  );
}

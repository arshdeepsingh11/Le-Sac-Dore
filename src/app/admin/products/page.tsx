import Link from "next/link";
import { ExportLink, PageHead, Panel, ProductThumb, RangeTabs, rangeOf, Table } from "@/components/admin/ui";
import { productStats } from "@/server/admin-queries";
import { pct } from "@/lib/admin-format";
import { fmt, PRODUCTS } from "@/lib/data";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ range?: string; focus?: string }> }) {
  const sp = await searchParams;
  const days = rangeOf(sp.range);
  const stats = await productStats(days);
  const rows = PRODUCTS.map((p) => {
    const s = stats.find((x) => x.product_id === p.id);
    const viewers = Number(s?.viewers ?? 0), units = Number(s?.units ?? 0);
    return { p, views: Number(s?.views ?? 0), viewers, wishlist: Number(s?.wishlist ?? 0), bag: Number(s?.bag ?? 0), units, revenue: Number(s?.revenue ?? 0), conv: viewers ? units / viewers : 0 };
  }).sort((a, b) => b.views - a.views);
  return (
    <>
      <PageHead title="Products" sub={`How each piece performs · last ${days} days`}>
        <RangeTabs value={days} base="/admin/products" />
        <ExportLink type="events" label="EXPORT EVENTS" />
      </PageHead>
      <Panel>
        <Table head={["PIECE", "VIEWS", "PEOPLE", "WISHLIST", "ADDED TO BAG", "SOLD", "REVENUE", "VIEW → BUY", ""]} minWidth={940}>
          {rows.map((r) => (
            <tr key={r.p.id} className={sp.focus === r.p.id ? "bg-gold/10" : ""}>
              <td>
                <span className="flex items-center gap-3">
                  <ProductThumb id={r.p.id} size={34} />
                  <span>
                    <span className="block font-medium">{r.p.name}</span>
                    <span className="text-[11px] text-taupe">{fmt(r.p.price)}</span>
                  </span>
                </span>
              </td>
              <td className="tabular-nums">{r.views}</td>
              <td className="tabular-nums">{r.viewers}</td>
              <td className="tabular-nums">{r.wishlist}</td>
              <td className="tabular-nums">{r.bag}</td>
              <td className="tabular-nums">{r.units}</td>
              <td className="tabular-nums">{r.revenue ? fmt(r.revenue) : "—"}</td>
              <td className="tabular-nums">{r.viewers ? pct(r.conv) : "—"}</td>
              <td>
                <Link href={`/admin/interest?product=${r.p.id}`} className="text-[10px] tracking-[.16em] whitespace-nowrap text-taupe hover:text-ink">
                  WHO&apos;S INTERESTED →
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}

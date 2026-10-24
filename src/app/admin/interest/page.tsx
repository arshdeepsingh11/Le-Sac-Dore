import Link from "next/link";
import { Badge, ExportLink, PageHead, Panel, ProductThumb, Table } from "@/components/admin/ui";
import { interest } from "@/server/admin-queries";
import { pname, timeAgo } from "@/lib/admin-format";
import { PRODUCTS } from "@/lib/data";
import { cn } from "@/lib/utils";

export default async function InterestPage({ searchParams }: { searchParams: Promise<{ hot?: string; product?: string }> }) {
  const sp = await searchParams;
  const hot = sp.hot === "1";
  const product = PRODUCTS.some((p) => p.id === sp.product) ? sp.product : undefined;
  const rows = await interest({ hot, productId: product });
  const chip = (href: string, label: string, on: boolean) => (
    <Link href={href} className={cn("border px-3 py-1.5 text-[10px] tracking-[.16em] whitespace-nowrap transition-colors", on ? "border-ink bg-ink text-cream" : "border-ink/15 bg-ivory text-taupe hover:text-ink")}>
      {label}
    </Link>
  );

  return (
    <>
      <PageHead title="Interest" sub="Who keeps coming back to which piece — ranked by intent. Repeat views, wishlist saves and bag adds all count.">
        <ExportLink type="interest" />
      </PageHead>
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 wide:mx-0 wide:flex-wrap wide:px-0">
        {chip("/admin/interest", "EVERYONE", !hot && !product)}
        {chip("/admin/interest?hot=1", "HOT LEADS · 2+ VIEWS, NOT BOUGHT", hot)}
        {PRODUCTS.map((p) => chip(`/admin/interest?product=${p.id}`, p.name, product === p.id))}
      </div>
      <Panel>
        <Table head={["PERSON", "PIECE", "VIEWS", "SIGNALS", "INTENT", "LAST SEEN"]}>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <Link href={r.user_id ? `/admin/customers/${r.user_id}` : `/admin/visitors/${r.visitor_id}`} className="hover:text-burgundy">
                  <span className="block font-medium">{r.name ?? `Visitor ${r.visitor_id?.slice(0, 4).toUpperCase()}`}</span>
                  <span className="text-[11px] text-taupe">{r.email ?? r.city ?? "Anonymous"}</span>
                </Link>
              </td>
              <td>
                <span className="flex items-center gap-3">
                  <ProductThumb id={r.product_id} size={28} />
                  {pname(r.product_id)}
                </span>
              </td>
              <td className="tabular-nums">{r.views}×</td>
              <td>
                <span className="flex flex-wrap gap-1">
                  {Number(r.views) >= 2 && <Badge tone="warn">RETURNING</Badge>}
                  {r.wishlisted && <Badge tone="gold">♥ WISHLIST</Badge>}
                  {r.bagged && <Badge tone="warn">IN BAG</Badge>}
                  {r.ordered && <Badge tone="good">BOUGHT</Badge>}
                </span>
              </td>
              <td>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-16 bg-ink/[.07]">
                    <span className="block h-full bg-gold" style={{ width: `${Math.min(100, Number(r.score) * 8)}%` }} />
                  </span>
                  <span className="text-[11px] tabular-nums">{r.score}</span>
                </span>
              </td>
              <td className="text-taupe">{timeAgo(r.last_viewed)}</td>
            </tr>
          ))}
        </Table>
        {!rows.length && <p className="m-0 py-6 text-center text-[13px] text-taupe">No interest signals yet.</p>}
      </Panel>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Timeline } from "@/components/admin/timeline";
import { Avatar, Badge, Panel, ProductThumb } from "@/components/admin/ui";
import { customer, interest, timeline } from "@/server/admin-queries";
import { flag, pname, STATUS, timeAgo } from "@/lib/admin-format";
import { fmt } from "@/lib/data";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const data = await customer(id);
  if (!data) notFound();
  const { u, orders, wish, reservations, visitors, passports } = data;
  const [ints, events] = await Promise.all([interest({ userId: id, limit: 12 }), timeline({ userId: id })]);
  const spent = orders.reduce((a, o) => a + Number(o.total), 0);
  const v = visitors[0];
  const facts: [string, string][] = [
    ["EMAIL", u.email],
    ["PHONE", u.phone ?? "—"],
    ["ADDRESS", u.address?.address ? `${u.address.address}, ${u.address.city ?? ""} ${u.address.postal ?? ""}` : "—"],
    ["CLIENT SINCE", new Date(u.created_at).toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" })],
    ["LAST SEEN", timeAgo(u.last_seen_at)],
    ["LOCATION", v ? `${flag(v.country)} ${v.city ?? ""} ${v.country ?? ""}`.trim() || "—" : "—"],
    ["DEVICE", v ? `${v.device ?? ""} · ${v.browser ?? ""} · ${v.os ?? ""}` : "—"],
    ["FIRST CAME FROM", v?.referrer ?? "Direct"],
    ["NEWSLETTER", u.marketing ? "Subscribed" : "No"],
  ];

  return (
    <>
      <Link href="/admin/customers" className="text-[10px] tracking-[.2em] text-taupe hover:text-ink">← CUSTOMERS</Link>
      <div className="mt-4 mb-8 flex flex-wrap items-center gap-4">
        <span className="scale-125"><Avatar name={u.name} seed={u.id} /></span>
        <div className="ml-2">
          <h1 className="m-0 font-serif text-[clamp(30px,3vw,42px)] leading-none font-light">{u.name}</h1>
          <p className="mt-2 mb-0 text-[13px] text-taupe">
            {orders.length} orders · {fmt(spent)} lifetime · {wish.length} saved · {passports.length} bags registered
          </p>
        </div>
        {u.role === "admin" && <Badge tone="gold">ADMIN</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="flex flex-col gap-3">
          <Panel title="PROFILE">
            <dl className="m-0">
              {facts.map(([k, val]) => (
                <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-t border-ink/[.06] py-2.5 text-[13px] first:border-0">
                  <dt className="text-[9px] font-semibold tracking-[.2em] text-taupe">{k}</dt>
                  <dd className="m-0 break-words">{val}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="INTERESTS — WHAT THEY KEEP LOOKING AT">
            {!ints.length && <p className="m-0 text-[13px] text-taupe">No product interest yet.</p>}
            <ul className="m-0 flex list-none flex-col p-0">
              {ints.map((r) => (
                <li key={r.product_id} className="flex items-center gap-3 border-t border-ink/[.06] py-2.5 text-[13px] first:border-0">
                  <ProductThumb id={r.product_id} size={30} />
                  <span className="flex-1">
                    <span className="block">{pname(r.product_id)}</span>
                    <span className="text-[11px] text-taupe">viewed {r.views}× · {timeAgo(r.last_viewed)}</span>
                  </span>
                  <span className="flex flex-wrap justify-end gap-1">
                    {r.wishlisted && <Badge tone="gold">♥</Badge>}
                    {r.bagged && <Badge tone="warn">BAG</Badge>}
                    {r.ordered && <Badge tone="good">BOUGHT</Badge>}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={`WISHLIST · ${wish.length}`}>
            {!wish.length && <p className="m-0 text-[13px] text-taupe">Nothing saved.</p>}
            <div className="flex flex-wrap gap-3">
              {wish.map((w) => (
                <span key={w.product_id} className="flex items-center gap-2 text-[12px]">
                  <ProductThumb id={w.product_id} size={26} /> {pname(w.product_id)}
                </span>
              ))}
            </div>
          </Panel>
          <Panel title={`ORDERS · ${orders.length}`}>
            {!orders.length && <p className="m-0 text-[13px] text-taupe">No orders yet.</p>}
            {orders.map((o) => (
              <div key={o.id} className="border-t border-ink/[.06] py-2.5 text-[13px] first:border-0">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{o.number}</span>
                  <span className="tabular-nums">{fmt(Number(o.total))}</span>
                </div>
                <div className="mt-0.5 flex justify-between gap-3 text-[11px] text-taupe">
                  <span className="truncate">{o.items}</span>
                  <span className="shrink-0">{STATUS[o.status]} · {timeAgo(o.created_at)}</span>
                </div>
              </div>
            ))}
          </Panel>
          {reservations.length > 0 && (
            <Panel title="APPOINTMENTS">
              {reservations.map((r) => (
                <div key={r.id} className="flex justify-between gap-3 border-t border-ink/[.06] py-2.5 text-[13px] first:border-0">
                  <span>{pname(r.product_id)} · {r.boutique}</span>
                  <span className="text-taupe">{r.date} {r.slot} · {r.status}</span>
                </div>
              ))}
            </Panel>
          )}
        </div>
        <Panel title="ACTIVITY TIMELINE">
          <Timeline rows={events} />
        </Panel>
      </div>
    </>
  );
}

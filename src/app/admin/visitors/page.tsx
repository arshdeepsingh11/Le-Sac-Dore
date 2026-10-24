import Link from "next/link";
import { Avatar, Badge, ExportLink, PageHead, Panel, Table } from "@/components/admin/ui";
import { visitors } from "@/server/admin-queries";
import { flag, timeAgo } from "@/lib/admin-format";
import { cn } from "@/lib/utils";

export default async function VisitorsPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const f = (await searchParams).f;
  const filter = f === "known" || f === "anonymous" ? f : "all";
  const rows = await visitors(filter);
  return (
    <>
      <PageHead title="Visitors" sub="Every browser that accepted analytics — signed-in clients are linked to their account automatically.">
        <div className="flex border border-ink/12 bg-ivory">
          {(["all", "known", "anonymous"] as const).map((k) => (
            <Link key={k} href={`/admin/visitors${k === "all" ? "" : `?f=${k}`}`} className={cn("px-3.5 py-2 text-[10px] tracking-[.18em] uppercase", filter === k ? "bg-ink text-cream" : "text-taupe hover:text-ink")}>
              {k}
            </Link>
          ))}
        </div>
        <ExportLink type="events" label="EXPORT EVENTS" />
      </PageHead>
      <Panel>
        <Table head={["VISITOR", "LOCATION", "DEVICE", "SOURCE", "PAGES", "LAST PAGE", "FIRST SEEN", "LAST SEEN"]} minWidth={980}>
          {rows.map((v) => (
            <tr key={v.id}>
              <td>
                <Link href={`/admin/visitors/${v.id}`} className="flex items-center gap-3 hover:text-burgundy">
                  <Avatar name={v.name} seed={v.id} />
                  <span>
                    <span className="block font-medium">{v.name ?? `Visitor ${v.id.slice(0, 4).toUpperCase()}`}</span>
                    <span className="text-[11px] text-taupe">{v.email ?? "Anonymous"}</span>
                  </span>
                </Link>
              </td>
              <td className="whitespace-nowrap">{flag(v.country)} {v.city ?? v.country ?? "—"}</td>
              <td className="whitespace-nowrap text-taupe">{v.device} · {v.browser}</td>
              <td>{v.utm_source ? <Badge tone="gold">{v.utm_source}</Badge> : <span className="text-taupe">{v.referrer ?? "Direct"}</span>}</td>
              <td className="tabular-nums">{v.page_views}</td>
              <td className="max-w-[180px] truncate text-taupe">{v.last_path ?? "—"}</td>
              <td className="whitespace-nowrap text-taupe">{timeAgo(v.first_seen)}</td>
              <td className="whitespace-nowrap">{timeAgo(v.last_seen)}</td>
            </tr>
          ))}
        </Table>
        {!rows.length && <p className="m-0 py-6 text-center text-[13px] text-taupe">No visitors yet.</p>}
      </Panel>
    </>
  );
}

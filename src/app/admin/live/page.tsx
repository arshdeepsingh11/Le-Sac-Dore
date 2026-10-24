import Link from "next/link";
import { AutoRefresh } from "@/components/admin/client";
import { Avatar, Badge, PageHead, Panel } from "@/components/admin/ui";
import { liveVisitors, recentActivity } from "@/server/admin-queries";
import { describe, flag, timeAgo } from "@/lib/admin-format";

export default async function LivePage() {
  const [live, feed] = await Promise.all([liveVisitors(), recentActivity(60, 60)]);
  return (
    <>
      <PageHead title="Live" sub="Who is in the boutique right now, and what they are doing.">
        <AutoRefresh seconds={10} />
      </PageHead>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Panel title={`ONLINE NOW · ${live.length}`}>
          {!live.length && <p className="m-0 text-[13px] text-taupe">No one in the last 5 minutes.</p>}
          <ul className="m-0 flex list-none flex-col p-0">
            {live.map((v) => (
              <li key={v.visitor_id} className="border-t border-ink/[.06] first:border-0">
                <Link href={`/admin/visitors/${v.visitor_id}`} className="flex items-center gap-3 py-3 transition-colors hover:text-burgundy">
                  <span className="relative">
                    <Avatar name={v.name} seed={v.visitor_id} />
                    <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-ivory bg-[#5E9E4F]" />
                  </span>
                  <span className="min-w-0 flex-1 text-[13px]">
                    <span className="block truncate">{v.name ?? `Visitor ${v.visitor_id.slice(0, 4).toUpperCase()}`}</span>
                    <span className="block truncate text-[11px] text-taupe">
                      {flag(v.country)} {v.city ?? "Unknown"} · {v.device} · on {v.path}
                    </span>
                  </span>
                  <Badge>{v.events} events</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="LAST HOUR">
          {!feed.length && <p className="m-0 text-[13px] text-taupe">Quiet hour.</p>}
          <ul className="m-0 flex list-none flex-col p-0">
            {feed.map((e) => (
              <li key={e.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-ink/[.06] py-2.5 text-[13px] first:border-0">
                <span className="min-w-0">
                  <span className="block truncate">{describe(e).text}</span>
                  <Link href={e.user_id ? `/admin/customers/${e.user_id}` : `/admin/visitors/${e.visitor_id}`} className="text-[11px] text-taupe hover:text-ink">
                    {e.name ?? `Visitor ${e.visitor_id?.slice(0, 4).toUpperCase() ?? ""}`} · {flag(e.country)} {e.city ?? ""}
                  </Link>
                </span>
                <span className="text-[11px] text-taupe tabular-nums">{timeAgo(e.created_at)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

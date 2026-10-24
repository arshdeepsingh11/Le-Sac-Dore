import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Timeline } from "@/components/admin/timeline";
import { Avatar, Panel } from "@/components/admin/ui";
import { timeline, visitor } from "@/server/admin-queries";
import { flag, timeAgo } from "@/lib/admin-format";

export default async function VisitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const v = await visitor(id);
  if (!v) notFound();
  if (v.user_id) redirect(`/admin/customers/${v.user_id}`);
  const events = await timeline({ visitorId: id });
  const facts: [string, string][] = [
    ["LOCATION", `${flag(v.country)} ${v.city ?? ""} ${v.country ?? ""}`.trim() || "—"],
    ["DEVICE", `${v.device ?? ""} · ${v.browser ?? ""} · ${v.os ?? ""}`],
    ["CAME FROM", v.referrer ?? "Direct"],
    ["CAMPAIGN", v.utm_source ?? "—"],
    ["LANDED ON", v.landing_path ?? "—"],
    ["PAGES VIEWED", String(v.page_views)],
    ["FIRST SEEN", timeAgo(v.first_seen)],
    ["LAST SEEN", timeAgo(v.last_seen)],
  ];
  return (
    <>
      <Link href="/admin/visitors" className="text-[10px] tracking-[.2em] text-taupe hover:text-ink">← VISITORS</Link>
      <div className="mt-4 mb-8 flex items-center gap-4">
        <Avatar seed={v.id} />
        <div>
          <h1 className="m-0 font-serif text-[clamp(30px,3vw,42px)] leading-none font-light">Visitor {v.id.slice(0, 4).toUpperCase()}</h1>
          <p className="mt-2 mb-0 text-[13px] text-taupe">Anonymous — linked automatically if they sign up or sign in.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
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
        <Panel title="ACTIVITY TIMELINE">
          <Timeline rows={events} />
        </Panel>
      </div>
    </>
  );
}

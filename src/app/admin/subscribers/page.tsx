import { Badge, ExportLink, PageHead, Panel, Table } from "@/components/admin/ui";
import { subscribers } from "@/server/admin-queries";
import { timeAgo } from "@/lib/admin-format";

export default async function SubscribersPage() {
  const rows = await subscribers();
  return (
    <>
      <PageHead title="Subscribers" sub={`${rows.length} people receive news from the maison`}>
        <ExportLink type="subscribers" />
      </PageHead>
      <Panel>
        <Table head={["EMAIL", "NAME", "SOURCE", "JOINED"]} minWidth={560}>
          {rows.map((r) => (
            <tr key={r.email}>
              <td className="font-medium">{r.email}</td>
              <td className="text-taupe">{r.name ?? "—"}</td>
              <td><Badge>{r.source}</Badge></td>
              <td className="text-taupe">{timeAgo(r.created_at)}</td>
            </tr>
          ))}
        </Table>
        {!rows.length && <p className="m-0 py-6 text-center text-[13px] text-taupe">No subscribers yet.</p>}
      </Panel>
    </>
  );
}

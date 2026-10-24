import Link from "next/link";
import { OrderStatus } from "@/components/admin/client";
import { ExportLink, PageHead, Panel, Table } from "@/components/admin/ui";
import { orders } from "@/server/admin-queries";
import { fmtDateTime } from "@/lib/admin-format";
import { fmt } from "@/lib/data";

export default async function OrdersPage() {
  const rows = await orders();
  const revenue = rows.reduce((a, o) => a + Number(o.total), 0);
  return (
    <>
      <PageHead title="Orders" sub={`${rows.length} orders · ${fmt(revenue)} · updating status writes to each bag's Digital Passport`}>
        <ExportLink type="orders" />
      </PageHead>
      <Panel>
        <Table head={["ORDER", "CLIENT", "PIECES", "TOTAL", "PAYMENT", "PLACED", "STATUS"]} minWidth={960}>
          {rows.map((o) => (
            <tr key={o.id}>
              <td className="font-medium whitespace-nowrap">{o.number}</td>
              <td>
                {o.user_id ? (
                  <Link href={`/admin/customers/${o.user_id}`} className="hover:text-burgundy">{o.name}</Link>
                ) : (
                  <span>{o.name} <span className="text-[11px] text-taupe">(guest)</span></span>
                )}
                <span className="block text-[11px] text-taupe">{o.email}</span>
              </td>
              <td className="max-w-[260px] text-[12px]">{o.items}</td>
              <td className="tabular-nums">{fmt(Number(o.total))}</td>
              <td className="text-taupe uppercase">{o.pay_method} · {o.ship_method}</td>
              <td className="whitespace-nowrap text-taupe">{fmtDateTime(o.created_at)}</td>
              <td><OrderStatus id={o.id} status={o.status} /></td>
            </tr>
          ))}
        </Table>
        {!rows.length && <p className="m-0 py-6 text-center text-[13px] text-taupe">No orders yet.</p>}
      </Panel>
    </>
  );
}

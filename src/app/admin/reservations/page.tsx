import Link from "next/link";
import { ReservationActions } from "@/components/admin/client";
import { Badge, ExportLink, PageHead, Panel, ProductThumb, Table } from "@/components/admin/ui";
import { reservations } from "@/server/admin-queries";
import { pname } from "@/lib/admin-format";

const tone = (s: string) => (s === "confirmed" ? "good" : s === "cancelled" ? "bad" : s === "completed" ? "neutral" : "warn") as "good" | "bad" | "neutral" | "warn";

export default async function ReservationsPage() {
  const rows = await reservations();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = rows.filter((r) => r.date >= today && r.status !== "cancelled").length;
  return (
    <>
      <PageHead title="Appointments" sub={`${upcoming} upcoming · reserve-in-boutique and video appointments, with the piece held 48 hours`}>
        <ExportLink type="reservations" />
      </PageHead>
      <Panel>
        <Table head={["WHEN", "CLIENT", "PIECE", "WHERE", "NOTE", "STATUS", ""]} minWidth={980}>
          {rows.map((r) => (
            <tr key={r.id} className={r.date < today ? "opacity-60" : ""}>
              <td className="whitespace-nowrap">
                <span className="block font-medium">{new Date(r.date + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short", day: "numeric", month: "short" })}</span>
                <span className="text-[11px] text-taupe tabular-nums">{r.slot}</span>
              </td>
              <td>
                {r.user_id ? <Link href={`/admin/customers/${r.user_id}`} className="hover:text-burgundy">{r.name}</Link> : r.name}
                <span className="block text-[11px] text-taupe">{r.email}{r.phone ? ` · ${r.phone}` : ""}</span>
              </td>
              <td>
                <span className="flex items-center gap-3">
                  <ProductThumb id={r.product_id} size={28} />
                  <span>{pname(r.product_id)}<span className="block text-[11px] text-taupe">{r.color}</span></span>
                </span>
              </td>
              <td>{r.kind === "video" ? <Badge tone="gold">VIDEO</Badge> : r.boutique}</td>
              <td className="max-w-[200px] text-[12px] text-taupe">{r.notes ?? "—"}</td>
              <td><Badge tone={tone(r.status)}>{r.status}</Badge></td>
              <td><ReservationActions id={r.id} status={r.status} /></td>
            </tr>
          ))}
        </Table>
        {!rows.length && <p className="m-0 py-6 text-center text-[13px] text-taupe">No appointments yet.</p>}
      </Panel>
    </>
  );
}

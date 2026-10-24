import Link from "next/link";
import { SearchBox } from "@/components/admin/client";
import { Avatar, Badge, ExportLink, PageHead, Panel, Table } from "@/components/admin/ui";
import { customers } from "@/server/admin-queries";
import { timeAgo } from "@/lib/admin-format";
import { fmt } from "@/lib/data";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 80);
  const rows = await customers(q);
  return (
    <>
      <PageHead title="Customers" sub={`${rows.length} accounts · everyone who signed up, with what they bought, saved and browsed.`}>
        <SearchBox placeholder="Search name or email" defaultValue={q} />
        <ExportLink type="customers" />
      </PageHead>
      <Panel>
        <Table head={["CLIENT", "JOINED", "ORDERS", "SPENT", "WISHLIST", "VIEWS", "LAST SEEN", ""]} minWidth={860}>
          {rows.map((u) => (
            <tr key={u.id}>
              <td>
                <Link href={`/admin/customers/${u.id}`} className="flex items-center gap-3 hover:text-burgundy">
                  <Avatar name={u.name} seed={u.id} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{u.name}</span>
                    <span className="block truncate text-[11px] text-taupe">{u.email}</span>
                  </span>
                </Link>
              </td>
              <td className="whitespace-nowrap text-taupe">{new Date(u.created_at).toLocaleDateString("en-CA", { day: "numeric", month: "short", year: "numeric" })}</td>
              <td className="tabular-nums">{u.orders}</td>
              <td className="tabular-nums">{Number(u.spent) ? fmt(Number(u.spent)) : "—"}</td>
              <td className="tabular-nums">{u.wishlist}</td>
              <td className="tabular-nums">{u.views}</td>
              <td className="whitespace-nowrap text-taupe">{timeAgo(u.last_seen_at)}</td>
              <td>
                <span className="flex gap-1">
                  {u.role === "admin" && <Badge tone="gold">ADMIN</Badge>}
                  {u.marketing && <Badge tone="good">NEWSLETTER</Badge>}
                  {u.is_demo && <Badge>DEMO</Badge>}
                </span>
              </td>
            </tr>
          ))}
        </Table>
        {!rows.length && <p className="m-0 py-6 text-center text-[13px] text-taupe">No customers found.</p>}
      </Panel>
    </>
  );
}

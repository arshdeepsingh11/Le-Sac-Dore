import Link from "next/link";
import { describe } from "@/lib/admin-format";
import type { ActivityRow } from "@/server/admin-queries";

const KEY = new Set(["order", "add_to_bag", "wishlist_add", "reservation", "signup", "checkout_start", "concierge_message", "passport_register"]);

/** Day-grouped activity timeline for one person. */
export function Timeline({ rows }: { rows: ActivityRow[] }) {
  if (!rows.length) return <p className="m-0 text-[13px] text-taupe">No activity recorded yet. Activity appears once the visitor accepts analytics cookies.</p>;
  const groups = new Map<string, ActivityRow[]>();
  for (const r of rows) {
    const d = new Date(r.created_at).toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    groups.set(d, [...(groups.get(d) ?? []), r]);
  }
  return (
    <div className="flex flex-col gap-7">
      {[...groups.entries()].map(([day, list]) => (
        <div key={day}>
          <p className="m-0 mb-3 text-[10px] font-semibold tracking-[.22em] text-taupe">{day.toUpperCase()}</p>
          <ol className="relative m-0 list-none p-0">
            <span className="absolute top-1 bottom-1 left-[11px] w-px bg-ink/10" aria-hidden />
            {list.map((r) => {
              const d = describe(r);
              const key = KEY.has(r.type);
              return (
                <li key={r.id} className="relative grid grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-3 py-1.5 text-[13px]">
                  <span className={`relative z-[1] flex size-[23px] items-center justify-center rounded-full text-[10px] ${key ? "bg-espresso text-gold" : "bg-cream text-taupe"}`}>{d.icon}</span>
                  <span className={key ? "font-medium text-ink" : "text-body"}>
                    {r.product_id ? (
                      <Link href={`/admin/products?focus=${r.product_id}`} className="hover:text-burgundy">
                        {d.text}
                      </Link>
                    ) : (
                      d.text
                    )}
                  </span>
                  <span className="text-[11px] text-taupe tabular-nums">{new Date(r.created_at).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}</span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

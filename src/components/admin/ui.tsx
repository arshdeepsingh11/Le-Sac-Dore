import Link from "next/link";
import type { ReactNode } from "react";
import { BagShot } from "../bag-shot";
import { COLORS, findProduct, groundFor } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="m-0 font-serif text-[clamp(32px,3.4vw,46px)] leading-none font-light">{title}</h1>
        {sub && <p className="mt-2.5 mb-0 text-[13px] text-taupe">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0 border border-ink/[.07] bg-ivory p-5 wide:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="m-0 text-[10px] font-semibold tracking-[.24em] text-taupe">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, prev, current, hint, href }: { label: string; value: string; prev?: number; current?: number; hint?: string; href?: string }) {
  const delta = prev !== undefined && current !== undefined ? (prev === 0 ? (current > 0 ? 1 : 0) : (current - prev) / prev) : null;
  const body = (
    <>
      <p className="m-0 text-[10px] font-medium tracking-[.22em] text-taupe">{label}</p>
      <p className="mt-3 mb-0 font-serif text-[clamp(28px,2.6vw,38px)] leading-none tabular-nums">{value}</p>
      <p className="mt-2.5 mb-0 flex items-center gap-2 text-[11px]">
        {delta !== null && (
          <span className={cn("tabular-nums", delta > 0 ? "text-olive" : delta < 0 ? "text-burgundy" : "text-taupe")}>
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta * 100).toFixed(0)}%
          </span>
        )}
        {hint && <span className="text-taupe">{hint}</span>}
      </p>
    </>
  );
  const cls = "block border border-ink/[.07] bg-ivory p-5 transition-shadow duration-500 wide:p-6";
  return href ? (
    <Link href={href} className={cn(cls, "hover:shadow-[0_20px_40px_-28px_rgba(17,12,9,.4)]")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function BarList({ rows, format = (v) => v.toLocaleString("en-CA"), empty = "No data yet." }: { rows: { label: ReactNode; value: number; href?: string; sub?: string }[]; format?: (v: number) => string; empty?: string }) {
  if (!rows.length) return <p className="m-0 text-[13px] text-taupe">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {rows.map((r, i) => {
        const inner = (
          <>
            <span className="absolute inset-y-0 left-0 bg-gold/[.16] transition-[width] duration-700" style={{ width: `${(r.value / max) * 100}%` }} />
            <span className="relative min-w-0 truncate">
              {r.label}
              {r.sub && <span className="ml-2 text-taupe">{r.sub}</span>}
            </span>
            <span className="relative tabular-nums">{format(r.value)}</span>
          </>
        );
        const cls = "relative flex items-center justify-between gap-4 overflow-hidden px-2.5 py-2 text-[13px]";
        return (
          <li key={i}>
            {r.href ? (
              <Link href={r.href} className={cn(cls, "transition-colors hover:text-burgundy")}>
                {inner}
              </Link>
            ) : (
              <div className={cls}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "gold" }) {
  const c = { neutral: "border-ink/15 text-taupe", good: "border-olive/40 text-olive", warn: "border-[#9C7C59]/50 text-[#7A5E3E]", bad: "border-burgundy/40 text-burgundy", gold: "border-gold/60 text-[#9A7B45]" }[tone];
  return <span className={cn("inline-flex items-center border px-2 py-0.5 text-[9px] font-medium tracking-[.18em] whitespace-nowrap uppercase", c)}>{children}</span>;
}

export function Avatar({ name, seed }: { name?: string | null; seed?: string | null }) {
  const label = name ? name.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase() : "··";
  const hue = [...(seed ?? name ?? "x")].reduce((a, c) => a + c.charCodeAt(0), 0) % 4;
  const bg = ["#3B2519", "#424A38", "#5A2029", "#22304A"][hue];
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full font-serif text-[13px] tracking-[.04em] text-cream" style={{ background: name ? bg : "#B5ACA1" }}>
      {label}
    </span>
  );
}

export function ProductThumb({ id, size = 40 }: { id: string; size?: number }) {
  const p = findProduct(id);
  const c = p?.colors[0] ?? "Espresso";
  return (
    <span className="relative block shrink-0 overflow-hidden bg-parch" style={{ width: size, height: size * 1.25 }}>
      <BagShot tone={COLORS[c]} ground={groundFor(c)} texture={p?.texture ?? "grain"} size={64} />
    </span>
  );
}

/** Responsive table: real table on desktop, stacked rows on mobile. */
export function Table({ head, children, minWidth = 760 }: { head: string[]; children: ReactNode; minWidth?: number }) {
  return (
    <div className="-mx-5 overflow-x-auto wide:mx-0" data-lenis-prevent>
      <table className="w-full border-collapse text-left text-[13px]" style={{ minWidth }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-ink/10 px-3 py-3 text-[9px] font-semibold tracking-[.22em] whitespace-nowrap text-taupe first:pl-5 wide:first:pl-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-ink/[.06] [&>tr:hover]:bg-cream/70 [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td:first-child]:pl-5 wide:[&_td:first-child]:pl-3">{children}</tbody>
      </table>
    </div>
  );
}

export function RangeTabs({ value, base }: { value: number; base: string }) {
  return (
    <div className="flex border border-ink/12 bg-ivory">
      {[7, 30, 90].map((d) => (
        <Link key={d} href={`${base}?range=${d}`} className={cn("px-3.5 py-2 text-[10px] tracking-[.18em] transition-colors", value === d ? "bg-ink text-cream" : "text-taupe hover:text-ink")}>
          {d}D
        </Link>
      ))}
    </div>
  );
}

export function ExportLink({ type, label = "EXPORT CSV" }: { type: string; label?: string }) {
  return (
    <a href={`/api/admin/export?type=${type}`} className="border border-ink/15 bg-ivory px-3.5 py-2 text-[10px] tracking-[.18em] transition-colors hover:border-ink">
      {label} ↓
    </a>
  );
}

export const rangeOf = (r?: string) => ([7, 30, 90].includes(Number(r)) ? Number(r) : 30);

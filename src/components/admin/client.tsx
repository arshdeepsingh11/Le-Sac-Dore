"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { motion } from "motion/react";
import { postJSON } from "@/lib/auth-store";
import { STATUS } from "@/lib/admin-format";
import { fmt } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ───────────────────────── Shell navigation ───────────────────────── */

const NAV: [string, string, string][] = [
  ["/admin", "Overview", "◧"],
  ["/admin/live", "Live", "●"],
  ["/admin/interest", "Interest", "♥"],
  ["/admin/customers", "Customers", "◉"],
  ["/admin/visitors", "Visitors", "◎"],
  ["/admin/products", "Products", "◇"],
  ["/admin/orders", "Orders", "★"],
  ["/admin/reservations", "Appointments", "◆"],
  ["/admin/subscribers", "Subscribers", "✉"],
  ["/admin/settings", "Settings", "⚙"],
];

export function AdminNav({ live, pending }: { live: number; pending: number }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const badge = (href: string) =>
    href === "/admin/live" && live > 0 ? <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[#9BC48A]"><span className="size-1.5 animate-pulse rounded-full bg-[#9BC48A]" />{live}</span>
    : href === "/admin/reservations" && pending > 0 ? <span className="ml-auto rounded-full bg-gold px-1.5 text-[10px] text-night">{pending}</span>
    : null;
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden flex-col gap-0.5 wide:flex">
        {NAV.map(([href, label, icon]) => (
          <Link key={href} href={href} className={cn("relative flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors", active(href) ? "text-cream" : "text-cream/55 hover:text-cream")}>
            {active(href) && <motion.span layoutId="admin-nav" className="absolute inset-0 bg-cream/[.08]" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
            <span className="relative w-4 text-center text-[11px] text-gold">{icon}</span>
            <span className="relative">{label}</span>
            <span className="relative ml-auto">{badge(href)}</span>
          </Link>
        ))}
      </nav>
      {/* Mobile tabs */}
      <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 wide:hidden">
        {NAV.map(([href, label]) => (
          <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-1.5 px-3 py-2 text-[12px] whitespace-nowrap transition-colors", active(href) ? "bg-cream/[.1] text-cream" : "text-cream/55")}>
            {label}
            {badge(href)}
          </Link>
        ))}
      </nav>
    </>
  );
}

/* ───────────────────────── Auto refresh ───────────────────────── */

export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  const [t, setT] = useState(seconds);
  useEffect(() => {
    const i = setInterval(() => {
      setT((x) => {
        if (x <= 1) {
          router.refresh();
          return seconds;
        }
        return x - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [router, seconds]);
  return (
    <span className="flex items-center gap-2 text-[10px] tracking-[.18em] text-taupe">
      <span className="size-1.5 animate-pulse rounded-full bg-olive" /> LIVE · REFRESH IN {t}s
    </span>
  );
}

/* ───────────────────────── Area chart ───────────────────────── */

export function AreaChart({ data, series }: { data: { day: string; [k: string]: number | string }[]; series: { key: string; label: string; color: string; money?: boolean }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 800, H = 220, P = { t: 12, r: 8, b: 26, l: 8 };
  const max = useMemo(() => Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key])))), [data, series]);
  const x = (i: number) => P.l + (i / Math.max(1, data.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - v / max) * (H - P.t - P.b);
  const path = (key: string) => data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(Number(d[key])).toFixed(1)}`).join(" ");
  const ticks = data.length > 14 ? [0, Math.floor(data.length / 2), data.length - 1] : data.map((_, i) => i).filter((i) => i % 2 === 0);
  const h = hover ?? data.length - 1;
  const total = (k: string) => data.reduce((a, d) => a + Number(d[k] ?? 0), 0);
  const val = (k: string) => (hover === null ? total(k) : Number(data[h]?.[k] ?? 0));

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-[11px] text-taupe">
            <span className="h-0.5 w-4" style={{ background: s.color }} /> {s.label}
            <strong className="font-semibold text-ink tabular-nums">{s.money ? fmt(val(s.key)) : val(s.key).toLocaleString("en-CA")}</strong>
          </span>
        ))}
        <span className="ml-auto text-[11px] text-taupe">{hover === null ? `Total · ${data.length} days` : data[h] ? new Date(data[h].day + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short", day: "numeric", month: "short" }) : ""}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-none" onMouseLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const rel = ((e.clientX - r.left) / r.width) * W;
          setHover(Math.max(0, Math.min(data.length - 1, Math.round(((rel - P.l) / (W - P.l - P.r)) * (data.length - 1)))));
        }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={s.color} stopOpacity=".22" />
              <stop offset="1" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={P.l} x2={W - P.r} y1={y(max * g)} y2={y(max * g)} stroke="rgba(17,17,17,.06)" />
        ))}
        {series.map((s) => (
          <g key={s.key}>
            <motion.path d={`${path(s.key)} L${x(data.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`} fill={`url(#g-${s.key})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
            <motion.path d={path(s.key)} fill="none" stroke={s.color} strokeWidth="1.6" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }} />
          </g>
        ))}
        <line x1={x(h)} x2={x(h)} y1={P.t} y2={H - P.b} stroke="rgba(17,17,17,.18)" strokeDasharray="3 3" />
        {series.map((s) => (
          <circle key={s.key} cx={x(h)} cy={y(Number(data[h]?.[s.key] ?? 0))} r="3.5" fill="#FCFBF8" stroke={s.color} strokeWidth="1.6" />
        ))}
        {ticks.map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize="10" fill="#857B70" letterSpacing="1">
            {new Date(data[i].day + "T12:00:00").toLocaleDateString("en-CA", { day: "numeric", month: "short" }).toUpperCase()}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ───────────────────────── Actions ───────────────────────── */

export function OrderStatus({ id, status }: { id: string; status: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [v, setV] = useState(status);
  return (
    <select
      value={v}
      disabled={pending}
      onChange={async (e) => {
        const s = Number(e.target.value);
        setV(s);
        await postJSON("/api/admin/orders", { id, status: s }, "PATCH");
        start(() => router.refresh());
      }}
      className="field !w-auto !border-ink/15 !py-1.5 !pr-6 !text-[12px]"
    >
      {STATUS.map((l, i) => (
        <option key={l} value={i}>
          {l}
        </option>
      ))}
    </select>
  );
}

export function ReservationActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = async (s: string) => {
    await postJSON("/api/admin/reservations", { id, status: s }, "PATCH");
    start(() => router.refresh());
  };
  const btn = "border px-2.5 py-1 text-[10px] tracking-[.14em] transition-colors disabled:opacity-40";
  return (
    <div className="flex flex-wrap gap-1.5">
      {status === "requested" && <button disabled={pending} onClick={() => set("confirmed")} className={cn(btn, "border-olive/50 text-olive hover:bg-olive hover:text-cream")}>CONFIRM</button>}
      {status === "confirmed" && <button disabled={pending} onClick={() => set("completed")} className={cn(btn, "border-ink/20 hover:border-ink")}>COMPLETE</button>}
      {status !== "cancelled" && status !== "completed" && <button disabled={pending} onClick={() => set("cancelled")} className={cn(btn, "border-burgundy/30 text-burgundy hover:bg-burgundy hover:text-cream")}>CANCEL</button>}
    </div>
  );
}

export function DemoControls() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const run = async (action: "load" | "clear") => {
    if (action === "clear" && !confirm("Remove all demo data? Real customers, orders and analytics are not affected.")) return;
    setBusy(action);
    await postJSON("/api/admin/demo", { action });
    setBusy(null);
    router.refresh();
  };
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => run("load")} disabled={!!busy} className="btn-ink !px-5 !py-3 !text-[10px]">{busy === "load" ? "LOADING…" : "LOAD DEMO DATA"}</button>
      <button onClick={() => run("clear")} disabled={!!busy} className="btn-line !px-5 !py-3 !text-[10px]">{busy === "clear" ? "CLEARING…" : "CLEAR DEMO DATA"}</button>
    </div>
  );
}

export function SearchBox({ placeholder, param = "q", defaultValue = "" }: { placeholder: string; param?: string; defaultValue?: string }) {
  const router = useRouter();
  const path = usePathname();
  const [v, setV] = useState(defaultValue);
  useEffect(() => {
    const t = setTimeout(() => router.replace(v ? `${path}?${param}=${encodeURIComponent(v)}` : path), 350);
    return () => clearTimeout(t);
  }, [v]); // eslint-disable-line react-hooks/exhaustive-deps
  return <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="w-full border border-ink/12 bg-ivory px-3.5 py-2.5 text-[13px] outline-none focus:border-ink sm:w-64" />;
}

export function SignOutButton({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="text-left text-[12px] text-cream/50 transition-colors hover:text-cream"
    >
      {children}
    </button>
  );
}

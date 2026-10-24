"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { fmt } from "@/lib/data";
import { useShop, useUI, type Order, type Prefs } from "@/lib/store";
import { EASE_LUX } from "@/lib/utils";

export type AccountTab = "orders" | "wish" | "info" | "addr" | "pay" | "prefs";
const TABS: [AccountTab, string][] = [
  ["orders", "ORDERS"],
  ["wish", "WISHLIST"],
  ["info", "PERSONAL DETAILS"],
  ["addr", "ADDRESSES"],
  ["pay", "PAYMENT METHODS"],
  ["prefs", "PREFERENCES"],
];
const TRACK = ["RECEIVED", "PREPARED", "SHIPPED", "DELIVERED"];
const SAMPLE: Order = { number: "LSD-204118", date: "12 August 2026", status: 3, total: 734.5, items: [{ name: "LE ZEN", color: "Espresso", qty: 1 }] };
const PREFS: [keyof Prefs, string, string][] = [
  ["news", "Le Sac Doré newsletter", "Collections and stories from the maison, monthly."],
  ["arrivals", "New arrivals", "Be told when a new piece is released."],
  ["appts", "Private appointment invitations", "Previews at your nearest boutique."],
  ["sms", "SMS order updates", "Delivery notifications by text message."],
];

export function SideNav<T extends string>({ tabs, active, onSelect, id, children }: { tabs: [T, string][]; active: T; onSelect: (k: T) => void; id: string; children?: React.ReactNode }) {
  return (
    <LayoutGroup id={id}>
      <nav aria-label={id} className="flex flex-row flex-wrap gap-x-6 gap-y-1 wide:flex-col">
        {tabs.map(([k, label]) => {
          const on = k === active;
          return (
            <button key={k} onClick={() => onSelect(k)} aria-current={on ? "page" : undefined} className="relative py-2.5 text-left text-[11px] font-medium tracking-[.22em] transition-colors duration-300" style={{ color: on ? "#111111" : "#857B70" }}>
              {on && <motion.span layoutId={`${id}-dot`} className="absolute top-1/2 -left-4 hidden size-1 -translate-y-1/2 rounded-full bg-gold wide:block" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              {label}
            </button>
          );
        })}
        {children}
      </nav>
    </LayoutGroup>
  );
}

export function AccountView({ initial }: { initial: AccountTab }) {
  const [tab, setTabState] = useState<AccountTab>(initial);
  const hydrated = useUI((s) => s.hydrated);
  const flash = useUI((s) => s.flash);
  const form = useShop((s) => s.form);
  const orders = useShop((s) => s.orders);
  const wish = useShop((s) => s.wish);
  const prefs = useShop((s) => s.prefs);
  const togglePref = useShop((s) => s.togglePref);
  const setTab = (k: AccountTab) => {
    setTabState(k);
    window.history.replaceState(null, "", `/account?tab=${k}`);
  };
  const all = [...orders, SAMPLE];

  const rows: [string, string][] =
    tab === "info"
      ? [
          ["NAME", `${form.first || "Camille"} ${form.last || "Laurent"}`],
          ["EMAIL", form.email || "camille.laurent@example.com"],
          ["PHONE", form.phone || "+1 416 555 0199"],
          ["CLIENT SINCE", "2024"],
        ]
      : tab === "addr"
        ? [["DEFAULT", `${form.address || "88 Hazelton Avenue"}\n${form.city || "Toronto"}, ${form.province || "Ontario"} ${form.postal || "M5R 2E2"}\n${form.country || "Canada"}`]]
        : [
            ["DEFAULT", "Visa ending 4821 · expires 08/29"],
            ["WALLET", "Apple Pay"],
          ];

  return (
    <section className="gutter mx-auto max-w-[1400px] pt-[clamp(130px,18vh,180px)] pb-[120px]">
      <p className="eyebrow mb-4">YOUR ACCOUNT</p>
      <h1 className="display mb-16 text-[clamp(46px,5vw,80px)]">Bonjour, {hydrated ? form.first || "Camille" : "Camille"}.</h1>
      <div className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,96px)] wide:grid-cols-[220px_minmax(0,1fr)]">
        <SideNav id="Account" tabs={TABS} active={tab} onSelect={setTab}>
          <button onClick={() => flash("YOU HAVE BEEN SIGNED OUT")} className="mt-2 py-2.5 text-left text-[11px] tracking-[.22em] text-taupe">
            SIGN OUT
          </button>
        </SideNav>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45, ease: EASE_LUX }}>
            {tab === "orders" && (
              <div className="flex flex-col gap-5">
                {all.map((o) => (
                  <div key={o.number} className="flex flex-col gap-6 bg-ivory p-8">
                    <div className="flex flex-wrap justify-between gap-3 text-[13px]">
                      <span>
                        <span className="font-serif text-2xl tracking-[.04em]">{o.number}</span>
                        <span className="ml-3.5 text-taupe">{o.date}</span>
                      </span>
                      <span>{fmt(o.total)}</span>
                    </div>
                    <span className="text-[13px] text-body">{o.items.map((i) => `${i.name} · ${i.color}${i.qty > 1 ? ` × ${i.qty}` : ""}`).join("   ")}</span>
                    <div className="relative">
                      <div className="absolute inset-x-0 top-[5px] h-px bg-ink/15" />
                      <motion.div className="absolute top-[5px] left-0 h-px bg-gold" initial={{ width: 0 }} animate={{ width: `${(o.status / 3) * 100}%` }} transition={{ duration: 1.2, delay: 0.2, ease: EASE_LUX }} />
                      <div className="relative grid grid-cols-4">
                        {TRACK.map((l, i) => (
                          <div key={l} className="flex flex-col gap-3">
                            <span className="box-border size-[11px] rounded-full border" style={{ background: i <= o.status ? "#C6A66A" : "#FCFBF8", borderColor: i <= o.status ? "#C6A66A" : "rgba(17,17,17,.25)" }} />
                            <span className="text-[10px] tracking-[.18em]" style={{ color: i === o.status ? "#111111" : "#857B70" }}>
                              {l}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "wish" && (
              <>
                <p className="mb-6 font-serif text-[26px]">
                  {wish.length} {wish.length === 1 ? "piece saved." : "pieces saved."}
                </p>
                <Link href="/wishlist" className="btn-ink">
                  VIEW WISHLIST
                </Link>
              </>
            )}

            {(tab === "info" || tab === "addr" || tab === "pay") && (
              <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-12 gap-y-5 text-sm">
                {rows.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="label pt-[3px]">{k}</dt>
                    <dd className="m-0 leading-[1.7] whitespace-pre-line">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {tab === "prefs" && (
              <div className="flex flex-col">
                {PREFS.map(([k, label, sub]) => (
                  <label key={k} className="flex cursor-pointer items-center justify-between gap-6 border-t border-ink/12 py-[22px] text-sm">
                    <span>
                      {label}
                      <span className="mt-1 block text-xs text-taupe">{sub}</span>
                    </span>
                    {/* Apple-style switch */}
                    <span className="relative inline-flex">
                      <input type="checkbox" checked={!!prefs[k]} onChange={() => togglePref(k)} className="peer sr-only" />
                      <span className="h-[26px] w-[44px] rounded-full bg-ink/15 transition-colors duration-300 peer-checked:bg-espresso peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold" />
                      <span className="absolute top-[3px] left-[3px] size-5 rounded-full bg-ivory shadow-[0_2px_6px_rgba(0,0,0,.2)] transition-transform duration-300 ease-lux peer-checked:translate-x-[18px]" />
                    </span>
                  </label>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

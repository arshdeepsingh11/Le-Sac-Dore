"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { SideNav } from "./account-view";
import { FAQ, SERVICES, STORES, type ServiceKey } from "@/lib/data";
import { EASE_LUX } from "@/lib/utils";

const TABS = (Object.keys(SERVICES) as ServiceKey[]).map((k) => [k, SERVICES[k][0]] as [ServiceKey, string]);

export function ServicesView({ initial }: { initial: ServiceKey }) {
  const [tab, setTabState] = useState<ServiceKey>(initial);
  const [faq, setFaq] = useState<number | null>(0);
  const [q, setQ] = useState("");
  const lenis = useLenis();
  const svc = SERVICES[tab];
  const title = svc[0].charAt(0) + svc[0].slice(1).toLowerCase();
  const stores = STORES.filter((s) => {
    const k = q.trim().toLowerCase();
    return !k || `${s.city} ${s.name} ${s.address}`.toLowerCase().includes(k);
  });

  const setTab = (k: ServiceKey) => {
    setTabState(k);
    window.history.replaceState(null, "", `/services?tab=${k}`);
  };

  // Arriving from "Find a boutique" → glide down to the store finder.
  useEffect(() => {
    if (window.location.hash !== "#stores") return;
    const t = setTimeout(() => {
      const el = document.getElementById("stores");
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
    }, 450);
    return () => clearTimeout(t);
  }, [lenis]);

  return (
    <>
      <section className="gutter mx-auto max-w-[1400px] pt-[clamp(130px,18vh,180px)] pb-[100px]">
        <p className="eyebrow mb-4">CLIENT SERVICES</p>
        <h1 className="display max-w-[900px] text-[clamp(46px,5vw,80px)] leading-[1.02]">At your service, for the life of every piece.</h1>
        <div className="mt-[72px] grid grid-cols-1 items-start gap-[clamp(32px,6vw,96px)] wide:grid-cols-[220px_minmax(0,1fr)]">
          <SideNav id="Client services" tabs={TABS} active={tab} onSelect={setTab} />
          <AnimatePresence mode="wait">
            <motion.div key={tab} aria-live="polite" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45, ease: EASE_LUX }}>
              <h2 className="m-0 mb-8 font-serif text-[40px] font-normal">{title}</h2>
              {tab === "faq" ? (
                <div className="border-b border-ink/15">
                  {FAQ.map(([qq, a], i) => {
                    const open = faq === i;
                    return (
                      <div key={qq} className="border-t border-ink/15">
                        <h3 className="m-0">
                          <button aria-expanded={open} onClick={() => setFaq(open ? null : i)} className="flex w-full justify-between gap-5 py-[22px] text-left text-[15px]">
                            {qq}
                            <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.4, ease: EASE_LUX }} className="font-light">
                              +
                            </motion.span>
                          </button>
                        </h3>
                        <div className="grid transition-[grid-template-rows] duration-500 ease-lux" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                          <div className="overflow-hidden">
                            <p className="mb-[22px] max-w-[640px] text-sm leading-[1.8] text-body">{a}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-x-10">
                  {svc[1].map(([h, p]) => (
                    <div key={h} className="flex flex-col gap-2.5 border-t border-ink/15 py-[26px]">
                      <h3 className="m-0 text-[11px] font-semibold tracking-[.22em]">{h}</h3>
                      <p className="m-0 text-sm leading-[1.75] text-body">{p}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section id="stores" aria-labelledby="h-stores" className="gutter bg-sand py-[clamp(100px,14vh,160px)]">
        <div className="mx-auto max-w-[1400px]">
          <h2 id="h-stores" className="display text-[clamp(44px,5vw,80px)] tracking-[.03em]">
            FIND LE SAC DORÉ
          </h2>
          <label htmlFor="store-q" className="label mt-12 block">
            CITY OR POSTAL CODE
          </label>
          <input
            id="store-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Toronto, Paris, M5R…"
            className="mt-2 w-full max-w-[560px] rounded-none border-b border-ink bg-transparent py-3.5 font-serif text-[30px] text-ink outline-none placeholder:text-taupe/60"
          />
          <AnimatePresence>
            {!stores.length && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 text-sm text-body">
                No boutique matches that search. Our Client Advisors can arrange a private appointment wherever you are.
              </motion.p>
            )}
          </AnimatePresence>
          <motion.div layout className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5">
            <AnimatePresence mode="popLayout">
              {stores.map((s) => (
                <motion.div
                  key={s.city}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: EASE_LUX }}
                  className="flex flex-col gap-3.5 bg-ivory p-8 text-[13px] leading-[1.7] transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_rgba(17,12,9,.35)]"
                >
                  <span className="text-[10px] tracking-[.24em] text-taupe">{s.city}</span>
                  <h3 className="m-0 font-serif text-[26px] font-normal">{s.name}</h3>
                  <span className="whitespace-pre-line">{s.address}</span>
                  <span className="whitespace-pre-line text-body">{s.hours}</span>
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-ink">
                    {s.phone}
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address.replace("\n", ", "))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 self-start border-b border-ink pb-[3px] text-[10px] tracking-[.22em]"
                  >
                    DIRECTIONS →
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  );
}

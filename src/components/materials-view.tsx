"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { BagShot } from "./bag-shot";
import { ProductCard } from "./product-card";
import { Reveal } from "./ui/reveal";
import { JUTE_NOTES, MATERIALS, PRODUCTS, type MaterialKey } from "@/lib/data";
import { EASE_LUX } from "@/lib/utils";

export function MaterialsView({ initial }: { initial: MaterialKey }) {
  const [mat, setMatState] = useState<MaterialKey>(initial);
  const mt = MATERIALS.find((m) => m.key === mat)!;
  const items = PRODUCTS.filter((x) => x.mats.includes(mat));
  const setMat = (k: MaterialKey) => {
    setMatState(k);
    window.history.replaceState(null, "", `/materials?mat=${k}`);
  };

  return (
    <>
      <section className="gutter mx-auto max-w-[1600px] pt-[clamp(130px,18vh,190px)] pb-16">
        <h1 className="display text-[clamp(56px,7vw,112px)] leading-[.96] tracking-[.03em]">THE MATERIALS</h1>
        <p className="lede mt-5 text-[26px]">Beauty begins with what you choose to touch.</p>

        <LayoutGroup id="mat-tabs">
          <div role="tablist" aria-label="Materials" className="mt-16 flex flex-wrap gap-x-9 gap-y-2 border-b border-ink/12 pb-[18px]">
            {MATERIALS.map((m) => {
              const active = m.key === mat;
              return (
                <button key={m.key} role="tab" aria-selected={active} onClick={() => setMat(m.key)} className="relative py-1.5 text-xs font-medium tracking-[.24em] transition-colors duration-300" style={{ color: active ? "#111111" : "#857B70" }}>
                  {m.label}
                  {active && <motion.span layoutId="mat-rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div className="mt-12 grid grid-cols-1 items-center gap-[clamp(40px,6vw,100px)] wide:grid-cols-2">
          <div className="relative aspect-square overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.div key={mat} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE_LUX }}>
                <BagShot view="macro" tone={mt.tone} texture={mt.tex} stitch={mt.key === "leather"} caption={`Macro — ${mt.title.toLowerCase()}, raking light`} />
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={mat} aria-live="polite" className="flex flex-col gap-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.55, ease: EASE_LUX }}>
              <span className="text-[11px] tracking-[.3em] text-taupe">{mt.origin}</span>
              <h2 className="m-0 font-serif text-[clamp(38px,4vw,60px)] leading-none font-normal tracking-[.04em]">{mt.title}</h2>
              <p className="m-0 max-w-[480px] font-serif text-2xl leading-[1.45] text-espresso">“{mt.text}”</p>
              <dl className="mt-4 grid max-w-[480px] grid-cols-[auto_minmax(0,1fr)] gap-x-7 gap-y-3 text-[13px]">
                {mt.facts.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="pt-0.5 text-[10px] tracking-[.2em] text-taupe">{k}</dt>
                    <dd className="m-0">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>

        <h3 className="mt-24 mb-9 text-[11px] font-medium tracking-[.3em]">PIECES IN {mt.label}</h3>
        <motion.div layout className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-x-5 gap-y-12">
          <AnimatePresence mode="popLayout">
            {items.map((x, i) => (
              <motion.div
                key={x.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.7, ease: EASE_LUX } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <ProductCard product={x} aspect="4 / 5" size={50} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <section id="jute" aria-labelledby="h-jute" className="mt-[clamp(80px,12vh,140px)] bg-linen">
        <div className="grid min-h-[90vh] grid-cols-1 wide:grid-cols-2">
          <div className="relative min-h-[520px]">
            <BagShot view="front" tone="#C8B28A" ground="#6E5B45" texture="weave" size={50} caption="Le Rivage on travertine steps, late afternoon sun" />
          </div>
          <Reveal className="flex flex-col justify-center gap-6 p-[clamp(56px,8vw,120px)]">
            <p className="eyebrow text-olive">THE JUTE EDIT</p>
            <h2 id="h-jute" className="display text-[clamp(48px,5.4vw,88px)] leading-[.98]">
              NATURAL BY NATURE.
            </h2>
            <p className="m-0 max-w-[460px] text-[15px] leading-[1.8] text-body">
              Jute appears only in selected pieces. We weave it at twice the usual density, then frame it in leather so it holds its shape for years rather than seasons.
            </p>
            <ul className="m-0 mt-2 grid max-w-[480px] list-none grid-cols-2 gap-x-7 gap-y-[18px] p-0">
              {JUTE_NOTES.map(([k, v]) => (
                <li key={k} className="border-t border-ink/15 pt-3.5 text-[13px] leading-relaxed">
                  <span className="label mb-1.5 block">{k}</span>
                  {v}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="gutter mx-auto grid max-w-[1600px] grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5 py-[clamp(80px,12vh,120px)]">
          {PRODUCTS.filter((x) => x.mats.includes("jute")).map((x) => (
            <ProductCard key={x.id} product={x} aspect="4 / 5" size={52} />
          ))}
        </div>
      </section>
    </>
  );
}

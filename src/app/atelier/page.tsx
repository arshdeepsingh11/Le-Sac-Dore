"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BagShot } from "@/components/bag-shot";
import { Reveal } from "@/components/ui/reveal";
import { MACROS, pad2, TIMELINE } from "@/lib/data";
import { EASE_LUX } from "@/lib/utils";

export default function AtelierPage() {
  const [step, setStep] = useState(0);
  const tl = TIMELINE[step];

  return (
    <>
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-[#1B130E] text-cream">
        <motion.div className="absolute inset-0 opacity-90" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: EASE_LUX }}>
          <BagShot view="macro" tone="#2A1A12" texture="grain" stitch />
        </motion.div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,14,10,.2), rgba(20,14,10,.75))" }} />
        <div className="gutter relative max-w-[900px] pb-[clamp(56px,10vh,110px)]">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1, ease: EASE_LUX }} className="mb-[22px] text-[11px] tracking-[.32em] text-gold">
            MACRO — FULL-GRAIN CALF, HAND STITCHED
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1.3, ease: EASE_LUX }} className="display text-[clamp(64px,9vw,148px)] leading-[.92] tracking-[.03em]">
            L&apos;ATELIER
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="mt-[26px] text-xs font-medium tracking-[.32em]">
            WHERE MATERIAL BECOMES OBJECT.
          </motion.p>
        </div>
      </section>

      <section className="gutter mx-auto max-w-[1100px] py-[clamp(100px,16vh,180px)]">
        <Reveal>
          <p className="display text-[clamp(30px,3.4vw,48px)] leading-[1.25] text-pretty">
            A Le Sac Doré bag is made by one artisan from the first cut to the final inspection. It takes between two and five days, depending on the piece, and it is signed on the inside with their initials.
          </p>
        </Reveal>
      </section>

      <section aria-label="Details" className="gutter mx-auto grid max-w-[1600px] grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5">
        {MACROS.map(([title, view, tone, tex, stitch], i) => (
          <Reveal key={title} delay={(i % 3) * 0.08}>
            <figure className="group m-0 flex flex-col gap-3.5">
              <div className="relative aspect-square overflow-hidden">
                <span className="absolute inset-0 transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.05]">
                  <BagShot view={view} tone={tone} texture={tex} stitch={stitch} caption={`Macro — ${title.toLowerCase()}`} />
                </span>
              </div>
              <figcaption className="flex justify-between text-[11px] tracking-[.2em]">
                <span>{title}</span>
                <span className="text-taupe">{pad2(i + 1)}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </section>

      <section aria-labelledby="h-tl" className="gutter mx-auto max-w-[1600px] py-[clamp(120px,18vh,200px)]">
        <p className="eyebrow mb-[18px]">SEVEN STAGES</p>
        <h2 id="h-tl" className="display mb-[72px] text-[clamp(40px,4.4vw,68px)]">
          The making of a bag.
        </h2>
        <div className="relative">
          <div className="absolute inset-x-0 top-[7px] h-px bg-ink/15" />
          <motion.div className="absolute top-[7px] left-0 h-px bg-gold" animate={{ width: `${(step / (TIMELINE.length - 1)) * 100}%` }} transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }} />
          <div role="tablist" aria-label="Craft stages" className="relative grid grid-cols-7 gap-2">
            {TIMELINE.map((x, i) => {
              const active = i === step;
              return (
                <button key={x.title} role="tab" aria-selected={active} onClick={() => setStep(i)} onMouseEnter={() => setStep(i)} className="flex flex-col gap-[18px] text-left">
                  <span
                    className="box-border size-[15px] rounded-full border transition-[background,border-color,transform] duration-500"
                    style={{ borderColor: i <= step ? "#C6A66A" : "rgba(17,17,17,.25)", background: active ? "#C6A66A" : i < step ? "#E9DDC4" : "#F7F4EE", transform: active ? "scale(1.15)" : "scale(1)" }}
                  />
                  <span className="text-[11px] tracking-[.2em] transition-colors duration-400" style={{ color: active ? "#111111" : "#857B70" }}>
                    {pad2(i + 1)}
                  </span>
                  <span className="hidden text-[11px] leading-normal font-medium tracking-[.14em] transition-colors duration-400 wide:block" style={{ color: active ? "#111111" : "#857B70" }}>
                    {x.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-[72px] grid grid-cols-1 items-center gap-[clamp(40px,6vw,100px)] wide:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.div key={step} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: EASE_LUX }}>
                <BagShot view={tl.view} tone={tl.tone} ground="#DCD2C3" texture={tl.tex} caption={tl.cap} size={52} />
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} aria-live="polite" className="flex flex-col gap-[18px]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.55, ease: EASE_LUX }}>
              <span className="text-[11px] tracking-[.3em] text-gold">{pad2(step + 1)} / 07</span>
              <h3 className="m-0 font-serif text-[clamp(34px,3.2vw,48px)] font-normal tracking-[.04em]">{tl.title}</h3>
              <p className="m-0 max-w-[460px] text-[15px] leading-[1.8] text-body">{tl.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="gutter flex flex-wrap items-end justify-between gap-8 bg-espresso py-[clamp(90px,14vh,150px)] text-cream">
        <h2 className="display max-w-[760px] text-[clamp(38px,4.4vw,68px)] leading-[1.05]">Beauty begins with what you choose to touch.</h2>
        <Link href="/materials" className="btn-light">
          EXPLORE THE MATERIALS
        </Link>
      </section>
    </>
  );
}

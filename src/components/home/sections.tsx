"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { BagShot } from "../bag-shot";
import { ProductCard } from "../product-card";
import { NumberTicker } from "../ui/number-ticker";
import { Reveal } from "../ui/reveal";
import { byId, COLORS, CRAFT_FIGURES, MATERIALS, PRODUCTS, type ColorName } from "@/lib/data";
import { addToBag } from "@/lib/store";
import { clamp01 } from "@/lib/utils";

/* ───────────── Brand statement — words light up as you scroll ───────────── */

const STATEMENT = "We believe the objects we carry should become part of the lives we lead.".split(" ");

function Word({ w, i, p }: { w: string; i: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => 0.14 + 0.86 * clamp01(v * (STATEMENT.length + 2) - i));
  return (
    <motion.span aria-hidden style={{ opacity }}>
      {w}
    </motion.span>
  );
}

export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "0.75 0.8"] });
  return (
    <section aria-label="Brand statement" className="gutter pt-[clamp(100px,18vh,200px)] pb-[clamp(120px,22vh,240px)]">
      <p
        ref={ref}
        aria-label={STATEMENT.join(" ")}
        className="mx-auto flex max-w-[1120px] flex-wrap justify-center gap-x-[.26em] text-center font-serif text-[clamp(36px,4.8vw,74px)] leading-[1.14] font-light text-ink"
      >
        {STATEMENT.map((w, i) => (
          <Word key={i} w={w} i={i} p={scrollYProgress} />
        ))}
      </p>
    </section>
  );
}

/* ───────────── Le Signature spotlight ───────────── */

export function Spotlight() {
  const sig = byId("le-signature");
  const [spot, setSpot] = useState<ColorName>("Espresso");
  const specs: [string, string][] = [
    ["MATERIAL", "Full-grain calfskin from Tuscany, lined in Belgian linen"],
    ["DIMENSIONS", `${sig.dims} · handle drop 11 cm`],
    ["MADE", "By one artisan, in about forty hours"],
  ];
  return (
    <section aria-labelledby="h-spot" className="gutter bg-sand py-[clamp(100px,14vh,160px)]">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center text-center">
        <Reveal>
          <p className="eyebrow mb-[18px] tracking-[.32em]">THE SIGNATURE</p>
          <h2 id="h-spot" className="display text-[clamp(56px,7.4vw,124px)] leading-[.95] tracking-[.06em]">
            LE SIGNATURE
          </h2>
          <p className="lede mx-auto mt-5 max-w-[620px] text-[clamp(20px,1.8vw,26px)]">A sculptural silhouette, designed to develop character with time.</p>
        </Reveal>
        <Reveal className="relative mt-14 aspect-video min-h-[320px] w-full overflow-hidden" y={40}>
          <BagShot view="front" tone={COLORS[spot]} ground="#E2D9CB" size={32} caption={`01 Front — Le Signature in ${spot.toLowerCase()}, limestone plinth, soft window light`} />
        </Reveal>
        <div role="radiogroup" aria-label="Colour" className="mt-9 flex justify-center gap-7">
          {sig.colors.map((n) => {
            const active = n === spot;
            return (
              <button key={n} role="radio" aria-checked={active} onClick={() => setSpot(n)} className="flex flex-col items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border transition-[border-color,transform] duration-300 hover:scale-105" style={{ borderColor: active ? "#111111" : "transparent" }}>
                  <span className="h-7 w-7 rounded-full shadow-[inset_0_0_0_1px_rgba(17,17,17,.15)]" style={{ background: COLORS[n] }} />
                </span>
                <span className="text-[10px] tracking-[.22em] transition-colors duration-300" style={{ color: active ? "#111111" : "#857B70" }}>
                  {n.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
        <dl className="mt-16 grid w-full max-w-[960px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-10 gap-y-7 text-left">
          {specs.map(([k, v], i) => (
            <Reveal key={k} delay={i * 0.08} className="border-t border-ink/15 pt-[18px]">
              <dt className="mb-2 text-[10px] tracking-[.24em] text-taupe">{k}</dt>
              <dd className="m-0 text-sm leading-relaxed">{v}</dd>
            </Reveal>
          ))}
        </dl>
        <div className="mt-[52px] flex flex-wrap justify-center gap-3.5">
          <button onClick={() => addToBag("le-signature", spot, 1, true)} className="btn-ink">
            ADD TO BAG — $895 CAD
          </button>
          <Link href={`/product/le-signature?color=${spot}`} className="btn-line">
            DISCOVER THE PIECE
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────── La Collection — editorial grid ───────────── */

const FEATURED: [string, string, string][] = [
  ["le-noir", "md:col-span-6 wide:col-span-4", "4 / 5"],
  ["la-bella", "md:col-span-6 wide:col-span-4", "4 / 5"],
  ["la-luna", "md:col-span-6 wide:col-span-4", "4 / 5"],
  ["l-eclat", "md:col-span-6 wide:col-span-4", "4 / 5"],
  ["le-voyage", "md:col-span-6 wide:col-span-4", "4 / 5"],
  ["le-rivage", "md:col-span-6 wide:col-span-4", "4 / 5"],
];

export function FeaturedGrid() {
  return (
    <section aria-labelledby="h-col" className="gutter mx-auto max-w-[1600px] py-[clamp(110px,16vh,180px)]">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <h2 id="h-col" className="display text-[clamp(44px,5vw,76px)] leading-none tracking-[.04em]">
            LA COLLECTION
          </h2>
          <p className="lede mt-4 text-[22px]">Objects designed for every chapter.</p>
        </Reveal>
        <Link href="/collection" className="link-rule">
          VIEW ALL PIECES →
        </Link>
      </div>
      <div className="grid grid-cols-12 items-start gap-x-5 gap-y-16">
        {FEATURED.map(([id, span, aspect], i) => (
          <Reveal key={id} className={`col-span-12 ${span}`} delay={(i % 3) * 0.08} y={36}>
            <ProductCard product={byId(id)} aspect={aspect} size={50} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── New arrivals rail ───────────── */

export function NewRail() {
  const rail = useRef<HTMLDivElement>(null);
  const by = (d: number) => rail.current?.scrollBy({ left: d * rail.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section aria-labelledby="h-new" className="py-[clamp(110px,16vh,180px)]">
      <div className="gutter mx-auto mb-12 flex max-w-[1600px] flex-wrap items-end justify-between gap-6">
        <Reveal>
          <h2 id="h-new" className="display text-[clamp(40px,4.4vw,68px)] leading-none tracking-[.04em]">
            NEW ARRIVALS
          </h2>
          <p className="lede mt-3.5 text-[22px]">New expressions of Le Sac Doré.</p>
        </Reveal>
        <div className="flex items-center gap-7">
          <div className="flex gap-2.5">
            <button onClick={() => by(-1)} aria-label="Scroll back" className="h-11 w-11 border border-ink/25 text-sm transition-colors duration-300 hover:border-ink">
              ←
            </button>
            <button onClick={() => by(1)} aria-label="Scroll forward" className="h-11 w-11 border border-ink/25 text-sm transition-colors duration-300 hover:border-ink">
              →
            </button>
          </div>
          <Link href="/collection?filter=new" className="link-rule">
            VIEW ALL
          </Link>
        </div>
      </div>
      <div
        ref={rail}
        className="no-scrollbar grid snap-x snap-mandatory auto-cols-[clamp(260px,27vw,400px)] grid-flow-col gap-5 overflow-x-auto px-[clamp(20px,4vw,56px)] pb-2 scroll-px-[clamp(20px,4vw,56px)]"
      >
        {PRODUCTS.filter((x) => x.isNew).map((x) => (
          <div key={x.id} className="snap-start">
            <ProductCard product={x} aspect="4 / 5" size={52} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────── The materials ───────────── */

export function MaterialsTiles() {
  return (
    <section aria-labelledby="h-mat" className="gutter mx-auto max-w-[1600px] pb-[clamp(110px,16vh,180px)]">
      <div className="mb-12 grid grid-cols-1 items-end gap-x-14 gap-y-6 wide:grid-cols-2">
        <Reveal>
          <p className="eyebrow mb-[18px]">THE MATERIALS</p>
          <h2 id="h-mat" className="display max-w-[640px] text-[clamp(38px,4vw,62px)] leading-[1.04]">
            Beauty begins with what you choose to touch.
          </h2>
        </Reveal>
        <p className="m-0 max-w-[440px] text-sm leading-[1.8] text-body">Six materials, each chosen for how it will look in ten years. Jute appears only in selected pieces.</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))] gap-3">
        {MATERIALS.map((m, i) => (
          <Reveal key={m.key} delay={i * 0.06}>
            <Link href={`/materials?mat=${m.key}`} className="group flex flex-col gap-3.5 text-left">
              <span className="relative block aspect-[3/4] w-full overflow-hidden transition-transform duration-[800ms] ease-lux group-hover:-translate-y-1.5">
                <BagShot view="macro" tone={m.tone} texture={m.tex} stitch={false} />
              </span>
              <span className="text-[11px] font-medium tracking-[.24em]">{m.label}</span>
              <span className="-mt-2 text-[11px] tracking-[.06em] text-taupe">{m.origin}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────── L'Atelier split ───────────── */

export function AtelierSplit() {
  return (
    <section aria-label="L'Atelier" className="grid min-h-[88vh] grid-cols-1 bg-ivory wide:grid-cols-2">
      <div className="relative min-h-[520px]">
        <BagShot view="macro" tone="#4A2E1F" texture="grain" caption="Macro — saddle stitch, beeswaxed linen thread, 7 stitches per centimetre" />
      </div>
      <Reveal className="flex flex-col justify-center gap-6 p-[clamp(56px,8vw,120px)]">
        <p className="eyebrow">L&apos;ATELIER</p>
        <h2 className="display text-[clamp(40px,4.4vw,68px)] leading-[1.02] text-balance">Where material becomes object.</h2>
        <p className="m-0 max-w-[440px] text-[15px] leading-[1.8] text-body">One artisan makes each bag from the first cut to the final inspection, and signs it inside with their initials.</p>
        <dl className="mt-5 mb-2 grid max-w-[480px] grid-cols-3 gap-6">
          {CRAFT_FIGURES.map(([v, k], i) => (
            <div key={k} className="border-t border-ink/15 pt-4">
              <dt className="font-serif text-[44px] leading-none font-light">
                <NumberTicker value={v} delay={0.15 + i * 0.12} />
              </dt>
              <dd className="m-0 mt-2.5 text-[10px] tracking-[.2em] text-taupe">{k}</dd>
            </div>
          ))}
        </dl>
        <div>
          <Link href="/atelier" className="btn-line fill-hover mt-3 !border-ink !px-[30px] !py-[18px] !text-[11px] !tracking-[.22em]">
            ENTER L&apos;ATELIER
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────────── Jute + leather ───────────── */

export function JuteBand() {
  return (
    <section aria-label="Natural by nature" className="gutter bg-linen py-[clamp(100px,14vh,160px)]">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-[clamp(40px,5vw,80px)] wide:grid-cols-2">
        <Reveal className="flex max-w-[520px] flex-col gap-6">
          <p className="eyebrow text-olive">JUTE + LEATHER</p>
          <h2 className="display text-[clamp(44px,5vw,80px)] leading-none">NATURAL BY NATURE.</h2>
          <p className="m-0 text-[15px] leading-[1.8] text-body">
            Long-staple jute, woven tight and bound in leather at every edge. Structured silhouettes, solid brass hardware and precise stitching give a natural fibre the discipline of a leather bag.
          </p>
          <div>
            <Link href="/materials?mat=jute" className="link-rule">
              DISCOVER THE MATERIAL →
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-5">
          {PRODUCTS.filter((x) => x.mats.includes("jute")).map((x, i) => (
            <Reveal key={x.id} delay={i * 0.1}>
              <ProductCard product={x} aspect="4 / 5" size={56} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

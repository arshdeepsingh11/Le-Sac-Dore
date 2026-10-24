"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedCircularProgressBar } from "../ui/animated-circular-progress-bar";
import { parseDims, PRODUCTS, type Product } from "@/lib/data";
import { track } from "@/lib/analytics";
import { fitRatio, interior } from "@/lib/fit";
import { cn, EASE_LUX } from "@/lib/utils";

/** Everyday objects, outer dimensions in cm (W × H × D). */
const ITEMS: { id: string; label: string; group: string; dims: [number, number, number] }[] = [
  { id: "iphone", label: "iPhone 16 Pro", group: "Phones", dims: [14.9, 7.2, 0.9] },
  { id: "iphonemax", label: "iPhone 16 Pro Max", group: "Phones", dims: [16.3, 7.7, 0.9] },
  { id: "galaxy", label: "Galaxy S25 Ultra", group: "Phones", dims: [16.2, 7.8, 0.9] },
  { id: "laptop13", label: '13" laptop', group: "Tech", dims: [30.4, 21.5, 1.2] },
  { id: "laptop14", label: '14" laptop', group: "Tech", dims: [31.3, 22.1, 1.6] },
  { id: "laptop16", label: '16" laptop', group: "Tech", dims: [35.6, 24.8, 1.7] },
  { id: "ipad", label: '11" tablet', group: "Tech", dims: [24.8, 17.9, 0.7] },
  { id: "airpods", label: "Earbuds case", group: "Tech", dims: [5.5, 4.8, 2.4] },
  { id: "wallet", label: "Long wallet", group: "Essentials", dims: [19, 10, 2.2] },
  { id: "cardholder", label: "Card holder", group: "Essentials", dims: [10.5, 7.5, 0.6] },
  { id: "keys", label: "Keys", group: "Essentials", dims: [9, 4, 2] },
  { id: "passport", label: "Passport", group: "Essentials", dims: [12.5, 8.8, 0.6] },
  { id: "sunglasses", label: "Sunglasses case", group: "Essentials", dims: [16, 6.5, 6] },
  { id: "cosmetics", label: "Cosmetic pouch", group: "Essentials", dims: [18, 11, 6] },
  { id: "bottle", label: "Water bottle 500 ml", group: "Day", dims: [22, 7, 7] },
  { id: "notebook", label: "A5 notebook", group: "Day", dims: [21, 14.8, 1.5] },
  { id: "umbrella", label: "Compact umbrella", group: "Day", dims: [24, 5.5, 5.5] },
  { id: "book", label: "Paperback", group: "Day", dims: [18, 11, 2.5] },
];
const DEFAULTS = ["iphone", "wallet", "keys", "sunglasses"];


function evaluate(p: Product, ids: string[]) {
  const box = interior(p);
  const vol = box[0] * box[1] * box[2] * 0.72; // realistic packing efficiency
  const chosen = ITEMS.filter((i) => ids.includes(i.id));
  const rows = chosen.map((i) => {
    const r = fitRatio(i.dims, box);
    return { ...i, ratio: r, status: r > 1 ? "no" : r > 0.9 ? "tight" : "fits" } as const;
  });
  const used = chosen.reduce((a, i) => a + i.dims[0] * i.dims[1] * i.dims[2], 0);
  const capacity = vol ? used / vol : 0;
  const allFit = rows.every((r) => r.status !== "no") && capacity <= 1;
  return { rows, capacity, allFit };
}

export function FitChecker({ product: p }: { product: Product }) {
  const [ids, setIds] = useState<string[]>(DEFAULTS);
  const res = useMemo(() => evaluate(p, ids), [p, ids]);
  const pct = Math.round(res.capacity * 100);

  // Suggest the most compact piece that would carry everything.
  const alt = useMemo(() => {
    if (res.allFit || !ids.length) return null;
    return PRODUCTS.filter((x) => x.id !== p.id && evaluate(x, ids).allFit).sort((a, b) => {
      const va = Object.values(parseDims(a.dims)).reduce((m, v) => m * v, 1);
      const vb = Object.values(parseDims(b.dims)).reduce((m, v) => m * v, 1);
      return va - vb;
    })[0];
  }, [res.allFit, ids, p.id]);

  useEffect(() => {
    if (ids.join() === DEFAULTS.join()) return;
    const t = setTimeout(() => track("fit_check", { productId: p.id, meta: { items: ids, capacity: pct, fits: res.allFit } }), 1500);
    return () => clearTimeout(t);
  }, [ids, p.id, pct, res.allFit]);

  const toggle = (id: string) => setIds((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  const verdict = !ids.length
    ? "Choose what you carry."
    : !res.allFit
      ? res.capacity > 1 && res.rows.every((r) => r.status !== "no")
        ? "Each piece fits, but not all at once."
        : "Not everything will fit."
      : res.capacity > 0.85 || res.rows.some((r) => r.status === "tight")
        ? "It all fits — snugly."
        : "Everything fits, with room to spare.";
  const groups = [...new Set(ITEMS.map((i) => i.group))];

  return (
    <section aria-labelledby="h-fit" className="gutter bg-ivory py-[clamp(90px,12vh,140px)]">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-start gap-[clamp(36px,6vw,100px)] wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <p className="eyebrow">WILL IT FIT?</p>
          <h2 id="h-fit" className="display text-[clamp(38px,4vw,60px)] leading-[1.04]">
            Choose what you carry.
          </h2>
          <p className="m-0 max-w-[460px] text-sm leading-[1.8] text-body">
            Select your everyday objects. We check each one against the interior of {p.name} ({p.dims}), turning it whichever way it fits best.
          </p>
          <div className="mt-2 flex flex-col gap-5">
            {groups.map((g) => (
              <div key={g}>
                <p className="label mb-2.5">{g.toUpperCase()}</p>
                <div className="flex flex-wrap gap-2">
                  {ITEMS.filter((i) => i.group === g).map((i) => {
                    const on = ids.includes(i.id);
                    return (
                      <button
                        key={i.id}
                        onClick={() => toggle(i.id)}
                        aria-pressed={on}
                        className={cn("border px-3.5 py-2 text-[12px] transition-all duration-300 ease-lux active:scale-[.97]", on ? "border-ink bg-ink text-cream" : "border-ink/15 bg-transparent text-ink hover:border-ink/50")}
                      >
                        {i.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cream p-6 wide:sticky wide:top-24 wide:p-10">
          <div className="flex items-center gap-6">
            <AnimatedCircularProgressBar value={Math.min(pct, 100)} max={100} className="size-24" strokeWidth={3} gaugePrimaryColor={!res.allFit ? "#541F27" : pct > 85 ? "#C6A66A" : "#424A38"} label="Space used">
              <span className="flex flex-col items-center leading-tight">
                <span className="font-serif text-[22px]">{pct}%</span>
                <span className="text-[8px] tracking-[.2em] text-taupe">FULL</span>
              </span>
            </AnimatedCircularProgressBar>
            <AnimatePresence mode="wait">
              <motion.p key={verdict} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE_LUX }} className="m-0 font-serif text-[26px] leading-tight">
                {verdict}
              </motion.p>
            </AnimatePresence>
          </div>
          <ul className="m-0 mt-8 flex list-none flex-col p-0">
            <AnimatePresence initial={false}>
              {res.rows.map((r) => (
                <motion.li
                  key={r.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: EASE_LUX }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4 border-t border-ink/10 py-3 text-[13px]">
                    <span>{r.label}</span>
                    <span className="text-[10px] tracking-[.2em]" style={{ color: r.status === "no" ? "#541F27" : r.status === "tight" ? "#9C7C59" : "#424A38" }}>
                      {r.status === "no" ? "TOO LARGE" : r.status === "tight" ? "SNUG FIT" : "FITS"}
                    </span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {alt && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 border-t border-ink/10 pt-5 text-[13px] text-body">
              For all of this, consider{" "}
              <Link href={`/product/${alt.id}`} className="border-b border-ink text-ink">
                {alt.name}
              </Link>{" "}
              ({alt.dims}).
            </motion.div>
          )}
          <p className="mt-6 mb-0 text-[11px] leading-relaxed text-taupe">Estimates use typical product dimensions and the bag&apos;s usable interior.</p>
        </div>
      </div>
    </section>
  );
}

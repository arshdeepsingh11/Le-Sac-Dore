"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BagShot } from "../bag-shot";
import { COLORS, type ColorName, type Product } from "@/lib/data";
import { track } from "@/lib/analytics";
import { EASE_LUX } from "@/lib/utils";

type Family = "leather" | "jute" | "canvas" | "textile";
const STOPS = [0, 1, 5, 10];

function family(p: Product): Family {
  const m = p.mats[0];
  if (m === "jute") return "jute";
  if (m === "canvas") return "canvas";
  if (m === "textile" || m === "linen") return "textile";
  return "leather";
}

/** How the surface changes with years of use — calibrated per material. */
function look(fam: Family, t: number) {
  switch (fam) {
    case "leather":
      return { filter: `sepia(${0.032 * t}) saturate(${1 + 0.07 * t}) brightness(${1 - 0.018 * t}) contrast(${1 + 0.02 * t})`, sheen: 0.032 * t };
    case "jute":
      return { filter: `brightness(${1 + 0.018 * t}) saturate(${1 - 0.035 * t}) sepia(${0.015 * t})`, sheen: 0.006 * t };
    case "canvas":
      return { filter: `brightness(${1 - 0.012 * t}) saturate(${1 - 0.03 * t}) contrast(${1 + 0.015 * t})`, sheen: 0.01 * t };
    default:
      return { filter: `brightness(${1 - 0.006 * t}) saturate(${1 - 0.012 * t})`, sheen: 0.004 * t };
  }
}

const COPY: Record<Family, Record<number, [string, string]>> = {
  leather: {
    0: ["New", "A matte, even surface with a firm hand. The grain is crisp and the edges are freshly painted."],
    1: ["One year", "The leather softens where your hand rests. A first, quiet sheen appears on the handle and the flap."],
    5: ["Five years", "The colour deepens by about a shade. Creases settle into the bag's own shape — this is the patina we design for."],
    10: ["Ten years", "A rich, burnished surface that no two bags share. With a yearly conditioning it is ready for decades more."],
  },
  jute: {
    0: ["New", "A tight, even weave in natural straw tones, framed by firm leather edges."],
    1: ["One year", "The fibre relaxes slightly and takes on a softer touch. The leather binding begins to warm."],
    5: ["Five years", "Sun lightens the jute a little while the leather trim darkens, sharpening the contrast between them."],
    10: ["Ten years", "A weathered, honey-toned weave. Keep it dry and brushed and the structure holds."],
  },
  canvas: {
    0: ["New", "A dense, waxed cotton with a slight bloom on the surface."],
    1: ["One year", "The wax settles and soft creases form where the bag flexes."],
    5: ["Five years", "A worn, lived-in character. Re-waxing restores water resistance in minutes."],
    10: ["Ten years", "Deep creases and a faded tone — the look of a well-travelled piece."],
  },
  textile: {
    0: ["New", "A crisp jacquard with a fine, even lustre."],
    1: ["One year", "Almost unchanged. Stored flat and away from light, silk-cotton keeps its colour."],
    5: ["Five years", "A subtle softening of the hand. The leather strap darkens gently."],
    10: ["Ten years", "Still close to new — evening pieces are carried less, and age slowly."],
  },
};

export function PatinaPreview({ product: p, color }: { product: Product; color: ColorName }) {
  const [t, setT] = useState(0);
  const fam = family(p);
  const stop = STOPS.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a), 0);
  const { filter, sheen } = look(fam, t);
  const tracked = useRef(false);

  useEffect(() => {
    if (t > 0 && !tracked.current) {
      tracked.current = true;
      track("patina_preview", { productId: p.id });
    }
  }, [t, p.id]);

  const tone = COLORS[color];
  const layer = { filter, transition: "filter .6s cubic-bezier(.2,.7,.2,1)" };
  const Sheen = () => (
    <div className="pointer-events-none absolute inset-0" style={{ opacity: sheen, transition: "opacity .6s ease", background: "radial-gradient(ellipse 60% 45% at 38% 30%, rgba(255,236,200,1), transparent 70%)", mixBlendMode: "soft-light" }} />
  );

  return (
    <section aria-labelledby="h-patina" className="gutter mx-auto max-w-[1600px] py-[clamp(90px,12vh,140px)]">
      <div className="grid grid-cols-1 items-center gap-[clamp(32px,6vw,100px)] wide:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative aspect-[4/5] overflow-hidden bg-parch">
            <div className="absolute inset-0" style={layer}>
              <BagShot view="front" tone={tone} ground="#E6DED2" texture={p.texture ?? "grain"} size={62} />
            </div>
            <Sheen />
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <div className="absolute inset-0" style={layer}>
              <BagShot view="macro" tone={tone} texture={p.texture ?? (fam === "jute" ? "weave" : "grain")} stitch={fam === "leather"} />
            </div>
            <Sheen />
            <span className="absolute bottom-3.5 left-4 text-[10px] tracking-[.14em] text-cream/70 uppercase">Surface · {t === 0 ? "new" : `${t} ${t === 1 ? "year" : "years"}`}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <p className="eyebrow">PATINA PREVIEW</p>
          <h2 id="h-patina" className="display text-[clamp(38px,4vw,60px)] leading-[1.04]">
            How it will age.
          </h2>
          <p className="m-0 max-w-[460px] text-sm leading-[1.8] text-body">Drag through the years to see how {p.name} in {color.toLowerCase()} changes with everyday use.</p>

          <div className="mt-4 max-w-[480px]">
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              onPointerUp={() => setT(stop)}
              onKeyUp={() => setT(stop)}
              aria-label="Years of use"
              aria-valuetext={`${stop} years`}
              className="patina-range w-full"
              style={{ ["--p" as string]: `${t * 10}%` }}
            />
            <div className="mt-3 flex justify-between text-[10px] tracking-[.2em]">
              {STOPS.map((y) => (
                <button key={y} onClick={() => setT(y)} className="transition-colors duration-300" style={{ color: stop === y ? "#111111" : "#857B70" }}>
                  {y === 0 ? "NEW" : `${y} ${y === 1 ? "YEAR" : "YEARS"}`}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[120px] max-w-[460px] border-t border-ink/12 pt-5">
            <AnimatePresence mode="wait">
              <motion.div key={stop} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4, ease: EASE_LUX }}>
                <p className="m-0 font-serif text-2xl">{COPY[fam][stop][0]}</p>
                <p className="mt-2 mb-0 text-sm leading-[1.8] text-body">{COPY[fam][stop][1]}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

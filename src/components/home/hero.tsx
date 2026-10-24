"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { clamp01 } from "@/lib/utils";

/**
 * Campaign hero — 240vh scroll scene, ported from the artifact's maths:
 * dark campaign → bag lifts & shrinks onto a limestone pedestal → "MORE THAN A BAG." end card.
 * Everything runs on motion values (compositor-only), so it never re-renders while scrolling.
 */
export function Hero() {
  const { scrollY } = useScroll();
  const vh = useMotionValue(900);
  const wideX = useMotionValue(12); // vw offset of the bag on wide screens
  const endShift = useMotionValue(6); // vh: settle lower on wide screens, rise on phones
  const [textPE, setTextPE] = useState(true);
  const [endPE, setEndPE] = useState(false);

  useEffect(() => {
    const on = () => {
      vh.set(window.innerHeight);
      wideX.set(window.innerWidth >= 1000 ? 12 : 0);
      endShift.set(window.innerWidth >= 1000 ? 6 : -9);
    };
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [vh, wideX, endShift]);

  const hp = useTransform(() => scrollY.get() / (vh.get() * 1.4));
  const darkOp = useTransform(hp, (p) => clamp01(1 - (p - 0.3) / 0.35));
  const textOp = useTransform(hp, (p) => clamp01(1 - p / 0.22));
  const textY = useTransform(hp, (p) => -p * 70);
  const endOp = useTransform(hp, (p) => clamp01((p - 0.62) / 0.28));
  const endY = useTransform(endOp, (o) => (1 - o) * 24);
  const k = useTransform(hp, (p) => clamp01(p / 0.8));
  const bagX = useTransform(() => (1 - k.get()) * wideX.get());
  // Lifts off the pedestal, then settles lower for the end card so the handle never meets the headline.
  const bagY = useTransform(() => -k.get() * 3 + endOp.get() * endShift.get());
  const bagS = useTransform(hp, (p) => 1 + 0.06 * clamp01(p / 0.3) - 0.2 * clamp01((p - 0.3) / 0.5));
  const bagT = useMotionTemplate`translate3d(${bagX}vw, ${bagY}vh, 0) scale(${bagS})`;

  useMotionValueEvent(hp, "change", (p) => {
    const t = p < 0.15;
    if (t !== textPE) setTextPE(t);
    const e = clamp01((p - 0.62) / 0.28) > 0.5;
    if (e !== endPE) setEndPE(e);
  });

  return (
    <section aria-label="Le Sac Doré campaign" className="relative h-[240vh] bg-cream">
      <div className="sticky top-0 h-screen min-h-[620px] overflow-hidden">
        {/* Campaign darkness */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ opacity: darkOp, background: "radial-gradient(ellipse 50% 62% at 60% 42%, rgba(218,182,128,.26), transparent 66%), linear-gradient(180deg,#241913 0%,#140F0B 100%)" }}
        />
        <motion.div aria-hidden className="absolute inset-y-0 left-[36%] w-[26%]" style={{ opacity: darkOp, background: "linear-gradient(90deg, rgba(247,244,238,.04), rgba(247,244,238,0))" }} />

        {/* End card headline */}
        <motion.div className="pointer-events-none absolute inset-x-0 top-[clamp(88px,11.5vh,150px)] px-5 text-center" style={{ opacity: endOp, y: endY }}>
          <p className="mb-5 text-[11px] font-medium tracking-[.34em] text-taupe">THE ART OF CARRYING.</p>
          <h2 className="display text-[clamp(46px,6.4vw,104px)] leading-none tracking-[.06em] text-ink">MORE THAN A BAG.</h2>
        </motion.div>

        {/* Bag + pedestal */}
        <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ transform: bagT, transformOrigin: "50% 72%" }}>
          <motion.div className="absolute inset-x-0 bottom-0 flex justify-center" style={{ opacity: darkOp }}>
            <div
              className="h-[10vh] w-[clamp(260px,64vw,480px)] wide:h-[27vh] wide:w-[clamp(280px,40vw,600px)]"
              style={{ background: "linear-gradient(180deg,#CFC1AD 0%,#A5947D 100%)", boxShadow: "0 -1px 0 rgba(255,244,224,.4), -50px 0 90px rgba(0,0,0,.4)" }}
            />
          </motion.div>
          <div className="absolute inset-x-0 bottom-[10vh] flex justify-center wide:bottom-[27vh]">
            <div className="relative aspect-[1.18/1] w-[clamp(150px,min(34vw,30vh),280px)] wide:w-[clamp(200px,min(29vw,40vh),440px)]">
              <div className="absolute -inset-x-[16%] -bottom-[7%] h-[15%]" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,.5), transparent 70%)" }} />
              <div className="absolute top-[-38%] left-1/4 h-[44%] w-1/2 rounded-t-full border-[4px] border-b-0 border-solid border-[#2E1C13]" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(115deg,#5E3B27 0%,#3B2519 46%,#241610 100%)", borderRadius: "14px 14px 5px 5px", boxShadow: "inset 0 -26px 40px rgba(0,0,0,.35), inset 14px 12px 32px rgba(255,220,170,.09)" }}
              />
              <div className="absolute inset-x-0 top-[34%] h-px bg-black/35" />
              <div className="absolute top-[30%] left-[44%] h-[7%] w-[12%] rounded-[2px]" style={{ background: "linear-gradient(90deg,#B8955A,#E2CA93,#B8955A)" }} />
            </div>
          </div>
        </motion.div>

        {/* Campaign caption */}
        <motion.p
          className="absolute top-[110px] right-[clamp(20px,4vw,56px)] m-0 hidden max-w-[250px] text-right text-[10px] leading-relaxed tracking-[.16em] text-cream/45 uppercase wide:block"
          style={{ opacity: textOp }}
        >
          Campaign — Le Signature, espresso full-grain, on a limestone pedestal
        </motion.p>

        {/* Campaign copy */}
        <motion.div
          className="absolute right-[clamp(20px,4vw,56px)] left-[clamp(20px,4vw,56px)] top-[clamp(96px,14vh,130px)] max-w-[540px] text-cream wide:top-auto wide:bottom-[clamp(40px,9vh,104px)]"
          style={{ opacity: textOp, y: textY, pointerEvents: textPE ? "auto" : "none" }}
        >
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }} className="mb-[22px] text-[11px] font-medium tracking-[.32em] text-gold">
            LE SAC DORÉ™
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="display text-[clamp(52px,7vw,112px)] leading-[.94] tracking-[.01em] text-balance"
          >
            THE ART OF CARRYING.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.6 }} className="mt-[26px] mb-9 text-[15px] leading-[1.7] text-cream/80">
            Exceptional materials.
            <br />
            Timeless silhouettes.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.75, ease: [0.2, 0.7, 0.2, 1] }} className="flex flex-wrap items-center gap-7">
            <Link
              href="/collection"
              className="border border-cream bg-cream px-[30px] py-[18px] text-[11px] font-medium tracking-[.22em] text-ink transition-colors duration-500 hover:bg-transparent hover:text-cream"
            >
              DISCOVER LA COLLECTION
            </Link>
            <Link href="/atelier" className="link-rule on-dark text-cream">
              EXPLORE L&apos;ATELIER
            </Link>
          </motion.div>
        </motion.div>

        {/* End card CTA */}
        <motion.div
          className="absolute inset-x-0 bottom-[clamp(36px,7vh,80px)] flex flex-col items-center gap-3.5"
          style={{ opacity: endOp, pointerEvents: endPE ? "auto" : "none" }}
        >
          <span className="px-5 text-center text-[11px] tracking-[.24em] text-espresso">LE SIGNATURE · FULL-GRAIN LEATHER · $895 CAD</span>
          <Link href="/product/le-signature?color=Espresso" className="link-rule">
            DISCOVER THE PIECE →
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <motion.div aria-hidden className="absolute right-[clamp(20px,4vw,56px)] bottom-[calc(clamp(40px,9vh,104px)+22px)] hidden items-center gap-3.5 text-[10px] tracking-[.3em] text-cream/55 wide:flex" style={{ opacity: textOp }}>
          SCROLL
          <span className="relative h-px w-12 overflow-hidden bg-cream/25">
            <motion.span className="absolute inset-y-0 left-0 w-1/2 bg-cream/80" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }} />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

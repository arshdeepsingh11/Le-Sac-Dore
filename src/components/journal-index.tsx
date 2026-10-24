"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { BagShot } from "./bag-shot";
import { Reveal } from "./ui/reveal";
import { ARTICLES, fmtJournalDate, JOURNAL_CATEGORIES, type Article } from "@/lib/journal";
import { EASE_LUX } from "@/lib/utils";

function Card({ a }: { a: Article }) {
  return (
    <Link href={`/journal/${a.slug}`} className="group flex flex-col gap-4">
      <span className="relative block aspect-[4/5] overflow-hidden">
        <span className="absolute inset-0 transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.04]">
          <BagShot view={a.hero.view} tone={a.hero.tone} ground={a.hero.ground} texture={a.hero.texture} size={52} />
        </span>
      </span>
      <span className="flex items-center gap-3 text-[10px] tracking-[.24em] text-taupe">
        <span className="text-gold">{a.category}</span>
        <span>{a.minutes} MIN READ</span>
      </span>
      <span className="font-serif text-[26px] leading-[1.15] transition-colors duration-300 group-hover:text-burgundy">{a.title}</span>
      <span className="text-[13px] leading-relaxed text-body">{a.dek}</span>
    </Link>
  );
}

export function JournalIndex() {
  const [cat, setCat] = useState<(typeof JOURNAL_CATEGORIES)[number]>("ALL");
  const [lead, ...rest] = ARTICLES;
  const list = cat === "ALL" ? rest : ARTICLES.filter((a) => a.category === cat);

  return (
    <>
      <section className="gutter mx-auto max-w-[1600px] pt-[clamp(120px,18vh,180px)]">
        <p className="eyebrow mb-4">LE SAC DORÉ™</p>
        <h1 className="display text-[clamp(56px,8vw,128px)] leading-[.92] tracking-[.03em]">THE JOURNAL</h1>
        <p className="lede mt-5 text-[clamp(20px,2vw,26px)]">Stories of craft, material and the lives our pieces lead.</p>
      </section>

      {cat === "ALL" && (
        <section className="gutter mx-auto mt-14 max-w-[1600px]">
          <Reveal>
            <Link href={`/journal/${lead.slug}`} className="group grid grid-cols-1 items-center gap-8 wide:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] wide:gap-16">
              <span className="relative block aspect-[4/3] overflow-hidden wide:aspect-[16/11]">
                <span className="absolute inset-0 transition-transform duration-[1600ms] ease-lux group-hover:scale-[1.03]">
                  <BagShot view={lead.hero.view} tone={lead.hero.tone} ground={lead.hero.ground} texture={lead.hero.texture} caption={lead.hero.caption} size={40} />
                </span>
              </span>
              <span className="flex flex-col gap-5">
                <span className="flex items-center gap-3 text-[10px] tracking-[.24em] text-taupe">
                  <span className="text-gold">LATEST · {lead.category}</span>
                  <span>{fmtJournalDate(lead.date).toUpperCase()}</span>
                </span>
                <span className="display text-[clamp(36px,4vw,60px)] leading-[1.04] transition-colors duration-300 group-hover:text-burgundy">{lead.title}</span>
                <span className="max-w-[460px] text-[15px] leading-[1.8] text-body">{lead.dek}</span>
                <span className="link-rule self-start">READ THE STORY →</span>
              </span>
            </Link>
          </Reveal>
        </section>
      )}

      <section className="gutter mx-auto max-w-[1600px] pt-[clamp(80px,12vh,140px)] pb-[clamp(100px,14vh,160px)]">
        <LayoutGroup id="journal-cats">
          <div role="tablist" aria-label="Categories" className="no-scrollbar -mx-[clamp(20px,4vw,56px)] mb-12 flex gap-7 overflow-x-auto border-b border-ink/12 px-[clamp(20px,4vw,56px)] pb-[18px]">
            {JOURNAL_CATEGORIES.map((c) => (
              <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className="relative shrink-0 py-1.5 text-[11px] font-medium tracking-[.22em] transition-colors duration-300" style={{ color: cat === c ? "#111111" : "#857B70" }}>
                {c}
                {cat === c && <motion.span layoutId="journal-rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
              </button>
            ))}
          </div>
        </LayoutGroup>
        <motion.div layout className="grid grid-cols-1 gap-x-5 gap-y-16 sm:grid-cols-2 wide:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((a, i) => (
              <motion.div key={a.slug} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.7, ease: EASE_LUX } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                <Card a={a} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </>
  );
}

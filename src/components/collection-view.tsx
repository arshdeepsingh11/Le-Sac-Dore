"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { BagShot } from "./bag-shot";
import { ProductCard } from "./product-card";
import { COLLECTIONS, filterProducts, FILTERS, type FilterKey } from "@/lib/data";
import { EASE_LUX } from "@/lib/utils";

export function CollectionView({ initialFilter }: { initialFilter: FilterKey }) {
  const [filter, setFilterState] = useState<FilterKey>(initialFilter);
  const [sort, setSort] = useState("featured");
  const lenis = useLenis();
  const list = filterProducts(filter, sort);
  const meta = COLLECTIONS.find((c) => c.key === filter);
  const title = filter === "new" ? "NEW ARRIVALS" : meta ? meta.name : "LA COLLECTION";
  const sub = filter === "new" ? "New expressions of Le Sac Doré." : meta ? meta.line : "Objects designed for every chapter.";

  const setFilter = (f: FilterKey, toTop = false) => {
    setFilterState(f);
    const url = f === "all" ? "/collection" : `/collection?filter=${f}`;
    window.history.replaceState(null, "", url);
    if (toTop) (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <section className="gutter mx-auto max-w-[1600px] pt-[clamp(130px,18vh,190px)] pb-[120px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={filter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45, ease: EASE_LUX }}>
          <p className="eyebrow mb-[18px]">{filter === "new" ? "AUTUMN 2026" : "LE SAC DORÉ™"}</p>
          <h1 className="display text-[clamp(52px,6.4vw,104px)] leading-[.98] tracking-[.03em]">{title}</h1>
          <p className="lede mt-[18px] text-2xl">{sub}</p>
        </motion.div>
      </AnimatePresence>

      {filter === "all" && (
        <div className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
          {COLLECTIONS.map((c, i) => (
            <motion.button
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: EASE_LUX }}
              onClick={() => setFilter(c.key, true)}
              className="group relative aspect-[3/4] overflow-hidden bg-[#2A211B] text-left"
            >
              <span className="absolute inset-0 transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.04]">
                <BagShot view="lifestyle" tone={c.tone} ground={c.ground} size={70} />
              </span>
              <span className="absolute inset-x-5 bottom-5 flex flex-col gap-1.5 text-cream">
                <span className="font-serif text-[22px] tracking-[.08em]">{c.name}</span>
                <span className="text-xs text-cream/80">{c.line}</span>
              </span>
            </motion.button>
          ))}
        </div>
      )}

      <div className="sticky top-[60px] z-20 mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-ink/12 bg-cream/90 py-[18px] backdrop-blur-xl">
        <LayoutGroup id="filters">
          <div role="tablist" aria-label="Filter" className="flex flex-wrap gap-x-[26px] gap-y-1.5">
            {FILTERS.map(([k, label]) => {
              const active = filter === k;
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(k)}
                  className="relative py-1.5 text-[11px] font-medium tracking-[.2em] transition-colors duration-300"
                  style={{ color: active ? "#111111" : "#857B70" }}
                >
                  {label}
                  {active && <motion.span layoutId="filter-rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <div className="flex items-center gap-6 text-xs text-taupe">
          <span className="tabular-nums">
            {list.length} {list.length === 1 ? "piece" : "pieces"}
          </span>
          <label className="flex items-center gap-2.5">
            <span className="text-[11px] tracking-[.2em]">SORT</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="field !w-auto !py-1.5 !pl-1 !text-xs">
              <option value="featured">Featured</option>
              <option value="new">Newest</option>
              <option value="asc">Price, low to high</option>
              <option value="desc">Price, high to low</option>
            </select>
          </label>
        </div>
      </div>

      <motion.div layout className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-x-5 gap-y-16">
        <AnimatePresence mode="popLayout">
          {list.map((x, i) => (
            <motion.div
              key={x.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: Math.min(i, 8) * 0.04, ease: EASE_LUX } }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.25 } }}
              transition={{ layout: { duration: 0.6, ease: EASE_LUX } }}
            >
              <ProductCard product={x} aspect="4 / 5" size={50} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

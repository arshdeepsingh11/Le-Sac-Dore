"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { BagShot } from "@/components/bag-shot";
import { productHref } from "@/components/product-card";
import { byId, COLORS, fmt, groundFor } from "@/lib/data";
import { addToBag, toggleWishlist, useShop, useUI } from "@/lib/store";
import { EASE_LUX } from "@/lib/utils";

export default function WishlistPage() {
  const hydrated = useUI((s) => s.hydrated);
  const wish = useShop((s) => s.wish);
  const cardColor = useUI((s) => s.cardColor);

  return (
    <section className="gutter mx-auto max-w-[1600px] pt-[clamp(130px,18vh,180px)] pb-[120px]">
      <h1 className="display mb-14 text-[clamp(48px,5.6vw,88px)] tracking-[.04em]">YOUR WISHLIST</h1>
      {hydrated && !wish.length && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-8 font-serif text-[26px] text-espresso">Nothing saved yet.</p>
          <Link href="/collection" className="btn-ink">
            DISCOVER LA COLLECTION
          </Link>
        </motion.div>
      )}
      {hydrated && (
        <motion.div layout className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-x-5 gap-y-14">
          <AnimatePresence mode="popLayout">
            {wish.map((id, i) => {
              const p = byId(id);
              const c = cardColor[id] ?? p.colors[0];
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.7, ease: EASE_LUX } }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.3 } }}
                  className="flex flex-col gap-4"
                >
                  <Link href={productHref(id, c)} aria-label={`View ${p.name}`} className="group relative aspect-[4/5] overflow-hidden bg-parch">
                    <span className="absolute inset-0 transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.035]">
                      <BagShot tone={COLORS[c]} ground={groundFor(c)} caption={`01 Front — ${c}`} size={50} />
                    </span>
                  </Link>
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="m-0 font-serif text-[22px] font-medium tracking-[.08em]">{p.name}</h2>
                    <span className="text-[13px]">{fmt(p.price)}</span>
                  </div>
                  <span className="-mt-2.5 text-xs text-taupe">
                    {p.material} · {c}
                  </span>
                  <div className="flex gap-5 text-[10px] tracking-[.2em]">
                    <Link href={productHref(id, c)} className="border-b border-ink pb-[3px]">
                      VIEW PRODUCT
                    </Link>
                    <button onClick={() => addToBag(id, c, 1, false)} className="border-b border-ink pb-[3px]">
                      ADD TO BAG
                    </button>
                    <button onClick={() => toggleWishlist(id)} className="border-b border-ink/30 pb-[3px] text-taupe">
                      REMOVE
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}

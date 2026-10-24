"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BagShot } from "./bag-shot";
import { COLORS, fmt, ground2For, groundFor, isLight, type Product } from "@/lib/data";
import { toggleWishlist, useShop, useUI } from "@/lib/store";

export const productHref = (id: string, color?: string) => `/product/${id}${color ? `?color=${encodeURIComponent(color)}` : ""}`;

interface Props {
  product: Product;
  aspect?: string;
  size?: number;
}

export const ProductCard = memo(function ProductCard({ product: p, aspect = "4 / 5", size = 50 }: Props) {
  const [hov, setHov] = useState(false);
  const cc = useUI((s) => s.cardColor[p.id]) ?? p.colors[0];
  const setCardColor = useUI((s) => s.setCardColor);
  const wished = useShop((s) => s.wish.includes(p.id));
  const light = isLight(cc);
  const ink = light ? "#F7F4EE" : "#111111";
  const tone = COLORS[cc];
  const texture = p.texture ?? "grain";
  const layer = "absolute inset-0 will-change-transform";
  const layerT = "opacity .8s ease, transform 1.4s cubic-bezier(.2,.7,.2,1)";

  return (
    <article
      className="relative flex flex-col gap-[18px] text-ink"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Link
        href={productHref(p.id, cc)}
        aria-label={`View ${p.name}`}
        className="relative block cursor-pointer overflow-hidden"
        style={{ aspectRatio: aspect, background: groundFor(cc) }}
        onFocus={() => setHov(true)}
        onBlur={() => setHov(false)}
      >
        <div className={layer} style={{ transition: layerT, opacity: hov ? 0 : 1, transform: hov ? "scale(1.035)" : "scale(1)" }}>
          <BagShot tone={tone} ground={groundFor(cc)} view="front" texture={texture} caption={`01 Front — ${cc}, ${light ? "dark oak" : "limestone"}`} size={size} />
        </div>
        <div className={layer} style={{ transition: layerT, opacity: hov ? 1 : 0, transform: hov ? "scale(1.035)" : "scale(1)" }}>
          <BagShot tone={tone} ground={ground2For(cc)} view="side" texture={texture} caption="02 Side — raking light" size={size} />
        </div>
        {p.isNew && (
          <span className="absolute top-[18px] left-[18px] text-[10px] font-medium tracking-[.26em]" style={{ color: ink }}>
            NEW
          </span>
        )}
        <span
          className="absolute right-[18px] bottom-4 text-[10px] font-medium tracking-[.24em] transition-[opacity,transform] duration-[600ms] ease-lux"
          style={{ color: ink, opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(6px)" }}
        >
          VIEW PRODUCT →
        </span>
      </Link>

      <button
        onClick={() => toggleWishlist(p.id)}
        aria-label={wished ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
        aria-pressed={wished}
        className="absolute top-2.5 right-2.5 flex h-10 w-10 items-center justify-center text-lg transition-transform duration-300 ease-lux hover:scale-[1.12] active:scale-95"
        style={{ color: ink }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={wished ? "on" : "off"}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 22 }}
          >
            {wished ? "♥" : "♡"}
          </motion.span>
        </AnimatePresence>
      </button>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1">
        <h3 className="m-0 font-serif text-[21px] font-medium tracking-[.08em]">{p.name}</h3>
        <span className="text-[13px] tracking-[.02em]">{fmt(p.price)}</span>
        <span className="text-xs tracking-[.02em] text-taupe">
          {p.material} · {cc}
        </span>
        <span />
      </div>

      <div className="-mt-1.5 flex items-center gap-2" role="group" aria-label="Colours">
        {p.colors.map((n) => (
          <button
            key={n}
            onClick={() => setCardColor(p.id, n)}
            aria-label={n}
            title={n}
            className="flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors duration-300"
            style={{ borderColor: n === cc ? "#111111" : "transparent" }}
          >
            <span className="h-2.5 w-2.5 rounded-full shadow-[inset_0_0_0_1px_rgba(17,17,17,.15)]" style={{ background: COLORS[n] }} />
          </button>
        ))}
      </div>
    </article>
  );
});

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BagShot } from "@/components/bag-shot";
import { productHref } from "@/components/product-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { COLORS, fmt, groundFor, totals } from "@/lib/data";
import { cartRows, useShop, useSubtotal, useUI } from "@/lib/store";
import { EASE_LUX } from "@/lib/utils";

const money = (n: number) => fmt(Math.round(n));

export default function CartPage() {
  const router = useRouter();
  const hydrated = useUI((s) => s.hydrated);
  const cart = useShop((s) => s.cart);
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.remove);
  const sub = useSubtotal();
  const t = totals(sub, "standard");
  const rows = cartRows(cart);

  return (
    <section className="gutter mx-auto max-w-[1400px] pt-[clamp(130px,18vh,180px)] pb-[120px]">
      <h1 className="display mb-14 text-[clamp(48px,5.6vw,88px)] tracking-[.04em]">YOUR BAG</h1>

      {hydrated && !rows.length && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-8 font-serif text-[26px] text-espresso">Your bag is empty.</p>
          <Link href="/collection" className="btn-ink !px-[30px] !py-[18px] !tracking-[.22em]">
            DISCOVER LA COLLECTION
          </Link>
        </motion.div>
      )}

      {hydrated && rows.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-[clamp(40px,6vw,96px)] wide:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <div className="border-t border-ink/15">
            <AnimatePresence initial={false}>
              {rows.map((c) => (
                <motion.div
                  key={c.key}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: EASE_LUX }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-[minmax(90px,140px)_minmax(0,1fr)_auto] items-start gap-7 border-b border-ink/15 py-7">
                    <Link href={productHref(c.pid, c.color)} aria-label={`View ${c.name}`} className="group relative aspect-[4/5] overflow-hidden bg-parch">
                      <span className="absolute inset-0 transition-transform duration-[1200ms] ease-lux group-hover:scale-[1.04]">
                        <BagShot tone={COLORS[c.color]} ground={groundFor(c.color)} size={60} />
                      </span>
                    </Link>
                    <div className="flex flex-col gap-1.5">
                      <h2 className="m-0 font-serif text-2xl font-medium tracking-[.08em]">{c.name}</h2>
                      <span className="text-[13px] text-taupe">
                        {c.material} · {c.color}
                      </span>
                      <div className="mt-[18px] flex flex-wrap items-center gap-2">
                        <button onClick={() => setQty(c.key, -1)} aria-label="Decrease quantity" className="qty-btn h-8 w-8">
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm tabular-nums">{c.qty}</span>
                        <button onClick={() => setQty(c.key, 1)} aria-label="Increase quantity" className="qty-btn h-8 w-8">
                          +
                        </button>
                        <button onClick={() => remove(c.key)} className="ml-[18px] border-b border-ink/40 pb-[3px] text-[10px] tracking-[.2em]">
                          REMOVE
                        </button>
                      </div>
                    </div>
                    <span className="text-sm tabular-nums">{c.lineF}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <aside aria-label="Order summary" className="flex flex-col gap-4 bg-ivory p-10 text-[13px] wide:sticky wide:top-[100px]">
            <h2 className="m-0 mb-2.5 text-[11px] font-semibold tracking-[.24em]">ORDER SUMMARY</h2>
            <div className="flex justify-between">
              <span>SUBTOTAL</span>
              <NumberTicker value={t.sub} format={money} />
            </div>
            <div className="flex justify-between">
              <span>SHIPPING</span>
              <span>{t.std === 0 ? "Complimentary" : fmt(t.std)}</span>
            </div>
            <div className="flex justify-between">
              <span>TAX (HST 13%)</span>
              <NumberTicker value={t.tax} format={money} />
            </div>
            <div className="flex justify-between border-t border-ink/15 pt-[18px] text-[15px] font-semibold">
              <span>TOTAL</span>
              <NumberTicker value={t.total} format={money} />
            </div>
            <div className="mt-1.5 flex items-center gap-4">
              <AnimatedCircularProgressBar value={t.sub} max={1000} className="size-11" label="Progress to complimentary shipping">
                <span className="text-[12px] text-gold">{t.sub >= 1000 ? "✓" : `${Math.round((t.sub / 1000) * 100)}%`}</span>
              </AnimatedCircularProgressBar>
              <p className="m-0 text-xs leading-relaxed text-olive">
                {t.sub >= 1000 ? "Your order qualifies for complimentary shipping." : `You are ${fmt(1000 - t.sub)} away from complimentary shipping.`}
              </p>
            </div>
            <button onClick={() => router.push("/checkout")} className="btn-ink mt-2.5 !px-[30px]">
              PROCEED TO CHECKOUT
            </button>
            <p className="mt-1.5 text-xs leading-relaxed text-taupe">Each piece arrives in our signature box with ivory tissue, a cotton dust bag and a numbered authentication card.</p>
          </aside>
        </div>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BagShot } from "./bag-shot";
import { Wordmark } from "./header";
import { productHref } from "./product-card";
import { NumberTicker } from "./ui/number-ticker";
import { AnimatedCircularProgressBar } from "./ui/animated-circular-progress-bar";
import { COLORS, fmt, groundFor, searchProducts, SEARCH_SUGGESTIONS } from "@/lib/data";
import { cartRows, useBagCount, useShop, useSubtotal, useUI } from "@/lib/store";
import { EASE_LUX } from "@/lib/utils";
import { track } from "@/lib/analytics";

/* ───────────────────────── Search ───────────────────────── */

export function SearchOverlay() {
  const open = useUI((s) => s.search);
  const set = useUI((s) => s.set);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const results = searchProducts(q);
  const hasQ = q.trim().length > 0;

  useEffect(() => {
    const q2 = q.trim();
    if (q2.length < 2) return;
    const t = setTimeout(() => track("search", { meta: { q: q2, results: searchProducts(q2).length } }), 1200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => input.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      aria-hidden={!open}
      data-lenis-prevent
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-cream"
      style={{ opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden", transition: "opacity .5s ease, visibility .5s" }}
    >
      <div
        className="gutter mx-auto max-w-[1400px] pt-8 pb-20"
        style={{ transform: open ? "translateY(0)" : "translateY(-16px)", transition: "transform .6s cubic-bezier(.2,.7,.2,1)" }}
      >
        <div className="flex items-center justify-between">
          <Wordmark />
          <button onClick={() => set({ search: false })} className="py-2 text-[11px] tracking-[.22em]">
            CLOSE ×
          </button>
        </div>
        <h2 className="display mt-[clamp(60px,12vh,120px)] mb-7 text-[clamp(40px,5.4vw,84px)] leading-none">WHAT ARE YOU LOOKING FOR?</h2>
        <label htmlFor="search-q" className="sr-only">
          Search
        </label>
        <input
          id="search-q"
          ref={input}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the maison"
          autoComplete="off"
          className="w-full rounded-none border-b border-ink bg-transparent py-[18px] font-serif text-[clamp(26px,2.6vw,38px)] text-ink outline-none placeholder:text-taupe/70"
        />
        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-2.5">
          <span className="py-1.5 text-[10px] tracking-[.24em] text-taupe">SUGGESTED</span>
          {SEARCH_SUGGESTIONS.map((l) => (
            <button key={l} onClick={() => setQ(l.toLowerCase())} className="border-b border-transparent py-1.5 text-[11px] font-medium tracking-[.22em] transition-colors hover:border-ink">
              {l}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-12 mb-6 text-[11px] tracking-[.2em] text-taupe">
          {hasQ ? (results.length ? `${results.length} ${results.length === 1 ? "RESULT" : "RESULTS"}` : "NO RESULTS. TRY LEATHER, EVENING OR JUTE.") : ""}
        </p>
        <motion.div layout className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-x-5 gap-y-10">
          <AnimatePresence mode="popLayout">
            {results.map((x, i) => (
              <motion.div
                key={x.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.6, ease: EASE_LUX } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <Link href={productHref(x.id)} className="group flex flex-col gap-3 text-left">
                  <span className="relative block aspect-[4/5] w-full overflow-hidden bg-parch">
                    <span className="absolute inset-0 transition-transform duration-[1200ms] ease-lux group-hover:scale-[1.04]">
                      <BagShot tone={COLORS[x.colors[0]]} ground={groundFor(x.colors[0])} texture={x.texture ?? "grain"} size={52} />
                    </span>
                  </span>
                  <span className="font-serif text-xl tracking-[.08em]">{x.name}</span>
                  <span className="-mt-1.5 text-xs text-taupe">
                    {x.material} · {fmt(x.price)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* ───────────────────────── Mobile menu ───────────────────────── */

export function MobileMenu() {
  const open = useUI((s) => s.menu);
  const set = useUI((s) => s.set);
  const wishCount = useShop((s) => s.wish.length);
  const items: [string, string][] = [
    ["La Collection", "/collection"],
    ["New Arrivals", "/collection?filter=new"],
    ["L'Atelier", "/atelier"],
    ["Materials", "/materials"],
    ["Journal", "/journal"],
    ["La Maison", "/maison"],
    [`Wishlist (${wishCount})`, "/wishlist"],
    ["Account", "/account"],
    ["Client Services", "/services"],
  ];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      data-lenis-prevent
      className="fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-cream px-6 py-7"
      style={{ opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden", transition: "opacity .45s ease, visibility .45s" }}
    >
      <div className="flex items-center justify-between">
        <Wordmark size={19} className="tracking-[.28em]" />
        <button onClick={() => set({ menu: false })} className="py-2 text-[11px] tracking-[.22em]">
          CLOSE ×
        </button>
      </div>
      <nav aria-label="Mobile" className="mt-16 flex flex-col gap-1.5">
        {items.map(([label, href], i) => (
          <Link
            key={href + label}
            href={href}
            onClick={() => set({ menu: false })}
            className="py-2.5 text-left font-serif text-4xl font-light tracking-[.04em]"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "none" : "translateY(14px)",
              transition: `opacity .6s ease ${open ? 0.08 + i * 0.04 : 0}s, transform .8s cubic-bezier(.2,.7,.2,1) ${open ? 0.08 + i * 0.04 : 0}s`,
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className="mt-auto pt-10 text-[11px] tracking-[.3em] text-taupe">THE ART OF CARRYING.</p>
    </div>
  );
}

/* ───────────────────────── Bag drawer ───────────────────────── */

export function BagDrawer() {
  const open = useUI((s) => s.drawer);
  const set = useUI((s) => s.set);
  const flash = useUI((s) => s.flash);
  const cart = useShop((s) => s.cart);
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.remove);
  const count = useBagCount();
  const sub = useSubtotal();
  const router = useRouter();
  const rows = cartRows(cart);
  const away = Math.max(0, 1000 - sub);

  const checkout = () => {
    if (!cart.length) return flash("YOUR BAG IS EMPTY");
    set({ drawer: false });
    router.push("/checkout");
  };

  return (
    <>
      <div
        onClick={() => set({ drawer: false })}
        aria-hidden="true"
        className="fixed inset-0 z-[48] bg-[rgba(17,12,9,.36)] backdrop-blur-[2px]"
        style={{ opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden", transition: "opacity .5s ease, visibility .5s" }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        aria-hidden={!open}
        className="fixed inset-y-0 right-0 z-50 flex w-[min(460px,100vw)] flex-col bg-cream shadow-[-30px_0_60px_rgba(17,12,9,.12)]"
        style={{ transform: open ? "translateX(0)" : "translateX(104%)", visibility: open ? "visible" : "hidden", transition: "transform .6s cubic-bezier(.2,.7,.2,1), visibility .6s" }}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-8 py-7">
          <h2 className="m-0 text-[11px] font-semibold tracking-[.26em]">YOUR BAG ({count})</h2>
          <button onClick={() => set({ drawer: false })} className="py-1.5 text-[11px] tracking-[.2em]">
            CLOSE ×
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-8 py-2">
          {!rows.length && <p className="my-10 font-serif text-2xl text-espresso">Your bag is empty.</p>}
          <AnimatePresence initial={false}>
            {rows.map((c) => (
              <motion.div
                key={c.key}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: EASE_LUX }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-5 border-b border-ink/10 py-6">
                  <Link href={productHref(c.pid, c.color)} onClick={() => set({ drawer: false })} className="relative aspect-[4/5] overflow-hidden bg-parch">
                    <BagShot tone={COLORS[c.color]} ground={groundFor(c.color)} size={62} />
                  </Link>
                  <div className="flex flex-col gap-1 text-[13px]">
                    <div className="flex justify-between gap-3">
                      <span className="font-serif text-xl tracking-[.06em]">{c.name}</span>
                      <span>{c.lineF}</span>
                    </div>
                    <span className="text-taupe">{c.color}</span>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <button onClick={() => setQty(c.key, -1)} aria-label="Decrease quantity" className="qty-btn h-7 w-7">
                        −
                      </button>
                      <span className="min-w-5 text-center tabular-nums">{c.qty}</span>
                      <button onClick={() => setQty(c.key, 1)} aria-label="Increase quantity" className="qty-btn h-7 w-7">
                        +
                      </button>
                      <button onClick={() => remove(c.key)} className="ml-auto border-b border-ink/35 pb-0.5 text-[10px] tracking-[.18em]">
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3 border-t border-ink/10 px-8 pt-6 pb-8">
          {rows.length > 0 && (
            <div className="mb-2 flex items-center gap-4 bg-ivory p-4">
              <AnimatedCircularProgressBar value={sub} max={1000} className="size-12" label="Progress to complimentary shipping">
                <span className="text-[13px] text-gold">{sub >= 1000 ? "✓" : `${Math.round((sub / 1000) * 100)}%`}</span>
              </AnimatedCircularProgressBar>
              <p className="m-0 text-xs leading-relaxed text-olive">
                {sub >= 1000 ? "Your order qualifies for complimentary shipping." : `You are ${fmt(away)} away from complimentary shipping.`}
              </p>
            </div>
          )}
          <div className="flex justify-between text-[13px] tracking-[.1em]">
            <span>SUBTOTAL</span>
            <NumberTicker value={sub} format={(n) => fmt(Math.round(n))} />
          </div>
          <p className="m-0 mb-1.5 text-xs text-taupe">Complimentary signature packaging.</p>
          <button onClick={checkout} className="btn-ink !py-[19px]">
            CHECKOUT
          </button>
          <Link href="/cart" onClick={() => set({ drawer: false })} className="btn-line !py-[18px]">
            VIEW BAG
          </Link>
        </div>
      </aside>
    </>
  );
}

/* ───────────────────────── Toast ───────────────────────── */

export function Toast() {
  const toast = useUI((s) => s.toast);
  const on = useUI((s) => s.toastOn);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-8 left-1/2 z-[80] bg-ink px-[26px] py-4 text-[11px] tracking-[.2em] whitespace-nowrap text-cream"
      style={{ transform: on ? "translate(-50%,0)" : "translate(-50%,12px)", opacity: on ? 1 : 0, transition: "opacity .5s ease, transform .5s cubic-bezier(.2,.7,.2,1)" }}
    >
      {toast}
    </div>
  );
}

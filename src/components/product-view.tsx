"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { BagShot } from "./bag-shot";
import { ProductCard } from "./product-card";
import { Reveal } from "./ui/reveal";
import { COLORS, fmt, groundFor, INSIDE, isLight, MATERIALS, PRODUCTS, VIEWS, type ColorName, type Product, type View } from "@/lib/data";
import { addToBag, toggleWishlist, useShop } from "@/lib/store";
import { EASE_LUX } from "@/lib/utils";

function makeView(i: number, p: Product, color: ColorName) {
  const [v, label] = VIEWS[i];
  const light = isLight(color);
  const ground: Record<View, string> = {
    front: groundFor(color),
    side: light ? "#2A211B" : "#DAD1C3",
    back: light ? "#3A2E26" : "#E9E3D9",
    interior: light ? "#2F261F" : "#CFC4B4",
    hardware: "#E6DED2",
    macro: "#E6DED2",
    lifestyle: "#2B211B",
    scale: "#EEE9E0",
    box: "#E3DACB",
  };
  const cap: Record<View, string> = {
    front: "on a limestone plinth, soft window light",
    side: "profile, raking light",
    back: "back panel and stitching",
    interior: "linen lining and pockets",
    hardware: "solid brass, champagne-gold finish",
    macro: "surface of the " + p.material.toLowerCase(),
    lifestyle: "carried, Paris, late afternoon",
    scale: p.dims,
    box: "signature box",
  };
  const darkInk = v === "lifestyle" || (light && ["front", "side", "back", "interior"].includes(v)) || (["hardware", "macro"].includes(v) && !light);
  return { view: v, label, tone: COLORS[color], ground: ground[v], texture: p.texture ?? "grain", caption: `${label} — ${cap[v]}`, ink: darkInk ? "#F7F4EE" : "#111111" };
}

export function ProductView({ product: p, initialColor }: { product: Product; initialColor: ColorName }) {
  const router = useRouter();
  const [color, setColorState] = useState<ColorName>(initialColor);
  const [view, setView] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [full, setFull] = useState(false);
  const [acc, setAcc] = useState<string | null>("details");
  const [inside, setInside] = useState("phone");
  const touchX = useRef(0);
  const wished = useShop((s) => s.wish.includes(p.id));
  const mv = makeView(view, p, color);
  const mat = MATERIALS.find((m) => m.key === p.mats[0]);

  const shift = useCallback((d: number) => {
    setView((v) => (v + d + VIEWS.length) % VIEWS.length);
    setZoom(false);
  }, []);

  const setColor = (c: ColorName) => {
    setColorState(c);
    window.history.replaceState(null, "", `/product/${p.id}?color=${encodeURIComponent(c)}`);
  };

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") shift(1);
      if (e.key === "ArrowLeft") shift(-1);
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full, shift]);

  const pos = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };
  const onTouchStart = (e: TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) shift(dx < 0 ? 1 : -1);
  };

  const accordions: [string, string, string][] = [
    ["details", "DETAILS", `${p.desc}\nMagnetic closure with champagne-gold clasp · Interior zip pocket and slip pocket · Maker’s initials stamped inside.`],
    ["material", "MATERIAL & CRAFT", `${p.material}. ${mat?.text ?? ""}\nLined in Belgian linen. Solid brass hardware. Edges hand-painted in three layers.`],
    ["dims", "DIMENSIONS", `${p.dims}\nHandle drop 11 cm · Adjustable strap drop 48–56 cm`],
    ["care", "CARE", "Store in the dust bag, filled with tissue to hold its shape. Keep away from prolonged sunlight and moisture. Wipe with a dry, soft cloth."],
    ["ship", "SHIPPING & RETURNS", "Complimentary shipping on orders over $1,000 CAD. Delivered in 2–5 business days across Canada. Returns within 30 days in original condition."],
  ];
  const related = PRODUCTS.filter((x) => x.id !== p.id && x.mats.some((m) => p.mats.includes(m))).slice(0, 4);

  return (
    <>
      <section className="gutter mx-auto max-w-[1600px] pt-[clamp(96px,12vh,120px)]">
        <nav aria-label="Breadcrumb" className="mb-7 flex gap-2.5 text-[11px] tracking-[.16em] text-taupe">
          <Link href="/collection" className="transition-colors hover:text-ink">
            LA COLLECTION
          </Link>
          <span>/</span>
          <span className="text-ink">{p.name}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-[clamp(32px,5vw,88px)] wide:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* Gallery */}
          <div className="grid grid-cols-1 gap-3.5 wide:grid-cols-[72px_minmax(0,1fr)]">
            <div role="tablist" aria-label="Product views" className="hidden flex-col gap-2.5 wide:flex">
              {VIEWS.map(([, label], i) => {
                const tv = makeView(i, p, color);
                const active = i === view;
                return (
                  <button
                    key={label}
                    role="tab"
                    aria-selected={active}
                    aria-label={label}
                    onClick={() => {
                      setView(i);
                      setZoom(false);
                    }}
                    className="relative aspect-[4/5] w-[72px] overflow-hidden bg-parch outline outline-offset-2 transition-[outline-color,opacity] duration-300"
                    style={{ outlineColor: active ? "#111111" : "transparent", opacity: active ? 1 : 0.82 }}
                  >
                    <BagShot view={tv.view} tone={tv.tone} ground={tv.ground} texture={tv.texture} size={54} />
                  </button>
                );
              })}
            </div>
            <div>
              <div
                role="img"
                aria-label={`${p.name} in ${color}, ${mv.label}`}
                onClick={(e) => {
                  setOrigin(pos(e));
                  setZoom((z) => !z);
                }}
                onMouseMove={(e) => zoom && setOrigin(pos(e))}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                className="relative aspect-[4/5] overflow-hidden bg-parch"
                style={{ cursor: zoom ? "zoom-out" : "zoom-in" }}
              >
                <div
                  className="absolute inset-0"
                  style={{ transform: zoom ? "scale(2.1)" : "scale(1)", transformOrigin: `${origin.x}% ${origin.y}%`, transition: "transform .6s cubic-bezier(.2,.7,.2,1)" }}
                >
                  <AnimatePresence initial={false}>
                    <motion.div key={mv.view} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: "easeInOut" }}>
                      <BagShot view={mv.view} tone={mv.tone} ground={mv.ground} texture={mv.texture} caption={mv.caption} scaleLabel={p.dims} size={54} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <span className="absolute top-[18px] left-[18px] text-[10px] tracking-[.24em] tabular-nums transition-colors duration-500" style={{ color: mv.ink }}>
                  {String(view + 1).padStart(2, "0")} / 08
                </span>
              </div>
              <div className="mt-3.5 flex items-center justify-between text-[11px] tracking-[.2em]">
                <div className="flex gap-[18px]">
                  <button onClick={() => shift(-1)} aria-label="Previous view" className="py-2 text-[13px] transition-transform hover:-translate-x-0.5">
                    ←
                  </button>
                  <button onClick={() => shift(1)} aria-label="Next view" className="py-2 text-[13px] transition-transform hover:translate-x-0.5">
                    →
                  </button>
                </div>
                <span className="text-taupe">{mv.label}</span>
                <button
                  onClick={() => {
                    setFull(true);
                    setZoom(false);
                  }}
                  className="border-b border-ink py-2 pb-0.5 text-[11px] tracking-[.2em]"
                >
                  FULLSCREEN
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col pb-10 wide:sticky wide:top-24">
            {p.isNew && <p className="mb-3.5 text-[10px] font-semibold tracking-[.3em] text-gold">NEW</p>}
            <h1 className="m-0 font-serif text-[clamp(40px,4vw,60px)] leading-none font-normal tracking-[.06em]">{p.name}</h1>
            <p className="mt-3.5 text-[13px] font-medium tracking-[.06em] text-espresso">{p.material}</p>
            <p className="mt-1.5 text-[15px]">{fmt(p.price)}</p>
            <p className="mt-7 max-w-[460px] font-serif text-[21px] leading-[1.45] text-espresso">{p.desc}</p>

            <div className="mt-9 flex gap-2.5 text-[11px] tracking-[.2em]">
              <span className="text-taupe">COLOUR</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={color} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }} className="font-semibold">
                  {color.toUpperCase()}
                </motion.span>
              </AnimatePresence>
            </div>
            <div role="radiogroup" aria-label="Colour" className="mt-3.5 flex gap-3">
              {p.colors.map((n) => (
                <button
                  key={n}
                  role="radio"
                  aria-checked={n === color}
                  aria-label={n}
                  title={n}
                  onClick={() => setColor(n)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border transition-[border-color,transform] duration-300 hover:scale-105"
                  style={{ borderColor: n === color ? "#111111" : "rgba(17,17,17,.12)" }}
                >
                  <span className="h-6 w-6 rounded-full shadow-[inset_0_0_0_1px_rgba(17,17,17,.15)]" style={{ background: COLORS[n] }} />
                </button>
              ))}
            </div>

            <div className="mt-[30px] flex items-center gap-2.5">
              <span className="mr-2.5 text-[11px] tracking-[.2em] text-taupe">QUANTITY</span>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="qty-btn h-9 w-9">
                −
              </button>
              <span aria-live="polite" className="min-w-7 text-center text-sm tabular-nums">
                {qty}
              </span>
              <button onClick={() => setQty((q) => Math.min(9, q + 1))} aria-label="Increase quantity" className="qty-btn h-9 w-9">
                +
              </button>
            </div>

            <div className="mt-[30px] flex max-w-[460px] flex-col gap-2.5">
              <button onClick={() => addToBag(p.id, color, qty, true)} className="btn-ink !px-[30px]">
                ADD TO BAG — {fmt(p.price * qty)}
              </button>
              <button onClick={() => toggleWishlist(p.id)} aria-pressed={wished} className="btn-line !px-[30px] !py-[19px]">
                {wished ? "SAVED TO WISHLIST ♥" : "ADD TO WISHLIST"}
              </button>
              <button
                onClick={() => {
                  useShop.getState().add(p.id, color, qty);
                  router.push("/checkout?pay=apple");
                }}
                className="flex items-center justify-center gap-2 border border-ink/12 bg-ivory px-[30px] py-[19px] text-xs font-semibold tracking-[.08em] transition-colors duration-300 hover:bg-[#F1ECE3]"
              >
                BUY WITH APPLE PAY
              </button>
              <p className="mt-1.5 text-xs leading-relaxed text-taupe">Complimentary signature packaging. Delivered in 2–5 business days.</p>
            </div>

            <div className="mt-10 max-w-[460px] border-b border-ink/15">
              {accordions.map(([k, title, body]) => {
                const open = acc === k;
                return (
                  <div key={k} className="border-t border-ink/15">
                    <h3 className="m-0">
                      <button aria-expanded={open} onClick={() => setAcc(open ? null : k)} className="flex w-full items-center justify-between py-5 text-left text-[11px] font-medium tracking-[.22em]">
                        {title}
                        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.4, ease: EASE_LUX }} className="text-base font-light">
                          +
                        </motion.span>
                      </button>
                    </h3>
                    <div className="grid transition-[grid-template-rows] duration-500 ease-lux" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                      <div className="overflow-hidden">
                        <p className="mb-[22px] text-sm leading-[1.8] whitespace-pre-line text-body">{body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Inside the bag */}
      <section aria-labelledby="h-inside" className="gutter mt-[clamp(100px,14vh,160px)] bg-sand py-[clamp(90px,12vh,140px)]">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-[clamp(40px,6vw,100px)] wide:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col gap-[18px]">
            <p className="eyebrow">INSIDE THE BAG</p>
            <h2 id="h-inside" className="display text-[clamp(38px,4vw,60px)] leading-[1.04]">
              A place for everything.
            </h2>
            <p className="mb-5 max-w-[420px] text-sm leading-[1.8] text-body">Select an object to see where it sits inside {p.name}.</p>
            <div role="listbox" aria-label="Objects" className="flex flex-col">
              {INSIDE.map((o) => {
                const a = o.key === inside;
                return (
                  <button
                    key={o.key}
                    role="option"
                    aria-selected={a}
                    onMouseEnter={() => setInside(o.key)}
                    onFocus={() => setInside(o.key)}
                    onClick={() => setInside(o.key)}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-t border-ink/10 py-3.5 text-left transition-colors duration-300"
                    style={{ color: a ? "#111111" : "#857B70" }}
                  >
                    <span className="font-serif text-2xl">{o.label}</span>
                    <span className="text-xs text-taupe">{o.fit}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <Reveal className="relative box-border aspect-[16/11] bg-cocoa p-[5%]" y={30}>
            <div className="relative h-full w-full bg-[#D8C9B0] shadow-[inset_0_18px_40px_rgba(0,0,0,.28)]">
              <LayoutGroup id="inside">
                {INSIDE.map((o) => {
                  const a = o.key === inside;
                  return (
                    <div
                      key={o.key}
                      className="absolute box-border flex items-end p-2.5 transition-[background,border-color] duration-500"
                      style={{ left: o.l, top: o.t, width: o.w, height: o.h, border: `1px solid ${a ? "#C6A66A" : "rgba(41,26,19,.18)"}`, background: a ? "rgba(198,166,106,.28)" : "rgba(255,255,255,.12)" }}
                    >
                      {a && <motion.span layoutId="inside-glow" className="pointer-events-none absolute inset-0 shadow-[0_0_0_1px_#C6A66A,0_10px_30px_-10px_rgba(198,166,106,.6)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                      <span className="relative text-[10px] tracking-[.2em] text-espresso transition-opacity duration-400" style={{ opacity: a ? 1 : 0.35 }}>
                        {a ? `${o.label.toUpperCase()} · ${o.zone}` : o.zone}
                      </span>
                    </div>
                  );
                })}
              </LayoutGroup>
            </div>
            <p className="absolute bottom-[1.4%] left-[5%] m-0 text-[10px] tracking-[.16em] text-cream/55">TOP-DOWN INTERIOR · LINEN LINING</p>
          </Reveal>
        </div>
      </section>

      {/* Related */}
      <section aria-labelledby="h-rel" className="gutter mx-auto max-w-[1600px] py-[clamp(100px,14vh,160px)]">
        <h2 id="h-rel" className="display mb-12 text-[clamp(34px,3.4vw,52px)]">
          You may also consider
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-x-5 gap-y-12">
          {related.map((x, i) => (
            <Reveal key={x.id} delay={i * 0.06}>
              <ProductCard product={x} aspect="4 / 5" size={50} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Fullscreen gallery */}
      <AnimatePresence>
        {full && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Gallery"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-[70] flex flex-col bg-ink"
          >
            <div className="gutter flex items-center justify-between py-6 text-[11px] tracking-[.22em] text-cream">
              <span>
                {p.name} · {mv.label}
              </span>
              <button onClick={() => setFull(false)} className="py-2 text-[11px] tracking-[.22em] text-cream">
                CLOSE ×
              </button>
            </div>
            <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="relative mx-[clamp(20px,4vw,56px)] flex-1">
              <AnimatePresence initial={false}>
                <motion.div key={mv.view} className="absolute inset-0" initial={{ opacity: 0, scale: 1.01 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE_LUX }}>
                  <BagShot view={mv.view} tone={mv.tone} ground={mv.ground} texture={mv.texture} caption={mv.caption} scaleLabel={p.dims} size={36} />
                </motion.div>
              </AnimatePresence>
              <button onClick={() => shift(-1)} aria-label="Previous view" className="absolute inset-y-0 left-0 w-[18%] pl-5 text-left text-[22px] text-cream">
                ←
              </button>
              <button onClick={() => shift(1)} aria-label="Next view" className="absolute inset-y-0 right-0 w-[18%] pr-5 text-right text-[22px] text-cream">
                →
              </button>
            </div>
            <div className="flex justify-center gap-2 p-5">
              {VIEWS.map(([, label], i) => (
                <button
                  key={label}
                  onClick={() => setView(i)}
                  aria-label={label}
                  className="h-0.5 w-7 transition-colors duration-300"
                  style={{ background: i === view ? "#F7F4EE" : "rgba(247,244,238,.25)" }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


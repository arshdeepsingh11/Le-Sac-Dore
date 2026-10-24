"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { BagShot } from "./bag-shot";
import { Wordmark } from "./header";
import { NumberTicker } from "./ui/number-ticker";
import { COLORS, COUNTRIES, fmt, groundFor, PROVINCES, totals } from "@/lib/data";
import { cartRows, useShop, useSubtotal, useUI, type Order } from "@/lib/store";
import { cn, EASE_LUX } from "@/lib/utils";

type Pay = "card" | "apple" | "google" | "shop";
const PAY_NAMES: Record<Pay, string> = { card: "Credit card", apple: "Apple Pay", google: "Google Pay", shop: "Shop Pay" };
const STEPS = ["INFORMATION", "SHIPPING", "PAYMENT"];
const money = (n: number) => fmt(Math.round(n));

interface FieldDef {
  key: string;
  label: string;
  half?: boolean;
  type?: string;
  auto?: string;
  mode?: "text" | "numeric" | "tel" | "email";
  ph?: string;
  options?: string[];
}

const INFO_FIELDS: FieldDef[] = [
  { key: "email", label: "EMAIL", type: "email", auto: "email", half: true, mode: "email" },
  { key: "phone", label: "PHONE", type: "tel", auto: "tel", half: true, mode: "tel" },
  { key: "first", label: "FIRST NAME", auto: "given-name", half: true },
  { key: "last", label: "LAST NAME", auto: "family-name", half: true },
  { key: "address", label: "ADDRESS", auto: "address-line1" },
  { key: "city", label: "CITY", auto: "address-level2", half: true },
  { key: "province", label: "PROVINCE", half: true, options: PROVINCES },
  { key: "postal", label: "POSTAL CODE", auto: "postal-code", half: true },
  { key: "country", label: "COUNTRY", half: true, options: COUNTRIES },
];

const CARD_FIELDS: FieldDef[] = [
  { key: "cardName", label: "NAME ON CARD", auto: "cc-name" },
  { key: "cardNum", label: "CARD NUMBER", auto: "cc-number", mode: "numeric", ph: "1234 5678 9012 3456" },
  { key: "exp", label: "EXPIRY", auto: "cc-exp", half: true, ph: "MM/YY" },
  { key: "cvc", label: "SECURITY CODE", auto: "cc-csc", half: true, mode: "numeric", ph: "123" },
];

function validateInfo(f: Record<string, string>) {
  const e: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email || "")) e.email = "Please enter a valid email address.";
  (["first", "last", "address", "city"] as const).forEach((k) => {
    if (!(f[k] || "").trim()) e[k] = "Required.";
  });
  if ((f.phone || "").replace(/\D/g, "").length < 10) e.phone = "Please enter a 10-digit phone number.";
  const postal = (f.postal || "").trim();
  if (f.country === "Canada" ? !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postal) : postal.length < 3)
    e.postal = f.country === "Canada" ? "Please enter a postal code such as M5R 1A6." : "Required.";
  return e;
}

function validatePay(f: Record<string, string>, pay: Pay) {
  const e: Record<string, string> = {};
  if (pay !== "card") return e;
  if (!(f.cardName || "").trim()) e.cardName = "Required.";
  if (!/^\d{15,16}$/.test((f.cardNum || "").replace(/\s/g, ""))) e.cardNum = "Please enter a 15 or 16-digit card number.";
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test((f.exp || "").trim())) e.exp = "Use MM/YY.";
  if (!/^\d{3,4}$/.test((f.cvc || "").trim())) e.cvc = "3 or 4 digits.";
  return e;
}

function Field({ def, value, error, onChange }: { def: FieldDef; value: string; error?: string; onChange: (v: string) => void }) {
  const id = `f-${def.key}`;
  return (
    <div className={cn("col-span-2 flex flex-col gap-1.5", def.half && "wide:col-span-1")}>
      <label htmlFor={id} className="label">
        {def.label}
      </label>
      {def.options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} className="field">
          {def.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={def.type ?? "text"}
          inputMode={def.mode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={def.auto ?? "off"}
          placeholder={def.ph}
          aria-invalid={!!error}
          className="field placeholder:text-taupe/60"
        />
      )}
      <AnimatePresence>
        {error && (
          <motion.span role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-burgundy">
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CheckoutFlow({ initialPay }: { initialPay: Pay }) {
  const router = useRouter();
  const lenis = useLenis();
  const hydrated = useUI((s) => s.hydrated);
  const flash = useUI((s) => s.flash);
  const cart = useShop((s) => s.cart);
  const form = useShop((s) => s.form);
  const setForm = useShop((s) => s.setForm);
  const placeOrder = useShop((s) => s.placeOrder);
  const sub = useSubtotal();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ship, setShip] = useState<"standard" | "express">("standard");
  const [pay, setPay] = useState<Pay>(initialPay);
  const [sumOpen, setSumOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const t = totals(sub, ship);
  const rows = cartRows(cart);

  const top = () => (lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0));
  const go = (s: number) => {
    setStep(s);
    setErrors({});
    top();
  };
  const update = (k: string, v: string) => {
    setForm(k, v);
    if (errors[k]) setErrors(({ [k]: _drop, ...rest }) => rest);
  };
  const shipTo = [`${form.first || ""} ${form.last || ""}`.trim(), form.address, [form.city, form.province, form.postal].filter(Boolean).join(", ")].filter(Boolean).join(", ");

  const submitInfo = (e: FormEvent) => {
    e.preventDefault();
    const er = validateInfo(form);
    if (Object.keys(er).length) {
      setErrors(er);
      flash("PLEASE REVIEW THE HIGHLIGHTED FIELDS");
    } else go(1);
  };

  const submitOrder = () => {
    const er = validatePay(form, pay);
    if (Object.keys(er).length) return setErrors(er);
    setPlacing(true);
    const d = (n: number) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long" });
    const order: Order = {
      number: "LSD-" + String(Math.floor(200000 + Math.random() * 799999)),
      date: new Date().toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" }),
      status: 0,
      total: t.coTotal,
      email: form.email,
      eta: `${d(3)} – ${d(6)}`,
      shipTo,
      items: rows.map((c) => ({ name: c.name, color: c.color, qty: c.qty, lineF: c.lineF })),
    };
    setTimeout(() => {
      placeOrder(order);
      router.push("/confirmation");
    }, 700);
  };

  const summaryRows = (
    <>
      {rows.map((c) => (
        <div key={c.key} className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 border-b border-ink/10 pb-3.5">
          <div className="relative aspect-[4/5] overflow-hidden bg-parch">
            <BagShot tone={COLORS[c.color]} ground={groundFor(c.color)} size={64} />
            <span className="absolute -top-0 -right-0 flex size-5 items-center justify-center bg-ink text-[10px] text-cream">{c.qty}</span>
          </div>
          <span>
            <span className="block font-serif text-lg tracking-[.06em]">{c.name}</span>
            <span className="text-xs text-taupe">
              {c.color} × {c.qty}
            </span>
          </span>
          <span className="tabular-nums">{c.lineF}</span>
        </div>
      ))}
    </>
  );

  return (
    <>
      <header className="gutter grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b border-ink/10 bg-cream py-7">
        <Link href="/cart" className="justify-self-start text-[11px] tracking-[.2em] transition-opacity hover:opacity-60">
          ← BAG
        </Link>
        <Link href="/" aria-label="Le Sac Doré home">
          <Wordmark size={22} />
        </Link>
        <span className="flex items-center gap-2 justify-self-end text-[10px] tracking-[.2em] text-taupe">
          <svg viewBox="0 0 12 14" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
            <rect x="1.5" y="6" width="9" height="7" rx="1" />
            <path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" />
          </svg>
          <span className="hidden wide:inline">SECURE CHECKOUT</span>
        </span>
      </header>

      {hydrated && !rows.length ? (
        <section className="gutter mx-auto max-w-[1280px] py-32">
          <p className="mb-8 font-serif text-[26px] text-espresso">Your bag is empty.</p>
          <Link href="/collection" className="btn-ink">
            DISCOVER LA COLLECTION
          </Link>
        </section>
      ) : (
        <section className="gutter mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-[clamp(40px,6vw,96px)] pt-14 pb-[120px] wide:grid-cols-[minmax(0,1.3fr)_minmax(340px,1fr)]">
          <div>
            {/* Narrow: collapsible summary */}
            <div className="mb-8 bg-ivory wide:hidden">
              <button onClick={() => setSumOpen((o) => !o)} aria-expanded={sumOpen} className="flex w-full justify-between px-5 py-[18px] text-[11px] tracking-[.2em]">
                <span>{sumOpen ? "HIDE ORDER SUMMARY −" : "SHOW ORDER SUMMARY +"}</span>
                <span className="tabular-nums">{fmt(t.coTotal)}</span>
              </button>
              <div className="grid transition-[grid-template-rows] duration-500 ease-lux" style={{ gridTemplateRows: sumOpen ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-3.5 px-5 pb-5 text-[13px]">{summaryRows}</div>
                </div>
              </div>
            </div>

            <ol aria-label="Checkout progress" className="m-0 mb-12 flex list-none flex-wrap items-center gap-3 p-0 text-[11px] tracking-[.2em]">
              {STEPS.map((l, i) => (
                <li key={l} className="flex items-center gap-3 transition-colors duration-500" style={{ color: i === step ? "#111111" : i < step ? "#291A13" : "#857B70", fontWeight: i === step ? 600 : 500 }}>
                  <button disabled={i >= step} onClick={() => go(i)} aria-current={i === step ? "step" : undefined} className="relative pb-1 disabled:cursor-default">
                    {l}
                    {i === step && <motion.span layoutId="step-rule" className="absolute inset-x-0 bottom-0 h-px bg-ink" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                  </button>
                  {i < 2 && <span className="text-taupe">→</span>}
                </li>
              ))}
            </ol>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.45, ease: EASE_LUX }}>
                {step === 0 && (
                  <>
                    <h1 className="display mb-8 text-[40px]">Information</h1>
                    <form onSubmit={submitInfo} noValidate className="grid grid-cols-2 gap-x-6 gap-y-[26px]">
                      {INFO_FIELDS.map((f) => (
                        <Field key={f.key} def={f} value={form[f.key] || ""} error={errors[f.key]} onChange={(v) => update(f.key, v)} />
                      ))}
                      <div className="col-span-2 mt-4">
                        <button type="submit" className="btn-ink">
                          CONTINUE TO SHIPPING
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h1 className="display mb-8 text-[40px]">Shipping</h1>
                    <div className="mb-7 flex justify-between gap-5 bg-ivory px-6 py-[22px] text-[13px] leading-[1.7]">
                      <span>
                        <span className="label mb-1 block">SHIP TO</span>
                        {shipTo}
                      </span>
                      <button onClick={() => go(0)} className="self-start border-b border-ink pb-0.5 text-[10px] tracking-[.2em]">
                        CHANGE
                      </button>
                    </div>
                    <div role="radiogroup" aria-label="Shipping method" className="flex flex-col gap-2.5">
                      {(
                        [
                          ["standard", "Standard delivery", "2–5 business days · signature required", totals(sub, "standard").std],
                          ["express", "Express delivery", "Next business day, ordered before 13:00 ET", 45],
                        ] as const
                      ).map(([k, label, subl, pr]) => {
                        const sel = ship === k;
                        return (
                          <button
                            key={k}
                            role="radio"
                            aria-checked={sel}
                            onClick={() => setShip(k)}
                            className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-4 border bg-ivory px-6 py-[22px] text-left text-sm transition-colors duration-300"
                            style={{ borderColor: sel ? "#111111" : "rgba(17,17,17,.12)" }}
                          >
                            <span className="flex size-3.5 items-center justify-center rounded-full border border-ink">
                              <motion.span animate={{ scale: sel ? 1 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 28 }} className="size-2 rounded-full bg-ink" />
                            </span>
                            <span>
                              <span className="block">{label}</span>
                              <span className="mt-1 block text-xs text-taupe">{subl}</span>
                            </span>
                            <span>{pr === 0 ? "Complimentary" : fmt(pr)}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-9 flex flex-wrap items-center gap-7">
                      <button onClick={() => go(2)} className="btn-ink">
                        CONTINUE TO PAYMENT
                      </button>
                      <button onClick={() => go(0)} className="text-[11px] tracking-[.2em]">
                        ← INFORMATION
                      </button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h1 className="display mb-8 text-[40px]">Payment</h1>
                    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
                      {(Object.keys(PAY_NAMES) as Pay[]).map((k) => (
                        <button
                          key={k}
                          role="radio"
                          aria-checked={pay === k}
                          onClick={() => {
                            setPay(k);
                            setErrors({});
                          }}
                          className="border bg-ivory px-4 py-5 text-xs font-medium tracking-[.1em] transition-colors duration-300"
                          style={{ borderColor: pay === k ? "#111111" : "rgba(17,17,17,.12)" }}
                        >
                          {PAY_NAMES[k].toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <AnimatePresence mode="wait" initial={false}>
                      {pay === "card" ? (
                        <motion.div key="card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: EASE_LUX }} className="overflow-hidden">
                          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-[26px]">
                            {CARD_FIELDS.map((f) => (
                              <Field key={f.key} def={f} value={form[f.key] || ""} error={errors[f.key]} onChange={(v) => update(f.key, v)} />
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.p key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-7 text-sm leading-[1.7] text-body">
                          You will confirm with {PAY_NAMES[pay]} after placing your order.
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <div className="mt-10 flex flex-wrap items-center gap-7">
                      <button onClick={submitOrder} disabled={placing} className="btn-ink min-w-[280px]">
                        {placing ? (
                          <span className="flex items-center gap-3">
                            <motion.span className="size-3 rounded-full border border-cream/40 border-t-cream" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                            PLACING ORDER
                          </span>
                        ) : (
                          `PLACE ORDER — ${fmt(t.coTotal)}`
                        )}
                      </button>
                      <button onClick={() => go(1)} className="text-[11px] tracking-[.2em]">
                        ← SHIPPING
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside aria-label="Order summary" className="sticky top-8 hidden flex-col gap-3.5 bg-ivory p-9 text-[13px] wide:flex">
            {summaryRows}
            <div className="mt-1.5 flex justify-between">
              <span>Subtotal</span>
              <NumberTicker value={t.sub} format={money} />
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{t.coShip === 0 ? "Complimentary" : fmt(t.coShip)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (HST 13%)</span>
              <NumberTicker value={t.tax} format={money} />
            </div>
            <div className="flex justify-between border-t border-ink/15 pt-4 text-[15px] font-semibold">
              <span>Total</span>
              <NumberTicker value={t.coTotal} format={money} />
            </div>
            <p className="mt-1.5 text-xs text-taupe">Complimentary signature packaging.</p>
          </aside>
        </section>
      )}
    </>
  );
}

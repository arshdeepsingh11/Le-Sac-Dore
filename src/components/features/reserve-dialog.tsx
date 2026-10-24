"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BagShot } from "../bag-shot";
import { COLORS, fmt, groundFor, STORES, type ColorName, type Product } from "@/lib/data";
import { postJSON, useAuth } from "@/lib/auth-store";
import { track } from "@/lib/analytics";
import { cn, EASE_LUX } from "@/lib/utils";

const SLOTS = ["11:00", "12:30", "14:00", "15:30", "17:00"];
const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function ReserveDialog({ product: p, color, open, onClose }: { product: Product; color: ColorName; open: boolean; onClose: () => void }) {
  const user = useAuth((s) => s.user);
  const [kind, setKind] = useState<"boutique" | "video">("boutique");
  const [city, setCity] = useState(STORES[0].city);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ boutique: string; date: string; slot: string; holdUntil: string } | null>(null);

  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    for (let i = 1; out.length < 10 && i < 20; i++) {
      const x = new Date(d.getTime() + i * 864e5);
      out.push(x);
    }
    return out;
  }, []);
  const closedSunday = kind === "boutique" && city === "PARIS";

  useEffect(() => {
    if (!open) return;
    track("reservation_open", { productId: p.id });
    setDone(null);
    setError("");
    if (user) {
      setName((n) => n || user.name);
      setEmail((e) => e || user.email);
      setPhone((x) => x || user.phone || "");
    }
  }, [open, user, p.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!date || !slot) return setError("Please choose a day and a time.");
    setBusy(true);
    const { ok, data } = await postJSON<{ reservation: typeof done }>("/api/reservations", { productId: p.id, color, kind, boutique: city, date, slot, name, email, phone, notes });
    setBusy(false);
    if (!ok) return setError(data.error ?? "Could not reserve. Please try again.");
    setDone(data.reservation);
    if (user) useAuth.getState().refresh();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[75] bg-[rgba(17,12,9,.4)] backdrop-blur-[2px]" />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Reserve in boutique"
            data-lenis-prevent
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[76] max-h-[92dvh] overflow-y-auto overscroll-contain bg-cream wide:inset-auto wide:top-1/2 wide:left-1/2 wide:max-h-[88vh] wide:w-[620px] wide:-translate-x-1/2 wide:-translate-y-1/2"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-cream/95 px-6 py-5 backdrop-blur-md wide:px-8">
              <p className="m-0 text-[11px] font-semibold tracking-[.24em]">RESERVE IN BOUTIQUE</p>
              <button onClick={onClose} className="text-[11px] tracking-[.2em]">CLOSE ×</button>
            </div>

            <div className="px-6 pt-6 pb-8 wide:px-8">
              <div className="mb-7 flex items-center gap-4">
                <span className="relative block aspect-[4/5] w-16 shrink-0 overflow-hidden bg-parch">
                  <BagShot tone={COLORS[color]} ground={groundFor(color)} size={62} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-serif text-2xl tracking-[.06em]">{p.name}</span>
                  <span className="text-[13px] text-taupe">
                    {color} · {fmt(p.price)}
                  </span>
                </span>
              </div>

              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_LUX }}>
                    <p className="display text-[44px] leading-none">Reserved.</p>
                    <p className="mt-5 text-[15px] leading-[1.8] text-body">
                      {done.boutique === "Video appointment" ? "Your video appointment" : `Your appointment at ${done.boutique}`} is requested for{" "}
                      <strong className="font-semibold text-ink">
                        {new Date(done.date + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long" })} at {done.slot}
                      </strong>
                      . An advisor will confirm by email. We will hold {p.name} in {color.toLowerCase()} for you until{" "}
                      {new Date(done.holdUntil).toLocaleString("en-CA", { weekday: "long", hour: "2-digit", minute: "2-digit" })}.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <button onClick={onClose} className="btn-ink">DONE</button>
                      {user ? (
                        <Link href="/account?tab=appointments" className="btn-line">MY APPOINTMENTS</Link>
                      ) : (
                        <Link href="/signup?next=/account?tab=appointments" className="btn-line">CREATE AN ACCOUNT</Link>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-7">
                    <div className="grid grid-cols-2 gap-2">
                      {(["boutique", "video"] as const).map((k) => (
                        <button
                          type="button"
                          key={k}
                          onClick={() => setKind(k)}
                          aria-pressed={kind === k}
                          className={cn("border px-4 py-4 text-left transition-colors duration-300", kind === k ? "border-ink bg-ivory" : "border-ink/12 bg-transparent")}
                        >
                          <span className="block text-[11px] font-medium tracking-[.2em]">{k === "boutique" ? "IN BOUTIQUE" : "VIDEO CALL"}</span>
                          <span className="mt-1 block text-xs text-taupe">{k === "boutique" ? "Held 48 h in your size and colour" : "See the piece live with an advisor"}</span>
                        </button>
                      ))}
                    </div>

                    {kind === "boutique" && (
                      <div>
                        <p className="label mb-2.5">BOUTIQUE</p>
                        <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 wide:mx-0 wide:flex-wrap wide:px-0">
                          {STORES.map((s) => (
                            <button
                              type="button"
                              key={s.city}
                              onClick={() => setCity(s.city)}
                              className={cn("shrink-0 border px-3.5 py-2 text-[11px] tracking-[.14em] transition-colors duration-300", city === s.city ? "border-ink bg-ink text-cream" : "border-ink/15")}
                            >
                              {s.city}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="label mb-2.5">DAY</p>
                      <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 wide:mx-0 wide:px-0">
                        {days.map((d) => {
                          const v = isoDay(d);
                          const off = closedSunday && d.getDay() === 0;
                          return (
                            <button
                              type="button"
                              key={v}
                              disabled={off}
                              onClick={() => setDate(v)}
                              className={cn(
                                "flex w-[58px] shrink-0 flex-col items-center gap-1 border py-3 transition-colors duration-300 disabled:opacity-30",
                                date === v ? "border-ink bg-ink text-cream" : "border-ink/15",
                              )}
                            >
                              <span className="text-[9px] tracking-[.2em]">{d.toLocaleDateString("en-CA", { weekday: "short" }).toUpperCase()}</span>
                              <span className="font-serif text-xl leading-none">{d.getDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="label mb-2.5">TIME</p>
                      <div className="flex flex-wrap gap-2">
                        {SLOTS.map((s) => (
                          <button type="button" key={s} onClick={() => setSlot(s)} className={cn("border px-4 py-2.5 text-[12px] tabular-nums transition-colors duration-300", slot === s ? "border-ink bg-ink text-cream" : "border-ink/15")}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="r-name" className="label">NAME</label>
                        <input id="r-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="field" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="r-email" className="label">EMAIL</label>
                        <input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="field" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="r-phone" className="label">PHONE (OPTIONAL)</label>
                        <input id="r-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className="field" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="r-notes" className="label">NOTE (OPTIONAL)</label>
                        <input id="r-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. compare with La Vela" className="field placeholder:text-taupe/60" />
                      </div>
                    </div>

                    {error && <p role="alert" className="m-0 text-[13px] text-burgundy">{error}</p>}
                    <button type="submit" disabled={busy} className="btn-ink w-full">
                      {busy ? "RESERVING…" : "REQUEST APPOINTMENT"}
                    </button>
                    <p className="-mt-3 mb-0 text-xs leading-relaxed text-taupe">No payment needed. The piece is held for 48 hours after your appointment time.</p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

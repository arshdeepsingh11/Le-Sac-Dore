"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BagShot } from "./bag-shot";
import { afterSignIn, postJSON } from "@/lib/auth-store";
import { useUI } from "@/lib/store";
import { EASE_LUX } from "@/lib/utils";

export function AuthForm({ mode: initialMode, next }: { mode: "login" | "signup"; next: string }) {
  const router = useRouter();
  const flash = useUI((s) => s.flash);
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [marketing, setMarketing] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setError("");
    window.history.replaceState(null, "", `/${m === "signup" ? "signup" : "login"}${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { ok, data } = await postJSON<{ role?: string }>(isSignup ? "/api/auth/signup" : "/api/auth/login", isSignup ? { name, email, password, marketing } : { email, password });
    if (!ok) {
      setBusy(false);
      setError(data.error ?? "Something went wrong.");
      return;
    }
    await afterSignIn();
    flash(isSignup ? "WELCOME TO LE SAC DORÉ" : "WELCOME BACK");
    router.push(data.role === "admin" && next === "/account" ? "/admin" : next);
    router.refresh();
  };

  return (
    <section className="grid min-h-screen grid-cols-1 wide:grid-cols-2">
      <div className="relative hidden wide:block">
        <BagShot view="lifestyle" tone="#3B2519" ground="#2B211B" size={52} caption="La Maison — private client area" />
      </div>
      <div className="gutter flex flex-col justify-center pt-32 pb-20 wide:px-[clamp(56px,7vw,120px)]">
        <div className="mx-auto w-full max-w-[440px]">
          <p className="eyebrow mb-4">{isSignup ? "JOIN THE MAISON" : "WELCOME BACK"}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1 key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4, ease: EASE_LUX }} className="display text-[clamp(42px,5vw,64px)] leading-[1.02]">
              {isSignup ? "Create your account." : "Sign in."}
            </motion.h1>
          </AnimatePresence>
          <p className="mt-4 mb-10 text-sm leading-relaxed text-body">
            {isSignup ? "Track orders, register your bags, keep a wishlist on every device and book private appointments." : "Access your orders, Digital Passports, wishlist and appointments."}
          </p>

          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <AnimatePresence initial={false}>
              {isSignup && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label htmlFor="a-name" className="label">FULL NAME</label>
                  <input id="a-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="field" />
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <label htmlFor="a-email" className="label">EMAIL</label>
              <input id="a-email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="field" />
            </div>
            <div>
              <label htmlFor="a-pw" className="label">PASSWORD</label>
              <div className="relative">
                <input
                  id="a-pw"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="field pr-14"
                />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute top-1/2 right-0 -translate-y-1/2 text-[10px] tracking-[.2em] text-taupe">
                  {show ? "HIDE" : "SHOW"}
                </button>
              </div>
              {isSignup && <p className="mt-2 text-xs text-taupe">At least 8 characters.</p>}
            </div>
            {isSignup && (
              <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-body">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 size-4 accent-espresso" />
                Send me new arrivals, private previews and stories from the maison. You can unsubscribe at any time.
              </label>
            )}
            <AnimatePresence>
              {error && (
                <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="m-0 text-[13px] text-burgundy">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <button type="submit" disabled={busy} className="btn-ink mt-2 w-full">
              {busy ? "ONE MOMENT…" : isSignup ? "CREATE ACCOUNT" : "SIGN IN"}
            </button>
          </form>

          <p className="mt-8 text-[13px] text-body">
            {isSignup ? "Already have an account? " : "New to Le Sac Doré? "}
            <button onClick={() => switchMode(isSignup ? "login" : "signup")} className="border-b border-ink pb-0.5 text-ink">
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>
          <p className="mt-10 text-xs leading-relaxed text-taupe">
            By continuing you agree to our <Link href="/privacy" className="border-b border-taupe/50">privacy policy</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}

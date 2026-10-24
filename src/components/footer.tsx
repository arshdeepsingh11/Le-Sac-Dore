"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const COLS: [string, [string, string][]][] = [
  ["SHOP", [["New Arrivals", "/collection?filter=new"], ["Bags", "/collection"], ["Collections", "/collection"], ["Gift Cards", "/services?tab=contact"]]],
  ["MAISON", [["Our Story", "/maison"], ["L'Atelier", "/atelier"], ["Materials", "/materials"], ["Boutiques", "/services#stores"]]],
  ["CLIENT SERVICES", [["Contact", "/services?tab=contact"], ["Shipping", "/services?tab=shipping"], ["Returns", "/services?tab=returns"], ["Care", "/services?tab=care"], ["Repairs", "/services?tab=repairs"]]],
  ["FOLLOW", [["Instagram", "https://instagram.com"], ["Pinterest", "https://pinterest.com"], ["TikTok", "https://tiktok.com"]]],
];

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);

  if (pathname.startsWith("/checkout")) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg("Thank you. You will hear from us soon.");
      setErr(false);
      setEmail("");
    } else {
      setMsg("Please enter a valid email address.");
      setErr(true);
    }
  };

  return (
    <footer className="gutter bg-night pt-[clamp(90px,14vh,140px)] pb-28 text-cream">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-14 border-b border-cream/15 pb-20 wide:grid-cols-2">
          <div>
            <p className="m-0 font-serif text-[clamp(34px,4vw,56px)] font-normal tracking-[.24em]">
              LE SAC DORÉ<sup className="font-sans text-[10px] tracking-normal text-gold">™</sup>
            </p>
            <p className="mt-3.5 text-[11px] tracking-[.32em] text-cream/70">MORE THAN A BAG.</p>
          </div>
          <form onSubmit={submit} noValidate aria-labelledby="news-h" className="flex max-w-[520px] flex-col gap-4">
            <h2 id="news-h" className="m-0 text-[11px] font-medium tracking-[.26em]">
              ENTER THE WORLD OF LE SAC DORÉ.
            </h2>
            <div className="flex items-end gap-4 border-b transition-colors duration-300" style={{ borderColor: err ? "#E3A6AE" : "rgba(247,244,238,.4)" }}>
              <label htmlFor="news-email" className="sr-only">
                Email address
              </label>
              <input
                id="news-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMsg("");
                }}
                placeholder="Email address"
                autoComplete="email"
                className="min-w-0 flex-1 bg-transparent py-3.5 text-[15px] text-cream outline-none placeholder:text-cream/45"
              />
              <button type="submit" className="py-3.5 text-[11px] tracking-[.22em] text-cream transition-colors duration-300 hover:text-gold">
                SUBSCRIBE →
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={msg}
                role="status"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="m-0 min-h-[18px] text-xs"
                style={{ color: err ? "#E3A6AE" : "#C6A66A" }}
              >
                {msg}
              </motion.p>
            </AnimatePresence>
          </form>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-10 py-16">
          {COLS.map(([title, links]) => (
            <div key={title} className="flex flex-col gap-3.5">
              <h3 className="m-0 mb-1.5 text-[10px] font-medium tracking-[.26em] text-gold">{title}</h3>
              {links.map(([label, href]) =>
                href.startsWith("http") ? (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="self-start text-[13px] text-cream/80 transition-colors duration-300 hover:text-cream">
                    {label}
                  </a>
                ) : (
                  <Link key={label} href={href} className="self-start text-[13px] text-cream/80 transition-colors duration-300 hover:text-cream">
                    {label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between gap-5 border-t border-cream/15 pt-7 text-[11px] tracking-[.14em] text-cream/60">
          <span>© 2026 LE SAC DORÉ™</span>
          <div className="flex gap-7">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

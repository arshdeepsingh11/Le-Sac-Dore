"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { consent, setConsent, track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth-store";
import { EASE_LUX } from "@/lib/utils";

function PageViews() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return; // never track the back-office
    track("page_view");
  }, [pathname, search]);
  return null;
}

function ConsentBanner() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const t = setTimeout(() => setShow(consent() === null), 1200);
    return () => clearTimeout(t);
  }, []);

  const choose = (v: "all" | "essential") => {
    setConsent(v);
    setShow(false);
    if (v === "all") track("page_view");
  };

  return (
    <AnimatePresence>
      {show && !pathname.startsWith("/admin") && (
        <motion.div
          role="dialog"
          aria-label="Cookie preferences"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE_LUX }}
          className="fixed inset-x-3 bottom-3 z-[90] border border-ink/10 bg-ivory/95 p-5 shadow-[0_30px_60px_-24px_rgba(17,12,9,.4)] backdrop-blur-xl wide:inset-x-auto wide:bottom-6 wide:left-6 wide:max-w-[420px] wide:p-6"
        >
          <p className="m-0 text-[10px] font-medium tracking-[.28em] text-gold">YOUR PRIVACY</p>
          <p className="mt-2.5 mb-4 text-[13px] leading-relaxed text-body">
            We use essential cookies to run the boutique, and — with your permission — analytics cookies to understand which pieces you explore, so we can serve you better.{" "}
            <Link href="/privacy" className="border-b border-ink/30 text-ink">
              Privacy policy
            </Link>
          </p>
          <div className="flex gap-2.5">
            <button onClick={() => choose("all")} className="btn-ink flex-1 !px-4 !py-3.5 !text-[10px]">
              ACCEPT ALL
            </button>
            <button onClick={() => choose("essential")} className="btn-line flex-1 !px-4 !py-3.5 !text-[10px]">
              ESSENTIAL ONLY
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AnalyticsTracker() {
  const refresh = useAuth((s) => s.refresh);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return (
    <>
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
      <ConsentBanner />
    </>
  );
}

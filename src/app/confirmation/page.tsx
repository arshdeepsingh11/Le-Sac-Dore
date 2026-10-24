"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { byId, fmt } from "@/lib/data";
import { useShop, useUI } from "@/lib/store";
import { EASE_LUX } from "@/lib/utils";

export default function ConfirmationPage() {
  const hydrated = useUI((s) => s.hydrated);
  const order = useShop((s) => s.lastOrder);
  const o = order ?? { number: "—", eta: "—", shipTo: "—", items: [], total: 0, email: "your email" };

  return (
    <section className="gutter mx-auto max-w-[1100px] pt-[clamp(150px,20vh,220px)] pb-[140px]">
      <h1 className="display animate-lsd-in text-[clamp(88px,13vw,200px)] leading-[.9] tracking-[.02em]">MERCI.</h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="mt-7 text-xs font-medium tracking-[.3em]">
        YOUR ORDER HAS BEEN RECEIVED.
      </motion.p>

      {hydrated && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 1, ease: EASE_LUX }}>
          <div className="mt-[72px] grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8 border-t border-ink/15 pt-8 text-sm leading-[1.7]">
            {[
              ["ORDER NUMBER", o.number],
              ["ESTIMATED DELIVERY", o.eta],
              ["SHIPPING TO", o.shipTo],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="label mb-2 block">{k}</span>
                {v}
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-ink/15">
            {o.items.map((c, i) => (
              <div key={i} className="flex justify-between gap-5 border-b border-ink/15 py-5 text-sm">
                <span>
                  <span className="font-serif text-[22px] tracking-[.06em]">{c.name}</span>{" "}
                  <span className="text-taupe">
                    · {c.color} × {c.qty}
                  </span>
                </span>
                <span>{c.lineF}</span>
              </div>
            ))}
            <div className="flex justify-between py-5 text-[15px] font-semibold">
              <span>TOTAL</span>
              <span>{order ? fmt(o.total) : "—"}</span>
            </div>
          </div>
          {!!order?.passports?.length && (
            <div className="mt-10 bg-ivory p-6 wide:p-8">
              <p className="m-0 text-[11px] font-semibold tracking-[.24em]">YOUR DIGITAL PASSPORTS</p>
              <p className="mt-2 mb-5 text-[13px] leading-relaxed text-body">Each bag has its own passport — its artisan, materials and history. It travels with the bag for life.</p>
              <div className="flex flex-col">
                {order.passports.map((ps) => (
                  <Link key={ps.serial} href={`/passport/${ps.serial}`} className="flex items-center justify-between gap-4 border-t border-ink/10 py-3.5 text-[13px] transition-colors hover:text-burgundy">
                    <span>
                      {byId(ps.productId).name} · {ps.color}
                    </span>
                    <span className="font-mono text-xs tracking-wider">{ps.serial} →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <p className="mt-6 text-[13px] text-taupe">A confirmation has been sent to {o.email || "your email"}. Your piece will arrive in our signature packaging.</p>
          <div className="mt-12 flex flex-wrap items-center gap-7">
            <Link href="/account?tab=orders" className="btn-ink">
              TRACK ORDER
            </Link>
            <Link href="/collection" className="link-rule">
              CONTINUE SHOPPING
            </Link>
          </div>
        </motion.div>
      )}
    </section>
  );
}

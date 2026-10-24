"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import { ReactLenis, useLenis } from "lenis/react";
import { useShop, useUI } from "@/lib/store";
import { useReducedMotion } from "@/lib/hooks";

/** Pauses smooth scroll under overlays, resets scroll on route change, wires global keys. */
function ScrollConductor() {
  const lenis = useLenis();
  const pathname = usePathname();
  const locked = useUI((s) => s.drawer || s.search || s.menu);

  useEffect(() => {
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  }, [locked, lenis]);

  useEffect(() => {
    if (window.location.hash) return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") useUI.getState().set({ drawer: false, search: false, menu: false, concierge: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    useUI.getState().closeAll();
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    Promise.resolve(useShop.persist.rehydrate()).then(() => useUI.getState().set({ hydrated: true }));
  }, []);

  const content = (
    <MotionConfig reducedMotion="user">
      <ScrollConductor />
      {children}
    </MotionConfig>
  );

  if (reduced) return content;

  return (
    <ReactLenis root options={{ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true, allowNestedScroll: true, anchors: { offset: -72 } }}>
      {content}
    </ReactLenis>
  );
}

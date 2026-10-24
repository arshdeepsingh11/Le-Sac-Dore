"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** SSR-safe media query. Defaults to `fallback` on the server. */
export function useMediaQuery(query: string, fallback = true) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

/** ≥1000px — the artifact's "wide" layout switch. */
export const useWide = () => useMediaQuery("(min-width: 1000px)", true);
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)", false);

/** Viewport height that tracks resizes (used by the scroll-driven hero). */
export function useViewportHeight() {
  const [vh, setVh] = useState(900);
  useEffect(() => {
    const on = () => setVh(window.innerHeight);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vh;
}

"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

const MORPH_TIME = 1.4;
const COOLDOWN = 2.2;

function useMorphingText(texts: string[]) {
  const textIndex = useRef(0);
  const morph = useRef(0);
  const cooldown = useRef(0);
  const time = useRef(new Date());
  const t1 = useRef<HTMLSpanElement>(null);
  const t2 = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [a, b] = [t1.current, t2.current];
      if (!a || !b) return;
      b.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      b.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      const inv = 1 - fraction;
      a.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
      a.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
      a.textContent = texts[textIndex.current % texts.length];
      b.textContent = texts[(textIndex.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morph.current -= cooldown.current;
    cooldown.current = 0;
    let fraction = morph.current / MORPH_TIME;
    if (fraction > 1) {
      cooldown.current = COOLDOWN;
      fraction = 1;
    }
    setStyles(fraction);
    if (fraction === 1) textIndex.current++;
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morph.current = 0;
    const [a, b] = [t1.current, t2.current];
    if (a && b) {
      b.style.filter = "none";
      b.style.opacity = "100%";
      a.style.filter = "none";
      a.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = new Date();
      const dt = (now.getTime() - time.current.getTime()) / 1000;
      time.current = now;
      cooldown.current -= dt;
      if (cooldown.current <= 0) doMorph();
      else doCooldown();
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [doMorph, doCooldown]);

  return { t1, t2 };
}

/** Magic UI — Morphing Text. Gooey blur-threshold morph between phrases. */
export function MorphingText({ texts, className }: { texts: string[]; className?: string }) {
  const { t1, t2 } = useMorphingText(texts);
  const id = useId().replace(/:/g, "");
  return (
    <span className={cn("relative block select-none", className)} style={{ filter: `url(#threshold-${id}) blur(0.5px)` }} aria-label={texts[0]}>
      <span ref={t1} aria-hidden className="absolute inset-x-0 top-0 inline-block w-full" />
      <span ref={t2} aria-hidden className="absolute inset-x-0 top-0 inline-block w-full" />
      <svg className="fixed h-0 w-0" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <filter id={`threshold-${id}`}>
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
    </span>
  );
}

"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number; // seconds
  decimalPlaces?: number;
  format?: (n: number) => string;
}

/** Magic UI — Number Ticker. Counts to `value` once scrolled into view. */
export function NumberTicker({ value, startValue = 0, direction = "up", delay = 0, decimalPlaces = 0, format, className, ...props }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = direction === "down" ? value : startValue;
  const to = direction === "down" ? startValue : value;
  const motionValue = useMotionValue(from);
  const spring = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  const render = (n: number) =>
    format ? format(n) : Intl.NumberFormat("en-CA", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(Number(n.toFixed(decimalPlaces)));

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => motionValue.set(to), delay * 1000);
    return () => clearTimeout(t);
  }, [inView, delay, to, motionValue]);

  useEffect(() => {
    // Animate subsequent value changes (e.g. totals) even after first reveal.
    if (inView) motionValue.set(to);
  }, [to]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () =>
      spring.on("change", (latest) => {
        if (ref.current) ref.current.textContent = render(latest);
      }),
    [spring, decimalPlaces, format], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)} {...props}>
      {render(from)}
    </span>
  );
}

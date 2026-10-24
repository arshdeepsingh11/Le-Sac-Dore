"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  max?: number;
  min?: number;
  gaugePrimaryColor?: string;
  gaugeSecondaryColor?: string;
  strokeWidth?: number;
  className?: string;
  children?: ReactNode;
  label?: string;
}

/** Magic UI — Animated Circular Progress Bar. A thin, Apple-style ring gauge. */
export function AnimatedCircularProgressBar({
  value,
  max = 100,
  min = 0,
  gaugePrimaryColor = "#C6A66A",
  gaugeSecondaryColor = "rgba(17,17,17,.1)",
  strokeWidth = 4,
  className,
  children,
  label,
}: Props) {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

  return (
    <div className={cn("relative size-14 shrink-0", className)} role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" fill="none">
        <circle cx="50" cy="50" r={r} stroke={gaugeSecondaryColor} strokeWidth={strokeWidth} />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke={gaugePrimaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1), stroke .6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium tracking-[.06em]">
        {children ?? `${Math.round(pct * 100)}%`}
      </div>
    </div>
  );
}

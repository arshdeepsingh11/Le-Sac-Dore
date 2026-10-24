import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Shared premium easing (artifact: cubic-bezier(.2,.7,.2,1)). */
export const EASE_LUX = [0.2, 0.7, 0.2, 1] as const;
export const EASE_APPLE = [0.25, 0.1, 0.25, 1] as const;

"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { EASE_LUX } from "@/lib/utils";

/** Gentle Apple-style rise-in on first view. */
export function Reveal({ delay = 0, y = 24, children, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.1, ease: EASE_LUX, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

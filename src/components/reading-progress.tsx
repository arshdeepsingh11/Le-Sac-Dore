"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { track } from "@/lib/analytics";

/** Gold reading-progress rule under the header; records a read at 60%. */
export function ReadingProgress({ slug }: { slug: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const sent = useRef(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.6 && !sent.current) {
      sent.current = true;
      track("journal_read", { meta: { slug } });
    }
  });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[45] h-[2px] origin-left bg-gold" style={{ scaleX }} />;
}

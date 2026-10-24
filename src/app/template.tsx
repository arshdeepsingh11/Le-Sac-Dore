"use client";

import { motion } from "motion/react";

/** Page transition — a soft cross-fade on every route, like the artifact's page fade. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}>
      {children}
    </motion.div>
  );
}

"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Records that a passport was opened (e.g. from the QR code on the card). */
export function PassportView({ serial, productId }: { serial: string; productId: string }) {
  useEffect(() => {
    track("passport_view", { productId, meta: { serial } });
  }, [serial, productId]);
  return null;
}

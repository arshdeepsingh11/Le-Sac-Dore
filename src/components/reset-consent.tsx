"use client";

import { useEffect, useState } from "react";
import { consent, setConsent } from "@/lib/analytics";

export function ResetConsent() {
  const [c, setC] = useState<string | null>(null);
  useEffect(() => setC(consent()), []);
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4 bg-ivory p-6 text-[13px]">
      <span className="flex-1">
        Analytics cookies: <strong className="font-semibold">{c === "all" ? "On" : c === "essential" ? "Off" : "Not chosen"}</strong>
      </span>
      <button onClick={() => (setConsent("all"), setC("all"))} className="btn-line !px-5 !py-3 !text-[10px]">ALLOW</button>
      <button onClick={() => (setConsent("essential"), setC("essential"))} className="btn-line !px-5 !py-3 !text-[10px]">TURN OFF</button>
    </div>
  );
}

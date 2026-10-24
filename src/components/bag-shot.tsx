import { memo, type CSSProperties } from "react";
import type { Texture, View } from "@/lib/data";

const TEX: Record<Texture, [string, string]> = {
  grain: ["radial-gradient(rgba(0,0,0,.3) 1px, transparent 1.6px), radial-gradient(rgba(255,255,255,.08) 1px, transparent 1.6px)", "7px 7px, 11px 11px"],
  weave: ["repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 2px, transparent 2px 6px), repeating-linear-gradient(90deg, rgba(255,255,255,.14) 0 2px, transparent 2px 6px)", "auto"],
  fine: ["repeating-linear-gradient(45deg, rgba(0,0,0,.09) 0 1px, transparent 1px 3px)", "auto"],
  quilt: ["repeating-linear-gradient(45deg, rgba(0,0,0,.28) 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, rgba(0,0,0,.28) 0 1px, transparent 1px 22px)", "auto"],
  smooth: ["linear-gradient(135deg, rgba(255,255,255,.1), rgba(0,0,0,.15))", "auto"],
};

const lum = (hex: string) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

export interface BagShotProps {
  tone?: string;
  ground?: string;
  view?: View;
  texture?: Texture;
  caption?: string;
  size?: number;
  stitch?: boolean;
  lining?: string;
  scaleLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const abs: CSSProperties = { position: "absolute", inset: 0 };

/** Illustrated product photograph — a faithful port of the artifact's BagShot component. */
export const BagShot = memo(function BagShot({
  tone = "#3B2519",
  ground = "#E6DED2",
  view = "front",
  texture = "grain",
  caption,
  size = 46,
  stitch = true,
  lining = "#D8C9B0",
  scaleLabel = "",
  className,
  style,
}: BagShotProps) {
  const isBag = ["front", "side", "back", "interior", "lifestyle", "scale"].includes(view);
  let w = size;
  let aspect = "1.22 / 1";
  if (view === "side") { w = size * 0.42; aspect = "0.52 / 1"; }
  if (view === "lifestyle") w = size * 0.6;
  if (view === "scale") w = size * 0.78;
  const [texBg, texSize] = TEX[texture] ?? ["none", "auto"];
  const hasClasp = ["front", "lifestyle", "scale"].includes(view);
  const capColor = lum(ground) < 0.5 ? "rgba(247,244,238,.62)" : "rgba(17,17,17,.5)";

  return (
    <div className={className} style={{ ...abs, overflow: "hidden", background: ground, transition: "background .7s ease", ...style }} aria-hidden={!caption}>
      <div style={{ ...abs, background: "radial-gradient(ellipse 70% 60% at 32% 18%, rgba(255,248,236,.2), transparent 62%), linear-gradient(180deg, transparent 55%, rgba(0,0,0,.1))" }} />

      {isBag && (
        <div style={{ ...abs, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "9%" }}>
          <div style={{ position: "relative", width: `${w}%`, aspectRatio: aspect, transition: "width .6s cubic-bezier(.2,.7,.2,1)" }}>
            <div style={{ position: "absolute", left: "-10%", right: "-10%", bottom: "-9%", height: "16%", background: "radial-gradient(ellipse at center, rgba(0,0,0,.38), transparent 70%)" }} />
            {view !== "interior" && (
              <div style={{ position: "absolute", left: "24%", width: "52%", top: "-36%", height: "42%", borderStyle: "solid", borderWidth: "3px 3px 0 3px", borderColor: tone, borderRadius: "999px 999px 0 0", filter: "brightness(.85)", transition: "border-color .7s ease" }} />
            )}
            <div style={{ ...abs, background: tone, transition: "background .7s ease", borderRadius: "10px 10px 4px 4px", boxShadow: "0 40px 50px -30px rgba(0,0,0,.55), inset 0 -22px 34px rgba(0,0,0,.2), inset 0 12px 22px rgba(255,255,255,.07)" }} />
            <div style={{ ...abs, borderRadius: "10px 10px 4px 4px", opacity: 0.5, backgroundImage: texBg, backgroundSize: texSize }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: "34%", height: 1, background: "rgba(0,0,0,.2)" }} />
            {view === "interior" && (
              <div style={{ position: "absolute", left: "7%", right: "7%", top: "6%", height: "44%", background: lining, borderRadius: 4, boxShadow: "inset 0 10px 18px rgba(0,0,0,.35)" }} />
            )}
            {hasClasp && (
              <div style={{ position: "absolute", left: "44%", width: "12%", top: "30%", height: "7%", background: "#C6A66A", borderRadius: 2, boxShadow: "0 1px 2px rgba(0,0,0,.35)" }} />
            )}
            {view === "scale" && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: "-26%", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: 10, letterSpacing: ".16em", color: "rgba(17,17,17,.55)" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(17,17,17,.35)" }} />
                <span style={{ whiteSpace: "nowrap" }}>{scaleLabel}</span>
                <div style={{ flex: 1, height: 1, background: "rgba(17,17,17,.35)" }} />
              </div>
            )}
          </div>
        </div>
      )}

      {view === "macro" && (
        <>
          <div style={{ ...abs, background: tone, transition: "background .7s ease" }} />
          <div style={{ ...abs, opacity: 0.7, backgroundImage: texBg, backgroundSize: texSize }} />
          <div style={{ ...abs, background: "radial-gradient(ellipse 80% 70% at 30% 25%, rgba(255,246,230,.16), transparent 60%), linear-gradient(180deg, transparent 40%, rgba(0,0,0,.25))" }} />
          {stitch && <div style={{ position: "absolute", left: 0, right: 0, top: "62%", borderTop: "2px dashed rgba(236,224,204,.5)" }} />}
        </>
      )}

      {view === "hardware" && (
        <>
          <div style={{ ...abs, background: tone }} />
          <div style={{ ...abs, opacity: 0.45, backgroundImage: texBg, backgroundSize: texSize }} />
          <div style={{ position: "absolute", left: "50%", top: "48%", width: "24%", aspectRatio: "1", transform: "translate(-50%,-50%)", borderRadius: "50%", border: "10px solid #C6A66A", boxShadow: "0 18px 30px -10px rgba(0,0,0,.5), inset 0 2px 4px rgba(255,255,255,.35)" }} />
        </>
      )}

      {view === "box" && (
        <div style={{ ...abs, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "52%", aspectRatio: "1.35 / 1", background: "#F2EDE3", boxShadow: "0 40px 50px -28px rgba(0,0,0,.45), inset 0 -14px 24px rgba(0,0,0,.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 6, marginLeft: -3, background: "#C6A66A" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 6, marginTop: -3, background: "#C6A66A" }} />
            <span style={{ position: "relative", background: "#F2EDE3", padding: "6px 10px", fontFamily: "var(--font-serif)", fontSize: 13, letterSpacing: ".3em", color: "#291A13", whiteSpace: "nowrap" }}>LE SAC DORÉ</span>
          </div>
        </div>
      )}

      {caption && (
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, fontFamily: "var(--font-sans)", fontSize: 10, lineHeight: 1.5, letterSpacing: ".14em", textTransform: "uppercase", color: capColor }}>
          {caption}
        </div>
      )}
    </div>
  );
});

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

let fonts: Promise<{ name: string; data: Buffer; weight: 300 | 500; style: "normal" }[]> | undefined;

/** Brand fonts for share images (TTF instances of the site's Cormorant Garamond + Manrope). */
export function ogFonts() {
  fonts ??= Promise.all([
    readFile(join(process.cwd(), "src/fonts/og/cormorant-light.ttf")),
    readFile(join(process.cwd(), "src/fonts/og/manrope-medium.ttf")),
  ]).then(([serif, sans]) => [
    { name: "Cormorant", data: serif, weight: 300 as const, style: "normal" as const },
    { name: "Manrope", data: sans, weight: 500 as const, style: "normal" as const },
  ]);
  return fonts;
}

/** The illustrated bag, drawn with flexbox for Satori. */
export function OgBag({ tone, width = 380, handle = true }: { tone: string; width?: number; handle?: boolean }) {
  const h = Math.round(width / 1.22);
  return (
    <div style={{ display: "flex", position: "relative", width, height: h + (handle ? h * 0.42 : 0), alignItems: "flex-end", justifyContent: "center" }}>
      {handle && (
        <div style={{ position: "absolute", top: 0, left: width * 0.24, width: width * 0.52, height: h * 0.5, border: `5px solid ${tone}`, borderBottom: "none", borderRadius: `${width}px ${width}px 0 0`, opacity: 0.88 }} />
      )}
      <div
        style={{
          display: "flex",
          position: "relative",
          width,
          height: h,
          background: `linear-gradient(115deg, ${tone} 0%, ${tone} 55%, #00000055 100%)`,
          backgroundColor: tone,
          borderRadius: "16px 16px 6px 6px",
          boxShadow: "0 40px 60px -30px rgba(0,0,0,.55)",
        }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.34, height: 2, background: "rgba(0,0,0,.25)" }} />
        <div style={{ position: "absolute", left: width * 0.44, top: h * 0.3, width: width * 0.12, height: h * 0.07, background: "linear-gradient(90deg,#B8955A,#E2CA93,#B8955A)", borderRadius: 3 }} />
      </div>
    </div>
  );
}

/** Shared share-card layout: copy on the left, the piece on the right. */
export function OgCard({ eyebrow, title, sub, tone, ground = "#E6DED2", dark = false }: { eyebrow: string; title: string; sub: string; tone: string; ground?: string; dark?: boolean }) {
  const ink = dark ? "#F7F4EE" : "#111111";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: dark ? "linear-gradient(180deg,#241913,#140F0B)" : "#F7F4EE", fontFamily: "Manrope" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600, padding: "64px 56px" }}>
        <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 30, letterSpacing: 9, color: ink }}>LE SAC DORÉ™</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 5, color: "#C6A66A", marginBottom: 22 }}>{eyebrow}</div>
          <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: title.length > 34 ? 56 : 76, lineHeight: 1.02, color: ink }}>{title}</div>
          <div style={{ display: "flex", fontSize: 22, lineHeight: 1.5, color: dark ? "rgba(247,244,238,.75)" : "#3A332D", marginTop: 24, maxWidth: 480 }}>{sub}</div>
        </div>
        <div style={{ display: "flex", fontSize: 16, letterSpacing: 5, color: dark ? "rgba(247,244,238,.55)" : "#857B70" }}>MORE THAN A BAG.</div>
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", background: ground, backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(255,248,236,.35), transparent 60%)" }}>
        <OgBag tone={tone} width={360} />
      </div>
    </div>
  );
}

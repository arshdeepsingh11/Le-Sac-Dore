import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, ogFonts } from "@/lib/og";
import { byId, COLORS, fmt, groundFor, PRODUCTS } from "@/lib/data";

export const alt = "LE SAC DORÉ™ handbag";
export const size = OG_SIZE;
export const contentType = "image/png";
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const p = byId((await params).id);
  const c = p.colors[0];
  return new ImageResponse(<OgCard eyebrow={`${p.material.toUpperCase()} · ${fmt(p.price)}`} title={p.name} sub={p.desc} tone={COLORS[c]} ground={groundFor(c)} />, { ...size, fonts: await ogFonts() });
}

import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, ogFonts } from "@/lib/og";
import { ARTICLES, articleBySlug } from "@/lib/journal";

export const alt = "The Journal — LE SAC DORÉ™";
export const size = OG_SIZE;
export const contentType = "image/png";
export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = articleBySlug((await params).slug) ?? ARTICLES[0];
  return new ImageResponse(<OgCard dark eyebrow={`THE JOURNAL · ${a.category}`} title={a.title} sub={a.dek} tone={a.hero.tone} ground={a.hero.ground ?? "#CFC1AD"} />, { ...size, fonts: await ogFonts() });
}

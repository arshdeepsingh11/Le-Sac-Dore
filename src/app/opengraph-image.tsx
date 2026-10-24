import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard, ogFonts } from "@/lib/og";

export const alt = "LE SAC DORÉ™ — Handmade luxury leather handbags";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<OgCard dark eyebrow="THE ART OF CARRYING" title="Exceptional materials. Timeless silhouettes." sub="Leather handbags made by one artisan, from the first cut to the final inspection." tone="#3B2519" ground="#CFC1AD" />, { ...size, fonts: await ogFonts() });
}

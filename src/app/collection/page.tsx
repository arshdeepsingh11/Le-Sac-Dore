import type { Metadata } from "next";
import { CollectionView } from "@/components/collection-view";
import { JsonLd } from "@/components/json-ld";
import { filterProducts, FILTERS, type FilterKey } from "@/lib/data";
import { abs, breadcrumbLd, itemListLd, pageMeta } from "@/lib/seo";

const VALID = new Set<string>([...FILTERS.map(([k]) => k), "essentiel", "atelier"]);

/** Each filter is a real, indexable category landing page with its own title and description. */
const CATEGORY: Record<string, [string, string]> = {
  all: ["Luxury Leather Handbags — La Collection", "Explore every Le Sac Doré handbag: full-grain leather totes, shoulder bags, evening clutches, travel bags and jute pieces, each handmade by one artisan. From $650 CAD."],
  new: ["New Arrivals — New Luxury Handbags", "The newest Le Sac Doré handbags this season: La Luna, Le Noir, Le Rivage, La Nova and La Dune. Handmade, with a Digital Passport and lifetime repairs."],
  leather: ["Leather Handbags — Full-Grain & Suede", "Handmade leather handbags in full-grain Tuscan calfskin, quilted lambskin and calf suede. Totes, top-handles, crossbody and shoulder bags from $650 CAD."],
  textile: ["Textile & Jute Bags — Woven Luxury Bags", "Woven jute bags bound in leather, waxed canvas travel bags and silk-cotton jacquard clutches, handmade by Le Sac Doré."],
  evening: ["Evening Bags & Luxury Clutches", "Evening bags and clutches: hand-quilted lambskin, pebbled calfskin and silk-cotton jacquard, with champagne-gold hardware."],
  travel: ["Leather Travel Bags & Weekenders", "Leather weekend bags and laptop travel bags in full-grain leather and waxed canvas, built for a laptop and two days away."],
  signature: ["La Collection Signature — Iconic Leather Bags", "Le Sac Doré's signature silhouettes — Le Signature, La Bella and La Vela — in full-grain leather, made by one artisan in about forty hours."],
  essentiel: ["L'Essentiel — Everyday Luxury Leather Bags", "Quiet luxury for everyday life: lightweight leather totes, top-handles and small crossbody bags from $650 CAD."],
  atelier: ["L'Atelier — Limited Material-Led Pieces", "Material-driven limited pieces from the Le Sac Doré atelier: hand-quilted lambskin and woven jute bound in leather."],
};

const key = (f?: string) => (f && VALID.has(f) ? f : "all");

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ filter?: string }> }): Promise<Metadata> {
  const f = key((await searchParams).filter);
  const [title, description] = CATEGORY[f];
  return pageMeta({ title, description, path: f === "all" ? "/collection" : `/collection?filter=${f}`, image: abs("/opengraph-image") });
}

export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const f = key((await searchParams).filter) as FilterKey;
  return (
    <>
      <JsonLd data={[itemListLd(CATEGORY[f][0], filterProducts(f, "featured")), breadcrumbLd([["Home", "/"], ["La Collection", "/collection"], ...(f === "all" ? [] : ([[CATEGORY[f][0].split(" — ")[0], `/collection?filter=${f}`]] as [string, string][]))])]} />
      <CollectionView key={f} initialFilter={f} />
    </>
  );
}

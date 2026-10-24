import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductFaq } from "@/components/product-faq";
import { ProductView } from "@/components/product-view";
import { findProduct, fmt, PRODUCTS, type ColorName } from "@/lib/data";
import { abs, breadcrumbLd, faqLd, pageMeta, productFaq, productLd, titleCase } from "@/lib/seo";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = findProduct(id);
  if (!p) return { title: "Not found", robots: { index: false } };
  const title = `${titleCase(p.name)} — ${p.material} Handbag`;
  return {
    ...pageMeta({
      title,
      description: `${p.desc} ${p.dims}. ${fmt(p.price)}. Handmade by one artisan, two-year warranty, free returns within 30 days.`,
      path: `/product/${p.id}`,
      image: abs(`/product/${p.id}/opengraph-image`),
    }),
    keywords: [p.name, `${p.material} handbag`, `${p.material} bag`, ...p.colors.map((c) => `${c.toLowerCase()} leather bag`), "luxury handbag", "handmade bag", "Le Sac Doré"],
    other: { "product:price:amount": String(p.price), "product:price:currency": "CAD", "product:availability": "in stock", "product:brand": "Le Sac Doré" },
  };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ color?: string }> }) {
  const { id } = await params;
  const { color } = await searchParams;
  const p = findProduct(id);
  if (!p) notFound();
  const initial = (color && p.colors.includes(color as ColorName) ? color : p.colors[0]) as ColorName;
  return (
    <>
      <JsonLd data={[productLd(p), breadcrumbLd([["Home", "/"], ["La Collection", "/collection"], [p.name, `/product/${p.id}`]]), faqLd(productFaq(p))]} />
      <ProductView key={p.id} product={p} initialColor={initial} />
      <ProductFaq product={p} />
    </>
  );
}

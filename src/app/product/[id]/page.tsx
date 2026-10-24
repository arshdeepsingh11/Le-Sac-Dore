import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product-view";
import { findProduct, fmt, PRODUCTS, type ColorName } from "@/lib/data";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = findProduct(id);
  if (!p) return { title: "Not found" };
  return { title: `${p.name} — ${p.material}`, description: `${p.desc} ${fmt(p.price)}.` };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ color?: string }> }) {
  const { id } = await params;
  const { color } = await searchParams;
  const p = findProduct(id);
  if (!p) notFound();
  const initial = (color && p.colors.includes(color as ColorName) ? color : p.colors[0]) as ColorName;
  return <ProductView key={p.id} product={p} initialColor={initial} />;
}

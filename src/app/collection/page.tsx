import type { Metadata } from "next";
import { CollectionView } from "@/components/collection-view";
import { FILTERS, type FilterKey } from "@/lib/data";

export const metadata: Metadata = { title: "La Collection" };

const VALID = new Set<string>([...FILTERS.map(([k]) => k), "essentiel", "atelier"]);

export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const initial = (filter && VALID.has(filter) ? filter : "all") as FilterKey;
  return <CollectionView key={initial} initialFilter={initial} />;
}

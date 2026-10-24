import type { Metadata } from "next";
import { MaterialsView } from "@/components/materials-view";
import { MATERIALS, type MaterialKey } from "@/lib/data";

export const metadata: Metadata = { title: "The Materials" };

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ mat?: string }> }) {
  const { mat } = await searchParams;
  const initial = (MATERIALS.some((m) => m.key === mat) ? mat : "leather") as MaterialKey;
  return <MaterialsView key={initial} initial={initial} />;
}

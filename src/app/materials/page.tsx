import type { Metadata } from "next";
import { MaterialsView } from "@/components/materials-view";
import { MATERIALS, type MaterialKey } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ mat?: string }> }): Promise<Metadata> {
  const { mat } = await searchParams;
  const m = MATERIALS.find((x) => x.key === mat);
  if (!m) return pageMeta({ title: "The Materials — Leather, Suede, Jute, Canvas, Linen", description: "The six materials behind every Le Sac Doré bag — full-grain Tuscan calfskin, French calf suede, Bangladeshi jute, Scottish waxed canvas, Belgian linen and Como jacquard.", path: "/materials" });
  const t = m.title.charAt(0) + m.title.slice(1).toLowerCase();
  return pageMeta({ title: `${t} — Our Materials`, description: `${m.text} ${m.facts.map(([k, v]) => `${k.charAt(0) + k.slice(1).toLowerCase()}: ${v}.`).join(" ")}`, path: `/materials?mat=${m.key}` });
}

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ mat?: string }> }) {
  const { mat } = await searchParams;
  const initial = (MATERIALS.some((m) => m.key === mat) ? mat : "leather") as MaterialKey;
  return <MaterialsView key={initial} initial={initial} />;
}

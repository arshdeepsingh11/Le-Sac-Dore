import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { TIMELINE } from "@/lib/data";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "L'Atelier — How Our Leather Bags Are Made",
  description: "One artisan makes each Le Sac Doré bag in seven stages — material selection, pattern, hand cutting, saddle-stitched construction, three-layer edge finishing and a 42-point inspection.",
  path: "/atelier",
});

const howTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How a Le Sac Doré leather bag is made",
  description: "The seven stages of making a handbag in the Le Sac Doré atelier.",
  totalTime: "P2D",
  step: TIMELINE.map((t, i) => ({ "@type": "HowToStep", position: i + 1, name: t.title.charAt(0) + t.title.slice(1).toLowerCase(), text: t.text })),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[howTo, breadcrumbLd([["Home", "/"], ["L'Atelier", "/atelier"]])]} />
      {children}
    </>
  );
}

import type { Metadata } from "next";
import { JournalIndex } from "@/components/journal-index";
import { JsonLd } from "@/components/json-ld";
import { ARTICLES } from "@/lib/journal";
import { abs, breadcrumbLd, pageMeta, SITE } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "The Journal — Leather Care, Craft & Materials",
  description: "Stories from the Le Sac Doré atelier: how a luxury leather bag is made, how to care for full-grain leather, what patina is, and how to pack for a weekend.",
  path: "/journal",
  image: abs("/opengraph-image"),
});

export default function JournalPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "The Journal — LE SAC DORÉ™",
            url: abs("/journal"),
            publisher: { "@id": `${SITE.url}/#organization` },
            blogPost: ARTICLES.map((a) => ({ "@type": "BlogPosting", headline: a.title, url: abs(`/journal/${a.slug}`), datePublished: a.date })),
          },
          breadcrumbLd([["Home", "/"], ["The Journal", "/journal"]]),
        ]}
      />
      <JournalIndex />
    </>
  );
}

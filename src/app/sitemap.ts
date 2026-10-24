import type { MetadataRoute } from "next";
import { COLLECTIONS, MATERIALS, PRODUCTS } from "@/lib/data";
import { ARTICLES } from "@/lib/journal";
import { abs } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const latestPost = new Date(ARTICLES[0].date);
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified = now) => ({ url: abs(path), lastModified, changeFrequency, priority });
  return [
    page("/", 1, "weekly"),
    page("/collection", 0.9, "weekly"),
    page("/collection?filter=new", 0.8, "weekly"),
    ...["leather", "textile", "evening", "travel", "signature"].map((f) => page(`/collection?filter=${f}`, 0.7, "weekly")),
    ...COLLECTIONS.filter((c) => !["evening", "travel", "signature"].includes(c.key)).map((c) => page(`/collection?filter=${c.key}`, 0.7, "weekly")),
    ...PRODUCTS.map((p) => ({ ...page(`/product/${p.id}`, 0.9, "weekly"), images: [abs(`/product/${p.id}/opengraph-image`)] })),
    page("/journal", 0.7, "weekly", latestPost),
    ...ARTICLES.map((a) => ({ ...page(`/journal/${a.slug}`, 0.6, "monthly", new Date(a.date)), images: [abs(`/journal/${a.slug}/opengraph-image`)] })),
    page("/materials", 0.6, "monthly"),
    ...MATERIALS.map((m) => page(`/materials?mat=${m.key}`, 0.5, "monthly")),
    page("/atelier", 0.6, "monthly"),
    page("/maison", 0.5, "monthly"),
    page("/services", 0.6, "monthly"),
    page("/privacy", 0.2, "yearly"),
  ];
}

import { COLLECTIONS, MATERIALS, PRODUCTS, fmt } from "@/lib/data";
import { ARTICLES } from "@/lib/journal";
import { abs, SITE } from "@/lib/seo";

export const dynamic = "force-static";

/** llms.txt — a concise, link-rich brief for AI assistants (https://llmstxt.org). */
export function GET() {
  const body = `# ${SITE.name}™

> ${SITE.description}

Key facts:
- Every bag is made by one artisan, from the first cut to the final inspection (18–58 hours of handwork depending on the piece).
- Prices from ${fmt(Math.min(...PRODUCTS.map((p) => p.price)))} to ${fmt(Math.max(...PRODUCTS.map((p) => p.price)))}.
- Every bag has a Digital Passport (artisan, materials, history), a two-year warranty and repairs for life.
- Free shipping in Canada over $1,000 CAD; delivery in 2–5 business days; 30-day free returns.
- Boutiques: Toronto (Yorkville), Montréal, Vancouver, Paris, New York, London — private appointments and video appointments available.

## Handbags
${PRODUCTS.map((p) => `- [${p.name}](${abs(`/product/${p.id}`)}): ${p.material}, ${p.dims}, ${fmt(p.price)}. ${p.desc}`).join("\n")}

## Collections
${COLLECTIONS.map((c) => `- [${c.name}](${abs(`/collection?filter=${c.key}`)}): ${c.line}`).join("\n")}
- [New arrivals](${abs("/collection?filter=new")})

## Materials
${MATERIALS.map((m) => `- [${m.title.charAt(0) + m.title.slice(1).toLowerCase()}](${abs(`/materials?mat=${m.key}`)}): ${m.text}`).join("\n")}

## Journal
${ARTICLES.map((a) => `- [${a.title}](${abs(`/journal/${a.slug}`)}): ${a.dek}`).join("\n")}

## Help
- [Client services, shipping, returns, care, repairs, warranty, FAQ and boutiques](${abs("/services")})
- [How our bags are made](${abs("/atelier")})
- [Our story and responsibility](${abs("/maison")})

## Optional
- [Full catalogue, policies and journal in one file](${abs("/llms-full.txt")})
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

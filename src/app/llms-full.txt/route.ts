import { FAQ, HOURS, MATERIALS, PILLARS, PRACTICES, PRODUCTS, SERVICES, STORES, TIMELINE, fmt } from "@/lib/data";
import { ARTICLES } from "@/lib/journal";
import { abs, productFaq, SITE } from "@/lib/seo";

export const dynamic = "force-static";

/** llms-full.txt — the whole maison as clean markdown, for AI answer engines. */
export function GET() {
  const products = PRODUCTS.map(
    (p) => `### ${p.name}
URL: ${abs(`/product/${p.id}`)}
- Price: ${fmt(p.price)}
- Material: ${p.material}
- Dimensions: ${p.dims}
- Colours: ${p.colors.join(", ")}
- Handwork: about ${HOURS[p.id] ?? 30} hours by one artisan
- ${p.isNew ? "New arrival this season. " : ""}${p.desc}

${productFaq(p).map(([q, a]) => `**${q}** ${a}`).join("\n\n")}`,
  ).join("\n\n");

  const services = Object.values(SERVICES)
    .filter(([, b]) => b.length)
    .map(([t, b]) => `### ${t.charAt(0) + t.slice(1).toLowerCase()}\n${b.map(([h, x]) => `- ${h.charAt(0) + h.slice(1).toLowerCase()}: ${x}`).join("\n")}`)
    .join("\n\n");

  const articles = ARTICLES.map((a) => `### ${a.title}\nURL: ${abs(`/journal/${a.slug}`)}\n${a.dek}\n\n${a.body.map((b) => (b.t === "p" ? b.text : b.t === "h" ? `#### ${b.text}` : b.t === "quote" ? `> ${b.text}${b.by ? ` — ${b.by}` : ""}` : b.t === "list" ? b.items.map((i) => `- ${i}`).join("\n") : "")).filter(Boolean).join("\n\n")}`).join("\n\n");

  const body = `# ${SITE.name}™ — full reference

> ${SITE.description}

Website: ${SITE.url} · Client services: ${SITE.phone} · ${SITE.email}

## The maison
${PILLARS.map(([t, x]) => `- **${t.charAt(0) + t.slice(1).toLowerCase()}** — ${x}`).join("\n")}

## Responsibility
${PRACTICES.map(([t, x]) => `- **${t.charAt(0) + t.slice(1).toLowerCase()}** — ${x}`).join("\n")}

## How a bag is made
${TIMELINE.map((t, i) => `${i + 1}. **${t.title.charAt(0) + t.title.slice(1).toLowerCase()}** — ${t.text}`).join("\n")}

## Materials
${MATERIALS.map((m) => `- **${m.title.charAt(0) + m.title.slice(1).toLowerCase()}** (${m.origin}): ${m.text} ${m.facts.map(([k, v]) => `${k.charAt(0) + k.slice(1).toLowerCase()}: ${v}.`).join(" ")}`).join("\n")}

## Handbags
${products}

## Client services
${services}

### Frequently asked questions
${FAQ.map(([q, a]) => `**${q}** ${a}`).join("\n\n")}

## Boutiques
${STORES.map((s) => `- **${s.city.charAt(0) + s.city.slice(1).toLowerCase()} — ${s.name}**: ${s.address.replace("\n", ", ")}. ${s.hours.replace("\n", "; ")}. ${s.phone}`).join("\n")}

## Journal
${articles}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

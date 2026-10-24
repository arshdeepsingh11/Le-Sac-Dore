import { HOURS, MATERIALS, fmt, type Product } from "@/lib/data";
import { productFaq } from "@/lib/seo";

/**
 * Answer-first block for search and AI engines: a plain fact sheet + Q&A.
 * Rendered on the server as real HTML (native <details>), so every answer is crawlable.
 */
export function ProductFaq({ product: p }: { product: Product }) {
  const mat = MATERIALS.find((m) => m.key === p.mats[0]);
  const facts: [string, string][] = [
    ["PRICE", fmt(p.price)],
    ["DIMENSIONS", p.dims],
    ["MATERIAL", p.material],
    ["ORIGIN", mat ? mat.origin.split("·")[1]?.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? "" : "—"],
    ["COLOURS", p.colors.join(", ")],
    ["HANDWORK", `About ${HOURS[p.id] ?? 30} hours, one artisan`],
    ["LINING & HARDWARE", "Belgian linen · solid brass"],
    ["WARRANTY", "2 years · repairs for life"],
    ["DELIVERY", "2–5 business days in Canada"],
    ["RETURNS", "30 days, free collection"],
  ];
  const qa = productFaq(p);
  return (
    <section aria-labelledby="h-faq" className="gutter mx-auto max-w-[1600px] pb-[clamp(90px,12vh,140px)]">
      <div className="grid grid-cols-1 gap-[clamp(36px,6vw,100px)] wide:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="eyebrow mb-4">AT A GLANCE</p>
          <h2 id="h-faq" className="display mb-8 text-[clamp(34px,3.4vw,52px)] leading-[1.05]">
            {p.name}, in brief.
          </h2>
          <dl className="m-0">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 border-t border-ink/12 py-3 text-[14px]">
                <dt className="label pt-0.5">{k}</dt>
                <dd className="m-0">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="eyebrow mb-4">QUESTIONS</p>
          <div className="border-b border-ink/12">
            {qa.map(([q, a], i) => (
              <details key={q} className="group border-t border-ink/12" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[15px] [&::-webkit-details-marker]:hidden">
                  <h3 className="m-0 text-[15px] font-normal">{q}</h3>
                  <span className="text-lg font-light transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-0 mb-5 max-w-[620px] text-sm leading-[1.8] text-body">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

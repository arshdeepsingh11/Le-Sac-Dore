import { FAQ, MATERIALS, PRODUCTS, SERVICES, STORES, artisanById, HOURS, fmt, type Product } from "./data";
import type { Article } from "./journal";
import { fitsInside } from "./fit";

/* ───────────────────────── Site ───────────────────────── */

export const SITE = {
  name: "LE SAC DORÉ",
  legalName: "Le Sac Doré",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://lesacdore.com").replace(/\/$/, ""),
  tagline: "More than a bag.",
  description:
    "Le Sac Doré makes luxury leather handbags by hand — one artisan per bag, from full-grain Tuscan calfskin, suede, waxed canvas and jute. Every piece has a Digital Passport, lifetime repairs and a two-year warranty. Boutiques in Toronto, Montréal, Vancouver, Paris, New York and London.",
  email: "clientservices@lesacdore.com",
  phone: "+1-416-555-0100",
  locale: "en_CA",
  currency: "CAD",
  social: ["https://www.instagram.com/lesacdore", "https://www.pinterest.com/lesacdore", "https://www.tiktok.com/@lesacdore"],
};

export const abs = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

/** Standard page metadata with canonical + OpenGraph + Twitter. */
export const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());

export function pageMeta({ title, description, path, image = abs("/opengraph-image"), type = "website", noindex = false }: { title: string; description: string; path: string; image?: string; type?: "website" | "article"; noindex?: boolean }) {
  return {
    title,
    description,
    alternates: { canonical: abs(path) },
    openGraph: { title: `${title} — ${SITE.name}™`, description, url: abs(path), siteName: `${SITE.name}™`, locale: SITE.locale, type, ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}) },
    twitter: { card: "summary_large_image" as const, title: `${title} — ${SITE.name}™`, description, ...(image ? { images: [image] } : {}) },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/* ───────────────────────── JSON-LD builders ───────────────────────── */

const ORG_ID = abs("/#organization");
const SITE_ID = abs("/#website");

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: `${SITE.name}™`,
    alternateName: SITE.legalName,
    url: SITE.url,
    logo: abs("/icon.png"),
    image: abs("/opengraph-image"),
    slogan: SITE.tagline,
    description: SITE.description,
    email: SITE.email,
    foundingLocation: "Paris, France",
    sameAs: SITE.social,
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", telephone: SITE.phone, email: SITE.email, areaServed: ["CA", "US", "GB", "EU"], availableLanguage: ["English", "French"], hoursAvailable: "Mo-Sa 09:00-19:00" }],
    department: STORES.map((s, i) => ({ "@id": abs(`/services#store-${i}`) })),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: `${SITE.name}™`,
    url: SITE.url,
    inLanguage: "en-CA",
    publisher: { "@id": ORG_ID },
    potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${abs("/search")}?q={search_term_string}` }, "query-input": "required name=search_term_string" },
  };
}

export function breadcrumbLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}

const RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "CA",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 30,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
};

const shipping = (price: number) => ({
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: price >= 1000 ? 0 : 35, currency: "CAD" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "CA" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
  },
});

export function productLd(p: Product) {
  const [w, h, d] = p.dims.match(/\d+/g)!.map(Number);
  const mat = MATERIALS.find((m) => m.key === p.mats[0]);
  const url = abs(`/product/${p.id}`);
  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    "@id": `${url}#group`,
    name: `${p.name} — ${p.material}`,
    description: p.desc,
    url,
    brand: { "@type": "Brand", name: `${SITE.name}™` },
    productGroupID: p.id,
    variesBy: ["https://schema.org/color"],
    image: abs(`/product/${p.id}/opengraph-image`),
    material: p.material,
    category: "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
    hasVariant: p.colors.map((c) => ({
      "@type": "Product",
      "@id": `${url}?color=${encodeURIComponent(c)}`,
      name: `${p.name} — ${c}`,
      sku: `LSD-${p.id.toUpperCase()}-${c.replace(/\s+/g, "").toUpperCase()}`,
      color: c,
      material: p.material,
      image: abs(`/product/${p.id}/opengraph-image`),
      url: `${url}?color=${encodeURIComponent(c)}`,
      offers: {
        "@type": "Offer",
        url: `${url}?color=${encodeURIComponent(c)}`,
        price: p.price,
        priceCurrency: "CAD",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": ORG_ID },
        shippingDetails: shipping(p.price),
        hasMerchantReturnPolicy: RETURN_POLICY,
      },
    })),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Width", value: w, unitCode: "CMT" },
      { "@type": "PropertyValue", name: "Height", value: h, unitCode: "CMT" },
      { "@type": "PropertyValue", name: "Depth", value: d, unitCode: "CMT" },
      { "@type": "PropertyValue", name: "Hours of handwork", value: HOURS[p.id] ?? 30 },
      { "@type": "PropertyValue", name: "Warranty", value: "2 years" },
      ...(mat ? [{ "@type": "PropertyValue", name: "Material origin", value: mat.origin }] : []),
    ],
  };
}

export function faqLd(qa: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function articleLd(a: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.dek,
    datePublished: a.date,
    dateModified: a.date,
    image: abs(`/journal/${a.slug}/opengraph-image`),
    url: abs(`/journal/${a.slug}`),
    mainEntityOfPage: abs(`/journal/${a.slug}`),
    articleSection: a.category,
    wordCount: a.body.reduce((n, b) => n + ("text" in b ? b.text.split(/\s+/).length : "items" in b ? b.items.join(" ").split(/\s+/).length : 0), 0),
    author: { "@type": "Organization", name: `${SITE.name}™ — ${a.author}`, url: SITE.url },
    publisher: { "@id": ORG_ID },
    about: a.products.map((id) => ({ "@type": "Product", name: PRODUCTS.find((p) => p.id === id)?.name, url: abs(`/product/${id}`) })),
  };
}

export function itemListLd(name: string, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/product/${p.id}`), name: p.name })),
  };
}

const DAY: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function hoursSpec(hours: string) {
  const out: Record<string, string>[] = [];
  for (const line of hours.split("\n")) {
    const m = line.match(/^(\w{3})(?:–(\w{3}))?\s+(\d{2}:\d{2})–(\d{2}:\d{2})/);
    if (!m) continue;
    const from = ORDER.indexOf(m[1]), to = m[2] ? ORDER.indexOf(m[2]) : from;
    out.push({ "@type": "OpeningHoursSpecification", dayOfWeek: ORDER.slice(from, to + 1).map((d) => `https://schema.org/${DAY[d]}`).join(","), opens: m[3], closes: m[4] } as Record<string, string>);
  }
  return out.map((o) => ({ ...o, dayOfWeek: o.dayOfWeek.split(",") }));
}

export function storesLd() {
  const country: Record<string, string> = { TORONTO: "CA", "MONTRÉAL": "CA", VANCOUVER: "CA", PARIS: "FR", "NEW YORK": "US", LONDON: "GB" };
  return STORES.map((s, i) => {
    const [street, rest] = s.address.split("\n");
    return {
      "@context": "https://schema.org",
      "@type": "Store",
      "@id": abs(`/services#store-${i}`),
      name: `${SITE.name}™ ${s.name}`,
      parentOrganization: { "@id": ORG_ID },
      telephone: s.phone.replace(/\s/g, ""),
      url: abs("/services#stores"),
      image: abs("/opengraph-image"),
      priceRange: "$650–$1,450 CAD",
      address: { "@type": "PostalAddress", streetAddress: street, addressLocality: s.city.charAt(0) + s.city.slice(1).toLowerCase(), postalCode: rest.match(/[A-Z]\d[A-Z] ?\d[A-Z]\d|\d{5}|[A-Z]{1,2}\d{1,2}[A-Z]? ?\d[A-Z]{2}/)?.[0], addressCountry: country[s.city] },
      openingHoursSpecification: hoursSpec(s.hours),
    };
  });
}

/* ───────────────────────── Answer-engine content ───────────────────────── */

const CARE: Record<string, string> = {
  leather: "Wipe it with a dry, soft cloth, condition it twice a year with a neutral cream, and store it upright in its dust bag filled with tissue, away from prolonged sunlight.",
  suede: "Brush it gently with the grain and treat marks with a suede eraser. Never use water. Store it in its dust bag, filled with tissue.",
  jute: "Keep it dry, brush it lightly to remove dust, and store it away from humidity, filled with tissue so it holds its shape.",
  canvas: "Brush off dust, spot-clean with a damp cloth, and re-wax the canvas when water stops beading on the surface.",
  textile: "Store it flat in its dust bag, away from light. Spot-clean only; do not soak.",
  linen: "Store it flat in its dust bag, away from light. Spot-clean only; do not soak.",
};

/** Visible, factual Q&A for each product page — mirrored in FAQPage JSON-LD. */
export function productFaq(p: Product): [string, string][] {
  const mat = MATERIALS.find((m) => m.key === p.mats[0]);
  const laptop = fitsInside(p, [30.4, 21.5, 1.2]);
  const phone = fitsInside(p, [16.3, 7.7, 0.9]);
  return [
    [`What are the dimensions of ${p.name}?`, `${p.name} measures ${p.dims.replace("W ", "").replace(" cm", " cm")} (width × height × depth). The handle drop is 11 cm and the adjustable strap drop is 48–56 cm.`],
    [`What is ${p.name} made of?`, `${p.name} is made of ${p.material.toLowerCase()}${mat ? ` — ${mat.title.toLowerCase()} from ${mat.origin.split("·")[1]?.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}` : ""}. It is lined in Belgian linen and fitted with solid brass hardware in a champagne-gold finish.`],
    [`Does a 13-inch laptop fit in ${p.name}?`, laptop ? `Yes. A 13-inch laptop fits inside ${p.name}.` : `No. ${p.name} is designed for everyday essentials; a 13-inch laptop does not fit. For a laptop, Le Voyage (W 44 × H 30 × D 18 cm) or Le Grand are better choices.${phone ? ` A large phone such as an iPhone 16 Pro Max fits easily.` : ""}`],
    [`How much does ${p.name} cost?`, `${p.name} costs ${fmt(p.price)}. Shipping in Canada is complimentary on orders over $1,000 CAD; otherwise standard delivery is $35 CAD. HST is added at checkout.`],
    [`Who makes ${p.name}?`, `Each ${p.name} is made by a single artisan in a Le Sac Doré atelier, from the first cut to the final inspection, in about ${HOURS[p.id] ?? 30} hours of handwork. The artisan's name is recorded in the bag's Digital Passport.`],
    [`How do I care for ${p.name}?`, CARE[p.mats[0]] ?? CARE.leather],
    [`Can I return or repair ${p.name}?`, `Unused pieces can be returned within 30 days of delivery for a full refund, with free courier collection. Le Sac Doré repairs every bag for life, and the first repair within two years is complimentary. Every piece also carries a two-year warranty.`],
  ];
}

export const SERVICE_FAQ: [string, string][] = [
  ...FAQ,
  ["What is the Le Sac Doré warranty?", SERVICES.warranty[1].map(([, t]) => t).join(" ")],
  ["Where are Le Sac Doré boutiques?", `Le Sac Doré has boutiques in ${STORES.map((s) => `${s.city.charAt(0) + s.city.slice(1).toLowerCase()} (${s.address.split("\n")[0]})`).join(", ")}. Private appointments are available in each.`],
];

export const artisanFor = (id: string) => artisanById(id);

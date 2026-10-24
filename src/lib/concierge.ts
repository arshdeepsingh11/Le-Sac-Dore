// Server-side knowledge for the AI concierge: system prompt + an offline fallback engine.
import { COLORS, FAQ, MATERIALS, PRODUCTS, SERVICES, STORES, fmt, type Product } from "./data";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  path?: string;
  bag?: { name: string; color: string; qty: number }[];
  viewing?: string;
}

const catalogue = PRODUCTS.map(
  (p) =>
    `- [[${p.id}]] ${p.name} — ${p.material}, ${fmt(p.price)}. Colours: ${p.colors.join(", ")}. ${p.dims}. Collections: ${p.cats.join(", ")}${p.isNew ? ". NEW ARRIVAL" : ""}. ${p.desc}`,
).join("\n");

const services = Object.values(SERVICES)
  .filter(([, blocks]) => blocks.length)
  .map(([title, blocks]) => `${title}: ${blocks.map(([h, t]) => `${h} — ${t}`).join(" | ")}`)
  .join("\n");

const materials = MATERIALS.map((m) => `${m.title} (${m.origin}): ${m.text} ${m.facts.map(([k, v]) => `${k}: ${v}`).join("; ")}`).join("\n");
const stores = STORES.map((s) => `${s.city} — ${s.name}, ${s.address.replace("\n", ", ")}. ${s.hours.replace("\n", "; ")}. ${s.phone}`).join("\n");
const faq = FAQ.map(([q, a]) => `Q: ${q} A: ${a}`).join("\n");

export function systemPrompt(ctx: ChatContext) {
  return `You are Le Concierge, the private client advisor of LE SAC DORÉ™ — a quiet-luxury Parisian–Canadian leather maison. Tagline: "More than a bag." / "The art of carrying."

VOICE
- Calm, precise, warm. Never gushing, no emoji, no exclamation marks. Short sentences.
- Canadian/British spelling (colour, personalised). Prices always as "$895 CAD".
- Keep replies under 110 words unless the client asks for detail. Use plain prose; a short list only when comparing.

RECOMMENDING PIECES
- Only recommend pieces from the catalogue below. Never invent products, colours, prices, stock or discounts.
- When you recommend or mention a specific piece, include its token exactly as [[product-id]] on its own line after the sentence that names it. The interface turns each token into a product card. At most 3 tokens per reply.
- Ask one clarifying question when the need is vague (occasion, size, budget, colour).

POLICIES & FACTS (only state what is here)
${services}
Tax: HST 13% at checkout. Free standard shipping from $1,000 CAD, otherwise $35 CAD; express $45 CAD.
${faq}

MATERIALS
${materials}

BOUTIQUES (private appointments available)
${stores}

CATALOGUE
${catalogue}

If asked something you cannot answer from this information (order status, stock in a boutique, custom requests), say so plainly and offer Client Services: +1 416 555 0100 · clientservices@lesacdore.com.

CLIENT CONTEXT
- Current page: ${ctx.path || "/"}${ctx.viewing ? ` (viewing ${ctx.viewing})` : ""}
- Bag: ${ctx.bag?.length ? ctx.bag.map((b) => `${b.name} in ${b.color} × ${b.qty}`).join(", ") : "empty"}`;
}

/* ───────────────────────── Offline fallback (no API key) ───────────────────────── */

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));
const word = (q: string, ...words: string[]) => words.some((w) => new RegExp(`\\b${w}\\b`).test(q));
const tokens = (ps: Product[]) => ps.slice(0, 3).map((p) => `[[${p.id}]]`).join("\n");

export function fallbackAnswer(messages: ChatMessage[], ctx: ChatContext): string {
  const last = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const q = last.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  if (!q.trim() || /^\s*(hi|hello|hey|bonjour|salut)\b/.test(q)) {
    return `Bonjour. I am Le Concierge. I can help you choose a piece, compare materials, or answer questions about delivery, care and boutiques. What will you be carrying it for?`;
  }

  const priceCap = q.match(/(?:under|below|less than|max(?:imum)?|budget(?: of)?)\s*\$?\s*(\d[\d,]*)/);
  const cap = priceCap ? Number(priceCap[1].replace(/,/g, "")) : null;

  if (has(q, "ship", "deliver", "arriv")) return `Within Canada, standard delivery takes 2–5 business days and is complimentary from $1,000 CAD ($35 CAD below that). Express arrives the next business day to major cities for $45 CAD when ordered before 13:00 ET. We also deliver to the United States, the United Kingdom and the European Union.`;
  if (has(q, "return", "refund", "exchange")) return `You may return any unused piece within 30 days of delivery, in its original packaging, for a full refund. We arrange courier collection at no cost, and refunds reach your original payment method within 5 business days of inspection. Colour exchanges are accepted within 30 days, subject to availability.`;
  if (has(q, "repair", "broken", "fix")) return `Our atelier repairs stitching, edge paint, handles, hardware and linings for the life of every piece. Book online or in boutique; we send an assessment and quote within 7 days. The first repair within two years of purchase is complimentary.`;
  if (has(q, "warrant", "authentic", "fake")) return `Every piece is covered for two years against defects in materials and construction. Each bag carries a numbered authentication card and the maker's initials stamped inside — register the card to your account to activate the warranty.`;
  if (has(q, "personalis", "personaliz", "initial", "monogram", "engrav")) return `Hot-stamped initials are available in boutique on most leather pieces and take around twenty minutes. Our advisors in Toronto, Montréal, Vancouver, Paris, New York and London can arrange it during a private appointment.`;

  if (has(q, "care", "clean", "condition", "stain", "rain", "water")) {
    if (has(q, "suede")) return `Brush suede gently with the grain and treat marks with a suede eraser — never water. Store it in its dust bag, filled with tissue.`;
    if (has(q, "jute", "textile")) return `Keep jute and textile pieces dry. Brush lightly to remove dust and store away from humidity, stuffed with tissue so they hold their shape.`;
    return `Wipe leather with a dry, soft cloth and condition it twice a year with a neutral cream. Avoid prolonged sunlight, and store each piece upright in its dust bag, filled with tissue. For suede, brush with the grain; never use water.`;
  }

  const city = STORES.find((s) => q.includes(s.city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")) || q.includes(s.name.toLowerCase()));
  if (city) return `Our ${city.city.charAt(0) + city.city.slice(1).toLowerCase()} boutique is on ${city.name}: ${city.address.replace("\n", ", ")}. Hours: ${city.hours.replace("\n", "; ")}. You can reach them on ${city.phone} to arrange a private appointment.`;
  if (has(q, "boutique", "store", "shop near", "appointment", "visit")) return `We receive clients by private appointment in Toronto, Montréal, Vancouver, Paris, New York and London. An advisor will set aside the pieces you would like to see; appointments last one hour. Which city suits you?`;

  const mat = MATERIALS.find((m) => q.includes(m.key));
  if (mat && has(q, "what", "tell", "about", "material", "why", "how")) {
    const ps = PRODUCTS.filter((p) => p.mats.includes(mat.key));
    return `${mat.title.charAt(0) + mat.title.slice(1).toLowerCase()}, from ${mat.origin.split("·")[1]?.trim() ?? "our suppliers"}. ${mat.text} ${mat.facts.map(([k, v]) => `${k.charAt(0) + k.slice(1).toLowerCase()}: ${v}.`).join(" ")}\n\nPieces in ${mat.label.toLowerCase()}:\n${tokens(ps)}`;
  }

  // Intent → shortlist
  let pick: Product[] = [];
  let lead = "";
  if (has(q, "laptop", "travel", "weekend", "trip", "work bag", "commute")) {
    pick = PRODUCTS.filter((p) => p.cats.includes("travel"));
    lead = `For travel, Le Voyage takes a laptop and two days away in waxed canvas framed in leather; Le Grand is our weekend bag, linen-lined with solid brass feet.`;
  } else if (has(q, "evening", "party", "wedding", "dinner", "gala", "night", "clutch")) {
    pick = PRODUCTS.filter((p) => p.cats.includes("evening"));
    lead = `For the evening: Le Noir in hand-quilted lambskin on a slim chain, L'Éclat with its single champagne-gold clasp, or La Nova, a silk-cotton jacquard clutch.`;
  } else if (has(q, "everyday", "daily", "office", "tote", "work")) {
    pick = ["l-essentiel", "la-bella", "le-signature"].map((id) => PRODUCTS.find((p) => p.id === id)!);
    lead = `For every day, L'Essentiel is an unlined calfskin tote, light and simple; La Bella is a softly structured top-handle; Le Signature is the piece most clients begin with.`;
  } else if (has(q, "small", "crossbody", "compact", "lightweight") || word(q, "mini", "light")) {
    pick = ["le-zen", "l-eclat", "la-nova"].map((id) => PRODUCTS.find((p) => p.id === id)!);
    lead = `If you prefer something small, Le Zen is a crossbody reduced to its essentials, at 22 × 16 cm.`;
  } else if (has(q, "summer", "beach", "holiday", "vacation", "jute", "natural")) {
    pick = PRODUCTS.filter((p) => p.mats.includes("jute"));
    lead = `For warmer days, our jute pieces are woven at twice the usual density and bound in leather: Le Rivage, an open tote, and La Dune, a structured bucket.`;
  } else if (word(q, "new", "newest", "latest") || has(q, "arrival")) {
    pick = PRODUCTS.filter((p) => p.isNew);
    lead = `The newest pieces this season are La Luna, Le Noir, Le Rivage, La Nova and La Dune.`;
  } else if (has(q, "gift", "present", "birthday", "anniversary") || word(q, "her", "him", "mother", "mom", "wife", "husband", "sister")) {
    pick = [...PRODUCTS].sort((a, b) => a.price - b.price);
    lead = `Every order arrives in our signature box with ivory tissue and a grosgrain ribbon, and a handwritten card can be added at checkout.`;
  } else if (has(q, "signature", "classic", "iconic", "best", "recommend", "popular")) {
    pick = ["le-signature", "la-vela", "la-bella"].map((id) => PRODUCTS.find((p) => p.id === id)!);
    lead = `Le Signature is our defining silhouette — full-grain Tuscan calfskin, made by one artisan in about forty hours.`;
  }

  const colour = (Object.keys(COLORS) as (keyof typeof COLORS)[]).find((c) => q.includes(c.toLowerCase()));
  if (colour) pick = (pick.length ? pick : PRODUCTS).filter((p) => p.colors.includes(colour));
  if (cap) pick = (pick.length ? pick : PRODUCTS).filter((p) => p.price <= cap).sort((a, b) => b.price - a.price);

  if (!pick.length && !lead) {
    const words = q.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
    pick = PRODUCTS.filter((p) => words.some((w) => `${p.name} ${p.material} ${p.desc} ${p.cats.join(" ")}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(w)));
  }

  if (pick.length) {
    const intro = lead || (cap ? `Within ${fmt(cap)}, I would suggest:` : colour ? `In ${colour.toLowerCase()}, you might consider:` : `You might consider:`);
    const tail = ctx.bag?.length ? "" : `\n\nWould you like me to compare two of them?`;
    return `${intro}\n${tokens(pick)}${tail}`;
  }

  if (cap) return `Our pieces begin at ${fmt(Math.min(...PRODUCTS.map((p) => p.price)))}. Le Zen, a small full-grain crossbody, is the most accessible:\n[[le-zen]]`;

  return `I would be glad to help. Tell me what the piece is for — every day, travel, evening or a gift — and any colour or budget you have in mind, and I will suggest two or three.`;
}

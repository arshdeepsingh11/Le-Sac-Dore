import type { Texture, View } from "./data";

export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "quote"; text: string; by?: string }
  | { t: "list"; items: string[] }
  | { t: "figure"; view: View; tone: string; ground?: string; texture?: Texture; caption: string };

export interface Article {
  slug: string;
  category: "CRAFT" | "CARE" | "MATERIALS" | "TRAVEL" | "MAISON";
  title: string;
  dek: string;
  date: string; // ISO
  minutes: number;
  author: string;
  hero: { view: View; tone: string; ground?: string; texture?: Texture; caption: string };
  products: string[];
  body: Block[];
}

export const ARTICLES: Article[] = [
  {
    slug: "forty-hours-the-making-of-le-signature",
    category: "CRAFT",
    title: "Forty hours: the making of Le Signature",
    dek: "One artisan, one hide, seven stages. A week at Élise Moreau's bench in the Paris atelier.",
    date: "2026-10-14",
    minutes: 6,
    author: "The Atelier",
    hero: { view: "macro", tone: "#3B2519", texture: "grain", caption: "Saddle stitch on full-grain calf, Paris atelier" },
    products: ["le-signature", "la-vela"],
    body: [
      { t: "p", text: "Élise Moreau begins every Le Signature the same way: by looking at the hide for a long time before she touches it. She lays it on the cutting table under the north window and reads it like a map — where the grain is tightest, where a small healed scar sits, which way the fibres run. Only the centre of the skin is good enough for the front panel." },
      { t: "p", text: "The pattern pieces are card, worn smooth at the edges from years of use. She places them by eye, then by hand, and cuts with a round knife in single, unhurried strokes. A machine would be faster. It would not follow the grain." },
      { t: "h", text: "The slow part" },
      { t: "p", text: "Most of the forty hours go into things you will never notice — and that is the point. Every edge is skived thinner so the seams lie flat. Load-bearing seams are saddle-stitched with two needles and beeswaxed linen thread, seven stitches to the centimetre. If one stitch breaks, the seam holds." },
      { t: "quote", text: "A good bag is quiet. You should notice it in ten years, not on the first day.", by: "Élise Moreau" },
      { t: "figure", view: "hardware", tone: "#3B2519", texture: "smooth", caption: "Solid brass clasp, screwed — never glued" },
      { t: "p", text: "The edges are painted in three layers, sanded between each, until they feel like polished wood. The champagne-gold clasp is screwed into place. Then the bag goes to Sofia Rinaldi in Florence for the forty-two-point inspection, and only after her approval does Élise stamp her initials inside." },
      { t: "h", text: "Signed, and recorded" },
      { t: "p", text: "Since this season, that signature is also digital. Every bag leaves the atelier with a Digital Passport: who made it, when, from which hide, and how many hours it took. Scan the card inside and the story is there — and it keeps growing with every repair." },
    ],
  },
  {
    slug: "how-to-care-for-full-grain-leather",
    category: "CARE",
    title: "How to care for full-grain leather",
    dek: "Five minutes, twice a year. Everything you need to keep a leather bag for decades.",
    date: "2026-10-02",
    minutes: 4,
    author: "Client Services",
    hero: { view: "macro", tone: "#5A3A26", texture: "grain", caption: "Full-grain calfskin, Tuscany" },
    products: ["l-essentiel", "le-zen", "la-bella"],
    body: [
      { t: "p", text: "Full-grain leather is the outer layer of the hide, left intact. It is the strongest leather there is, and it is alive in the way only natural materials are: it breathes, it darkens, it remembers how you carry it. Care for it is less about protection than about letting it age well." },
      { t: "h", text: "Every week" },
      { t: "list", items: ["Wipe with a dry, soft cloth to lift dust.", "Empty the bag now and then so the base does not stretch.", "Let rain dry naturally, away from radiators. Never use a hair dryer."] },
      { t: "h", text: "Twice a year" },
      { t: "p", text: "Apply a pea-sized amount of neutral conditioning cream to a soft cloth and work it in small circles, a panel at a time. Leave it overnight. The leather drinks what it needs; buff away the rest in the morning." },
      { t: "quote", text: "Condition less than you think. Leather that is fed too often goes soft and loses its shape." },
      { t: "h", text: "Storing it" },
      { t: "p", text: "Fill the bag with tissue so it keeps its silhouette, place it in its cotton dust bag and stand it upright. Avoid plastic, which traps moisture, and long stretches of direct sun, which fade the colour unevenly." },
      { t: "figure", view: "box", tone: "#3B2519", ground: "#E3DACB", caption: "Tissue, dust bag and box — the bag's resting place" },
      { t: "p", text: "And if something does go wrong — a scuffed corner, a loose stitch, a handle that has done its years — bring it back. Our atelier repairs every piece for life, and the first repair within two years is on us." },
    ],
  },
  {
    slug: "patina-explained",
    category: "MATERIALS",
    title: "Patina, explained",
    dek: "Why a ten-year-old leather bag can be more beautiful than a new one — and how to see it before you buy.",
    date: "2026-09-21",
    minutes: 5,
    author: "The Maison",
    hero: { view: "front", tone: "#2E1B12", ground: "#E6DED2", texture: "grain", caption: "Le Signature after ten years of daily use" },
    products: ["le-signature", "la-luna"],
    body: [
      { t: "p", text: "Patina is the record of a life. Light, the oils of your hands and the friction of daily use slowly change the surface of leather: it darkens by a shade, gains a soft sheen at the handle and the flap, and settles into creases that are entirely its own." },
      { t: "p", text: "Only certain leathers patinate well. Corrected-grain and coated leathers are sealed behind a layer of pigment; they look the same on day one and day one thousand, until they crack. Full-grain, vegetable- or lightly-tanned leathers are left open, so they can change." },
      { t: "h", text: "What changes, and when" },
      { t: "list", items: ["Year one — the leather softens where you hold it, and a first sheen appears.", "Year five — the colour deepens noticeably; creases follow the bag's shape.", "Year ten — a burnished surface no other bag shares."] },
      { t: "quote", text: "We choose every material for how it will look in ten years, not ten weeks." },
      { t: "p", text: "Because it is hard to imagine a decade from a photograph, every leather piece on our boutique now has a Patina Preview. Drag through the years and see how your colour will age — espresso warms toward chestnut, black deepens to ink, olive turns to bronze." },
      { t: "figure", view: "macro", tone: "#4A2E1F", texture: "grain", caption: "Surface after five years — sheen at the grain's peaks" },
    ],
  },
  {
    slug: "why-we-weave-jute-twice-as-tight",
    category: "MATERIALS",
    title: "Why we weave jute twice as tight",
    dek: "A humble fibre, given the discipline of a leather bag.",
    date: "2026-09-08",
    minutes: 4,
    author: "The Atelier",
    hero: { view: "macro", tone: "#C8B28A", texture: "weave", caption: "Double-density jute weave, bound in leather" },
    products: ["le-rivage", "la-dune"],
    body: [
      { t: "p", text: "Jute is one of the oldest fibres there is: strong, renewable and beautiful in raw light. It is also, usually, loose — woven for sacks, not for objects meant to last. When Nadia Haddad first proposed a jute bag, the brief was simple: make it hold its shape for years, not seasons." },
      { t: "h", text: "Twice the density" },
      { t: "p", text: "We source long-staple jute and weave it flat at roughly twice the usual density. The tighter weave resists sagging and snagging, and takes a cleaner edge when cut." },
      { t: "figure", view: "front", tone: "#C8B28A", ground: "#6E5B45", texture: "weave", caption: "Le Rivage — jute framed in vegetable-tanned leather" },
      { t: "h", text: "Framed in leather" },
      { t: "p", text: "Every edge is bound in vegetable-tanned leather and saddle-stitched, six stitches to the centimetre. The base is structured leather, so the bag stands on its own. Hardware is solid brass." },
      { t: "quote", text: "The jute brings the light. The leather brings the backbone.", by: "Nadia Haddad" },
      { t: "p", text: "With time the jute lightens slightly in the sun while the leather trim darkens, so the two drift further apart in tone — a contrast that only improves. Keep it dry and brush it lightly, and it will be ready for many summers." },
    ],
  },
  {
    slug: "the-weekend-edit-packing-le-voyage",
    category: "TRAVEL",
    title: "The weekend edit: packing Le Voyage",
    dek: "Two days, one bag, nothing forgotten. How our Client Advisors pack for a weekend away.",
    date: "2026-08-27",
    minutes: 3,
    author: "Client Services",
    hero: { view: "lifestyle", tone: "#1D2231", ground: "#35302A", caption: "Le Voyage in midnight, Gare du Nord" },
    products: ["le-voyage", "le-grand", "la-nova"],
    body: [
      { t: "p", text: "Le Voyage was designed around a simple test: a laptop and two days away. Its interior is 44 by 30 by 18 centimetres, framed in full-grain leather with waxed canvas that shrugs off weather." },
      { t: "h", text: "The advisor's list" },
      { t: "list", items: ['A 14" laptop in the padded back sleeve.', "Two shirts, rolled — never folded.", "A cashmere layer for the train.", "The linen pouch for toiletries.", "A small evening piece, flat at the base, for dinner."] },
      { t: "p", text: "Unsure if your own things will fit? Every product page now has a Will It Fit? checker. Choose what you carry — phone, laptop, water bottle, sunglasses — and we turn each object inside the bag's real interior to see what fits, what is snug, and what needs a larger piece." },
      { t: "quote", text: "Pack the evening bag first. It is the one people forget, and the one they always want." },
      { t: "figure", view: "interior", tone: "#1D2231", ground: "#CFC4B4", caption: "Interior — linen lining, padded sleeve" },
    ],
  },
  {
    slug: "meet-the-inspector-forty-two-points",
    category: "MAISON",
    title: "Meet the inspector: forty-two points",
    dek: "Sofia Rinaldi has the final word on every bag we make. She says no more often than you would think.",
    date: "2026-08-12",
    minutes: 5,
    author: "The Maison",
    hero: { view: "side", tone: "#3B2519", ground: "#DAD1C3", texture: "grain", caption: "Inspection under raking light, Florence" },
    products: ["le-noir", "l-eclat"],
    body: [
      { t: "p", text: "Before a bag can be signed, it goes to Florence, to a long table under a single raking lamp. Sofia Rinaldi has inspected Le Sac Doré pieces since 2010. She checks forty-two points, always in the same order." },
      { t: "h", text: "What she looks for" },
      { t: "list", items: ["Stitch tension, seam by seam — no stitch looser than its neighbour.", "Edge paint: three layers, no ridges, no bubbles.", "Clasp alignment to within half a millimetre.", "Symmetry of the handle drop, measured, not judged by eye.", "The lining: no puckering at the corners, ever."] },
      { t: "quote", text: "If I hesitate, it goes back. A bag should never make me hesitate.", by: "Sofia Rinaldi" },
      { t: "p", text: "About one bag in twelve goes back to the bench. It is not failure; it is the system working. The artisan corrects it, and it comes back to the same table." },
      { t: "p", text: "Her name is recorded in every Digital Passport, beside the artisan who made the piece. Two signatures, one bag." },
    ],
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
export const JOURNAL_CATEGORIES = ["ALL", "CRAFT", "CARE", "MATERIALS", "TRAVEL", "MAISON"] as const;
export const fmtJournalDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" });

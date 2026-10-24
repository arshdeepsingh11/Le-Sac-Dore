// All catalogue & editorial content, ported verbatim from the LE SAC DORÉ™ artifact.

export type ColorName =
  | "Black"
  | "Espresso"
  | "Ivory"
  | "Burgundy"
  | "Olive"
  | "Taupe"
  | "Midnight"
  | "Muted Rose"
  | "Deep Navy"
  | "Natural";

export type Texture = "grain" | "weave" | "fine" | "quilt" | "smooth";
export type View = "front" | "side" | "back" | "interior" | "hardware" | "macro" | "lifestyle" | "scale" | "box";
export type MaterialKey = "leather" | "suede" | "jute" | "canvas" | "linen" | "textile";
export type Category = "signature" | "leather" | "essentiel" | "evening" | "travel" | "textile" | "atelier";
export type FilterKey = "all" | "new" | "leather" | "textile" | "evening" | "travel" | "signature" | "essentiel" | "atelier";

export interface Product {
  id: string;
  name: string;
  material: string;
  mats: MaterialKey[];
  price: number;
  colors: ColorName[];
  cats: Category[];
  isNew?: boolean;
  texture?: Texture;
  dims: string;
  desc: string;
}

export const COLORS: Record<ColorName, string> = {
  Black: "#161412",
  Espresso: "#3B2519",
  Ivory: "#EDE6DA",
  Burgundy: "#5A2029",
  Olive: "#4A5240",
  Taupe: "#8C8176",
  Midnight: "#1D2231",
  "Muted Rose": "#B89089",
  "Deep Navy": "#22304A",
  Natural: "#C8B28A",
};

export const LIGHT: ColorName[] = ["Ivory", "Natural", "Muted Rose"];

export const PRODUCTS: Product[] = [
  { id: "le-signature", name: "LE SIGNATURE", material: "Full-Grain Leather", mats: ["leather"], price: 895, colors: ["Espresso", "Black", "Burgundy", "Olive"], cats: ["signature", "leather"], dims: "W 30 × H 22 × D 12 cm", desc: "A sculptural silhouette crafted from supple full-grain leather, designed to develop character with time." },
  { id: "la-bella", name: "LA BELLA", material: "Full-Grain Leather", mats: ["leather"], price: 795, colors: ["Ivory", "Taupe", "Black"], cats: ["signature", "leather", "essentiel"], dims: "W 28 × H 20 × D 10 cm", desc: "A softly structured top-handle with a gentle curve, finished with hand-painted edges." },
  { id: "la-luna", name: "LA LUNA", material: "Soft Leather", mats: ["leather", "suede"], price: 850, colors: ["Olive", "Espresso", "Muted Rose"], cats: ["leather"], isNew: true, dims: "W 34 × H 24 × D 11 cm", desc: "A crescent shoulder bag in soft nappa, lined in suede and cut to fall close to the body." },
  { id: "l-eclat", name: "L'ÉCLAT", material: "Textured Leather", mats: ["leather"], price: 920, colors: ["Black", "Burgundy", "Deep Navy"], cats: ["leather", "evening"], dims: "W 24 × H 15 × D 7 cm", desc: "A compact evening piece in pebbled calfskin with a single champagne-gold bar clasp." },
  { id: "le-noir", name: "LE NOIR", material: "Quilted Leather", mats: ["leather"], texture: "quilt", price: 1150, colors: ["Black", "Burgundy"], cats: ["evening", "leather", "atelier"], isNew: true, dims: "W 26 × H 17 × D 8 cm", desc: "Lambskin quilted by hand in a fine diagonal, carried on a slim leather-wrapped chain." },
  { id: "le-voyage", name: "LE VOYAGE", material: "Leather + Canvas", mats: ["canvas", "leather"], texture: "weave", price: 1250, colors: ["Midnight", "Taupe"], cats: ["travel", "textile"], dims: "W 44 × H 30 × D 18 cm", desc: "Waxed cotton canvas framed in full-grain leather, sized for a laptop and two days away." },
  { id: "le-rivage", name: "LE RIVAGE", material: "Jute + Leather", mats: ["jute", "leather"], texture: "weave", price: 695, colors: ["Natural"], cats: ["textile", "atelier"], isNew: true, dims: "W 38 × H 28 × D 14 cm", desc: "Tightly woven natural jute bound in vegetable-tanned leather at every edge." },
  { id: "l-essentiel", name: "L'ESSENTIEL", material: "Smooth Leather", mats: ["leather"], texture: "smooth", price: 750, colors: ["Black", "Taupe", "Ivory", "Espresso"], cats: ["leather", "essentiel"], dims: "W 32 × H 25 × D 12 cm", desc: "An everyday tote in smooth calfskin, unlined for lightness, with a zipped inner pocket." },
  { id: "la-vela", name: "LA VELA", material: "Premium Leather", mats: ["leather", "suede"], price: 895, colors: ["Taupe", "Espresso", "Olive"], cats: ["leather", "signature"], dims: "W 31 × H 23 × D 13 cm", desc: "A trapeze silhouette with suede side panels and a hand-stitched top handle." },
  { id: "le-zen", name: "LE ZEN", material: "Full-Grain Leather", mats: ["leather"], price: 650, colors: ["Espresso", "Black", "Natural"], cats: ["leather", "essentiel"], dims: "W 22 × H 16 × D 6 cm", desc: "A small crossbody reduced to its essentials: one compartment, one pocket, one strap." },
  { id: "la-nova", name: "LA NOVA", material: "Premium Textile", mats: ["textile", "linen"], texture: "fine", price: 725, colors: ["Deep Navy", "Ivory", "Muted Rose"], cats: ["textile", "evening"], isNew: true, dims: "W 25 × H 16 × D 6 cm", desc: "A silk-cotton jacquard clutch lined in linen, with a detachable leather wrist strap." },
  { id: "le-grand", name: "LE GRAND", material: "Leather Travel Bag", mats: ["leather", "linen"], price: 1450, colors: ["Espresso", "Black", "Midnight"], cats: ["travel", "leather"], dims: "W 52 × H 30 × D 24 cm", desc: "A weekend bag in full-grain leather with a linen-lined interior and solid brass feet." },
  { id: "la-dune", name: "LA DUNE", material: "Jute + Suede", mats: ["jute", "suede"], texture: "weave", price: 745, colors: ["Natural", "Taupe"], cats: ["textile", "atelier"], isNew: true, dims: "W 30 × H 26 × D 12 cm", desc: "A structured bucket of woven jute, trimmed in suede and closed with a leather drawcord." },
];

export const FILTERS: [FilterKey, string][] = [
  ["all", "ALL"],
  ["new", "NEW ARRIVALS"],
  ["leather", "LEATHER"],
  ["textile", "TEXTILE"],
  ["evening", "EVENING"],
  ["travel", "TRAVEL"],
  ["signature", "SIGNATURE"],
];

export const COLLECTIONS: { key: FilterKey; name: string; line: string; tone: string; ground: string }[] = [
  { key: "signature", name: "LA COLLECTION SIGNATURE", line: "Timeless leather silhouettes.", tone: "#3B2519", ground: "#2A1E17" },
  { key: "essentiel", name: "L'ESSENTIEL", line: "Quiet luxury for everyday life.", tone: "#8C8176", ground: "#2F2923" },
  { key: "evening", name: "LE SOIR", line: "Evening pieces.", tone: "#161412", ground: "#3A1A20" },
  { key: "travel", name: "LE VOYAGE", line: "Designed for movement.", tone: "#1D2231", ground: "#35302A" },
  { key: "atelier", name: "L'ATELIER", line: "Material-driven limited pieces.", tone: "#C8B28A", ground: "#4A3C2E" },
];

export const VIEWS: [View, string][] = [
  ["front", "01 Front"],
  ["side", "02 Side"],
  ["back", "03 Back"],
  ["interior", "04 Interior"],
  ["hardware", "05 Hardware"],
  ["macro", "06 Material macro"],
  ["lifestyle", "07 Lifestyle"],
  ["scale", "08 Scale reference"],
];

export const INSIDE = [
  { key: "laptop", label: "Laptop", fit: 'Back sleeve · up to 13"', zone: "PADDED SLEEVE", l: "5%", t: "6%", w: "90%", h: "18%" },
  { key: "passport", label: "Passport", fit: "Zipped inner pocket", zone: "ZIP POCKET", l: "5%", t: "30%", w: "26%", h: "28%" },
  { key: "phone", label: "Phone", fit: "Slip pocket, suede-lined", zone: "SLIP POCKET", l: "35%", t: "30%", w: "17%", h: "28%" },
  { key: "wallet", label: "Wallet", fit: "Main compartment, front", zone: "MAIN", l: "56%", t: "30%", w: "39%", h: "28%" },
  { key: "cosmetics", label: "Cosmetics", fit: "Removable linen pouch", zone: "POUCH", l: "5%", t: "64%", w: "40%", h: "30%" },
  { key: "sunglasses", label: "Sunglasses", fit: "Structured side well", zone: "SIDE WELL", l: "49%", t: "64%", w: "28%", h: "30%" },
  { key: "keys", label: "Keys", fit: "Brass key clip", zone: "KEY CLIP", l: "81%", t: "64%", w: "14%", h: "30%" },
];

export interface Material {
  key: MaterialKey;
  label: string;
  title: string;
  text: string;
  tone: string;
  tex: Texture;
  origin: string;
  facts: [string, string][];
}

export const MATERIALS: Material[] = [
  { key: "leather", label: "LEATHER", title: "FULL-GRAIN LEATHER", text: "Selected for its natural character, durability and ability to develop a richer patina over time.", tone: "#5A3A26", tex: "grain", origin: "CALFSKIN · TUSCANY", facts: [["TANNAGE", "Vegetable and chrome-free options"], ["THICKNESS", "1.4–1.8 mm"], ["AGEING", "Deepens and softens with use"]] },
  { key: "suede", label: "SUEDE", title: "CALF SUEDE", text: "A napped finish with a soft, matte hand, brushed after tanning for depth of colour.", tone: "#8C7560", tex: "fine", origin: "CALF SUEDE · FRANCE", facts: [["USE", "Linings and side panels"], ["FINISH", "Water-repellent treatment"], ["CARE", "Brush with the grain"]] },
  { key: "jute", label: "JUTE", title: "NATURAL JUTE", text: "Tightly woven from long-staple fibre, then bound in leather at every edge for structure.", tone: "#C8B28A", tex: "weave", origin: "WOVEN JUTE · BANGLADESH", facts: [["WEAVE", "Double-density flat weave"], ["EDGES", "Vegetable-tanned leather binding"], ["CARE", "Keep dry; brush lightly"]] },
  { key: "canvas", label: "CANVAS", title: "WAXED CANVAS", text: "A dense cotton canvas, waxed for resistance to weather and the wear of travel.", tone: "#2A3140", tex: "weave", origin: "COTTON CANVAS · SCOTLAND", facts: [["WEIGHT", "18 oz"], ["FINISH", "Paraffin and beeswax"], ["AGEING", "Develops soft creases"]] },
  { key: "linen", label: "LINEN", title: "BELGIAN LINEN", text: "Used for our linings: breathable, strong and quieter to the touch than synthetics.", tone: "#D9CFBF", tex: "fine", origin: "FLAX LINEN · BELGIUM", facts: [["USE", "Interior linings"], ["FIBRE", "100% flax"], ["FINISH", "Stone-washed"]] },
  { key: "textile", label: "TEXTILE", title: "SILK-COTTON JACQUARD", text: "Woven on jacquard looms in a silk-cotton blend, developed for our evening pieces.", tone: "#22304A", tex: "fine", origin: "JACQUARD · COMO", facts: [["BLEND", "60% silk, 40% cotton"], ["USE", "Evening and clutch"], ["CARE", "Store flat, away from light"]] },
];

export const TIMELINE: { title: string; text: string; view: View; tone: string; tex: Texture; cap: string }[] = [
  { title: "MATERIAL SELECTION", text: "Each hide is inspected by hand under daylight. We use only the centre of the skin, where the grain is tightest.", view: "macro", tone: "#5A3A26", tex: "grain", cap: "Hides laid out under north light" },
  { title: "PATTERN DEVELOPMENT", text: "Patterns are drafted on card and refined over several prototypes until every seam falls where it should.", view: "back", tone: "#D9CFBF", tex: "fine", cap: "Card patterns and a toile prototype" },
  { title: "CUTTING", text: "Every panel is cut by hand with a round knife, following the direction of the grain.", view: "macro", tone: "#3B2519", tex: "grain", cap: "Round knife on full-grain calf" },
  { title: "CONSTRUCTION", text: "Panels are skived, glued and assembled. Load-bearing seams are saddle-stitched with two needles.", view: "interior", tone: "#3B2519", tex: "grain", cap: "Assembly on the bench" },
  { title: "HAND FINISHING", text: "Edges are sanded, painted and polished in three layers. Hardware is fitted and screwed, never glued.", view: "hardware", tone: "#3B2519", tex: "smooth", cap: "Edge paint and brass fittings" },
  { title: "QUALITY INSPECTION", text: "A second artisan checks forty-two points, from stitch tension to clasp alignment, before approval.", view: "side", tone: "#3B2519", tex: "grain", cap: "Inspection under raking light" },
  { title: "FINAL PRESENTATION", text: "The bag is stuffed with tissue, wrapped in its dust bag and placed in the signature box with its numbered card.", view: "box", tone: "#3B2519", tex: "grain", cap: "Signature box and ribbon" },
];

export const STORES = [
  { city: "TORONTO", name: "Yorkville", address: "128 Cumberland Street\nToronto, ON M5R 1A6", hours: "Mon–Sat 10:00–19:00\nSun 12:00–17:00", phone: "+1 416 555 0148" },
  { city: "MONTRÉAL", name: "Sherbrooke Ouest", address: "1455 rue Sherbrooke Ouest\nMontréal, QC H3G 1L2", hours: "Mon–Sat 10:00–18:00\nSun 12:00–17:00", phone: "+1 514 555 0172" },
  { city: "VANCOUVER", name: "Alberni", address: "1011 Alberni Street\nVancouver, BC V6E 1A1", hours: "Mon–Sat 10:00–19:00\nSun 11:00–18:00", phone: "+1 604 555 0190" },
  { city: "PARIS", name: "Faubourg Saint-Honoré", address: "14 rue du Faubourg Saint-Honoré\n75008 Paris", hours: "Mon–Sat 10:30–19:00\nClosed Sunday", phone: "+33 1 55 55 01 20" },
  { city: "NEW YORK", name: "Madison Avenue", address: "960 Madison Avenue\nNew York, NY 10021", hours: "Mon–Sat 10:00–18:00\nSun 12:00–17:00", phone: "+1 212 555 0133" },
  { city: "LONDON", name: "Mount Street", address: "21 Mount Street\nLondon W1K 2RR", hours: "Mon–Sat 10:00–18:30\nSun 12:00–17:00", phone: "+44 20 5555 0144" },
];

export type ServiceKey = "contact" | "shipping" | "returns" | "care" | "repairs" | "warranty" | "faq";

export const SERVICES: Record<ServiceKey, [string, [string, string][]]> = {
  contact: ["CONTACT", [["CLIENT ADVISORS", "Monday to Saturday, 9:00–19:00 ET. +1 416 555 0100 · clientservices@lesacdore.com"], ["PRIVATE APPOINTMENTS", "Visit a boutique with an advisor and the pieces you are considering set aside. Appointments last one hour."], ["CORRESPONDENCE", "We reply to every message within one business day."]]],
  shipping: ["SHIPPING & DELIVERY", [["CANADA", "Complimentary on orders over $1,000 CAD. Standard delivery in 2–5 business days; $35 CAD below the threshold."], ["EXPRESS", "Next business day to major Canadian cities for $45 CAD, when ordered before 13:00 ET."], ["INTERNATIONAL", "Delivered to the United States, United Kingdom and European Union. Duties are calculated at checkout."]]],
  returns: ["RETURNS", [["30 DAYS", "Return any unused piece within 30 days of delivery, in its original packaging, for a full refund."], ["COLLECTION", "We arrange courier collection from your address at no cost."], ["REFUNDS", "Issued to the original payment method within 5 business days of inspection."]]],
  care: ["CARE GUIDE", [["LEATHER", "Wipe with a dry, soft cloth. Condition twice a year with a neutral cream. Avoid prolonged sunlight."], ["SUEDE", "Brush gently with the grain. Treat marks with a suede eraser; never use water."], ["JUTE & TEXTILE", "Keep dry. Brush lightly to remove dust and store away from humidity."], ["STORAGE", "Stuff with tissue to hold the shape and keep in the dust bag, standing upright."]]],
  repairs: ["REPAIRS", [["FOR THE LIFE OF THE BAG", "Our atelier repairs stitching, edge paint, handles, hardware and linings on every Le Sac Doré piece."], ["HOW IT WORKS", "Book online or in boutique. We send an assessment and quote within 7 days."], ["FIRST TWO YEARS", "The first repair within two years of purchase is complimentary."]]],
  warranty: ["WARRANTY", [["TWO YEARS", "Every piece is covered for two years against defects in materials and construction."], ["AUTHENTICATION", "Each bag carries a numbered authentication card. Register it to your account to activate the warranty."]]],
  faq: ["FAQ", []],
};

export const FAQ: [string, string][] = [
  ["How long does delivery take?", "Standard delivery within Canada takes 2–5 business days. Express delivery arrives the next business day to major cities."],
  ["Can I have a piece personalised?", "Hot-stamped initials are available in boutique on most leather pieces, and take around 20 minutes."],
  ["Do you offer gift packaging?", "Every order arrives in our signature box with ivory tissue, a cotton dust bag and a grosgrain ribbon. A handwritten card can be added at checkout."],
  ["How do I know my bag is authentic?", "Each piece has a numbered authentication card and the maker’s initials stamped inside. Client Services can verify any number."],
  ["Can I exchange a colour?", "Yes. Exchanges are accepted within 30 days, subject to availability."],
];

export const PACKAGING: [string, string][] = [
  ["01", "The signature box, in ivory board with a champagne-gold foil mark"],
  ["02", "Ivory tissue, folded by hand"],
  ["03", "A branded dust bag in undyed cotton"],
  ["04", "A numbered authentication and care card"],
  ["05", "A grosgrain ribbon, tied at dispatch"],
];

export const CRAFT_FIGURES: [number, string][] = [
  [7, "STAGES"],
  [40, "HOURS OF HANDWORK"],
  [1, "ARTISAN PER BAG"],
];

export const MACROS: [string, View, string, Texture, boolean][] = [
  ["LEATHER GRAIN", "macro", "#5A3A26", "grain", false],
  ["HAND STITCHING", "macro", "#3B2519", "grain", true],
  ["EDGE FINISHING", "macro", "#291A13", "smooth", true],
  ["BRASS HARDWARE", "hardware", "#3B2519", "smooth", false],
  ["ZIPPERS", "hardware", "#161412", "fine", false],
  ["LINING", "macro", "#D9CFBF", "fine", false],
  ["HANDLES", "side", "#3B2519", "grain", false],
  ["CUTTING", "macro", "#8C7560", "grain", false],
  ["CONSTRUCTION", "interior", "#3B2519", "grain", false],
];

export const JUTE_NOTES: [string, string][] = [
  ["BORDERS", "Vegetable-tanned leather on every edge"],
  ["SILHOUETTE", "Structured with a leather base"],
  ["HARDWARE", "Solid brass, champagne-gold finish"],
  ["STITCHING", "Saddle-stitched, 6 per cm"],
];

export const PILLARS: [string, string][] = [
  ["DESIGN", "We draw fewer bags and revise each one for longer. A silhouette is released only when nothing more can be taken away."],
  ["MATERIALS", "Every material is chosen for how it will look in ten years, not ten weeks: leather, suede, canvas, linen, silk and, in selected pieces, jute."],
  ["CRAFTSMANSHIP", "One artisan makes each bag from start to finish and signs it inside. Load-bearing seams are stitched by hand."],
  ["LONGEVITY", "We repair what we make, for as long as you own it. Spare hardware and hides are kept for every model in production."],
  ["MODERN LUXURY", "Quiet design, clear pricing and service that continues long after the purchase."],
];

export const PRACTICES: [string, string][] = [
  ["MATERIAL CHOICES", "Leathers come from tanneries certified by the Leather Working Group. The origin of each material is listed on its product page."],
  ["DURABILITY", "Every model is tested to 10,000 handle-lift cycles and a 6 kg static load before release."],
  ["REPAIR", "Repairs are offered for the life of the bag. The first repair within two years is complimentary."],
  ["LONGEVITY", "A two-year warranty covers materials and construction. Spare parts are stocked for every current model."],
  ["PACKAGING", "Boxes are FSC-certified board. Dust bags are undyed cotton. There is no plastic in the box."],
  ["RESPONSIBLE SOURCING", "Suppliers sign our code of conduct and are visited in person at least once a year."],
];

export const PROVINCES = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Québec", "Saskatchewan"];
export const COUNTRIES = ["Canada", "United States", "France", "United Kingdom"];

export const SEARCH_SUGGESTIONS = ["LEATHER", "NEW ARRIVALS", "BLACK", "TRAVEL", "EVENING", "JUTE", "SIGNATURE"];

/* ───────────── helpers ───────────── */

export const byId = (id: string): Product => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
export const findProduct = (id: string): Product | undefined => PRODUCTS.find((p) => p.id === id);
export const isLight = (c: ColorName) => LIGHT.includes(c);
export const groundFor = (c: ColorName) => (isLight(c) ? "#3A2E26" : "#E6DED2");
export const ground2For = (c: ColorName) => (isLight(c) ? "#2A211B" : "#D6CCBD");
export const fmt = (n: number) =>
  "$" + n.toLocaleString("en-CA", Number.isInteger(n) ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " CAD";
export const pad2 = (n: number) => String(n).padStart(2, "0");

const strip = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((x) =>
    q.split(/\s+/).every((tok) =>
      strip([x.name, x.material, x.colors.join(" "), x.cats.join(" "), x.mats.join(" "), x.isNew ? "new arrivals" : ""].join(" ")).includes(strip(tok)),
    ),
  );
}

export function filterProducts(f: FilterKey, sort: string): Product[] {
  let list = PRODUCTS.filter((x) => f === "all" || (f === "new" ? x.isNew : x.cats.includes(f as Category)));
  if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "new") list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  return list;
}

export function totals(sub: number, ship: "standard" | "express") {
  const std = sub === 0 || sub >= 1000 ? 0 : 35;
  const coShip = ship === "express" ? 45 : std;
  const tax = Math.round(sub * 0.13);
  return { sub, std, coShip, tax, total: sub + std + tax, coTotal: sub + coShip + tax };
}

/* ───────────── Artisans & passports ───────────── */

export interface Artisan {
  id: string;
  name: string;
  initials: string;
  atelier: string;
  since: number;
  speciality: string;
}

export const ARTISANS: Artisan[] = [
  { id: "em", name: "Élise Moreau", initials: "É.M.", atelier: "Paris atelier", since: 2011, speciality: "Structured silhouettes and hand-painted edges" },
  { id: "mb", name: "Matteo Bianchi", initials: "M.B.", atelier: "Florence atelier", since: 2008, speciality: "Saddle stitching and full-grain calf" },
  { id: "cl", name: "Clara Lefèvre", initials: "C.L.", atelier: "Paris atelier", since: 2015, speciality: "Quilting and lambskin" },
  { id: "jt", name: "Jules Tremblay", initials: "J.T.", atelier: "Montréal atelier", since: 2013, speciality: "Travel pieces and waxed canvas" },
  { id: "na", name: "Nadia Haddad", initials: "N.H.", atelier: "Paris atelier", since: 2017, speciality: "Jute weaving and leather binding" },
  { id: "sr", name: "Sofia Rinaldi", initials: "S.R.", atelier: "Florence atelier", since: 2010, speciality: "Final inspection — 42-point check" },
];

export const artisanById = (id: string) => ARTISANS.find((a) => a.id === id) ?? ARTISANS[0];

/** Hours of handwork per piece (artisan's bench time). */
export const HOURS: Record<string, number> = {
  "le-signature": 40, "la-bella": 34, "la-luna": 36, "l-eclat": 30, "le-noir": 46, "le-voyage": 52,
  "le-rivage": 28, "l-essentiel": 26, "la-vela": 38, "le-zen": 18, "la-nova": 22, "le-grand": 58, "la-dune": 30,
};

/** Short code used in passport serials, e.g. LSD-SIG-0001. */
export const SERIAL_CODE: Record<string, string> = {
  "le-signature": "SIG", "la-bella": "BEL", "la-luna": "LUN", "l-eclat": "ECL", "le-noir": "NOI", "le-voyage": "VOY",
  "le-rivage": "RIV", "l-essentiel": "ESS", "la-vela": "VEL", "le-zen": "ZEN", "la-nova": "NOV", "le-grand": "GRA", "la-dune": "DUN",
};

export const sampleSerial = (productId: string) => `LSD-${SERIAL_CODE[productId] ?? "GEN"}-0001`;

/** Parse "W 30 × H 22 × D 12 cm" → { w, h, d } in cm. */
export function parseDims(dims: string) {
  const n = dims.match(/\d+(\.\d+)?/g)?.map(Number) ?? [30, 22, 12];
  return { w: n[0], h: n[1], d: n[2] };
}

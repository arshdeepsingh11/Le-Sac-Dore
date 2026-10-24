import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { BagShot } from "@/components/bag-shot";
import { PassportView } from "@/components/features/passport-view";
import { getDb, schema as s } from "@/server/db";
import { getCurrentUser } from "@/server/auth";
import { artisanById, byId, COLORS, groundFor, MATERIALS, type ColorName } from "@/lib/data";

export const dynamic = "force-dynamic";

async function load(serial: string) {
  const db = await getDb();
  const [p] = await db.select().from(s.passports).where(eq(s.passports.serial, serial.toUpperCase())).limit(1);
  if (!p) return null;
  const owner = p.ownerUserId ? (await db.select({ name: s.users.name }).from(s.users).where(eq(s.users.id, p.ownerUserId)).limit(1))[0] : undefined;
  return { p, owner };
}

export async function generateMetadata({ params }: { params: Promise<{ serial: string }> }): Promise<Metadata> {
  const { serial } = await params;
  return { title: `Digital Passport ${serial.toUpperCase()}`, robots: { index: false } };
}

const fmtDate = (d: string | Date) => new Date(typeof d === "string" ? d + "T12:00:00" : d).toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" });
const initials = (n: string) => n.split(/\s+/).map((x) => x[0]?.toUpperCase() + ".").join(" ");

export default async function PassportPage({ params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params;
  const data = await load(serial);
  if (!data) notFound();
  const { p, owner } = data;
  const product = byId(p.productId);
  const color = (product.colors.includes(p.color as ColorName) ? p.color : product.colors[0]) as ColorName;
  const artisan = artisanById(p.artisanId);
  const inspector = artisanById(p.inspectorId);
  const material = MATERIALS.find((m) => m.key === product.mats[0]);
  const me = await getCurrentUser();
  const mine = !!me && me.id === p.ownerUserId;

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;
  const url = `${origin}/passport/${p.serial}`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#111111", light: "#00000000" }, errorCorrectionLevel: "M" });

  const warrantyEnd = p.registeredAt ? new Date(new Date(p.registeredAt).getTime() + 2 * 365 * 864e5) : null;
  const rows: [string, string][] = [
    ["PIECE", `${product.name} · ${product.material}`],
    ["COLOUR", color],
    ["MADE BY", `${artisan.name} — ${artisan.atelier}, with the maison since ${artisan.since}`],
    ["MADE ON", fmtDate(p.madeOn)],
    ["HANDWORK", `${p.hours} hours at the bench`],
    ["MATERIAL", material ? `${material.title.charAt(0) + material.title.slice(1).toLowerCase()} · ${(material.origin.split("·")[1]?.trim() ?? "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}` : product.material],
    ["INSPECTED BY", `${inspector.name} — 42-point final inspection`],
    ["OWNER", p.isSample ? "Sample passport" : owner ? `Registered to ${initials(owner.name)}` : "Not yet registered"],
    ["WARRANTY", p.isSample ? "Two years from registration" : warrantyEnd ? `Active until ${fmtDate(warrantyEnd)}` : "Activates when the bag is registered"],
  ];

  return (
    <>
      <PassportView serial={p.serial} productId={p.productId} />
      <section className="gutter mx-auto max-w-[1400px] pt-[clamp(110px,16vh,170px)] pb-[clamp(90px,12vh,140px)]">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow">DIGITAL PASSPORT</p>
          {p.isSample && <span className="border border-gold/50 px-2.5 py-1 text-[9px] tracking-[.24em] text-gold">SAMPLE</span>}
          {mine && <span className="border border-olive/40 px-2.5 py-1 text-[9px] tracking-[.24em] text-olive">YOUR BAG</span>}
        </div>
        <h1 className="display mt-4 font-mono text-[clamp(30px,5vw,64px)] leading-none tracking-[.04em]">{p.serial}</h1>

        <div className="mt-12 grid grid-cols-1 items-start gap-[clamp(32px,5vw,80px)] wide:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-parch">
              <BagShot tone={COLORS[color]} ground={groundFor(color)} caption={`${product.name} — ${color}`} size={54} />
            </div>
            <div className="flex items-center gap-5 bg-ivory p-5">
              <div className="size-[92px] shrink-0 [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: qr }} aria-label="QR code linking to this passport" />
              <p className="m-0 text-xs leading-relaxed text-body">
                This code is printed on the authentication card inside every bag. Scan it to verify the piece and see its history.
              </p>
            </div>
          </div>

          <div>
            <dl className="m-0 border-b border-ink/12">
              {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-1 gap-1 border-t border-ink/12 py-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
                  <dt className="label pt-0.5">{k}</dt>
                  <dd className="m-0 text-[15px] leading-relaxed">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex items-start gap-5 bg-ivory p-6">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-espresso font-serif text-lg tracking-[.06em] text-gold">{artisan.initials}</span>
              <div>
                <p className="m-0 font-serif text-2xl">{artisan.name}</p>
                <p className="mt-1 mb-0 text-[13px] leading-relaxed text-body">
                  {artisan.speciality}. {artisan.name.split(" ")[0]} signs the inside of every bag with the initials {artisan.initials}
                </p>
              </div>
            </div>

            <h2 className="mt-14 mb-6 text-[11px] font-semibold tracking-[.26em]">HISTORY</h2>
            <ol className="relative m-0 list-none p-0">
              <span className="absolute top-2 bottom-2 left-[5px] w-px bg-ink/15" aria-hidden />
              {p.history.map((e, i) => (
                <li key={i} className="relative grid grid-cols-[22px_minmax(0,1fr)] gap-3 pb-6">
                  <span className="relative top-1.5 size-[11px] rounded-full border border-gold" style={{ background: i === p.history.length - 1 ? "#C6A66A" : "#F7F4EE" }} />
                  <span>
                    <span className="block text-[10px] tracking-[.22em] text-taupe">
                      {fmtDate(e.date)} · {e.type}
                    </span>
                    <span className="mt-1 block text-[14px] text-body">{e.note}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/product/${product.id}?color=${encodeURIComponent(color)}`} className="btn-ink">
                VIEW {product.name}
              </Link>
              {!p.isSample && !p.ownerUserId && (
                <Link href={me ? "/account?tab=bags" : `/login?next=${encodeURIComponent("/account?tab=bags")}`} className="btn-line">
                  REGISTER THIS BAG
                </Link>
              )}
              <Link href="/services?tab=repairs" className="btn-line">
                BOOK A REPAIR
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { BagShot } from "@/components/bag-shot";
import { Hero } from "@/components/home/hero";
import { AtelierSplit, FeaturedGrid, JuteBand, MaterialsTiles, NewRail, Spotlight, Statement } from "@/components/home/sections";
import { Reveal } from "@/components/ui/reveal";
import { PACKAGING } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <Spotlight />
      <FeaturedGrid />

      <section aria-label="Form, material, purpose" className="gutter bg-espresso py-[clamp(100px,16vh,180px)] text-center text-cream">
        <Reveal>
          <p className="mb-7 text-[11px] tracking-[.32em] text-gold">TIMELESS OBJECTS. CRAFTED FOR LIFE.</p>
          <p className="display text-[clamp(40px,6vw,96px)] leading-[1.05] tracking-[.06em]">FORM. MATERIAL. PURPOSE.</p>
        </Reveal>
      </section>

      <NewRail />
      <MaterialsTiles />
      <AtelierSplit />
      <JuteBand />

      <section aria-labelledby="h-exp" className="gutter mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-[clamp(40px,6vw,100px)] py-[clamp(100px,16vh,180px)] wide:grid-cols-2">
        <Reveal className="relative aspect-[5/4]" y={40}>
          <BagShot view="box" ground="#E3DACB" caption="Signature box, ivory tissue and grosgrain ribbon on travertine" />
        </Reveal>
        <div className="flex flex-col gap-[22px]">
          <p className="eyebrow">THE LE SAC DORÉ EXPERIENCE</p>
          <h2 id="h-exp" className="display text-[clamp(38px,4vw,60px)] leading-[1.05]">
            Every piece arrives as an experience.
          </h2>
          <Reveal y={16}>
            <ul className="m-0 mt-4 flex list-none flex-col p-0">
              {PACKAGING.map(([n, t]) => (
                <li key={n} className="grid grid-cols-[48px_minmax(0,1fr)] border-t border-ink/12 py-4 text-sm">
                  <span className="pt-0.5 text-[11px] tracking-[.14em] text-gold">{n}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="h-visit" className="grid grid-cols-1 bg-olive text-cream wide:grid-cols-2">
        <div className="relative min-h-[480px]">
          <BagShot view="lifestyle" tone="#3B2519" ground="#2F3528" size={44} caption="The Yorkville boutique — limestone, oak and north light" />
        </div>
        <Reveal className="flex flex-col justify-center gap-[22px] p-[clamp(56px,8vw,120px)]">
          <p className="eyebrow text-sage">VISIT LA MAISON</p>
          <h2 id="h-visit" className="display text-[clamp(38px,4vw,62px)] leading-[1.04]">
            Private appointments, in six cities.
          </h2>
          <p className="m-0 max-w-[440px] text-[15px] leading-[1.8] text-cream/85">
            Toronto, Montréal, Vancouver, Paris, New York and London. An advisor will set aside the pieces you would like to see.
          </p>
          <div>
            <Link href="/services#stores" className="btn-light mt-2">
              FIND A BOUTIQUE
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { BagShot } from "@/components/bag-shot";
import { Reveal } from "@/components/ui/reveal";
import { pad2, PILLARS, PRACTICES } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({ title: "La Maison — Our Story & Responsibility", description: "Le Sac Doré makes bags well enough to be carried for decades: fewer designs, Leather Working Group tanneries, repairs for life, FSC packaging and no plastic in the box.", path: "/maison" });

export default function MaisonPage() {
  return (
    <>
      <section className="gutter flex min-h-[90vh] flex-col items-center justify-center pt-40 pb-[100px] text-center">
        <h1 className="display animate-lsd-in text-[clamp(56px,9vw,150px)] leading-none tracking-[.14em]">
          LE SAC DORÉ<sup className="font-sans text-[.12em] tracking-normal">™</sup>
        </h1>
        <p className="mt-9 animate-[lsd-in_1.2s_.4s_cubic-bezier(.2,.7,.2,1)_both] text-xs font-medium tracking-[.36em]">MORE THAN A BAG.</p>
      </section>

      <section className="relative aspect-[21/9] min-h-[360px]">
        <BagShot view="lifestyle" tone="#3B2519" ground="#2B211B" size={40} caption="La Maison — the Paris atelier, north light over the cutting tables" />
      </section>

      <section className="gutter mx-auto max-w-[1100px] py-[clamp(100px,16vh,180px)]">
        <Reveal>
          <p className="display text-[clamp(30px,3.4vw,50px)] leading-[1.25] text-pretty">
            Le Sac Doré was founded on a simple idea: a bag should be made well enough to be carried for decades, and designed quietly enough that you still want to. Everything we do follows from that.
          </p>
        </Reveal>
      </section>

      <section className="gutter mx-auto flex max-w-[1600px] flex-col pb-[clamp(100px,14vh,160px)]">
        {PILLARS.map(([title, text], i) => (
          <Reveal key={title} y={18}>
            <div className="grid grid-cols-1 items-baseline gap-[clamp(24px,4vw,64px)] border-t border-ink/12 py-12 wide:grid-cols-[80px_minmax(0,1fr)_minmax(0,1.2fr)]">
              <span className="text-[11px] tracking-[.24em] text-gold">{pad2(i + 1)}</span>
              <h2 className="m-0 font-serif text-[clamp(32px,3vw,46px)] font-normal tracking-[.04em]">{title}</h2>
              <p className="m-0 max-w-[520px] text-[15px] leading-[1.8] text-body">{text}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section aria-labelledby="h-resp" className="gutter bg-olive py-[clamp(100px,14vh,160px)] text-cream">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow mb-[18px] text-sage">RESPONSIBILITY</p>
          <h2 id="h-resp" className="display mb-5 max-w-[800px] text-[clamp(40px,4.4vw,68px)] leading-[1.04]">
            What we do, stated plainly.
          </h2>
          <p className="mb-16 max-w-[560px] text-sm leading-[1.8] text-cream/80">
            We make fewer claims and more commitments. Each practice below is something you can check on the product page, in the box or with Client Services.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-x-12">
            {PRACTICES.map(([k, v], i) => (
              <Reveal key={k} delay={(i % 3) * 0.08} className="flex flex-col gap-2.5 border-t border-cream/20 py-7">
                <span className="text-[11px] font-medium tracking-[.24em]">{k}</span>
                <p className="m-0 text-sm leading-[1.7] text-cream/85">{v}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

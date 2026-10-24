import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BagShot } from "@/components/bag-shot";
import { ProductCard } from "@/components/product-card";
import { ReadingProgress } from "@/components/reading-progress";
import { Reveal } from "@/components/ui/reveal";
import { byId } from "@/lib/data";
import { ARTICLES, articleBySlug, fmtJournalDate, type Block } from "@/lib/journal";
import { JsonLd } from "@/components/json-ld";
import { abs, articleLd, breadcrumbLd, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  if (!a) return { title: "Not found", robots: { index: false } };
  const m = pageMeta({ title: a.title, description: a.dek, path: `/journal/${a.slug}`, image: abs(`/journal/${a.slug}/opengraph-image`), type: "article" });
  return { ...m, openGraph: { ...m.openGraph, type: "article", publishedTime: a.date, section: a.category, authors: [a.author] } };
}

function Render({ b, first }: { b: Block; first: boolean }) {
  switch (b.t) {
    case "p":
      return (
        <p className={`my-0 text-[17px] leading-[1.85] text-body ${first ? "first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-serif first-letter:text-[64px] first-letter:leading-[.8] first-letter:text-ink" : ""}`}>
          {b.text}
        </p>
      );
    case "h":
      return <h2 className="mt-6 mb-0 font-serif text-[clamp(26px,2.6vw,34px)] font-normal tracking-[.01em]">{b.text}</h2>;
    case "quote":
      return (
        <blockquote className="my-6 border-l border-gold pl-6 wide:-mx-16 wide:my-10 wide:border-0 wide:pl-0 wide:text-center">
          <p className="m-0 font-serif text-[clamp(26px,3vw,40px)] leading-[1.25] font-light italic text-espresso">“{b.text}”</p>
          {b.by && <footer className="mt-4 text-[10px] tracking-[.26em] text-taupe">— {b.by.toUpperCase()}</footer>}
        </blockquote>
      );
    case "list":
      return (
        <ul className="m-0 flex list-none flex-col p-0">
          {b.items.map((i) => (
            <li key={i} className="grid grid-cols-[20px_minmax(0,1fr)] border-t border-ink/10 py-3 text-[16px] leading-relaxed text-body">
              <span className="pt-2.5"><span className="block size-1 rounded-full bg-gold" /></span>
              {i}
            </li>
          ))}
        </ul>
      );
    case "figure":
      return (
        <figure className="my-6 wide:-mx-24">
          <div className="relative aspect-[16/10] overflow-hidden">
            <BagShot view={b.view} tone={b.tone} ground={b.ground} texture={b.texture} size={36} />
          </div>
          <figcaption className="mt-3 text-[11px] tracking-[.14em] text-taupe uppercase">{b.caption}</figcaption>
        </figure>
      );
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articleBySlug(slug);
  if (!a) notFound();
  const idx = ARTICLES.indexOf(a);
  const next = ARTICLES[(idx + 1) % ARTICLES.length];
  const firstP = a.body.findIndex((b) => b.t === "p");

  return (
    <article>
      <JsonLd data={[articleLd(a), breadcrumbLd([["Home", "/"], ["The Journal", "/journal"], [a.title, `/journal/${a.slug}`]])]} />
      <ReadingProgress slug={a.slug} />
      <header className="gutter mx-auto max-w-[1000px] pt-[clamp(120px,18vh,180px)] text-center">
        <Link href="/journal" className="text-[10px] tracking-[.26em] text-taupe transition-colors hover:text-ink">
          THE JOURNAL
        </Link>
        <p className="mt-6 text-[10px] tracking-[.26em] text-gold">{a.category}</p>
        <h1 className="display mx-auto mt-4 max-w-[900px] animate-lsd-in text-[clamp(40px,6vw,88px)] leading-[1.02] text-balance">{a.title}</h1>
        <p className="lede mx-auto mt-6 max-w-[640px] text-[clamp(20px,2vw,26px)]">{a.dek}</p>
        <p className="mt-8 text-[10px] tracking-[.24em] text-taupe">
          {a.author.toUpperCase()} · {fmtJournalDate(a.date).toUpperCase()} · {a.minutes} MIN READ
        </p>
      </header>

      <Reveal className="gutter mx-auto mt-14 max-w-[1400px]" y={30}>
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[21/10]">
          <BagShot view={a.hero.view} tone={a.hero.tone} ground={a.hero.ground} texture={a.hero.texture} caption={a.hero.caption} size={34} />
        </div>
      </Reveal>

      <div className="gutter mx-auto flex max-w-[720px] flex-col gap-7 py-[clamp(64px,10vh,110px)]">
        {a.body.map((b, i) => (
          <Render key={i} b={b} first={i === firstP} />
        ))}
      </div>

      {a.products.length > 0 && (
        <section className="gutter bg-sand py-[clamp(80px,12vh,130px)]">
          <div className="mx-auto max-w-[1400px]">
            <p className="eyebrow mb-3">IN THIS STORY</p>
            <h2 className="display mb-12 text-[clamp(34px,3.4vw,52px)]">The pieces.</h2>
            <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 wide:grid-cols-3">
              {a.products.map((id) => (
                <ProductCard key={id} product={byId(id)} aspect="4 / 5" size={50} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="gutter mx-auto max-w-[1400px] py-[clamp(80px,12vh,130px)]">
        <p className="eyebrow mb-6">NEXT STORY</p>
        <Link href={`/journal/${next.slug}`} className="group grid grid-cols-1 items-center gap-8 wide:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <span className="display text-[clamp(32px,4vw,56px)] leading-[1.06] transition-colors duration-300 group-hover:text-burgundy">{next.title} →</span>
          <span className="relative block aspect-[16/10] overflow-hidden">
            <span className="absolute inset-0 transition-transform duration-[1400ms] ease-lux group-hover:scale-[1.03]">
              <BagShot view={next.hero.view} tone={next.hero.tone} ground={next.hero.ground} texture={next.hero.texture} size={40} />
            </span>
          </span>
        </Link>
      </section>
    </article>
  );
}

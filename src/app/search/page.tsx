import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS, searchProducts, SEARCH_SUGGESTIONS } from "@/lib/data";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const q = ((await searchParams).q ?? "").trim();
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false, follow: true } };
}

/** Server-rendered search — the target of the sitelinks search box. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const results = q ? searchProducts(q) : PRODUCTS;
  return (
    <section className="gutter mx-auto max-w-[1600px] pt-[clamp(130px,18vh,180px)] pb-[120px]">
      <p className="eyebrow mb-4">SEARCH</p>
      <h1 className="display text-[clamp(44px,5vw,80px)] leading-none">{q ? `“${q}”` : "All pieces"}</h1>
      <form action="/search" className="mt-10 max-w-[640px]">
        <label htmlFor="sq" className="sr-only">Search</label>
        <input id="sq" name="q" type="search" defaultValue={q} placeholder="Search the maison" className="w-full rounded-none border-b border-ink bg-transparent py-4 font-serif text-[28px] outline-none" />
      </form>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        {SEARCH_SUGGESTIONS.map((s) => (
          <Link key={s} href={`/search?q=${encodeURIComponent(s.toLowerCase())}`} className="py-1 text-[11px] font-medium tracking-[.22em] text-taupe hover:text-ink">{s}</Link>
        ))}
      </div>
      <p className="mt-12 mb-8 text-[11px] tracking-[.2em] text-taupe">{results.length ? `${results.length} ${results.length === 1 ? "PIECE" : "PIECES"}` : "NO RESULTS. TRY LEATHER, EVENING OR JUTE."}</p>
      <div className="grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 wide:grid-cols-3 xl:grid-cols-4">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} aspect="4 / 5" size={50} />
        ))}
      </div>
    </section>
  );
}

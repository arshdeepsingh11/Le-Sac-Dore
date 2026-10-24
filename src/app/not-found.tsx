import Link from "next/link";

export default function NotFound() {
  return (
    <section className="gutter mx-auto flex min-h-[80vh] max-w-[1100px] flex-col justify-center pt-40 pb-32">
      <p className="eyebrow mb-5">404</p>
      <h1 className="display text-[clamp(56px,8vw,128px)] leading-[.92]">This piece has moved.</h1>
      <p className="lede mt-6 text-2xl">The page you were looking for is no longer here.</p>
      <div className="mt-12">
        <Link href="/collection" className="btn-ink">
          DISCOVER LA COLLECTION
        </Link>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { dbMode } from "@/server/db";
import { overview } from "@/server/admin-queries";
import { AdminNav, SignOutButton } from "@/components/admin/client";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const o = await overview(1);
  const local = dbMode() === "local";
  return (
    <div className="min-h-screen bg-cream wide:grid wide:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 bg-night px-4 pt-4 pb-2 text-cream wide:h-screen wide:px-4 wide:py-7">
        <div className="mb-3 flex items-center justify-between wide:mb-8 wide:block wide:px-3">
          <Link href="/admin" className="block">
            <span className="block font-serif text-[17px] tracking-[.26em]">LE SAC DORÉ</span>
            <span className="mt-1 hidden text-[9px] tracking-[.3em] text-gold wide:block">MAISON CONSOLE</span>
          </Link>
          <Link href="/" className="text-[10px] tracking-[.2em] text-cream/60 wide:hidden">VIEW SITE ↗</Link>
        </div>
        <AdminNav live={o.live} pending={o.pendingReservations} />
        <div className="absolute inset-x-4 bottom-7 hidden flex-col gap-3 border-t border-cream/10 px-3 pt-5 wide:flex">
          <span className="text-[12px] text-cream/80">{admin.name}</span>
          <span className="-mt-2 truncate text-[11px] text-cream/40">{admin.email}</span>
          <Link href="/" className="text-[12px] text-cream/50 transition-colors hover:text-cream">View boutique ↗</Link>
          <SignOutButton>Sign out</SignOutButton>
        </div>
      </aside>
      <main className="min-w-0 px-4 pt-7 pb-24 wide:px-10 wide:pt-10">
        {local && (
          <div className="mb-6 border border-gold/40 bg-gold/10 px-4 py-3 text-[12px] leading-relaxed text-espresso">
            Local database (PGlite) — perfect for development. Set <code className="font-mono">DATABASE_URL</code> to a Postgres database before going live.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

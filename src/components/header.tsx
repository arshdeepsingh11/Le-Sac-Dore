"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useBagCount, useShop, useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Wordmark({ className, size }: { className?: string; size?: number }) {
  return (
    <span className={cn("font-serif font-medium whitespace-nowrap tracking-[.3em]", !size && "text-[21px]", className)} style={size ? { fontSize: size } : undefined}>
      LE SAC DORÉ<sup className="ml-px font-sans text-[7px] tracking-normal">™</sup>
    </span>
  );
}

function NavLinks() {
  const pathname = usePathname();
  const filter = useSearchParams().get("filter") ?? "all";
  const items: [string, string, boolean][] = [
    ["LA COLLECTION", "/collection", pathname === "/collection" && filter !== "new"],
    ["NEW ARRIVALS", "/collection?filter=new", pathname === "/collection" && filter === "new"],
    ["BAGS", "/collection", false],
    ["L'ATELIER", "/atelier", pathname === "/atelier"],
    ["LA MAISON", "/maison", pathname === "/maison"],
  ];
  return (
    <nav aria-label="Primary" className="hidden gap-[34px] wide:flex">
      {items.map(([label, href, active]) => (
        <Link
          key={label}
          href={href}
          className="group relative py-1.5 text-[11px] font-medium tracking-[.2em] whitespace-nowrap"
          aria-current={active ? "page" : undefined}
        >
          {label}
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 h-px origin-left bg-current transition-transform duration-500 ease-lux",
              active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
            )}
          />
        </Link>
      ))}
    </nav>
  );
}

type Mode = "hero-dark" | "hero-light" | "solid";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scrollY } = useScroll();
  const [heroMode, setHeroMode] = useState<Mode>("hero-dark");
  const bagCount = useBagCount();
  const wishCount = useShop((s) => s.wish.length);
  const hydrated = useUI((s) => s.hydrated);
  const set = useUI((s) => s.set);

  useMotionValueEvent(scrollY, "change", (y) => {
    const vh = window.innerHeight;
    const next: Mode = y > vh * 1.45 ? "solid" : y < vh * 0.665 ? "hero-dark" : "hero-light";
    if (next !== heroMode) setHeroMode(next);
  });

  const mode: Mode = isHome ? heroMode : "solid";
  const solid = mode === "solid";
  const ink = mode === "hero-dark" ? "#F7F4EE" : "#111111";

  if (pathname.startsWith("/checkout")) return null;

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 gutter"
      style={{
        color: ink,
        paddingTop: solid ? 16 : 28,
        paddingBottom: solid ? 16 : 28,
        background: solid ? "rgba(247,244,238,.82)" : "rgba(247,244,238,0)",
        borderBottom: `1px solid ${solid ? "rgba(17,17,17,.1)" : "rgba(247,244,238,0)"}`,
        backdropFilter: solid ? "saturate(180%) blur(20px)" : "none",
        WebkitBackdropFilter: solid ? "saturate(180%) blur(20px)" : "none",
        transition: "background .6s ease, color .6s ease, border-color .6s ease, padding .6s cubic-bezier(.2,.7,.2,1)",
      }}
    >
      <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-3 wide:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] wide:gap-6">
        <Link href="/" aria-label="Le Sac Doré home" className="justify-self-start">
          <Wordmark className="text-[16px] tracking-[.22em] min-[420px]:text-[18px] wide:text-[21px] wide:tracking-[.3em]" />
        </Link>

        <Suspense fallback={<span />}>
          <NavLinks />
        </Suspense>
        <span className="wide:hidden" />

        <div className="flex items-center gap-4 justify-self-end text-[10px] font-medium tracking-[.16em] whitespace-nowrap min-[420px]:text-[11px] wide:gap-6 wide:tracking-[.18em]">
          <button onClick={() => set({ search: true, menu: false })} className="py-1.5 tracking-[inherit] transition-opacity hover:opacity-60">
            SEARCH
          </button>
          <Link href="/account" className="hidden py-1.5 transition-opacity hover:opacity-60 wide:inline">
            ACCOUNT
          </Link>
          <Link href="/wishlist" className="hidden py-1.5 transition-opacity hover:opacity-60 wide:inline">
            WISHLIST ({hydrated ? wishCount : 2})
          </Link>
          <button
            onClick={() => set({ drawer: true, menu: false })}
            aria-label={`Open bag, ${bagCount} items`}
            className="py-1.5 tracking-[inherit] transition-opacity hover:opacity-60"
          >
            BAG (<span key={bagCount} className="inline-block animate-[lsd-in_.5s_ease_both]">{bagCount}</span>)
          </button>
          <button onClick={() => set({ menu: true })} aria-label="Open menu" className="py-1.5 tracking-[inherit] wide:hidden">
            MENU
          </button>
        </div>
      </div>
    </header>
  );
}

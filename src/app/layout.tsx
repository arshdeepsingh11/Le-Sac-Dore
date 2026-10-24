import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BagDrawer, MobileMenu, SearchOverlay, Toast } from "@/components/overlays";
import { Concierge } from "@/components/concierge";
import { AnalyticsTracker } from "@/components/analytics-tracker";

const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond.woff2", weight: "300 500", style: "normal" },
    { path: "../fonts/cormorant-garamond-italic.woff2", weight: "300 400", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const manrope = localFont({
  src: [{ path: "../fonts/manrope.woff2", weight: "300 600", style: "normal" }],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "LE SAC DORÉ™ — More than a bag.", template: "%s — LE SAC DORÉ™" },
  description: "Exceptional materials. Timeless silhouettes. Leather bags made by one artisan from the first cut to the final inspection.",
  applicationName: "LE SAC DORÉ",
  openGraph: { title: "LE SAC DORÉ™ — More than a bag.", description: "The art of carrying.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#F7F4EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <Providers>
          <a href="#main" className="sr-only-focusable top-2 z-[100] bg-ink px-[18px] py-3 text-xs text-ivory focus:fixed focus:left-2">
            Skip to content
          </a>
          <Header />
          <main id="main" className="min-h-screen">
            {children}
          </main>
          <Footer />
          <SearchOverlay />
          <MobileMenu />
          <BagDrawer />
          <Concierge />
          <Toast />
          <AnalyticsTracker />
        </Providers>
      </body>
    </html>
  );
}

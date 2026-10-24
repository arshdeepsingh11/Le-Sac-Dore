import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BagDrawer, MobileMenu, SearchOverlay, Toast } from "@/components/overlays";
import { Concierge } from "@/components/concierge";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { JsonLd } from "@/components/json-ld";
import { organizationLd, SITE, websiteLd } from "@/lib/seo";

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
  metadataBase: new URL(SITE.url),
  title: { default: "LE SAC DORÉ™ — Handmade Luxury Leather Handbags", template: "%s — LE SAC DORÉ™" },
  description: SITE.description,
  applicationName: "LE SAC DORÉ",
  keywords: ["luxury handbags", "leather handbags", "handmade leather bags", "full-grain leather bag", "designer handbags Canada", "luxury bags Toronto", "quiet luxury", "jute bag", "evening clutch", "leather travel bag", "Le Sac Doré"],
  authors: [{ name: "Le Sac Doré", url: SITE.url }],
  creator: "Le Sac Doré",
  publisher: "Le Sac Doré",
  category: "fashion",
  openGraph: { type: "website", siteName: "LE SAC DORÉ™", locale: SITE.locale, url: SITE.url, title: "LE SAC DORÉ™ — More than a bag.", description: SITE.description },
  twitter: { card: "summary_large_image", title: "LE SAC DORÉ™ — More than a bag.", description: SITE.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  formatDetection: { telephone: false, email: false, address: false },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION, other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined },
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
        <JsonLd data={[organizationLd(), websiteLd()]} />
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

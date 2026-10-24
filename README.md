# LE SAC DORÉ™ — More than a bag.

A complete luxury handbag boutique: storefront, accounts, orders, Digital Passports, appointments, an AI concierge, a journal and an admin console with first-party analytics. Built with **Next.js 16 + TypeScript**.

## Run locally

```bash
npm install
npm run dev            # http://localhost:3000
```

No setup needed — an embedded Postgres (PGlite) is created in `./.data` on first start.

- **Admin:** http://localhost:3000/admin → `admin@lesacdore.com` / `admin1234` (local only)
- In **Admin → Settings**, click **Load demo data** to explore the dashboard with sample customers, visits and orders. Clear it in one click.

## Go live (Vercel)

1. Create a free Postgres on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. In Vercel → Project → Environment Variables set:
   - `DATABASE_URL` — your Postgres connection string
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — your admin login
   - `ANTHROPIC_API_KEY` *(optional)* — powers Le Concierge with Claude
3. Deploy. Tables are created automatically on the first request.

## What's inside

| Area | Highlights |
|---|---|
| Storefront | Scroll-driven hero, collection filters, product gallery with zoom/fullscreen, bag drawer, search, wishlist |
| **Digital Passport** | Every bag gets a serial + QR page: artisan, materials, hours, inspection, warranty, full history (shipping and repairs are added automatically) |
| **Patina Preview** | Slider showing how each material ages over 1, 5 and 10 years |
| **Will It Fit?** | Pick phone, laptop, bottle… each item is rotated inside the bag's real interior; suggests a larger piece if needed |
| **Reserve in Boutique** | Book a boutique or video appointment; piece held 48 h |
| Accounts | Sign up / sign in, orders with tracking, My Bags (register by serial), appointments, saved wishlist across devices, editable details |
| Journal | Editorial articles with reading progress and shoppable pieces |
| Le Concierge (AI) | Streaming chat that recommends pieces as tappable cards (Claude, or an offline catalogue assistant) |
| **Admin console** `/admin` | KPIs vs previous period, traffic & revenue charts, funnel, live visitors, per-person activity timelines, **Interest** (who returns to which piece — repeat views, wishlist, bag), customers, visitors, products, orders (status → passport), appointments, subscribers, CSV exports |

## SEO, AEO & GEO

- **Metadata:** unique title, description, canonical, Open Graph and Twitter card on every page; private pages are `noindex`.
- **Structured data (JSON-LD):** Organization, WebSite + SearchAction, ProductGroup + Offer (shipping, returns), BreadcrumbList, FAQPage, BlogPosting, ItemList, Store ×6, HowTo.
- **Generated:** `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, icons, OG images per page/product/article.
- **AI engines:** `/llms.txt` and `/llms-full.txt`; AI crawlers allowed in robots; visible "At a glance" facts + FAQ on product pages.
- **Go-live:** set `NEXT_PUBLIC_SITE_URL`, verify in Google Search Console and Bing Webmaster Tools, submit `/sitemap.xml`.

## Privacy

Browsing analytics are recorded only after a visitor chooses **Accept all** in the cookie banner. Signed-in browsing is linked to the account; earlier anonymous browsing is attached at sign-up. Admin browsing is never recorded. Card numbers are never stored or sent to the server — connect Stripe for real payments.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Lenis · Zustand · Drizzle ORM · Postgres / PGlite · Anthropic SDK · Magic UI (Number Ticker, Morphing Text, Animated Circular Progress Bar)

## Structure

```
src/app/              pages, /admin console, /api routes
src/components/       storefront UI, features/, admin/, ui/ (Magic UI)
src/lib/              catalogue data, journal, client stores, analytics
src/server/           db (schema, seed), auth, tracking, admin queries
```

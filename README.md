# LE SAC DORÉ™ — More than a bag.

Premium luxury handbag storefront, rebuilt from the Claude Design artifact in **Next.js 16 (App Router) + TypeScript**.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Optional AI: copy `.env.example` → `.env.local` and set `ANTHROPIC_API_KEY`.
Without a key, the concierge still works using a built-in catalogue assistant.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 — exact artifact palette as design tokens (`src/app/globals.css`) |
| Motion | Motion (Framer Motion) — scroll-linked hero, layout animations, springs |
| Smooth scroll | Lenis (auto-disabled for reduced motion) |
| State | Zustand — cart / wishlist / orders persisted to `localStorage` (`lsd_v1`) |
| AI | Anthropic SDK, streaming `/api/concierge` (`claude-sonnet-5-5`) + offline fallback |
| Fonts | Cormorant Garamond + Manrope, self-hosted (`next/font/local`) |

## Pages

`/` Home · `/collection` (`?filter=new|leather|textile|evening|travel|signature`) · `/product/[id]` · `/cart` · `/checkout` · `/confirmation` · `/wishlist` · `/atelier` · `/materials` (`?mat=`) · `/maison` · `/account` (`?tab=`) · `/services` (`?tab=`, `#stores`)

Overlays: search, mobile menu, bag drawer, fullscreen gallery, toast, **AI concierge**.

## Magic UI components (used only where they add meaning)

- **Number Ticker** — L'Atelier figures (7 / 40 / 1), bag & checkout totals
- **Morphing Text** — concierge welcome (cycles piece names)
- **Animated Circular Progress Bar** — progress to complimentary shipping ($1,000 CAD)

## Structure

```
src/app/            routes + /api/concierge
src/components/     header, footer, overlays, concierge, product-card, bag-shot, views
src/components/ui/  number-ticker, morphing-text, animated-circular-progress-bar, reveal
src/lib/            data (catalogue & content), store, concierge (prompt + fallback), hooks
```

## Deploy

Push to GitHub → import in Vercel → add `ANTHROPIC_API_KEY` (optional).

# Wirely (Next.js + Netlify)

TypeScript storefront for Wirely Pakistan: conversion funnel, cart/checkout, SEO, scroll motion.

## Mode

The site runs in **static mode** (`STATIC_MODE = true` in `src/lib/config.ts`):

- Catalog comes from `src/lib/data/seed-products.ts`
- Product images live in `public/products/`
- Checkout confirms via WhatsApp (+ optional Resend email) — orders are **not** saved to a database
- Admin is a read-only view of the seed catalog

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Edit products

1. Add/replace images in `public/products/`
2. Update entries in `src/lib/data/seed-products.ts`
3. Refresh the site

## Netlify deploy

```bash
npm run deploy:prod
```

Or connect Git and set env vars from `.env.example` in the Netlify UI. Do **not** require Supabase vars.

## Go-live checklist

- [ ] Products & images finalized in seed files
- [ ] Netlify env vars configured (site URL, WhatsApp, analytics)
- [ ] Resend domain verified for order emails (optional)
- [ ] Turnstile keys set (optional)
- [ ] GA4 / Google Ads IDs verified
- [ ] Test advance + COD checkout + WhatsApp handoff
- [ ] Confirm 301s: `/product/:slug`, old combo slug

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Structure

- `src/app` — routes (storefront, checkout, admin, API)
- `src/components` — UI, funnel sections, motion
- `src/lib` — products, orders, coupons, email
- `src/lib/data/seed-products.ts` — static catalog
- `src/store` — Zustand cart (localStorage)
- `public/products` — product images
- `public/videos` — homepage showcase videos
- `public/hero` — hero product art

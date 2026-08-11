# Wirely (Next.js + Supabase + Netlify)

TypeScript rebuild of the Wirely Pakistan storefront: conversion funnel, cart/checkout, SEO, scroll motion, and admin CMS.

## Quick start

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase env vars the catalog uses the built-in seed products and demo checkout still works (orders are not persisted).

## Supabase setup

Short version: copy API keys into `.env.local` → run `supabase/migrations/001_initial.sql` then `002_seed_products.sql` in SQL Editor → create Auth user → set `profiles.role = 'admin'`.

## Netlify deploy

Full walkthrough: [../docs/NETLIFY_DEPLOY.md](../docs/NETLIFY_DEPLOY.md)

**Note:** Netlify’s browser drag-and-drop is static-only and will not run this Next.js app. Use:

```bash
npm run deploy:prod
```

Or connect Git with **base directory** `web`. Add env vars from `.env.example` in the Netlify UI.

## Go-live checklist

- [ ] Supabase schema + seed applied
- [ ] Admin user role set to `admin`
- [ ] Netlify env vars configured
- [ ] Resend domain verified for order emails
- [ ] Turnstile keys set (optional)
- [ ] GA4 / Google Ads IDs verified
- [ ] Test advance + COD checkout end-to-end
- [ ] Confirm 301s: `/product/:slug`, old combo slug
- [ ] DNS cutover from PHP host
- [ ] Rotate any secrets that lived in the old PHP `db_config.php`

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
- `src/lib` — products, orders, coupons, Supabase, email
- `src/store` — Zustand cart (localStorage)
- `supabase/migrations` — SQL schema + seed data

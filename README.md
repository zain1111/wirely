# Wirely (Next.js + Netlify)

TypeScript storefront for Wirely Pakistan: conversion funnel, cart/checkout, SEO, scroll motion.

## Mode

By default the site uses **Supabase** for the product catalog and **admin product editing** when these env vars are set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — required for admin saves & uploads)

If Supabase is missing, the storefront falls back to `src/lib/data/seed-products.ts`.

Set `WIRELY_STATIC_MODE=true` to force seed-only mode (no database connections).

Checkout uses **email** (Resend) for order confirmations; orders are not stored in the DB unless you extend `src/lib/orders.ts`.

## Quick start

```bash
cp .env.example .env.local
# Fill Supabase + Resend keys in .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin product editing

1. Run SQL migrations in `supabase/migrations/` (Supabase Dashboard → SQL Editor).
2. Create a user under **Authentication → Users**.
3. Set `profiles.role` to `admin` for that user in the Table Editor.
4. Sign in at `/admin/login`.
5. Edit products under **Admin → Products** (image upload uses Supabase Storage; run `007_fix_storage_rls.sql` if uploads fail).

## Netlify env vars

Copy from `.env.example`. Required for live admin editing:

| Variable | Scopes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Builds, Functions (secret) |
| `RESEND_API_KEY` | Functions |
| `ORDER_ADMIN_EMAIL` | Functions |

Redeploy after changing env vars.

## Go-live checklist

- [ ] Supabase migrations applied + admin user with `profiles.role = admin`
- [ ] Netlify env vars set (Supabase + Resend)
- [ ] Resend domain verified for `no-reply@wire-ly.shop`
- [ ] Test checkout → customer + admin emails
- [ ] Test admin product save + image upload
- [ ] GA4 / Google Ads IDs verified

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
- `src/lib` — products, orders, email, Supabase helpers
- `src/lib/data/seed-products.ts` — fallback catalog
- `src/store` — Zustand cart (localStorage)
- `supabase/migrations` — database schema & seed SQL

-- Point catalog products at the regenerated theme-matched images
-- Run in Supabase SQL Editor after deploying the new /public/products/*.webp files

update public.products
set images = '["/products/40w-charger.webp"]'::jsonb
where slug = '40w-charger';

update public.products
set images = '["/products/cable.webp"]'::jsonb
where slug = 'usb-c-cable';

update public.products
set images = '["/products/airpods-pro-2.webp"]'::jsonb
where slug = 'airpods-pro-2';

update public.products
set images = '["/products/airpods-4.webp"]'::jsonb
where slug = 'airpods-4';

update public.products
set images = '["/products/combo-charger-cable.webp"]'::jsonb
where slug = 'charger-cable-combo';

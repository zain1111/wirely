-- How the product page behaves: checkout (buy/add to cart) vs enquiry (WhatsApp only)
alter table public.products
  add column if not exists purchase_mode text not null default 'checkout';

alter table public.products drop constraint if exists products_purchase_mode_check;

alter table public.products
  add constraint products_purchase_mode_check
  check (purchase_mode in ('checkout', 'enquiry'));

-- Samsung (and any other seeded rows) should sell normally when stock > 0
update public.products
set purchase_mode = 'checkout'
where slug = 'samsung-usb-c-charger';

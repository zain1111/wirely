-- Wirely storefront schema (idempotent — safe to re-run)
-- Run in Supabase Dashboard → SQL Editor

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (admin auth)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists created_at timestamptz not null default now();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles
  for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text not null,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  badge text,
  description text not null default '',
  meta_title text,
  meta_description text,
  video_url text,
  video_thumbnail text,
  highlights jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  device_compatibility jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists product_variations_product_id_idx
  on public.product_variations (product_id);

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('fixed', 'percent')),
  value integer not null check (value > 0),
  min_order_amount integer check (min_order_amount is null or min_order_amount >= 0),
  max_discount_amount integer check (max_discount_amount is null or max_discount_amount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  subtotal_before_discount integer not null check (subtotal_before_discount >= 0),
  discount_amount integer not null default 0 check (discount_amount >= 0),
  coupon_id uuid references public.coupons (id) on delete set null,
  coupon_code text,
  payment_method text not null check (payment_method in ('advance', 'cod')),
  cod_fee integer not null default 0 check (cod_fee >= 0),
  total_price integer not null check (total_price >= 0),
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'shipped', 'completed', 'cancelled')
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  variation_id uuid references public.product_variations (id) on delete set null,
  variation_label text,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  reviewer_name text not null,
  reviewer_email text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  images_json jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected')
  ),
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_status_idx on public.product_reviews (status);
create index if not exists product_reviews_product_slug_idx on public.product_reviews (product_slug);

-- ---------------------------------------------------------------------------
-- Settings (key/value store)
-- ---------------------------------------------------------------------------

create table if not exists public.settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.product_variations enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_reviews enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
  on public.products
  for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admin manage products" on public.products;
create policy "Admin manage products"
  on public.products
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public read active variations" on public.product_variations;
create policy "Public read active variations"
  on public.product_variations
  for select
  using (
    is_active = true
    and exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.is_active = true
    )
    or public.is_admin()
  );

drop policy if exists "Admin manage variations" on public.product_variations;
create policy "Admin manage variations"
  on public.product_variations
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin manage coupons" on public.coupons;
create policy "Admin manage coupons"
  on public.coupons
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin manage settings" on public.settings;
create policy "Admin manage settings"
  on public.settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- orders, order_items, product_reviews: server-side only (service role bypasses RLS)

-- ---------------------------------------------------------------------------
-- Default settings
-- ---------------------------------------------------------------------------

insert into public.settings (key, value)
values
  ('site_logo', '/brand/logo.png'),
  ('whatsapp_number', '923431143434')
on conflict (key) do nothing;

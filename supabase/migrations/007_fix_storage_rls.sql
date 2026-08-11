-- Fix product image upload RLS for authenticated admins
-- Run this entire file in Supabase → SQL Editor

-- 1) Ensure bucket exists and is public
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2) Remove old policies (names from earlier migrations)
drop policy if exists "Public read product images" on storage.objects;
drop policy if exists "Admins upload product images" on storage.objects;
drop policy if exists "Admins update product images" on storage.objects;
drop policy if exists "Admins delete product images" on storage.objects;
drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_admin_insert" on storage.objects;
drop policy if exists "product_images_admin_update" on storage.objects;
drop policy if exists "product_images_admin_delete" on storage.objects;

-- 3) Public can read (shop needs this)
create policy "product_images_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'product-images');

-- 4) Logged-in admins can upload / manage
create policy "product_images_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "product_images_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

create policy "product_images_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- 5) Make sure YOUR user is admin (uncomment and set your email)
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');

-- Fix: profiles_role_check rejecting role = 'user'
-- Run this entire file in Supabase → SQL Editor

-- 1) Drop the broken / too-strict check constraint
alter table public.profiles drop constraint if exists profiles_role_check;

-- 2) Ensure role column exists with a safe default
alter table public.profiles
  add column if not exists role text;

update public.profiles
set role = 'user'
where role is null or role = '';

alter table public.profiles
  alter column role set default 'user';

alter table public.profiles
  alter column role set not null;

-- 3) Recreate the correct check: only 'user' or 'admin'
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

-- 4) Backfill missing profile rows
insert into public.profiles (id, role)
select u.id, 'user'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 5) Promote YOUR admin (change the email below)
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'YOUR_EMAIL@example.com'
);

-- 6) Verify
select u.email, p.role
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at desc;

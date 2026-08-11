-- Fix Supabase "Failed to create user: {}" (usually profiles trigger failure)
-- Run in Supabase Dashboard → SQL Editor

-- 1) Normalize profiles table (handles old Supabase starter schema leftovers)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- Drop legacy starter columns that block inserts (ignore errors if absent)
alter table public.profiles drop column if exists username;
alter table public.profiles drop column if exists full_name;
alter table public.profiles drop column if exists avatar_url;
alter table public.profiles drop column if exists website;
alter table public.profiles drop column if exists updated_at;

-- 2) Resilient signup trigger — must not block auth.users insert
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
exception
  when others then
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 3) Backfill profiles for any existing auth users missing a row
insert into public.profiles (id, role)
select u.id, 'user'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 4) Promote your admin (change the email below, then run)
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');

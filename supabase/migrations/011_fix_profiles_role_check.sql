-- Fix: insert/update fails with profiles_role_check for role = 'user'
-- Run this entire file in Supabase → SQL Editor, then run 010_make_user_admin.sql

alter table public.profiles drop constraint if exists profiles_role_check;

-- Drop duplicate check constraints if migrations were run twice with different names
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint if exists %I', r.conname);
  end loop;
end $$;

alter table public.profiles
  alter column role set default 'user';

update public.profiles
set role = 'user'
where role is null or btrim(role) = '';

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

-- Optional: see current constraints
-- select conname, pg_get_constraintdef(oid) from pg_constraint where conrelid = 'public.profiles'::regclass;

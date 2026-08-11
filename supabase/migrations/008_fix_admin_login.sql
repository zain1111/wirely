-- Run in Supabase SQL Editor if admin login / role checks fail

-- 1) Ensure every auth user has a profiles row
insert into public.profiles (id, role)
select u.id, 'user'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 2) Promote your admin (CHANGE THE EMAIL)
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'YOUR_EMAIL@example.com'
);

-- 3) Confirm
select u.email, p.role, u.email_confirmed_at is not null as email_confirmed
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at desc;

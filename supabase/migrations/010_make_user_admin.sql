-- Run once in Supabase → SQL Editor
-- Change the email below to the account you use at /admin/login

insert into public.profiles (id, role)
select u.id, 'user'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'zainazeem2010@gmail.com'
);

select u.email, p.role, p.id
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at desc;

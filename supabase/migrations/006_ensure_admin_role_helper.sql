-- Promote your admin user (change the email), then verify role
-- Run in Supabase SQL Editor if uploads/saves return Forbidden

-- update public.profiles
-- set role = 'admin'
-- where id = (
--   select id from auth.users where email = 'your-admin@email.com'
-- );

-- Check who is admin:
-- select p.id, u.email, p.role
-- from public.profiles p
-- join auth.users u on u.id = p.id;

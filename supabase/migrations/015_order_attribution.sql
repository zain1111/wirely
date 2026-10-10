-- Ad click data stored with the order. Safe to run more than once.
alter table public.orders
  add column if not exists attribution jsonb;

notify pgrst, 'reload schema';

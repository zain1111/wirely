-- Combo page: iPhone 11, 12, 13, 14, 15, 16, 17 and 18.
update public.products
set device_compatibility = replace(
  device_compatibility::text,
  'iPhone 15, 15 Pro, 16, 16 Pro, 16e',
  'iPhone 11, 12, 13, 14, 15, 16, 17 and 18, including basic, e, Pro, and Pro Max models.'
)::jsonb
where slug = 'charger-cable-combo'
  and device_compatibility::text like '%iPhone 15, 15 Pro, 16, 16 Pro, 16e%';

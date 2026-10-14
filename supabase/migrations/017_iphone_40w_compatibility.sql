-- 40W iPhone adapter page: iPhone 11, 12, 13, 14, 15, 16, 17 and 18.
update public.products
set device_compatibility = (
  select coalesce(
    jsonb_agg(
      case
        when lower(elem->>'name') = 'iphone'
          then jsonb_set(
            elem,
            '{models}',
            to_jsonb(
              'iPhone 11, 12, 13, 14, 15, 16, 17 and 18, including basic, e, Pro, and Pro Max models.'::text
            )
          )
        else elem
      end
      order by ordinality
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(device_compatibility) with ordinality as listed(elem, ordinality)
)
where slug = '40w-dynamic-power-adopter-for-iphone-fast-charging';

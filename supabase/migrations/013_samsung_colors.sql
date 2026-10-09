-- Samsung charger colors. Safe to run more than once.
insert into public.product_variations (
  product_id,
  label,
  price,
  stock,
  sort_order,
  is_active
)
select p.id, v.label, p.price, greatest(p.stock, 0), v.sort_order, true
from public.products p
cross join (
  values ('White', 0), ('Black', 1)
) as v(label, sort_order)
where p.slug = 'samsung-usb-c-charger'
  and not exists (
    select 1
    from public.product_variations pv
    where pv.product_id = p.id
      and lower(pv.label) = lower(v.label)
  );

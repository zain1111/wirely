-- Samsung charger: state device compatibility instead of asking buyers to confirm a model.
update public.products
set
  description = 'Samsung USB-C charging adapter. Adapter only; the USB-C cable is sold separately. Our charger is compatible with all Samsung devices, especially flagship phones.',
  meta_description = 'Samsung USB-C charger at Wirely. Compatible with all Samsung devices, especially flagship phones.',
  highlights = '["Adapter only — cable not included","USB-C charging connection","Two-pin round plug","Compatible with all Samsung devices, especially flagship phones"]'::jsonb,
  device_compatibility = '[{"icon":"📱","name":"Samsung Galaxy","models":"Our charger is compatible with all Samsung devices, especially flagship phones."}]'::jsonb
where slug = 'samsung-usb-c-charger';

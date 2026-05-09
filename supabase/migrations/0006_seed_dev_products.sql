-- ============================================================
-- Vua Bỉm — Migration 0006: Seed sản phẩm demo cho DEV
-- ============================================================
-- 14 SP demo trải đều trên 11 hãng. Đa dạng size, giá, điểm.
-- Ảnh placeholder từ placehold.co (đổi sau khi admin upload thật).
--
-- ⚠️ XÓA TRƯỚC KHI LAUNCH PRODUCTION:
--    DELETE FROM products WHERE slug IN (...);
-- Hoặc đơn giản: vào admin xóa từng sp.

insert into public.products (
  slug, name, brand_id, size, weight_range,
  price, stock, points_per_unit, images
)
select
  v.slug,
  v.name,
  b.id,
  v.size,
  v.weight_range,
  v.price,
  v.stock,
  v.points,
  jsonb_build_array(v.image)
from (values
  -- Yingcool (mint)
  ('yingcool-cool-cap-m',     'Yingcool Cool Cap Size M (40 miếng)',  'yingcool',
   'M',  '6-11kg',  195000,  80,  8,
   'https://placehold.co/600x600/22C7C9/ffffff/png?text=Yingcool+M'),
  ('yingcool-cool-cap-l',     'Yingcool Cool Cap Size L (36 miếng)',  'yingcool',
   'L',  '9-14kg',  215000,  60,  9,
   'https://placehold.co/600x600/22C7C9/ffffff/png?text=Yingcool+L'),

  -- RoyalSoft (teal)
  ('royalsoft-premium-m',     'RoyalSoft Premium Size M (44 miếng)',  'royalsoft',
   'M',  '6-11kg',  235000,  50,  10,
   'https://placehold.co/600x600/0891B2/ffffff/png?text=RoyalSoft+M'),

  -- Gooby (pink)
  ('gooby-soft-l',            'Gooby Soft Size L (40 miếng)',         'gooby',
   'L',  '9-14kg',  220000,  70,  9,
   'https://placehold.co/600x600/FF7EB6/ffffff/png?text=Gooby+L'),
  ('gooby-soft-xl',           'Gooby Soft Size XL (32 miếng)',        'gooby',
   'XL', '12-17kg', 250000,  40,  10,
   'https://placehold.co/600x600/FF7EB6/ffffff/png?text=Gooby+XL'),

  -- Honey (yellow)
  ('honey-daily-m',           'Honey Daily Size M (42 miếng)',        'honey',
   'M',  '6-11kg',  180000,  90,  7,
   'https://placehold.co/600x600/FFC83D/333333/png?text=Honey+M'),

  -- Bemom
  ('bemom-comfort-l',         'Bemom Comfort Size L (38 miếng)',      'bemom',
   'L',  '9-14kg',  210000,  55,  8,
   'https://placehold.co/600x600/22C7C9/ffffff/png?text=Bemom+L'),

  -- Merries (3 SP, hãng phổ biến)
  ('merries-classic-m',       'Merries Bỉm dán Size M (64 miếng)',    'merries',
   'M',  '6-11kg',  295000,  100, 12,
   'https://placehold.co/600x600/0891B2/ffffff/png?text=Merries+M'),
  ('merries-classic-l',       'Merries Bỉm quần Size L (44 miếng)',   'merries',
   'L',  '9-14kg',  285000,  80,  11,
   'https://placehold.co/600x600/0891B2/ffffff/png?text=Merries+L'),
  ('merries-classic-xl',      'Merries Bỉm quần Size XL (38 miếng)',  'merries',
   'XL', '12-22kg', 305000,  60,  12,
   'https://placehold.co/600x600/0891B2/ffffff/png?text=Merries+XL'),

  -- Moony (2 SP, hãng phổ biến)
  ('moony-premium-l',         'Moony Bỉm Air Fit Size L (44 miếng)',  'moony',
   'L',  '9-14kg',  280000,  75,  11,
   'https://placehold.co/600x600/FF7EB6/ffffff/png?text=Moony+L'),
  ('moony-premium-xl',        'Moony Bỉm Air Fit Size XL (32 miếng)', 'moony',
   'XL', '12-17kg', 290000,  50,  12,
   'https://placehold.co/600x600/FF7EB6/ffffff/png?text=Moony+XL'),

  -- BB Nature (organic premium)
  ('bb-nature-organic-l',     'BB Nature Organic Size L (38 miếng)',  'bb-nature',
   'L',  '9-14kg',  320000,  30,  14,
   'https://placehold.co/600x600/22C7C9/ffffff/png?text=BB+Nature+L'),

  -- Mompa
  ('mompa-daily-m',           'Mompa Daily Size M (42 miếng)',        'mompa',
   'M',  '6-11kg',  165000,  100, 6,
   'https://placehold.co/600x600/FFC83D/333333/png?text=Mompa+M')
) as v(slug, name, brand_slug, size, weight_range, price, stock, points, image)
join public.brands b on b.slug = v.brand_slug
on conflict (slug) do nothing;

-- DONE — 14 sản phẩm demo seed

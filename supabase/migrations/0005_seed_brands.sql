-- ============================================================
-- Vua Bỉm — Migration 0005: Seed 15 hãng cố định
-- ============================================================
-- 15 hãng theo §14.3 THIET-KE.md
-- Logo, banner, story_content sẽ được admin update sau

insert into public.brands (slug, name, display_order, is_active) values
  ('yingcool',   'Yingcool',    1,  true),
  ('royalsoft',  'RoyalSoft',   2,  true),
  ('gooby',      'Gooby',       3,  true),
  ('honey',      'Honey',       4,  true),
  ('bemom',      'Bemom',       5,  true),
  ('mamogom',    'Mamogom',     6,  true),
  ('yacool',     'Yacool',      7,  true),
  ('rouya',      'Rouya',       8,  true),
  ('eom-eon',    'Eom Eon',     9,  true),
  ('bb-nature',  'BB Nature',  10,  true),
  ('momorabit',  'Momorabit',  11,  true),
  ('merries',    'Merries',    12,  true),
  ('ualarogo',   'Ualarogo',   13,  true),
  ('moony',      'Moony',      14,  true),
  ('mompa',      'Mompa',      15,  true)
on conflict (slug) do nothing;

-- DONE — migration 0005 (15 hãng đã seed)

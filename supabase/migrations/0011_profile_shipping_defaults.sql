-- ============================================================
-- Lưu địa chỉ giao hàng mặc định vào profiles
-- Để khách không phải điền lại mỗi lần checkout
-- Áp dụng thủ công trong Supabase Dashboard → SQL Editor
-- ============================================================

alter table public.profiles
  add column if not exists default_shipping_name text,
  add column if not exists default_shipping_phone text,
  add column if not exists default_province_code text,
  add column if not exists default_province_name text,
  add column if not exists default_district_code text,
  add column if not exists default_district_name text,
  add column if not exists default_ward_code text,
  add column if not exists default_ward_name text,
  add column if not exists default_address_detail text;

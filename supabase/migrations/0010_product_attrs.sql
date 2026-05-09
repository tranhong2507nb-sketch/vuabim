-- ============================================================
-- Thêm thuộc tính sản phẩm: loại bỉm + thời điểm dùng
-- Áp dụng thủ công trong Supabase Dashboard → SQL Editor
-- ============================================================

-- diaper_type: 'pant' = Bỉm quần, 'tape' = Bỉm dán
alter table public.products
  add column if not exists diaper_type text not null default 'tape'
    check (diaper_type in ('pant','tape'));

-- usage_time: 'day' = Ngày, 'night' = Đêm
alter table public.products
  add column if not exists usage_time text not null default 'day'
    check (usage_time in ('day','night'));

-- ============================================================
-- Đổi usage_time (single value) → 2 boolean độc lập
-- Admin có thể tích cả 2 / 1 / không tích
-- Áp dụng thủ công trong Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Thêm 2 cột mới (default false — chưa phân loại)
alter table public.products
  add column if not exists usage_day boolean not null default false,
  add column if not exists usage_night boolean not null default false;

-- 2. Backfill từ usage_time cũ
update public.products
   set usage_day = true
 where usage_time = 'day' and usage_day = false;

update public.products
   set usage_night = true
 where usage_time = 'night' and usage_night = false;

-- 3. Cột usage_time cũ vẫn giữ lại để khôi phục dữ liệu nếu cần.
--    Sau khi xác nhận hệ thống chạy ổn (1-2 tuần), có thể tự xóa thủ công:
--    alter table public.products drop column usage_time;

-- ============================================================
-- Storage: bucket cho ảnh sản phẩm + ảnh quà + ảnh hãng
-- Áp dụng thủ công trong Supabase Dashboard → SQL Editor
-- ============================================================

-- Tạo bucket public (read tự do, write cần admin)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ============================================================
-- Policies cho bucket product-images
-- ============================================================

-- Drop nếu có (idempotent)
drop policy if exists "product-images public read"   on storage.objects;
drop policy if exists "product-images admin insert"  on storage.objects;
drop policy if exists "product-images admin update"  on storage.objects;
drop policy if exists "product-images admin delete"  on storage.objects;

-- Public read: ai cũng xem được ảnh
create policy "product-images public read"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- Admin upload
create policy "product-images admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin update (rename, replace metadata)
create policy "product-images admin update"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin delete
create policy "product-images admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

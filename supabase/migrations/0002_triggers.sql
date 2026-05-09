-- ============================================================
-- Vua Bỉm — Migration 0002: Triggers
-- ============================================================
-- 1. handle_new_user — tự tạo profiles row khi auth.users INSERT
-- 2. set_updated_at — auto cập nhật updated_at khi UPDATE

-- ============================================================
-- Trigger 1: tạo profiles khi đăng ký
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, current_points)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name',
             ''),
    'customer',
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Trigger 2: auto update updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Áp cho các bảng có updated_at
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_brands_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_gifts_updated_at
  before update on public.gifts
  for each row execute function public.set_updated_at();

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger trg_redemptions_updated_at
  before update on public.gift_redemptions
  for each row execute function public.set_updated_at();

-- DONE — migration 0002

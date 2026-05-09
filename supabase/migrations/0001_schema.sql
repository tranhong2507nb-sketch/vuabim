-- ============================================================
-- Vua Bỉm — Migration 0001: Database Schema
-- ============================================================
-- 10 bảng + indexes theo §15 THIET-KE.md
-- Apply qua Supabase Dashboard → SQL Editor → New query → paste → Run

-- ─── Extensions ───
create extension if not exists pgcrypto;          -- gen_random_uuid

-- ============================================================
-- 1. profiles (mở rộng auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  phone text,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  current_points integer not null default 0 check (current_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. brands (15 hãng cố định)
-- ============================================================
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  banner_url text,
  story_content text,
  meta_title text,
  meta_description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. products
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand_id uuid not null references public.brands(id),
  size text,
  weight_range text,
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  points_per_unit integer not null default 0 check (points_per_unit >= 0),
  images jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. gifts
-- ============================================================
create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  description text,
  points_required integer not null check (points_required > 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 5. cart_items
-- ============================================================
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id),
  qty integer not null check (qty > 0),
  added_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- ============================================================
-- 6. orders
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  user_id uuid references public.profiles(id),
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipping','completed','cancelled','refunded')),

  subtotal integer not null check (subtotal >= 0),
  shipping_fee_original integer not null default 45000 check (shipping_fee_original >= 0),
  shipping_fee integer not null default 0 check (shipping_fee >= 0),

  -- Nhóm A: điểm sản phẩm (sinh từ đơn)
  points_to_earn integer not null default 0 check (points_to_earn >= 0),
  points_earned_at timestamptz,
  instant_points_used integer not null default 0 check (instant_points_used >= 0),
  instant_points_discount integer not null default 0 check (instant_points_discount >= 0),

  -- Nhóm B: điểm tài khoản (điểm thật)
  account_points_used integer not null default 0 check (account_points_used >= 0),
  account_points_discount integer not null default 0 check (account_points_discount >= 0),
  account_points_refunded_at timestamptz,

  -- Yêu cầu hủy
  cancel_requested_at timestamptz,
  cancel_request_reason text,

  total integer not null check (total >= 0),
  payment_method text not null default 'cod',
  shipping_name text not null,
  shipping_phone text not null,
  shipping_email text,
  province_code text not null,
  province_name text not null,
  district_code text not null,
  district_name text not null,
  ward_code text not null,
  ward_name text not null,
  address_detail text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 7. order_items (snapshot khi tạo đơn)
-- ============================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  qty integer not null check (qty > 0),
  unit_price_snapshot integer not null,
  points_per_unit_snapshot integer not null,
  product_name_snapshot text not null,
  product_image_snapshot text
);

-- ============================================================
-- 8. gift_redemptions
-- ============================================================
create table public.gift_redemptions (
  id uuid primary key default gen_random_uuid(),
  redemption_code text unique not null,
  user_id uuid not null references public.profiles(id),
  gift_id uuid not null references public.gifts(id),
  points_used integer not null check (points_used > 0),
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipping','completed','cancelled')),
  refunded boolean not null default false,
  source text not null check (source in ('checkout','standalone','pdp')),
  ref_order_id uuid references public.orders(id),
  shipping_name text,
  shipping_phone text,
  shipping_email text,
  province_code text,
  province_name text,
  district_code text,
  district_name text,
  ward_code text,
  ward_name text,
  address_detail text,
  note text,
  gift_name_snapshot text not null,
  points_required_snapshot integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 9. order_messages (chatbox khách ↔ admin per đơn)
-- ============================================================
create table public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_type text not null check (sender_type in ('customer','admin','system')),
  sender_id uuid references public.profiles(id),
  message text not null check (length(trim(message)) > 0),
  attachments jsonb not null default '[]'::jsonb,
  read_by_other boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 10. points_transactions (audit log — append-only)
-- ============================================================
create table public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  delta integer not null,
  type text not null check (type in
    ('earn','revoke',
     'use_account_direct','refund_account_direct',
     'redeem_gift','refund_gift',
     'clamp','admin_adjust')),
  reason text,
  ref_order_id uuid references public.orders(id),
  ref_redemption_id uuid references public.gift_redemptions(id),
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_orders_user on public.orders(user_id, created_at desc);
create index idx_orders_status on public.orders(status);
create index idx_orders_cancel_requested on public.orders(cancel_requested_at)
  where cancel_requested_at is not null;
create index idx_redemptions_user on public.gift_redemptions(user_id, created_at desc);
create index idx_redemptions_source on public.gift_redemptions(source, status);
create index idx_pt_user on public.points_transactions(user_id, created_at desc);
create index idx_products_brand on public.products(brand_id) where is_active = true;
create index idx_products_search on public.products using gin(to_tsvector('simple', name));
create index idx_om_order on public.order_messages(order_id, created_at);
create index idx_om_unread on public.order_messages(order_id, sender_type)
  where read_by_other = false;

-- DONE — migration 0001

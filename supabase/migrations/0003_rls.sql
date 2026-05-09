-- ============================================================
-- Vua Bỉm — Migration 0003: Row Level Security (RLS) Policies
-- ============================================================
-- Mặc định DENY mọi thao tác, mở quyền theo §17 THIET-KE.md

-- ============================================================
-- Helper: is_admin
-- ============================================================
create or replace function public.is_admin(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_uid and role = 'admin'
  );
$$;

-- ============================================================
-- Bật RLS cho mọi bảng public
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.brands              enable row level security;
alter table public.products            enable row level security;
alter table public.gifts               enable row level security;
alter table public.cart_items          enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.gift_redemptions    enable row level security;
alter table public.order_messages      enable row level security;
alter table public.points_transactions enable row level security;

-- ============================================================
-- profiles
-- ============================================================
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============================================================
-- brands, products, gifts: public read khi is_active=true; admin all
-- ============================================================
create policy "brands_select_public"
  on public.brands for select
  using (is_active = true);

create policy "brands_admin_all"
  on public.brands for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "products_select_public"
  on public.products for select
  using (is_active = true);

create policy "products_admin_all"
  on public.products for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "gifts_select_public"
  on public.gifts for select
  using (is_active = true);

create policy "gifts_admin_all"
  on public.gifts for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ============================================================
-- cart_items: user manage own cart
-- ============================================================
create policy "cart_select_own"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "cart_insert_own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "cart_update_own"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cart_delete_own"
  on public.cart_items for delete
  using (auth.uid() = user_id);

create policy "cart_admin_select"
  on public.cart_items for select
  using (public.is_admin(auth.uid()));

-- ============================================================
-- orders: user xem đơn của mình; admin xem all; mutations qua RPC
-- ============================================================
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders_select_admin"
  on public.orders for select
  using (public.is_admin(auth.uid()));

-- INSERT/UPDATE chỉ qua RPC SECURITY DEFINER (không tạo policy public)

-- ============================================================
-- order_items: theo order_id parent
-- ============================================================
create policy "order_items_select_own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "order_items_select_admin"
  on public.order_items for select
  using (public.is_admin(auth.uid()));

-- ============================================================
-- gift_redemptions: user xem của mình; admin all
-- ============================================================
create policy "redemptions_select_own"
  on public.gift_redemptions for select
  using (auth.uid() = user_id);

create policy "redemptions_select_admin"
  on public.gift_redemptions for select
  using (public.is_admin(auth.uid()));

-- ============================================================
-- order_messages: user của đơn được SELECT; INSERT/UPDATE qua RPC
-- ============================================================
create policy "msg_select_own"
  on public.order_messages for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_messages.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "msg_select_admin"
  on public.order_messages for select
  using (public.is_admin(auth.uid()));

-- ============================================================
-- points_transactions: append-only, user xem của mình
-- ============================================================
create policy "pt_select_own"
  on public.points_transactions for select
  using (auth.uid() = user_id);

create policy "pt_select_admin"
  on public.points_transactions for select
  using (public.is_admin(auth.uid()));

-- KHÔNG có policy INSERT/UPDATE/DELETE cho points_transactions
-- → chỉ RPC SECURITY DEFINER mới được ghi

-- DONE — migration 0003

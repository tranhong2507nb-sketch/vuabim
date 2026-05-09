-- ============================================================
-- Vua Bỉm — Migration 0004: RPC Functions
-- ============================================================
-- 12 RPC core theo §16 THIET-KE.md
-- Tất cả SECURITY DEFINER, atomic transaction, validate auth.uid() bên trong

set search_path = public;

-- ============================================================
-- HELPERS
-- ============================================================

-- Sinh order_code: VB-YYYYMMDD-XXXX (4 ký tự random)
create or replace function gen_order_code()
returns text
language plpgsql
as $$
declare
  v_code text;
  v_attempt integer := 0;
begin
  loop
    v_code := 'VB-' || to_char(now(), 'YYYYMMDD') || '-' ||
              upper(substring(md5(random()::text || clock_timestamp()::text), 1, 4));
    if not exists (select 1 from orders where order_code = v_code) then
      return v_code;
    end if;
    v_attempt := v_attempt + 1;
    if v_attempt > 10 then
      raise exception 'Cannot generate unique order_code';
    end if;
  end loop;
end;
$$;

-- Sinh redemption_code: DQ-YYYYMMDD-XXXX
create or replace function gen_redemption_code()
returns text
language plpgsql
as $$
declare
  v_code text;
  v_attempt integer := 0;
begin
  loop
    v_code := 'DQ-' || to_char(now(), 'YYYYMMDD') || '-' ||
              upper(substring(md5(random()::text || clock_timestamp()::text), 1, 4));
    if not exists (select 1 from gift_redemptions where redemption_code = v_code) then
      return v_code;
    end if;
    v_attempt := v_attempt + 1;
    if v_attempt > 10 then
      raise exception 'Cannot generate unique redemption_code';
    end if;
  end loop;
end;
$$;

-- ============================================================
-- 1. place_order — tạo đơn atomic
-- ============================================================
create or replace function place_order(p_input jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_current_points integer;
  v_subtotal integer := 0;
  v_shipping_fee_original integer := 45000;
  v_shipping_fee integer := 0;
  v_base_total integer;
  v_points_to_earn_raw integer := 0;
  v_account_used integer := coalesce((p_input->>'account_points_used')::integer, 0);
  v_gift_id uuid := nullif(p_input->>'gift_id', '')::uuid;
  v_gift_points integer := 0;
  v_max_account integer;
  v_account_discount integer;
  v_remaining_after_account integer;
  v_choice text := coalesce(p_input->>'product_point_choice', 'earn');
  v_max_instant integer;
  v_instant_used integer := 0;
  v_instant_discount integer := 0;
  v_points_to_earn integer := 0;
  v_total integer;
  v_order_id uuid := gen_random_uuid();
  v_order_code text;
  v_balance integer;
  v_item jsonb;
  v_product record;
  v_gift record;
  v_redemption_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- 1. Validate cart + tính subtotal + points_to_earn_raw
  for v_item in select * from jsonb_array_elements(p_input->'items')
  loop
    select id, price, points_per_unit, stock, is_active, name
      into v_product
      from products
     where id = (v_item->>'product_id')::uuid
       for update;
    if not found then
      raise exception 'Product not found: %', v_item->>'product_id';
    end if;
    if not v_product.is_active then
      raise exception 'Product not active: %', v_product.name;
    end if;
    if v_product.stock < (v_item->>'qty')::integer then
      raise exception 'Insufficient stock for %', v_product.name;
    end if;
    if v_product.price <> (v_item->>'unit_price')::integer then
      raise exception 'Price mismatch for %', v_product.name;
    end if;
    v_subtotal := v_subtotal + v_product.price * (v_item->>'qty')::integer;
    v_points_to_earn_raw := v_points_to_earn_raw +
                            v_product.points_per_unit * (v_item->>'qty')::integer;
  end loop;

  v_base_total := v_subtotal + v_shipping_fee;

  -- 2. Lock profile + lấy current_points
  select current_points into v_current_points
    from profiles where id = v_uid for update;

  -- 3. Validate gift checkout
  if v_gift_id is not null then
    select id, points_required, stock, name
      into v_gift
      from gifts
     where id = v_gift_id and is_active = true
       for update;
    if not found then
      raise exception 'Gift not found or inactive';
    end if;
    if v_gift.stock <= 0 then
      raise exception 'Out of gift stock';
    end if;
    v_gift_points := v_gift.points_required;
  end if;

  -- 4. Validate điểm TK
  if v_account_used + v_gift_points > v_current_points then
    raise exception 'Insufficient account points (have %, need %)',
                    v_current_points, v_account_used + v_gift_points;
  end if;

  v_max_account := floor(v_base_total / 1000);
  if v_account_used > v_max_account then
    raise exception 'Account points used exceeds order value';
  end if;

  v_account_discount := v_account_used * 1000;
  v_remaining_after_account := v_base_total - v_account_discount;

  -- 5. Xử lý điểm SP (1 trong 2)
  if v_choice = 'earn' then
    v_instant_used := 0;
    v_instant_discount := 0;
    v_points_to_earn := v_points_to_earn_raw;
  elsif v_choice = 'use_instant' then
    v_max_instant := floor(v_remaining_after_account / 1000);
    v_instant_used := least(v_points_to_earn_raw, v_max_instant);
    v_instant_discount := v_instant_used * 1000;
    v_points_to_earn := v_points_to_earn_raw - v_instant_used;
  else
    raise exception 'Invalid product_point_choice: %', v_choice;
  end if;

  v_total := greatest(0, v_base_total - v_account_discount - v_instant_discount);

  -- 6. Trừ điểm TK + log
  if v_account_used > 0 then
    update profiles set current_points = current_points - v_account_used
      where id = v_uid returning current_points into v_balance;
    insert into points_transactions
      (user_id, delta, type, ref_order_id, balance_after)
      values (v_uid, -v_account_used, 'use_account_direct', v_order_id, v_balance);
  end if;

  -- 7. Đổi quà checkout
  if v_gift_id is not null then
    update profiles set current_points = current_points - v_gift_points
      where id = v_uid returning current_points into v_balance;
    update gifts set stock = stock - 1 where id = v_gift_id;

    v_redemption_id := gen_random_uuid();
    insert into gift_redemptions
      (id, redemption_code, user_id, gift_id, points_used, source,
       ref_order_id, gift_name_snapshot, points_required_snapshot)
      values (v_redemption_id, gen_redemption_code(), v_uid, v_gift_id,
              v_gift_points, 'checkout', v_order_id,
              v_gift.name, v_gift_points);

    insert into points_transactions
      (user_id, delta, type, ref_order_id, ref_redemption_id, balance_after)
      values (v_uid, -v_gift_points, 'redeem_gift',
              v_order_id, v_redemption_id, v_balance);
  end if;

  -- 8. Tạo đơn
  v_order_code := gen_order_code();
  insert into orders (
    id, order_code, user_id, status,
    subtotal, shipping_fee_original, shipping_fee, total,
    points_to_earn, instant_points_used, instant_points_discount,
    account_points_used, account_points_discount,
    payment_method,
    shipping_name, shipping_phone, shipping_email,
    province_code, province_name, district_code, district_name,
    ward_code, ward_name, address_detail, note
  )
  values (
    v_order_id, v_order_code, v_uid, 'pending',
    v_subtotal, v_shipping_fee_original, v_shipping_fee, v_total,
    v_points_to_earn, v_instant_used, v_instant_discount,
    v_account_used, v_account_discount,
    'cod',
    p_input->>'shipping_name', p_input->>'shipping_phone', p_input->>'shipping_email',
    p_input->>'province_code', p_input->>'province_name',
    p_input->>'district_code', p_input->>'district_name',
    p_input->>'ward_code', p_input->>'ward_name',
    p_input->>'address_detail', p_input->>'note'
  );

  -- 9. Insert order_items + trừ tồn kho
  for v_item in select * from jsonb_array_elements(p_input->'items')
  loop
    select id, price, points_per_unit, name, images
      into v_product
      from products where id = (v_item->>'product_id')::uuid;

    insert into order_items
      (order_id, product_id, qty, unit_price_snapshot, points_per_unit_snapshot,
       product_name_snapshot, product_image_snapshot)
      values (v_order_id, v_product.id, (v_item->>'qty')::integer,
              v_product.price, v_product.points_per_unit, v_product.name,
              coalesce(v_product.images->>0, null));

    update products set stock = stock - (v_item->>'qty')::integer
      where id = v_product.id;
  end loop;

  return v_order_id;
end;
$$;

-- ============================================================
-- 2. complete_order — admin chuyển → completed, cộng điểm
-- ============================================================
create or replace function complete_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_balance integer;
begin
  if not is_admin(auth.uid()) then
    raise exception 'Admin only';
  end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if v_order.status not in ('shipping','completed') then
    raise exception 'Cannot complete from status: %', v_order.status;
  end if;

  -- Idempotent
  if v_order.points_earned_at is not null then
    update orders set status = 'completed' where id = p_order_id;
    return;
  end if;

  if v_order.points_to_earn > 0 then
    update profiles set current_points = current_points + v_order.points_to_earn
      where id = v_order.user_id returning current_points into v_balance;
    insert into points_transactions
      (user_id, delta, type, ref_order_id, balance_after)
      values (v_order.user_id, v_order.points_to_earn, 'earn',
              p_order_id, v_balance);
  end if;

  update orders set
    status = 'completed',
    points_earned_at = now()
  where id = p_order_id;
end;
$$;

-- ============================================================
-- 3. update_order_status — wrapper validate transition
-- ============================================================
create or replace function update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
begin
  if not is_admin(auth.uid()) then
    raise exception 'Admin only';
  end if;

  select status into v_current from orders where id = p_order_id;
  if not found then raise exception 'Order not found'; end if;

  if p_new_status = 'completed' then
    perform complete_order(p_order_id);
    return;
  end if;

  if p_new_status = 'cancelled' then
    perform cancel_order(p_order_id, p_reason);
    return;
  end if;

  -- Validate forward transitions
  if (v_current = 'pending' and p_new_status = 'confirmed') or
     (v_current = 'confirmed' and p_new_status = 'shipping') then
    update orders set status = p_new_status where id = p_order_id;
  else
    raise exception 'Invalid transition: % → %', v_current, p_new_status;
  end if;
end;
$$;

-- ============================================================
-- 4. customer_cancel_order — khách tự hủy pending
-- ============================================================
create or replace function customer_cancel_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_redemption record;
  v_item record;
  v_balance integer;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if v_order.user_id <> auth.uid() then
    raise exception 'Not your order';
  end if;
  if v_order.status <> 'pending' then
    raise exception 'Can only cancel pending orders yourself';
  end if;

  -- Hoàn account_points_used
  if v_order.account_points_used > 0 and v_order.account_points_refunded_at is null then
    update profiles set current_points = current_points + v_order.account_points_used
      where id = v_order.user_id returning current_points into v_balance;
    update orders set account_points_refunded_at = now() where id = p_order_id;
    insert into points_transactions
      (user_id, delta, type, ref_order_id, balance_after)
      values (v_order.user_id, v_order.account_points_used,
              'refund_account_direct', p_order_id, v_balance);
  end if;

  -- Hủy gift_redemptions gắn
  for v_redemption in
    select * from gift_redemptions
    where ref_order_id = p_order_id
      and status <> 'cancelled' and refunded = false
  loop
    update gift_redemptions
      set status = 'cancelled', refunded = true
      where id = v_redemption.id;
    update profiles set current_points = current_points + v_redemption.points_used
      where id = v_order.user_id returning current_points into v_balance;
    update gifts set stock = stock + 1 where id = v_redemption.gift_id;
    insert into points_transactions
      (user_id, delta, type, ref_order_id, ref_redemption_id, balance_after)
      values (v_order.user_id, v_redemption.points_used, 'refund_gift',
              p_order_id, v_redemption.id, v_balance);
  end loop;

  -- Hoàn tồn kho sản phẩm
  for v_item in select * from order_items where order_id = p_order_id
  loop
    update products set stock = stock + v_item.qty where id = v_item.product_id;
  end loop;

  update orders set status = 'cancelled' where id = p_order_id;
end;
$$;

-- ============================================================
-- 5. cancel_order — admin hủy (pending/confirmed)
-- ============================================================
create or replace function cancel_order(p_order_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_redemption record;
  v_item record;
  v_balance integer;
begin
  if not is_admin(auth.uid()) then
    raise exception 'Admin only';
  end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if v_order.status in ('cancelled','refunded') then
    raise exception 'Already cancelled/refunded';
  end if;
  if v_order.status = 'shipping' then
    raise exception 'Đơn đang vận chuyển, vui lòng dùng quy trình hoàn hàng';
  end if;
  if v_order.status not in ('pending','confirmed') then
    raise exception 'Use refund_completed_order instead';
  end if;

  -- Hoàn account_points_used
  if v_order.account_points_used > 0 and v_order.account_points_refunded_at is null then
    update profiles set current_points = current_points + v_order.account_points_used
      where id = v_order.user_id returning current_points into v_balance;
    update orders set account_points_refunded_at = now() where id = p_order_id;
    insert into points_transactions
      (user_id, delta, type, reason, ref_order_id, balance_after)
      values (v_order.user_id, v_order.account_points_used,
              'refund_account_direct', p_reason, p_order_id, v_balance);
  end if;

  -- Hủy gift_redemptions
  for v_redemption in
    select * from gift_redemptions
    where ref_order_id = p_order_id
      and status <> 'cancelled' and refunded = false
  loop
    update gift_redemptions
      set status = 'cancelled', refunded = true
      where id = v_redemption.id;
    update profiles set current_points = current_points + v_redemption.points_used
      where id = v_order.user_id returning current_points into v_balance;
    update gifts set stock = stock + 1 where id = v_redemption.gift_id;
    insert into points_transactions
      (user_id, delta, type, ref_order_id, ref_redemption_id, balance_after)
      values (v_order.user_id, v_redemption.points_used, 'refund_gift',
              p_order_id, v_redemption.id, v_balance);
  end loop;

  -- Hoàn tồn kho
  for v_item in select * from order_items where order_id = p_order_id
  loop
    update products set stock = stock + v_item.qty where id = v_item.product_id;
  end loop;

  update orders set status = 'cancelled' where id = p_order_id;
end;
$$;

-- ============================================================
-- 6. refund_completed_order — admin refund đơn completed
-- ============================================================
create or replace function refund_completed_order(
  p_order_id uuid,
  p_reason text default null,
  p_refund_gifts boolean default true
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_redemption record;
  v_item record;
  v_actual integer;
  v_current integer;
  v_balance integer;
begin
  if not is_admin(auth.uid()) then
    raise exception 'Admin only';
  end if;

  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if v_order.status <> 'completed' then
    raise exception 'Only refund completed orders';
  end if;

  -- Hoàn account_points_used
  if v_order.account_points_used > 0 and v_order.account_points_refunded_at is null then
    update profiles set current_points = current_points + v_order.account_points_used
      where id = v_order.user_id returning current_points into v_balance;
    update orders set account_points_refunded_at = now() where id = p_order_id;
    insert into points_transactions
      (user_id, delta, type, reason, ref_order_id, balance_after)
      values (v_order.user_id, v_order.account_points_used,
              'refund_account_direct', p_reason, p_order_id, v_balance);
  end if;

  -- Trừ points_to_earn (clamp 0)
  if v_order.points_earned_at is not null and v_order.points_to_earn > 0 then
    select current_points into v_current
      from profiles where id = v_order.user_id for update;
    v_actual := least(v_order.points_to_earn, v_current);
    update profiles set current_points = current_points - v_actual
      where id = v_order.user_id returning current_points into v_balance;
    insert into points_transactions
      (user_id, delta, type, reason, ref_order_id, balance_after)
      values (v_order.user_id, -v_actual, 'revoke', p_reason,
              p_order_id, v_balance);
    if v_actual < v_order.points_to_earn then
      insert into points_transactions
        (user_id, delta, type, reason, ref_order_id, balance_after)
        values (v_order.user_id, 0, 'clamp',
                'clamped: needed=' || v_order.points_to_earn ||
                ' available=' || v_actual,
                p_order_id, v_balance);
    end if;
  end if;

  -- Hủy gift_redemptions (theo param)
  if p_refund_gifts then
    for v_redemption in
      select * from gift_redemptions
      where ref_order_id = p_order_id
        and status <> 'cancelled' and refunded = false
    loop
      update gift_redemptions
        set status = 'cancelled', refunded = true
        where id = v_redemption.id;
      update profiles set current_points = current_points + v_redemption.points_used
        where id = v_order.user_id returning current_points into v_balance;
      update gifts set stock = stock + 1 where id = v_redemption.gift_id;
      insert into points_transactions
        (user_id, delta, type, ref_order_id, ref_redemption_id, balance_after)
        values (v_order.user_id, v_redemption.points_used, 'refund_gift',
                p_order_id, v_redemption.id, v_balance);
    end loop;
  end if;

  -- Hoàn tồn kho sản phẩm
  for v_item in select * from order_items where order_id = p_order_id
  loop
    update products set stock = stock + v_item.qty where id = v_item.product_id;
  end loop;

  update orders set status = 'refunded' where id = p_order_id;
end;
$$;

-- ============================================================
-- 7. request_cancel_order — khách yêu cầu hủy ở confirmed
-- ============================================================
create or replace function request_cancel_order(p_order_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;

  if v_order.user_id <> auth.uid() then
    raise exception 'Not your order';
  end if;
  if v_order.status <> 'confirmed' then
    raise exception 'Can only request cancel when status=confirmed';
  end if;
  if v_order.cancel_requested_at is not null then
    raise exception 'Cancel request already submitted';
  end if;
  if length(coalesce(trim(p_reason),'')) = 0 then
    raise exception 'Reason required';
  end if;

  update orders set
    cancel_requested_at = now(),
    cancel_request_reason = p_reason
  where id = p_order_id;

  -- Auto-post system message vào chatbox
  insert into order_messages (order_id, sender_type, sender_id, message)
    values (p_order_id, 'system', null,
            'Khách yêu cầu hủy đơn. Lý do: ' || p_reason);
end;
$$;

-- ============================================================
-- 8. send_order_message — gửi tin chatbox đơn
-- ============================================================
create or replace function send_order_message(
  p_order_id uuid,
  p_message text,
  p_attachments jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_order record;
  v_sender_type text;
  v_msg_id uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if length(trim(p_message)) = 0 then raise exception 'Message empty'; end if;
  if jsonb_array_length(p_attachments) > 3 then
    raise exception 'Max 3 attachments';
  end if;

  select user_id into v_order from orders where id = p_order_id;
  if not found then raise exception 'Order not found'; end if;

  if is_admin(v_uid) then
    v_sender_type := 'admin';
  elsif v_order.user_id = v_uid then
    v_sender_type := 'customer';
  else
    raise exception 'Not your order';
  end if;

  insert into order_messages
    (order_id, sender_type, sender_id, message, attachments)
    values (p_order_id, v_sender_type, v_uid, p_message, p_attachments)
    returning id into v_msg_id;

  return v_msg_id;
end;
$$;

-- ============================================================
-- 9. mark_order_messages_read
-- ============================================================
create or replace function mark_order_messages_read(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_order record;
  v_other_type text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select user_id into v_order from orders where id = p_order_id;
  if not found then raise exception 'Order not found'; end if;

  if is_admin(v_uid) then
    v_other_type := 'customer';
  elsif v_order.user_id = v_uid then
    v_other_type := 'admin';
  else
    raise exception 'Not your order';
  end if;

  update order_messages set read_by_other = true
    where order_id = p_order_id
      and sender_type in (v_other_type, 'system')
      and read_by_other = false;
end;
$$;

-- ============================================================
-- 10. redeem_gift_standalone — đổi quà độc lập
-- ============================================================
create or replace function redeem_gift_standalone(p_input jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_gift record;
  v_current integer;
  v_redemption_id uuid := gen_random_uuid();
  v_balance integer;
  v_source text := coalesce(p_input->>'source', 'standalone');
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if v_source not in ('standalone','pdp') then
    raise exception 'Invalid source';
  end if;

  select * into v_gift from gifts
    where id = (p_input->>'gift_id')::uuid and is_active = true
    for update;
  if not found then raise exception 'Gift not found'; end if;
  if v_gift.stock <= 0 then raise exception 'Out of stock'; end if;

  select current_points into v_current from profiles where id = v_uid for update;
  if v_current < v_gift.points_required then
    raise exception 'Insufficient points';
  end if;

  update profiles set current_points = current_points - v_gift.points_required
    where id = v_uid returning current_points into v_balance;
  update gifts set stock = stock - 1 where id = v_gift.id;

  insert into gift_redemptions (
    id, redemption_code, user_id, gift_id, points_used, source,
    shipping_name, shipping_phone, shipping_email,
    province_code, province_name, district_code, district_name,
    ward_code, ward_name, address_detail, note,
    gift_name_snapshot, points_required_snapshot
  ) values (
    v_redemption_id, gen_redemption_code(), v_uid, v_gift.id,
    v_gift.points_required, v_source,
    p_input->>'shipping_name', p_input->>'shipping_phone', p_input->>'shipping_email',
    p_input->>'province_code', p_input->>'province_name',
    p_input->>'district_code', p_input->>'district_name',
    p_input->>'ward_code', p_input->>'ward_name',
    p_input->>'address_detail', p_input->>'note',
    v_gift.name, v_gift.points_required
  );

  insert into points_transactions
    (user_id, delta, type, ref_redemption_id, balance_after)
    values (v_uid, -v_gift.points_required, 'redeem_gift',
            v_redemption_id, v_balance);

  return v_redemption_id;
end;
$$;

-- ============================================================
-- 11. cancel_gift_redemption — admin hủy đổi quà
-- ============================================================
create or replace function cancel_gift_redemption(
  p_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_redemption record;
  v_balance integer;
begin
  if not is_admin(auth.uid()) then raise exception 'Admin only'; end if;

  select * into v_redemption from gift_redemptions where id = p_id for update;
  if not found then raise exception 'Redemption not found'; end if;
  if v_redemption.status = 'cancelled' or v_redemption.refunded then
    raise exception 'Already cancelled/refunded';
  end if;

  update profiles set current_points = current_points + v_redemption.points_used
    where id = v_redemption.user_id returning current_points into v_balance;
  update gifts set stock = stock + 1 where id = v_redemption.gift_id;
  update gift_redemptions
    set status = 'cancelled', refunded = true
    where id = p_id;

  insert into points_transactions
    (user_id, delta, type, reason, ref_redemption_id, balance_after)
    values (v_redemption.user_id, v_redemption.points_used, 'refund_gift',
            p_reason, p_id, v_balance);
end;
$$;

-- ============================================================
-- 12. admin_adjust_points — admin chỉnh điểm thủ công
-- ============================================================
create or replace function admin_adjust_points(
  p_user_id uuid,
  p_delta integer,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current integer;
  v_actual integer;
  v_balance integer;
begin
  if not is_admin(auth.uid()) then raise exception 'Admin only'; end if;
  if length(coalesce(trim(p_reason),'')) = 0 then
    raise exception 'Reason required';
  end if;

  select current_points into v_current from profiles where id = p_user_id for update;
  if not found then raise exception 'User not found'; end if;

  if p_delta < 0 then
    v_actual := greatest(p_delta, -v_current);  -- clamp về 0
  else
    v_actual := p_delta;
  end if;

  update profiles set current_points = current_points + v_actual
    where id = p_user_id returning current_points into v_balance;

  insert into points_transactions
    (user_id, delta, type, reason, balance_after)
    values (p_user_id, v_actual, 'admin_adjust', p_reason, v_balance);

  if v_actual <> p_delta then
    insert into points_transactions
      (user_id, delta, type, reason, balance_after)
      values (p_user_id, 0, 'clamp',
              'admin_adjust clamped from ' || p_delta || ' to ' || v_actual,
              v_balance);
  end if;
end;
$$;

-- DONE — migration 0004

-- ============================================================
-- Vua Bỉm — Migration 0008: Fix RPC place_order (FK order)
-- ============================================================
-- Lỗi cũ: log points_transactions với ref_order_id TRƯỚC khi INSERT orders
-- → vi phạm FK constraint points_transactions_ref_order_id_fkey
--
-- Fix: re-order — INSERT orders + order_items TRƯỚC, rồi mới deduct points + log.

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

  -- 3. Validate gift checkout (nếu có)
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

  -- 6. INSERT orders TRƯỚC (FK của points_transactions tham chiếu orders.id)
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

  -- 7. INSERT order_items + trừ tồn kho
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

  -- 8. Trừ điểm TK + log (giờ ref_order_id đã hợp lệ)
  if v_account_used > 0 then
    update profiles set current_points = current_points - v_account_used
      where id = v_uid returning current_points into v_balance;
    insert into points_transactions
      (user_id, delta, type, ref_order_id, balance_after)
      values (v_uid, -v_account_used, 'use_account_direct', v_order_id, v_balance);
  end if;

  -- 9. Đổi quà checkout (nếu có)
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

  return v_order_id;
end;
$$;

-- DONE — place_order đã sửa thứ tự

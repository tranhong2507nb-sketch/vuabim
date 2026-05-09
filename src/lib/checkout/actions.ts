'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CheckoutSchema } from './schemas'
import { pushOrderToSheet } from '@/lib/google-sheets/push-order'
import type { CartItem } from '@/lib/cart/types'

type PlaceOrderResult =
  | { ok: true; order_id: string; order_code: string }
  | { ok: false; error: string }

interface PlaceOrderInput {
  form: unknown
  items: CartItem[]
}

/**
 * Server Action — gọi RPC place_order (Phase 0 migration 0004).
 *
 * RPC tự xử lý:
 * - Validate cart, tồn kho, giá khớp
 * - Tính subtotal, points_to_earn, instant/account discounts (clamp 0)
 * - Trừ điểm TK + đổi quà checkout (atomic)
 * - Tạo orders + order_items + log points_transactions
 *
 * Trả về order_id để client redirect đến trang đặt hàng thành công.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = CheckoutSchema.safeParse(input.form)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  if (!input.items || input.items.length === 0) {
    return { ok: false, error: 'Giỏ hàng trống' }
  }

  // Mỗi sản phẩm phải có số lượng tối thiểu 2 cái
  const itemBelowMin = input.items.find(i => (i.qty ?? 0) < 2)
  if (itemBelowMin) {
    return {
      ok: false,
      error: `Mỗi sản phẩm phải mua tối thiểu 2 cái. "${itemBelowMin.name}" đang có ${itemBelowMin.qty} cái.`,
    }
  }

  const supabase = await createClient()

  // Build payload jsonb cho RPC place_order(p_input jsonb)
  const rpcInput = {
    items: input.items.map(item => ({
      product_id: item.product_id,
      qty: item.qty,
      unit_price: item.price, // snapshot — RPC sẽ validate khớp với DB
    })),

    shipping_name: parsed.data.shipping_name,
    shipping_phone: parsed.data.shipping_phone,
    shipping_email: parsed.data.shipping_email,
    province_code: parsed.data.province_code,
    province_name: parsed.data.province_name,
    district_code: parsed.data.district_code,
    district_name: parsed.data.district_name,
    ward_code: parsed.data.ward_code,
    ward_name: parsed.data.ward_name,
    address_detail: parsed.data.address_detail,
    note: parsed.data.note ?? '',

    product_point_choice: parsed.data.product_point_choice,
    account_points_used: parsed.data.account_points_used,
    gift_id: parsed.data.gift_id ?? null,
  }

  const { data: orderId, error } = await supabase.rpc('place_order', {
    p_input: rpcInput,
  })

  if (error) {
    console.error('place_order RPC failed:', error)
    return {
      ok: false,
      error: 'Đặt hàng thất bại: ' + error.message,
    }
  }

  // Tự động chuyển trạng thái pending → confirmed (bỏ bước admin xác nhận thủ công).
  // Dùng admin client để bypass RLS — RPC update_order_status yêu cầu admin role.
  const admin = createAdminClient()
  const { error: updateErr } = await admin
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', orderId as string)
    .eq('status', 'pending') // chỉ update nếu vẫn pending (idempotent)

  if (updateErr) {
    console.error('auto-confirm order failed (non-fatal):', updateErr)
    // Không return lỗi — đơn đã tạo thành công, chỉ là chưa auto-confirm
  }

  // Lấy order_code để redirect
  const { data: order } = await supabase
    .from('orders')
    .select('order_code')
    .eq('id', orderId as string)
    .single()

  // Push lên Google Sheet (non-blocking — fail không ảnh hưởng đặt hàng)
  pushOrderToSheet(orderId as string).catch(err => {
    console.error('pushOrderToSheet error:', err)
  })

  return {
    ok: true,
    order_id: orderId as string,
    order_code: order?.order_code ?? '',
  }
}

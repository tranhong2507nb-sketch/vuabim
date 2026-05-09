'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { ok: false; error: string }

/**
 * Khách tự hủy đơn pending — gọi RPC customer_cancel_order.
 * RPC tự xử lý:
 * - Validate user_id = auth.uid()
 * - Validate status = 'pending'
 * - Hoàn account_points_used về TK
 * - Hủy gift_redemptions gắn → hoàn điểm + tồn kho quà
 * - Hoàn tồn kho sản phẩm
 * - Set status = 'cancelled'
 */
export async function cancelOwnOrder(orderId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('customer_cancel_order', {
    p_order_id: orderId,
  })

  if (error) {
    console.error('customer_cancel_order failed:', error)
    return {
      ok: false,
      error: 'Không hủy được: ' + error.message,
    }
  }

  revalidatePath('/tai-khoan/don-hang')
  return { ok: true }
}

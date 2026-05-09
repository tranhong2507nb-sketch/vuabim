'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult = { ok: true } | { ok: false; error: string }

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'completed'
  | 'cancelled'
  | 'refunded'

const FORWARD: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'shipping',
  shipping: 'completed',
  completed: null,
  cancelled: null,
  refunded: null,
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, error: 'Chưa đăng nhập' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { supabase, error: 'Không có quyền admin' as const }
  }
  return { supabase, error: null as null }
}

function revalidateOrderPaths(code?: string | null, userId?: string | null) {
  revalidatePath('/admin/don-hang')
  revalidatePath('/admin')
  if (code) {
    revalidatePath(`/admin/don-hang/${code}`)
    revalidatePath(`/tai-khoan/don-hang/${code}`)
  }
  revalidatePath('/tai-khoan/don-hang')
  if (userId) revalidatePath(`/admin/khach-hang/${userId}`)
}

export async function advanceOrderStatus(orderId: string): Promise<ActionResult> {
  if (!orderId) return { ok: false, error: 'ID không hợp lệ' }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('orders')
    .select('status, order_code, user_id, cancel_requested_at')
    .eq('id', orderId)
    .single()

  if (!row) return { ok: false, error: 'Không tìm thấy đơn' }

  if (row.cancel_requested_at) {
    return {
      ok: false,
      error: 'Khách đang yêu cầu hủy — duyệt hoặc từ chối yêu cầu trước',
    }
  }

  const next = FORWARD[row.status as OrderStatus]
  if (!next) {
    return { ok: false, error: `Trạng thái "${row.status}" không thể tiến tiếp` }
  }

  const { error } = await supabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_new_status: next,
    p_reason: null,
  })

  if (error) {
    console.error('advanceOrderStatus failed:', error)
    return { ok: false, error: 'Cập nhật thất bại: ' + error.message }
  }

  revalidateOrderPaths(row.order_code, row.user_id)
  return { ok: true }
}

export async function adminCancelOrder(
  orderId: string,
  reason: string
): Promise<ActionResult> {
  if (!orderId) return { ok: false, error: 'ID không hợp lệ' }
  const trimmed = (reason ?? '').trim()
  if (trimmed.length < 3) {
    return { ok: false, error: 'Lý do tối thiểu 3 ký tự' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('orders')
    .select('order_code, user_id')
    .eq('id', orderId)
    .single()

  const { error } = await supabase.rpc('cancel_order', {
    p_order_id: orderId,
    p_reason: trimmed,
  })

  if (error) {
    console.error('adminCancelOrder failed:', error)
    return { ok: false, error: 'Hủy thất bại: ' + error.message }
  }

  revalidateOrderPaths(row?.order_code, row?.user_id)
  return { ok: true }
}

/**
 * Duyệt yêu cầu hủy của khách → cancel_order với lý do từ cancel_request_reason.
 */
export async function approveCancelRequest(
  orderId: string
): Promise<ActionResult> {
  if (!orderId) return { ok: false, error: 'ID không hợp lệ' }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('orders')
    .select('order_code, user_id, cancel_requested_at, cancel_request_reason')
    .eq('id', orderId)
    .single()

  if (!row) return { ok: false, error: 'Không tìm thấy đơn' }
  if (!row.cancel_requested_at) {
    return { ok: false, error: 'Đơn này không có yêu cầu hủy' }
  }

  const reason =
    'Duyệt yêu cầu hủy: ' + (row.cancel_request_reason ?? 'không nêu lý do')

  const { error } = await supabase.rpc('cancel_order', {
    p_order_id: orderId,
    p_reason: reason,
  })

  if (error) {
    console.error('approveCancelRequest failed:', error)
    return { ok: false, error: 'Duyệt thất bại: ' + error.message }
  }

  revalidateOrderPaths(row.order_code, row.user_id)
  return { ok: true }
}

/**
 * Từ chối yêu cầu hủy: clear cancel_requested_at + gửi tin nhắn "admin".
 * Dùng admin client để bypass RLS (không có RPC reject_cancel).
 */
export async function rejectCancelRequest(
  orderId: string,
  message: string
): Promise<ActionResult> {
  if (!orderId) return { ok: false, error: 'ID không hợp lệ' }
  const trimmed = (message ?? '').trim()
  if (trimmed.length < 3) {
    return { ok: false, error: 'Lý do từ chối tối thiểu 3 ký tự' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('orders')
    .select('order_code, user_id, cancel_requested_at')
    .eq('id', orderId)
    .single()

  if (!row) return { ok: false, error: 'Không tìm thấy đơn' }
  if (!row.cancel_requested_at) {
    return { ok: false, error: 'Đơn này không có yêu cầu hủy' }
  }

  const admin = createAdminClient()

  const { error: updErr } = await admin
    .from('orders')
    .update({
      cancel_requested_at: null,
      cancel_request_reason: null,
    })
    .eq('id', orderId)

  if (updErr) {
    console.error('rejectCancelRequest update failed:', updErr)
    return { ok: false, error: 'Từ chối thất bại: ' + updErr.message }
  }

  // Gửi tin nhắn admin để khách thấy lý do từ chối
  const { error: msgErr } = await supabase.rpc('send_order_message', {
    p_order_id: orderId,
    p_message: 'Shop đã từ chối yêu cầu hủy. Lý do: ' + trimmed,
    p_attachments: [],
  })
  if (msgErr) {
    console.error('rejectCancelRequest message failed:', msgErr)
  }

  revalidateOrderPaths(row.order_code, row.user_id)
  return { ok: true }
}

export async function refundCompletedOrder(
  orderId: string,
  reason: string,
  refundGifts: boolean = true
): Promise<ActionResult> {
  if (!orderId) return { ok: false, error: 'ID không hợp lệ' }
  const trimmed = (reason ?? '').trim()
  if (trimmed.length < 3) {
    return { ok: false, error: 'Lý do tối thiểu 3 ký tự' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('orders')
    .select('order_code, user_id')
    .eq('id', orderId)
    .single()

  const { error } = await supabase.rpc('refund_completed_order', {
    p_order_id: orderId,
    p_reason: trimmed,
    p_refund_gifts: refundGifts,
  })

  if (error) {
    console.error('refundCompletedOrder failed:', error)
    return { ok: false, error: 'Hoàn tiền thất bại: ' + error.message }
  }

  revalidateOrderPaths(row?.order_code, row?.user_id)
  return { ok: true }
}

export async function sendOrderMessage(
  orderId: string,
  message: string
): Promise<ActionResult> {
  if (!orderId) return { ok: false, error: 'ID không hợp lệ' }
  const trimmed = (message ?? '').trim()
  if (trimmed.length === 0) {
    return { ok: false, error: 'Tin nhắn trống' }
  }
  if (trimmed.length > 2000) {
    return { ok: false, error: 'Tin nhắn quá dài (max 2000 ký tự)' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('orders')
    .select('order_code, user_id')
    .eq('id', orderId)
    .single()

  const { error } = await supabase.rpc('send_order_message', {
    p_order_id: orderId,
    p_message: trimmed,
    p_attachments: [],
  })

  if (error) {
    console.error('sendOrderMessage failed:', error)
    return { ok: false, error: 'Gửi tin nhắn thất bại: ' + error.message }
  }

  revalidateOrderPaths(row?.order_code, row?.user_id)
  return { ok: true }
}

export async function markOrderMessagesRead(
  orderId: string
): Promise<ActionResult> {
  if (!orderId) return { ok: false, error: 'ID không hợp lệ' }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { error } = await supabase.rpc('mark_order_messages_read', {
    p_order_id: orderId,
  })

  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

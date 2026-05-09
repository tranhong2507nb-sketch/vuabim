'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

export type RedemptionStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'completed'
  | 'cancelled'

const FORWARD_TRANSITIONS: Record<RedemptionStatus, RedemptionStatus | null> = {
  pending: 'confirmed',
  confirmed: 'shipping',
  shipping: 'completed',
  completed: null,
  cancelled: null,
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

function revalidateRedemptionPaths(code?: string | null) {
  revalidatePath('/admin/yeu-cau-doi-qua')
  revalidatePath('/admin')
  revalidatePath('/tai-khoan/qua-da-doi')
  if (code) revalidatePath(`/admin/yeu-cau-doi-qua/${code}`)
}

/**
 * Đổi trạng thái tiến (forward only): pending→confirmed→shipping→completed.
 * Không cho lùi để tránh sai logic.
 */
export async function advanceRedemptionStatus(id: string): Promise<ActionResult> {
  if (!id || typeof id !== 'string') {
    return { ok: false, error: 'ID không hợp lệ' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('gift_redemptions')
    .select('id, status, redemption_code')
    .eq('id', id)
    .single()

  if (!row) return { ok: false, error: 'Không tìm thấy yêu cầu' }

  const current = row.status as RedemptionStatus
  const next = FORWARD_TRANSITIONS[current]
  if (!next) {
    return { ok: false, error: `Trạng thái "${current}" không thể tiến tiếp` }
  }

  const { error } = await supabase
    .from('gift_redemptions')
    .update({ status: next })
    .eq('id', id)

  if (error) {
    console.error('advanceRedemptionStatus failed:', error)
    return { ok: false, error: 'Cập nhật thất bại: ' + error.message }
  }

  revalidateRedemptionPaths(row.redemption_code)
  return { ok: true }
}

/**
 * Hủy đổi quà — gọi RPC `cancel_gift_redemption` để refund điểm + tăng tồn quà.
 */
export async function cancelRedemption(
  id: string,
  reason?: string
): Promise<ActionResult> {
  if (!id || typeof id !== 'string') {
    return { ok: false, error: 'ID không hợp lệ' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('gift_redemptions')
    .select('redemption_code')
    .eq('id', id)
    .single()

  const { error } = await supabase.rpc('cancel_gift_redemption', {
    p_id: id,
    p_reason: reason?.trim() || null,
  })

  if (error) {
    console.error('cancelRedemption failed:', error)
    return { ok: false, error: 'Hủy thất bại: ' + error.message }
  }

  revalidateRedemptionPaths(row?.redemption_code)
  return { ok: true }
}

'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

const AdjustSchema = z.object({
  user_id: z.string().uuid('User ID không hợp lệ'),
  delta: z
    .number({ message: 'Điểm phải là số' })
    .int('Điểm phải là số nguyên')
    .refine(v => v !== 0, 'Điểm thay đổi phải khác 0')
    .min(-1_000_000, 'Số quá nhỏ')
    .max(1_000_000, 'Số quá lớn'),
  reason: z
    .string()
    .trim()
    .min(3, 'Lý do tối thiểu 3 ký tự')
    .max(300, 'Lý do quá dài'),
})

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

/**
 * Cộng/trừ điểm thủ công cho 1 khách. Gọi RPC `admin_adjust_points`:
 * - Nếu trừ > số điểm hiện có → tự clamp về 0 (không âm), ghi thêm 1 dòng audit type='clamp'
 * - Ghi `points_transactions` type='admin_adjust' (audit append-only)
 */
export async function adjustCustomerPoints(input: unknown): Promise<ActionResult> {
  const parsed = AdjustSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { error } = await supabase.rpc('admin_adjust_points', {
    p_user_id: parsed.data.user_id,
    p_delta: parsed.data.delta,
    p_reason: parsed.data.reason,
  })

  if (error) {
    console.error('adjustCustomerPoints failed:', error)
    return { ok: false, error: 'Điều chỉnh thất bại: ' + error.message }
  }

  revalidatePath('/admin/khach-hang')
  revalidatePath(`/admin/khach-hang/${parsed.data.user_id}`)
  return { ok: true }
}

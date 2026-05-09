'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ProfileUpdateSchema } from './schemas'

type ActionResult = { ok: true } | { ok: false; error: string }

/**
 * Cập nhật profile (full_name, phone) cho user hiện tại.
 * Email không sửa qua đây — phải dùng Supabase Auth flow riêng.
 */
export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = ProfileUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Chưa đăng nhập' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
    })
    .eq('id', user.id)

  if (error) {
    console.error('updateProfile failed:', error)
    return { ok: false, error: 'Cập nhật thất bại: ' + error.message }
  }

  revalidatePath('/tai-khoan')
  revalidatePath('/tai-khoan/thong-tin')
  return { ok: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { GiftCreateSchema, GiftUpdateSchema } from './schemas'

type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string }

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

function revalidateGiftPaths() {
  revalidatePath('/admin/qua')
  revalidatePath('/doi-qua')
}

export async function createGift(input: unknown): Promise<ActionResult> {
  const parsed = GiftCreateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data, error } = await supabase
    .from('gifts')
    .insert({
      name: parsed.data.name,
      image_url: parsed.data.image_url || null,
      description: parsed.data.description || null,
      points_required: parsed.data.points_required,
      stock: parsed.data.stock,
      is_active: parsed.data.is_active,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createGift failed:', error)
    return { ok: false, error: 'Tạo quà thất bại: ' + error.message }
  }

  revalidateGiftPaths()
  return { ok: true, id: data.id }
}

export async function updateGift(input: unknown): Promise<ActionResult> {
  const parsed = GiftUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { error } = await supabase
    .from('gifts')
    .update({
      name: parsed.data.name,
      image_url: parsed.data.image_url || null,
      description: parsed.data.description || null,
      points_required: parsed.data.points_required,
      stock: parsed.data.stock,
      is_active: parsed.data.is_active,
    })
    .eq('id', parsed.data.id)

  if (error) {
    console.error('updateGift failed:', error)
    return { ok: false, error: 'Cập nhật thất bại: ' + error.message }
  }

  revalidateGiftPaths()
  return { ok: true, id: parsed.data.id }
}

export async function deleteGift(id: string): Promise<ActionResult> {
  if (typeof id !== 'string' || !id) {
    return { ok: false, error: 'ID không hợp lệ' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { error } = await supabase.from('gifts').delete().eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return {
        ok: false,
        error:
          'Quà đã có yêu cầu đổi — không thể xóa. Hãy "Tắt" thay vì xóa.',
      }
    }
    console.error('deleteGift failed:', error)
    return { ok: false, error: 'Xóa thất bại: ' + error.message }
  }

  revalidateGiftPaths()
  return { ok: true }
}

export async function toggleGiftActive(
  id: string,
  is_active: boolean
): Promise<ActionResult> {
  if (typeof id !== 'string' || !id) {
    return { ok: false, error: 'ID không hợp lệ' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { error } = await supabase
    .from('gifts')
    .update({ is_active })
    .eq('id', id)

  if (error) {
    console.error('toggleGiftActive failed:', error)
    return { ok: false, error: 'Cập nhật trạng thái thất bại' }
  }

  revalidateGiftPaths()
  return { ok: true }
}

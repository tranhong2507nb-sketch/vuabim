'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ProductCreateSchema, ProductUpdateSchema } from './schemas'

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

function revalidateProductPaths(slug?: string | null) {
  revalidatePath('/admin/san-pham')
  revalidatePath('/san-pham')
  revalidatePath('/')
  revalidatePath('/thuong-hieu')
  if (slug) revalidatePath(`/san-pham/${slug}`)
}

export async function createProduct(input: unknown): Promise<ActionResult> {
  const parsed = ProductCreateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      brand_id: parsed.data.brand_id,
      size: parsed.data.size || null,
      weight_range: parsed.data.weight_range || null,
      diaper_type: parsed.data.diaper_type,
      usage_day: parsed.data.usage_day,
      usage_night: parsed.data.usage_night,
      price: parsed.data.price,
      stock: parsed.data.stock,
      points_per_unit: parsed.data.points_per_unit,
      images: parsed.data.images,
      meta_title: parsed.data.meta_title || null,
      meta_description: parsed.data.meta_description || null,
      is_active: parsed.data.is_active,
    })
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Slug đã tồn tại — đổi slug khác' }
    }
    console.error('createProduct failed:', error)
    return { ok: false, error: 'Tạo sản phẩm thất bại: ' + error.message }
  }

  revalidateProductPaths(data.slug)
  return { ok: true, id: data.id }
}

export async function updateProduct(input: unknown): Promise<ActionResult> {
  const parsed = ProductUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: oldRow } = await supabase
    .from('products')
    .select('slug')
    .eq('id', parsed.data.id)
    .single()

  const { error } = await supabase
    .from('products')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      brand_id: parsed.data.brand_id,
      size: parsed.data.size || null,
      weight_range: parsed.data.weight_range || null,
      diaper_type: parsed.data.diaper_type,
      usage_day: parsed.data.usage_day,
      usage_night: parsed.data.usage_night,
      price: parsed.data.price,
      stock: parsed.data.stock,
      points_per_unit: parsed.data.points_per_unit,
      images: parsed.data.images,
      meta_title: parsed.data.meta_title || null,
      meta_description: parsed.data.meta_description || null,
      is_active: parsed.data.is_active,
    })
    .eq('id', parsed.data.id)

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Slug đã tồn tại — đổi slug khác' }
    }
    console.error('updateProduct failed:', error)
    return { ok: false, error: 'Cập nhật thất bại: ' + error.message }
  }

  revalidateProductPaths(parsed.data.slug)
  if (oldRow?.slug && oldRow.slug !== parsed.data.slug) {
    revalidatePath(`/san-pham/${oldRow.slug}`)
  }
  return { ok: true, id: parsed.data.id }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  if (typeof id !== 'string' || !id) {
    return { ok: false, error: 'ID không hợp lệ' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('products')
    .select('slug')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return {
        ok: false,
        error:
          'Sản phẩm đã có trong đơn hàng — không thể xóa. Hãy ẩn (Tắt hoạt động) thay vì xóa.',
      }
    }
    console.error('deleteProduct failed:', error)
    return { ok: false, error: 'Xóa thất bại: ' + error.message }
  }

  revalidateProductPaths(row?.slug)
  return { ok: true }
}

export async function toggleProductActive(
  id: string,
  is_active: boolean
): Promise<ActionResult> {
  if (typeof id !== 'string' || !id) {
    return { ok: false, error: 'ID không hợp lệ' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data, error } = await supabase
    .from('products')
    .update({ is_active })
    .eq('id', id)
    .select('slug')
    .single()

  if (error) {
    console.error('toggleProductActive failed:', error)
    return { ok: false, error: 'Cập nhật trạng thái thất bại' }
  }

  revalidateProductPaths(data?.slug)
  return { ok: true }
}

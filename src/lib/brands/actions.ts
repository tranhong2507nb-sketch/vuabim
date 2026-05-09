'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sanitizeBrandStory } from '@/lib/sanitize/brand-story'
import {
  BrandCreateSchema,
  BrandUpdateSchema,
  BrandStorySchema,
} from './schemas'

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

function revalidateBrandPaths(slug?: string | null) {
  revalidatePath('/admin/thuong-hieu')
  revalidatePath('/thuong-hieu')
  revalidatePath('/')
  if (slug) revalidatePath(`/thuong-hieu/${slug}`)
}

export async function createBrand(input: unknown): Promise<ActionResult> {
  const parsed = BrandCreateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data, error } = await supabase
    .from('brands')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      logo_url: parsed.data.logo_url || null,
      banner_url: parsed.data.banner_url || null,
      meta_title: parsed.data.meta_title || null,
      meta_description: parsed.data.meta_description || null,
      display_order: parsed.data.display_order,
      is_active: parsed.data.is_active,
    })
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Slug đã tồn tại — đổi slug khác' }
    }
    console.error('createBrand failed:', error)
    return { ok: false, error: 'Tạo hãng thất bại: ' + error.message }
  }

  revalidateBrandPaths(data.slug)
  return { ok: true, id: data.id }
}

export async function updateBrand(input: unknown): Promise<ActionResult> {
  const parsed = BrandUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: oldRow } = await supabase
    .from('brands')
    .select('slug')
    .eq('id', parsed.data.id)
    .single()

  const { error } = await supabase
    .from('brands')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      logo_url: parsed.data.logo_url || null,
      banner_url: parsed.data.banner_url || null,
      meta_title: parsed.data.meta_title || null,
      meta_description: parsed.data.meta_description || null,
      display_order: parsed.data.display_order,
      is_active: parsed.data.is_active,
    })
    .eq('id', parsed.data.id)

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Slug đã tồn tại — đổi slug khác' }
    }
    console.error('updateBrand failed:', error)
    return { ok: false, error: 'Cập nhật thất bại: ' + error.message }
  }

  revalidateBrandPaths(parsed.data.slug)
  if (oldRow?.slug && oldRow.slug !== parsed.data.slug) {
    revalidatePath(`/thuong-hieu/${oldRow.slug}`)
  }
  return { ok: true, id: parsed.data.id }
}

/**
 * Cập nhật riêng story_content. Sanitize HTML server-side trước khi lưu.
 */
export async function updateBrandStory(input: unknown): Promise<ActionResult> {
  const parsed = BrandStorySchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const sanitized = sanitizeBrandStory(parsed.data.story_content)

  const { data, error } = await supabase
    .from('brands')
    .update({ story_content: sanitized })
    .eq('id', parsed.data.id)
    .select('slug')
    .single()

  if (error) {
    console.error('updateBrandStory failed:', error)
    return { ok: false, error: 'Lưu nội dung thất bại: ' + error.message }
  }

  revalidateBrandPaths(data?.slug)
  return { ok: true, id: parsed.data.id }
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  if (typeof id !== 'string' || !id) {
    return { ok: false, error: 'ID không hợp lệ' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data: row } = await supabase
    .from('brands')
    .select('slug')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('brands').delete().eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return {
        ok: false,
        error:
          'Hãng đã có sản phẩm — không thể xóa. Hãy chuyển sản phẩm sang hãng khác hoặc Tắt hãng.',
      }
    }
    console.error('deleteBrand failed:', error)
    return { ok: false, error: 'Xóa thất bại: ' + error.message }
  }

  revalidateBrandPaths(row?.slug)
  return { ok: true }
}

export async function toggleBrandActive(
  id: string,
  is_active: boolean
): Promise<ActionResult> {
  if (typeof id !== 'string' || !id) {
    return { ok: false, error: 'ID không hợp lệ' }
  }

  const { supabase, error: authErr } = await requireAdmin()
  if (authErr) return { ok: false, error: authErr }

  const { data, error } = await supabase
    .from('brands')
    .update({ is_active })
    .eq('id', id)
    .select('slug')
    .single()

  if (error) {
    console.error('toggleBrandActive failed:', error)
    return { ok: false, error: 'Cập nhật trạng thái thất bại' }
  }

  revalidateBrandPaths(data?.slug)
  return { ok: true }
}

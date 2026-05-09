'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

const ShippingDefaultSchema = z.object({
  shipping_name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(60),
  shipping_phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
  province_code: z.string().min(1, 'Chọn Tỉnh/Thành'),
  province_name: z.string().min(1),
  district_code: z.string().min(1, 'Chọn Quận/Huyện'),
  district_name: z.string().min(1),
  ward_code: z.string().min(1, 'Chọn Phường/Xã'),
  ward_name: z.string().min(1),
  address_detail: z.string().min(5, 'Địa chỉ chi tiết tối thiểu 5 ký tự').max(200),
})

/**
 * Lưu thông tin giao hàng làm mặc định vào profiles.
 * Lần checkout sau sẽ tự prefill.
 */
export async function saveShippingDefaults(input: unknown): Promise<ActionResult> {
  const parsed = ShippingDefaultSchema.safeParse(input)
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
      default_shipping_name: parsed.data.shipping_name,
      default_shipping_phone: parsed.data.shipping_phone,
      default_province_code: parsed.data.province_code,
      default_province_name: parsed.data.province_name,
      default_district_code: parsed.data.district_code,
      default_district_name: parsed.data.district_name,
      default_ward_code: parsed.data.ward_code,
      default_ward_name: parsed.data.ward_name,
      default_address_detail: parsed.data.address_detail,
    })
    .eq('id', user.id)

  if (error) {
    console.error('saveShippingDefaults failed:', error)
    return { ok: false, error: 'Lưu thất bại: ' + error.message }
  }

  revalidatePath('/thanh-toan')
  revalidatePath('/tai-khoan/thong-tin')
  return { ok: true }
}

export interface ShippingDefaults {
  shipping_name: string | null
  shipping_phone: string | null
  province_code: string | null
  province_name: string | null
  district_code: string | null
  district_name: string | null
  ward_code: string | null
  ward_name: string | null
  address_detail: string | null
}

/**
 * Lấy địa chỉ mặc định của user. Trả null nếu chưa lưu lần nào.
 */
export async function getShippingDefaults(): Promise<ShippingDefaults | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select(
      `default_shipping_name, default_shipping_phone,
       default_province_code, default_province_name,
       default_district_code, default_district_name,
       default_ward_code, default_ward_name,
       default_address_detail`
    )
    .eq('id', user.id)
    .single()

  if (!data) return null

  return {
    shipping_name: data.default_shipping_name,
    shipping_phone: data.default_shipping_phone,
    province_code: data.default_province_code,
    province_name: data.default_province_name,
    district_code: data.default_district_code,
    district_name: data.default_district_name,
    ward_code: data.default_ward_code,
    ward_name: data.default_ward_name,
    address_detail: data.default_address_detail,
  }
}

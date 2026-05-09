import { z } from 'zod'

export const CheckoutSchema = z.object({
  shipping_name: z
    .string()
    .min(2, 'Vui lòng nhập họ tên (≥2 ký tự)')
    .max(60, 'Họ tên tối đa 60 ký tự'),
  shipping_email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),
  shipping_phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ (vd: 0912345678)'),

  province_code: z.string().min(1, 'Chọn Tỉnh/Thành'),
  province_name: z.string().min(1),
  district_code: z.string().min(1, 'Chọn Quận/Huyện'),
  district_name: z.string().min(1),
  ward_code: z.string().min(1, 'Chọn Phường/Xã'),
  ward_name: z.string().min(1),

  address_detail: z
    .string()
    .min(5, 'Địa chỉ chi tiết tối thiểu 5 ký tự')
    .max(200, 'Địa chỉ chi tiết tối đa 200 ký tự'),
  note: z.string().max(300, 'Ghi chú tối đa 300 ký tự').optional().or(z.literal('')),

  // Phase 2.2 sẽ tích hợp:
  product_point_choice: z.enum(['earn', 'use_instant']),
  account_points_used: z.number().int().nonnegative(),
  gift_id: z.string().uuid().optional().nullable(),
})

export type CheckoutInput = z.infer<typeof CheckoutSchema>

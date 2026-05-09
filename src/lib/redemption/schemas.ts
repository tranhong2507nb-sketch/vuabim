import { z } from 'zod'

/**
 * Form đổi quà standalone — yêu cầu địa chỉ vì không gắn với đơn nào.
 */
export const RedemptionSchema = z.object({
  gift_id: z.string().uuid(),

  shipping_name: z
    .string()
    .min(2, 'Vui lòng nhập họ tên')
    .max(60),
  shipping_phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
  shipping_email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),

  province_code: z.string().min(1, 'Chọn Tỉnh/Thành'),
  province_name: z.string().min(1),
  district_code: z.string().min(1, 'Chọn Quận/Huyện'),
  district_name: z.string().min(1),
  ward_code: z.string().min(1, 'Chọn Phường/Xã'),
  ward_name: z.string().min(1),
  address_detail: z.string().min(5, 'Địa chỉ chi tiết tối thiểu 5 ký tự').max(200),
  note: z.string().max(300).optional().or(z.literal('')),
})

export type RedemptionInput = z.infer<typeof RedemptionSchema>

import { z } from 'zod'

export const ProfileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(60, 'Họ tên tối đa 60 ký tự'),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ (vd: 0912345678)')
    .optional()
    .or(z.literal('')),
})

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>

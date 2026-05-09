import { z } from 'zod'

export const GiftCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên quà tối thiểu 2 ký tự')
    .max(120, 'Tên quá dài'),
  image_url: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')),
  description: z
    .string()
    .max(500, 'Mô tả tối đa 500 ký tự')
    .optional()
    .or(z.literal('')),
  points_required: z
    .number({ message: 'Điểm phải là số' })
    .int('Điểm phải là số nguyên')
    .min(1, 'Điểm phải lớn hơn 0')
    .max(1_000_000, 'Điểm quá lớn'),
  stock: z
    .number({ message: 'Tồn kho phải là số' })
    .int('Tồn kho phải là số nguyên')
    .min(0, 'Tồn kho không được âm')
    .max(1_000_000, 'Tồn kho quá lớn'),
  is_active: z.boolean(),
})

export const GiftUpdateSchema = GiftCreateSchema.extend({
  id: z.string().uuid(),
})

export type GiftCreateInput = z.infer<typeof GiftCreateSchema>
export type GiftUpdateInput = z.infer<typeof GiftUpdateSchema>

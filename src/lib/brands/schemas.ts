import { z } from 'zod'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const BrandCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên hãng tối thiểu 2 ký tự')
    .max(80, 'Tên hãng tối đa 80 ký tự'),
  slug: z
    .string()
    .min(2, 'Slug tối thiểu 2 ký tự')
    .max(80, 'Slug tối đa 80 ký tự')
    .regex(slugRegex, 'Slug chỉ gồm chữ thường, số, gạch ngang (vd: huggies)'),
  logo_url: z.string().url('URL logo không hợp lệ').optional().or(z.literal('')),
  banner_url: z
    .string()
    .url('URL banner không hợp lệ')
    .optional()
    .or(z.literal('')),
  meta_title: z.string().max(150).optional().or(z.literal('')),
  meta_description: z.string().max(300).optional().or(z.literal('')),
  display_order: z
    .number({ message: 'Thứ tự phải là số' })
    .int('Thứ tự phải là số nguyên')
    .min(0, 'Thứ tự không được âm')
    .max(9999, 'Thứ tự quá lớn'),
  is_active: z.boolean(),
})

export const BrandUpdateSchema = BrandCreateSchema.extend({
  id: z.string().uuid(),
})

export const BrandStorySchema = z.object({
  id: z.string().uuid(),
  story_content: z.string().max(50_000, 'Nội dung quá dài'),
})

export type BrandCreateInput = z.infer<typeof BrandCreateSchema>
export type BrandUpdateInput = z.infer<typeof BrandUpdateSchema>
export type BrandStoryInput = z.infer<typeof BrandStorySchema>

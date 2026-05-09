import { z } from 'zod'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const ProductCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên sản phẩm tối thiểu 2 ký tự')
    .max(150, 'Tên tối đa 150 ký tự'),
  slug: z
    .string()
    .min(2, 'Slug tối thiểu 2 ký tự')
    .max(150, 'Slug tối đa 150 ký tự')
    .regex(slugRegex, 'Slug chỉ gồm chữ thường, số, gạch ngang (vd: bim-merries-size-l)'),
  brand_id: z.string().uuid('Hãng không hợp lệ'),
  size: z.string().max(20).optional().or(z.literal('')),
  weight_range: z.string().max(50).optional().or(z.literal('')),
  diaper_type: z.enum(['pant', 'tape'], {
    message: 'Loại bỉm không hợp lệ',
  }),
  usage_day: z.boolean(),
  usage_night: z.boolean(),
  price: z
    .number({ message: 'Giá phải là số' })
    .int('Giá phải là số nguyên')
    .min(0, 'Giá không được âm')
    .max(100_000_000, 'Giá quá lớn'),
  stock: z
    .number({ message: 'Tồn kho phải là số' })
    .int('Tồn kho phải là số nguyên')
    .min(0, 'Tồn kho không được âm')
    .max(1_000_000, 'Tồn kho quá lớn'),
  points_per_unit: z
    .number({ message: 'Điểm phải là số' })
    .int('Điểm phải là số nguyên')
    .min(0, 'Điểm không được âm')
    .max(10_000, 'Điểm quá lớn'),
  images: z
    .array(z.string().url('URL ảnh không hợp lệ'))
    .max(8, 'Tối đa 8 ảnh'),
  meta_title: z.string().max(150).optional().or(z.literal('')),
  meta_description: z.string().max(300).optional().or(z.literal('')),
  is_active: z.boolean(),
})

export const ProductUpdateSchema = ProductCreateSchema.extend({
  id: z.string().uuid(),
})

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>

/**
 * Tạo slug từ tên: bỏ dấu, lowercase, thay khoảng trắng bằng -
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

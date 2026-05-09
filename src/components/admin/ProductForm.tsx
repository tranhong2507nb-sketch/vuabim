'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ProductCreateSchema,
  type ProductCreateInput,
  slugify,
} from '@/lib/products/schemas'
import { createProduct, updateProduct } from '@/lib/products/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProductImagePicker } from './ProductImagePicker'

interface BrandOption {
  id: string
  name: string
}

interface Props {
  brands: BrandOption[]
  initial?: ProductCreateInput & { id: string }
}

export function ProductForm({ brands, initial }: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const isEdit = !!initial

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(ProductCreateSchema),
    defaultValues: initial ?? {
      name: '',
      slug: '',
      brand_id: brands[0]?.id ?? '',
      size: '',
      weight_range: '',
      diaper_type: 'tape',
      usage_day: false,
      usage_night: false,
      price: 0,
      stock: 0,
      points_per_unit: 0,
      images: [],
      meta_title: '',
      meta_description: '',
      is_active: true,
    },
  })

  const nameValue = watch('name')
  const slugValue = watch('slug')

  function autoFillSlug() {
    if (!slugValue && nameValue) {
      setValue('slug', slugify(nameValue), { shouldDirty: true })
    }
  }

  const onSubmit = (data: ProductCreateInput) => {
    setServerError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateProduct({ ...data, id: initial!.id })
        : await createProduct(data)

      if (!result.ok) {
        setServerError(result.error)
        return
      }

      router.push('/admin/san-pham')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Tên sản phẩm *"
          {...register('name')}
          onBlur={autoFillSlug}
          error={errors.name?.message}
        />
        <Input
          label="Slug *"
          {...register('slug')}
          error={errors.slug?.message}
          hint="URL: /san-pham/{slug}"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Hãng *
        </label>
        <select
          {...register('brand_id')}
          className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-primary-light bg-card text-foreground focus:outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20"
        >
          {brands.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        {errors.brand_id && (
          <p className="mt-1 text-sm text-status-out">{errors.brand_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Size"
          placeholder="vd: M, L, XL"
          {...register('size')}
          error={errors.size?.message}
        />
        <Input
          label="Cân nặng"
          placeholder="vd: 6-11kg"
          {...register('weight_range')}
          error={errors.weight_range?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Loại bỉm *
          </label>
          <select
            {...register('diaper_type')}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-primary-light bg-card text-foreground focus:outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20"
          >
            <option value="tape">Bỉm dán</option>
            <option value="pant">Bỉm quần</option>
          </select>
          {errors.diaper_type && (
            <p className="mt-1 text-sm text-status-out">
              {errors.diaper_type.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Thời điểm dùng
          </label>
          <div className="flex flex-wrap gap-x-4 gap-y-2 min-h-[44px] items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('usage_day')}
                className="w-4 h-4 accent-primary-dark"
              />
              <span className="text-sm text-foreground">Ngày</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('usage_night')}
                className="w-4 h-4 accent-primary-dark"
              />
              <span className="text-sm text-foreground">Đêm</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-muted">
            Có thể tích cả 2, 1 trong 2, hoặc bỏ trống nếu sản phẩm không phân loại
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Giá (đ) *"
          type="number"
          inputMode="numeric"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
        />
        <Input
          label="Tồn kho *"
          type="number"
          inputMode="numeric"
          {...register('stock', { valueAsNumber: true })}
          error={errors.stock?.message}
        />
        <Input
          label="Điểm/sp *"
          type="number"
          inputMode="numeric"
          {...register('points_per_unit', { valueAsNumber: true })}
          error={errors.points_per_unit?.message}
          hint="Điểm sản phẩm (cộng khi đơn completed)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Ảnh sản phẩm
        </label>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ProductImagePicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.images && (
          <p className="mt-1 text-sm text-status-out">{errors.images.message}</p>
        )}
      </div>

      <details className="border border-primary-light rounded-lg">
        <summary className="px-4 py-2.5 cursor-pointer text-sm font-medium text-foreground select-none">
          SEO (tùy chọn)
        </summary>
        <div className="p-4 pt-2 space-y-3 border-t border-primary-light">
          <Input
            label="Meta title"
            {...register('meta_title')}
            error={errors.meta_title?.message}
            hint="Để trống → dùng tên sản phẩm"
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Meta description
            </label>
            <textarea
              {...register('meta_description')}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-primary-light bg-card text-foreground focus:outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20"
            />
            {errors.meta_description?.message && (
              <p className="mt-1 text-sm text-status-out">
                {errors.meta_description.message}
              </p>
            )}
          </div>
        </div>
      </details>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          {...register('is_active')}
          className="w-4 h-4 accent-primary-dark"
        />
        <span className="text-sm text-foreground">
          Đang hoạt động (hiển thị trên web khách)
        </span>
      </label>

      {serverError && (
        <p className="text-sm text-status-out bg-status-out/10 px-3 py-2 rounded-lg">
          {serverError}
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2 border-t border-primary-light">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/san-pham')}
        >
          Hủy
        </Button>
        <Button type="submit" variant="cta" loading={pending}>
          {isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </Button>
      </div>
    </form>
  )
}

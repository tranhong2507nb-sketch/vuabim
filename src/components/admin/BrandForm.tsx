'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BrandCreateSchema,
  type BrandCreateInput,
} from '@/lib/brands/schemas'
import { createBrand, updateBrand } from '@/lib/brands/actions'
import { slugify } from '@/lib/products/schemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SingleImagePicker } from './SingleImagePicker'

interface Props {
  initial?: BrandCreateInput & { id: string }
}

export function BrandForm({ initial }: Props) {
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
  } = useForm<BrandCreateInput>({
    resolver: zodResolver(BrandCreateSchema),
    defaultValues: initial ?? {
      name: '',
      slug: '',
      logo_url: '',
      banner_url: '',
      meta_title: '',
      meta_description: '',
      display_order: 0,
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

  const onSubmit = (data: BrandCreateInput) => {
    setServerError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateBrand({ ...data, id: initial!.id })
        : await createBrand(data)

      if (!result.ok) {
        setServerError(result.error)
        return
      }

      if (!isEdit && result.id) {
        // Sau khi tạo → chuyển sang trang sửa để có thể nhập câu chuyện
        router.push(`/admin/thuong-hieu/${result.id}`)
      } else {
        router.push('/admin/thuong-hieu')
      }
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Tên hãng *"
          placeholder="vd: Merries"
          {...register('name')}
          onBlur={autoFillSlug}
          error={errors.name?.message}
        />
        <Input
          label="Slug *"
          placeholder="vd: merries"
          {...register('slug')}
          error={errors.slug?.message}
          hint="URL: /thuong-hieu/{slug}"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="logo_url"
          control={control}
          render={({ field }) => (
            <SingleImagePicker
              label="Logo (vuông)"
              value={field.value || null}
              onChange={url => field.onChange(url ?? '')}
              pathPrefix="brands/logo"
              aspect="1/1"
            />
          )}
        />
        <Controller
          name="banner_url"
          control={control}
          render={({ field }) => (
            <SingleImagePicker
              label="Banner (ngang)"
              value={field.value || null}
              onChange={url => field.onChange(url ?? '')}
              pathPrefix="brands/banner"
              aspect="3/1"
            />
          )}
        />
      </div>

      <Input
        label="Thứ tự hiển thị"
        type="number"
        inputMode="numeric"
        {...register('display_order', { valueAsNumber: true })}
        error={errors.display_order?.message}
        hint="Số nhỏ hiển thị trước, vd: 0, 1, 2..."
      />

      <details className="border border-primary-light rounded-lg">
        <summary className="px-4 py-2.5 cursor-pointer text-sm font-medium text-foreground select-none">
          SEO (tùy chọn)
        </summary>
        <div className="p-4 pt-2 space-y-3 border-t border-primary-light">
          <Input
            label="Meta title"
            {...register('meta_title')}
            error={errors.meta_title?.message}
            hint="Để trống → dùng tên hãng"
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
          onClick={() => router.push('/admin/thuong-hieu')}
        >
          Hủy
        </Button>
        <Button type="submit" variant="cta" loading={pending}>
          {isEdit ? 'Lưu thay đổi' : 'Tạo hãng'}
        </Button>
      </div>
    </form>
  )
}

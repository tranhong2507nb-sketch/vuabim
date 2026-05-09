'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  GiftCreateSchema,
  type GiftCreateInput,
} from '@/lib/gifts/schemas'
import { createGift, updateGift } from '@/lib/gifts/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SingleImagePicker } from './SingleImagePicker'

interface Props {
  initial?: GiftCreateInput & { id: string }
}

export function GiftForm({ initial }: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const isEdit = !!initial

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GiftCreateInput>({
    resolver: zodResolver(GiftCreateSchema),
    defaultValues: initial ?? {
      name: '',
      image_url: '',
      description: '',
      points_required: 100,
      stock: 0,
      is_active: true,
    },
  })

  const onSubmit = (data: GiftCreateInput) => {
    setServerError(null)
    startTransition(async () => {
      const result = isEdit
        ? await updateGift({ ...data, id: initial!.id })
        : await createGift(data)

      if (!result.ok) {
        setServerError(result.error)
        return
      }

      router.push('/admin/qua')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="Tên quà *"
        placeholder="vd: Khăn ướt Bobby 80 tờ"
        {...register('name')}
        error={errors.name?.message}
      />

      <Controller
        name="image_url"
        control={control}
        render={({ field }) => (
          <SingleImagePicker
            label="Ảnh quà"
            value={field.value || null}
            onChange={url => field.onChange(url ?? '')}
            pathPrefix="gifts"
            aspect="1/1"
          />
        )}
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Mô tả
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Mô tả ngắn về quà — kích thước, màu sắc, đặc điểm..."
          className="w-full px-3 py-2.5 rounded-lg border border-primary-light bg-card text-foreground focus:outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20"
        />
        {errors.description?.message && (
          <p className="mt-1 text-sm text-status-out">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Điểm cần đổi *"
          type="number"
          inputMode="numeric"
          {...register('points_required', { valueAsNumber: true })}
          error={errors.points_required?.message}
          hint="Khách phải có >= điểm này để đổi"
        />
        <Input
          label="Tồn kho *"
          type="number"
          inputMode="numeric"
          {...register('stock', { valueAsNumber: true })}
          error={errors.stock?.message}
          hint="Số lượng còn để đổi"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          {...register('is_active')}
          className="w-4 h-4 accent-primary-dark"
        />
        <span className="text-sm text-foreground">
          Đang hoạt động (hiển thị trên trang đổi quà)
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
          onClick={() => router.push('/admin/qua')}
        >
          Hủy
        </Button>
        <Button type="submit" variant="cta" loading={pending}>
          {isEdit ? 'Lưu thay đổi' : 'Tạo quà'}
        </Button>
      </div>
    </form>
  )
}

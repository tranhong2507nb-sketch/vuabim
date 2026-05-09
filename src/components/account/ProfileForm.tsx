'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProfileUpdateSchema, type ProfileUpdateInput } from '@/lib/profile/schemas'
import { updateProfile } from '@/lib/profile/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Props {
  defaultValues: ProfileUpdateInput
  email: string
}

export function ProfileForm({ defaultValues, email }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues,
  })

  const onSubmit = async (data: ProfileUpdateInput) => {
    setServerError(null)
    const result = await updateProfile(data)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    setSavedAt(new Date())
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Họ và tên *"
        autoComplete="name"
        {...register('full_name')}
        error={errors.full_name?.message}
      />

      <Input
        label="Email"
        value={email}
        disabled
        readOnly
        hint="Email dùng để đăng nhập — không thể sửa tại đây"
      />

      <Input
        label="Số điện thoại"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="vd: 0912345678"
        {...register('phone')}
        error={errors.phone?.message}
      />

      {serverError && (
        <p className="text-sm text-status-out bg-status-out/10 px-3 py-2 rounded-lg">
          {serverError}
        </p>
      )}

      {savedAt && !isDirty && (
        <p className="text-sm text-status-instock bg-status-instock/10 px-3 py-2 rounded-lg">
          ✓ Đã lưu lúc{' '}
          {savedAt.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}

      <Button
        type="submit"
        variant="cta"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={!isDirty}
      >
        Lưu thay đổi
      </Button>
    </form>
  )
}

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import Link from 'next/link'
import { RegisterSchema, type RegisterInput } from '@/lib/auth/schemas'
import { signUpWithEmail } from '@/lib/auth/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { accept_terms: false },
  })

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)
    const result = await signUpWithEmail(data)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="bg-cta-bg border border-primary-light rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-primary-dark mb-2">
          Đăng ký thành công 🎉
        </h2>
        <p className="text-sm text-muted mb-4">
          Vui lòng kiểm tra email và bấm vào link xác minh để hoàn tất đăng ký.
        </p>
        <Link href="/dang-nhap">
          <Button variant="outline" size="md">
            Quay lại đăng nhập
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Họ và tên"
        autoComplete="name"
        placeholder="vd: Nguyễn Hoa"
        {...register('full_name')}
        error={errors.full_name?.message}
      />

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="vd: meobim@gmail.com"
        {...register('email')}
        error={errors.email?.message}
      />

      <Input
        label="Số điện thoại (tùy chọn)"
        type="tel"
        autoComplete="tel"
        inputMode="numeric"
        placeholder="vd: 0912345678"
        {...register('phone')}
        error={errors.phone?.message}
      />

      <Input
        label="Mật khẩu"
        type="password"
        autoComplete="new-password"
        placeholder="Tối thiểu 6 ký tự"
        {...register('password')}
        error={errors.password?.message}
      />

      <Input
        label="Nhập lại mật khẩu"
        type="password"
        autoComplete="new-password"
        placeholder="Nhập lại mật khẩu"
        {...register('confirm_password')}
        error={errors.confirm_password?.message}
      />

      <div className="flex items-start gap-2.5">
        <input
          id="accept_terms"
          type="checkbox"
          {...register('accept_terms')}
          className="mt-1 w-4 h-4 accent-primary-dark"
        />
        <label htmlFor="accept_terms" className="text-sm text-muted">
          Tôi đồng ý với{' '}
          <Link href="/dieu-khoan-su-dung" className="text-primary-dark hover:underline">
            Điều khoản sử dụng
          </Link>{' '}
          và{' '}
          <Link href="/chinh-sach-bao-mat" className="text-primary-dark hover:underline">
            Chính sách bảo mật
          </Link>
        </label>
      </div>
      {errors.accept_terms && (
        <p className="text-sm text-status-out">{errors.accept_terms.message}</p>
      )}

      {serverError && (
        <p className="text-sm text-status-out bg-status-out/10 px-3 py-2 rounded-lg">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        variant="cta"
        size="lg"
        fullWidth
        loading={isSubmitting}
      >
        Đăng ký
      </Button>
    </form>
  )
}

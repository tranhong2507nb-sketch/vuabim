'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@/lib/auth/schemas'
import { forgotPassword } from '@/lib/auth/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null)
    const result = await forgotPassword(data)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    setSuccess(true)
  }

  return (
    <div className="bg-card rounded-2xl border border-primary-light p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Quên mật khẩu</h1>
      <p className="text-sm text-muted mb-6">
        Nhập email để nhận link đặt lại mật khẩu
      </p>

      {success ? (
        <div className="bg-cta-bg border border-primary-light rounded-lg p-4 text-sm text-foreground">
          ✓ Đã gửi email! Vui lòng kiểm tra hộp thư (kể cả thư rác) và click link để đặt lại mật khẩu.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="vd: meobim@gmail.com"
            {...register('email')}
            error={errors.email?.message}
          />

          {serverError && (
            <p className="text-sm text-status-out bg-status-out/10 px-3 py-2 rounded-lg">
              {serverError}
            </p>
          )}

          <Button type="submit" variant="cta" size="lg" fullWidth loading={isSubmitting}>
            Gửi link đặt lại mật khẩu
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/dang-nhap" className="text-primary-dark hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </div>
  )
}

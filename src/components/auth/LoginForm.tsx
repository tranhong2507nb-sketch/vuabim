'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { LoginSchema, type LoginInput } from '@/lib/auth/schemas'
import { signInWithEmail } from '@/lib/auth/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect_to') ?? '/tai-khoan'
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    const result = await signInWithEmail(data)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
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

      <Input
        label="Mật khẩu"
        type="password"
        autoComplete="current-password"
        placeholder="Nhập mật khẩu"
        {...register('password')}
        error={errors.password?.message}
      />

      <div className="flex justify-end">
        <Link
          href="/quen-mat-khau"
          className="text-sm text-primary-dark hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>

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
        Đăng nhập
      </Button>
    </form>
  )
}

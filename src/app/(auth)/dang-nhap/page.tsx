import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập tài khoản Vua Bỉm',
}

export default function LoginPage() {
  return (
    <div className="bg-card rounded-2xl border border-primary-light p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Đăng nhập</h1>
      <p className="text-sm text-muted mb-6">
        Chào mừng mẹ trở lại Vua Bỉm 🌿
      </p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <div className="my-6 flex items-center gap-3 text-sm text-subtle">
        <div className="flex-1 h-px bg-primary-light" />
        <span>HOẶC</span>
        <div className="flex-1 h-px bg-primary-light" />
      </div>

      <OAuthButtons />

      <p className="mt-6 text-center text-sm text-muted">
        Chưa có tài khoản?{' '}
        <Link href="/dang-ky" className="text-primary-dark font-medium hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  )
}

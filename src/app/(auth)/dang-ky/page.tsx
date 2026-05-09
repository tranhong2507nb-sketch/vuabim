import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng ký',
  description: 'Tạo tài khoản Vua Bỉm — tích điểm đổi quà',
}

export default function RegisterPage() {
  return (
    <div className="bg-card rounded-2xl border border-primary-light p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Đăng ký</h1>
      <p className="text-sm text-muted mb-6">
        Tạo tài khoản miễn phí để mua bỉm + tích điểm đổi quà
      </p>

      <RegisterForm />

      <div className="my-6 flex items-center gap-3 text-sm text-subtle">
        <div className="flex-1 h-px bg-primary-light" />
        <span>HOẶC ĐĂNG KÝ NHANH</span>
        <div className="flex-1 h-px bg-primary-light" />
      </div>

      <OAuthButtons />

      <p className="mt-6 text-center text-sm text-muted">
        Đã có tài khoản?{' '}
        <Link href="/dang-nhap" className="text-primary-dark font-medium hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  )
}

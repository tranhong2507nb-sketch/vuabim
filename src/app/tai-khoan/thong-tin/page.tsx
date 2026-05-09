import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { ProfileForm } from '@/components/account/ProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thông tin cá nhân',
  robots: { index: false, follow: false },
}

export default async function ProfileInfoPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/dang-nhap')

  // Fetch phone từ DB (CurrentUser type không có phone)
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <nav className="text-xs text-muted mb-3">
        <Link href="/tai-khoan" className="hover:text-primary-dark">
          ← Tài khoản
        </Link>
      </nav>

      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
        Thông tin cá nhân
      </h1>
      <p className="text-sm text-muted mb-5">
        Cập nhật họ tên và số điện thoại để liên hệ giao hàng nhanh hơn.
      </p>

      <ProfileForm
        email={user.email}
        defaultValues={{
          full_name: profile?.full_name ?? user.full_name ?? '',
          phone: profile?.phone ?? '',
        }}
      />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Quản trị',
    template: '%s | Vua Bỉm Admin',
  },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Defense in depth — proxy.ts đã chặn, đây là lớp bảo vệ thứ 2
  if (!user) redirect('/dang-nhap?redirect_to=/admin')
  if (user.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen flex bg-section-soft">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar userName={user.full_name} userEmail={user.email} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

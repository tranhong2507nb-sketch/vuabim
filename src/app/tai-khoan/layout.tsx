import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

/**
 * Layout cho tất cả trang /tai-khoan/*
 * Auth đã được middleware (proxy.ts) bảo vệ — đến đây user luôn login.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <>
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}

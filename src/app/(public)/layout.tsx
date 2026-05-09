import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

/**
 * Layout cho mọi trang public (khách hàng).
 * Fetch user ở Server Component → pass xuống Header để render UserMenu.
 */
export default async function PublicLayout({
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

import { Header } from '@/components/layout/Header'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <>
      <Header user={user} />
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </>
  )
}

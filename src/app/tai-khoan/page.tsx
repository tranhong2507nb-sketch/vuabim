import Link from 'next/link'
import { Gift, ShoppingBag, User as UserIcon, LogOut, Settings, Clock } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { signOut } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tài khoản của tôi',
  robots: { index: false, follow: false },
}

export default async function AccountDashboard() {
  const user = await getCurrentUser()
  if (!user) redirect('/dang-nhap')

  // Tính tổng điểm chờ cộng — đơn chưa completed, points_earned_at NULL
  const supabase = await createClient()
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('points_to_earn')
    .eq('user_id', user.id)
    .in('status', ['pending', 'confirmed', 'shipping'])
    .is('points_earned_at', null)

  const pendingPoints =
    pendingOrders?.reduce((sum, o) => sum + (o.points_to_earn ?? 0), 0) ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Greeting + điểm */}
      <section className="bg-gradient-to-br from-cta-bg to-secondary-light rounded-2xl p-5 md:p-6">
        <p className="text-sm text-muted">Xin chào,</p>
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-3">
          {user.full_name || user.email || 'Mẹ'}
        </h1>
        <div className="flex items-stretch gap-2 flex-wrap">
          <div className="bg-card rounded-xl p-3 inline-flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-reward" />
            <div>
              <div className="text-xs text-muted">Điểm hiện có</div>
              <div className="text-lg font-bold text-foreground">
                {user.current_points} điểm
              </div>
            </div>
          </div>
          {pendingPoints > 0 && (
            <div className="bg-card rounded-xl p-3 inline-flex items-center gap-2.5 border border-status-pending/40">
              <Clock className="w-6 h-6 text-status-pending" />
              <div>
                <div className="text-xs text-muted">Điểm chờ cộng</div>
                <div className="text-lg font-bold text-status-pending">
                  +{pendingPoints} điểm
                </div>
              </div>
            </div>
          )}
        </div>
        {pendingPoints > 0 && (
          <p className="text-xs text-muted mt-3">
            Điểm chờ sẽ tự động cộng vào tài khoản khi đơn hàng được xác nhận{' '}
            <strong>Hoàn thành</strong>.
          </p>
        )}
      </section>

      {/* Menu items */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MenuCard
          href="/tai-khoan/don-hang"
          icon={<ShoppingBag className="w-5 h-5" />}
          title="Đơn hàng của tôi"
          desc="Xem và theo dõi đơn hàng"
        />
        <MenuCard
          href="/tai-khoan/qua-da-doi"
          icon={<Gift className="w-5 h-5" />}
          title="Quà đã đổi"
          desc="Lịch sử đổi quà bằng điểm"
        />
        <MenuCard
          href="/tai-khoan/thong-tin"
          icon={<UserIcon className="w-5 h-5" />}
          title="Thông tin cá nhân"
          desc="Họ tên, SĐT, email"
        />
        {user.role === 'admin' && (
          <MenuCard
            href="/admin"
            icon={<Settings className="w-5 h-5" />}
            title="Trang quản trị"
            desc="Admin only"
          />
        )}
      </section>

      {/* Logout */}
      <form action={signOut}>
        <button
          type="submit"
          className="w-full bg-card border border-primary-light rounded-xl p-4 flex items-center gap-3 text-status-out hover:bg-section-soft transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </form>
    </div>
  )
}

function MenuCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="bg-card border border-primary-light rounded-xl p-4 flex items-start gap-3 hover:border-primary-dark transition-colors"
    >
      <div className="w-10 h-10 flex-shrink-0 bg-primary-light text-primary-dark rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted mt-0.5">{desc}</div>
      </div>
    </Link>
  )
}

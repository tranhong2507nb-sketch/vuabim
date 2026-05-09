import Link from 'next/link'
import {
  Receipt,
  AlertCircle,
  GiftIcon,
  TrendingUp,
  Users,
  ShoppingBag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/admin/StatCard'
import { formatVND } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard',
}

async function getStats() {
  const supabase = await createClient()

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfTodayISO = startOfToday.toISOString()

  const [
    pendingOrders,
    cancelRequests,
    pendingRedemptions,
    todayRevenueRows,
    totalCustomers,
    totalProducts,
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed']),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .not('cancel_requested_at', 'is', null)
      .not('status', 'in', '(cancelled,refunded,completed)'),
    supabase
      .from('gift_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('orders')
      .select('total')
      .eq('status', 'completed')
      .gte('updated_at', startOfTodayISO),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'customer'),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  const todayRevenue =
    todayRevenueRows.data?.reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0

  return {
    pendingOrders: pendingOrders.count ?? 0,
    cancelRequests: cancelRequests.count ?? 0,
    pendingRedemptions: pendingRedemptions.count ?? 0,
    todayRevenue,
    totalCustomers: totalCustomers.count ?? 0,
    totalProducts: totalProducts.count ?? 0,
  }
}

async function getRecentOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('id, order_code, shipping_name, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Chờ xác nhận', classes: 'bg-status-low/15 text-status-low' },
  confirmed: { label: 'Đã xác nhận', classes: 'bg-primary-light text-primary-dark' },
  shipping: { label: 'Đang giao', classes: 'bg-cta/15 text-cta' },
  completed: { label: 'Hoàn thành', classes: 'bg-status-instock/15 text-status-instock' },
  cancelled: { label: 'Đã hủy', classes: 'bg-status-out/15 text-status-out' },
  refunded: { label: 'Hoàn tiền', classes: 'bg-muted/20 text-muted' },
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()])

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-6xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
        Tổng quan
      </h1>
      <p className="text-sm text-muted mb-5">
        Theo dõi tình hình đơn hàng, đổi quà và khách hàng.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <Link href="/admin/don-hang?status=pending" className="block">
          <StatCard
            label="Đơn cần xử lý"
            value={stats.pendingOrders}
            hint="pending + confirmed"
            icon={Receipt}
            tone="primary"
          />
        </Link>
        <Link href="/admin/don-hang?cancel_requested=true" className="block">
          <StatCard
            label="Yêu cầu hủy"
            value={stats.cancelRequests}
            hint="chờ duyệt"
            icon={AlertCircle}
            tone="danger"
          />
        </Link>
        <Link href="/admin/yeu-cau-doi-qua?status=pending" className="block">
          <StatCard
            label="Đổi quà chờ duyệt"
            value={stats.pendingRedemptions}
            icon={GiftIcon}
            tone="reward"
          />
        </Link>
        <StatCard
          label="Doanh thu hôm nay"
          value={formatVND(stats.todayRevenue)}
          hint="đơn hoàn thành"
          icon={TrendingUp}
          tone="default"
        />
        <Link href="/admin/khach-hang" className="block">
          <StatCard
            label="Khách hàng"
            value={stats.totalCustomers}
            icon={Users}
          />
        </Link>
        <Link href="/admin/san-pham" className="block">
          <StatCard
            label="Sản phẩm"
            value={stats.totalProducts}
            hint="đang bán"
            icon={ShoppingBag}
          />
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-semibold text-foreground">
            Đơn hàng gần đây
          </h2>
          <Link
            href="/admin/don-hang"
            className="text-sm text-cta hover:text-primary-dark"
          >
            Xem tất cả →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-card border border-primary-light rounded-xl p-6 text-center text-sm text-muted">
            Chưa có đơn hàng nào.
          </div>
        ) : (
          <div className="bg-card border border-primary-light rounded-xl overflow-hidden">
            <ul className="divide-y divide-primary-light">
              {recentOrders.map(order => {
                const statusInfo =
                  STATUS_LABELS[order.status] ?? {
                    label: order.status,
                    classes: 'bg-muted/20 text-muted',
                  }
                return (
                  <li key={order.id}>
                    <Link
                      href={`/admin/don-hang/${order.order_code}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-section-soft transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {order.order_code}
                        </div>
                        <div className="text-xs text-muted truncate">
                          {order.shipping_name} ·{' '}
                          {new Date(order.created_at).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-foreground">
                          {formatVND(order.total)}
                        </div>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.classes}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}

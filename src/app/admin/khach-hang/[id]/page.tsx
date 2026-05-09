import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  Receipt,
  Gift,
  Coins,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdjustPointsForm } from '@/components/admin/AdjustPointsForm'
import { RedemptionStatusBadge } from '@/components/admin/RedemptionStatusBadge'
import { formatVND } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Chi tiết khách hàng',
}

const ORDER_STATUS_LABEL: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Chờ xác nhận', classes: 'bg-status-pending/15 text-status-pending' },
  confirmed: { label: 'Đã xác nhận', classes: 'bg-primary-light text-primary-dark' },
  shipping: { label: 'Đang giao', classes: 'bg-cta/15 text-cta' },
  completed: { label: 'Hoàn thành', classes: 'bg-status-instock/15 text-status-instock' },
  cancelled: { label: 'Đã hủy', classes: 'bg-status-out/15 text-status-out' },
  refunded: { label: 'Hoàn tiền', classes: 'bg-muted/20 text-muted' },
}

const PT_TYPE_LABEL: Record<string, string> = {
  earn: 'Tích điểm',
  revoke: 'Thu hồi',
  use_account_direct: 'Dùng điểm',
  refund_account_direct: 'Hoàn điểm',
  redeem_gift: 'Đổi quà',
  refund_gift: 'Hoàn điểm hủy đổi',
  clamp: 'Clamp',
  admin_adjust: 'Admin điều chỉnh',
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: customer },
    { data: orders },
    { data: redemptions },
    { data: pointsLog },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, phone, full_name, role, current_points, created_at')
      .eq('id', id)
      .single(),
    supabase
      .from('orders')
      .select('id, order_code, total, status, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('gift_redemptions')
      .select('id, redemption_code, gift_name_snapshot, points_used, status, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('points_transactions')
      .select('id, delta, type, reason, balance_after, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  if (!customer) notFound()

  // Tổng kết
  const totalSpent =
    orders
      ?.filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0
  const completedOrders =
    orders?.filter(o => o.status === 'completed').length ?? 0
  const totalRedemptions =
    redemptions?.filter(r => r.status === 'completed').length ?? 0

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-4xl mx-auto">
      <Link
        href="/admin/khach-hang"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-dark mb-3"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      {/* Header */}
      <div className="bg-card border border-primary-light rounded-xl p-4 md:p-5 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
              {customer.full_name || '(chưa có tên)'}
            </h1>
            {customer.role === 'admin' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-cta/15 text-cta font-medium mb-1">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </span>
            )}
            <div className="flex items-center gap-1.5 text-sm text-muted mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <Phone className="w-3.5 h-3.5" />
                <a href={`tel:${customer.phone}`} className="hover:text-cta">
                  {customer.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
              <Calendar className="w-3 h-3" />
              Tham gia:{' '}
              {new Date(customer.created_at).toLocaleDateString('vi-VN')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted uppercase tracking-wide">
              Điểm hiện tại
            </div>
            <div className="text-2xl md:text-3xl font-bold text-reward">
              🎁 {customer.current_points}
            </div>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
        <div className="bg-card border border-primary-light rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <Receipt className="w-3.5 h-3.5" />
            Đơn hoàn thành
          </div>
          <div className="text-lg md:text-xl font-bold text-foreground">
            {completedOrders}
          </div>
        </div>
        <div className="bg-card border border-primary-light rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <Coins className="w-3.5 h-3.5" />
            Tổng đã chi
          </div>
          <div className="text-lg md:text-xl font-bold text-foreground truncate">
            {formatVND(totalSpent)}
          </div>
        </div>
        <div className="bg-card border border-primary-light rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <Gift className="w-3.5 h-3.5" />
            Quà đã đổi
          </div>
          <div className="text-lg md:text-xl font-bold text-foreground">
            {totalRedemptions}
          </div>
        </div>
      </div>

      {/* Adjust điểm */}
      <div className="mb-6">
        <AdjustPointsForm
          userId={customer.id}
          currentPoints={customer.current_points}
        />
      </div>

      {/* Lịch sử đơn */}
      <section className="mb-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-3">
          Đơn hàng gần đây
        </h2>
        {!orders || orders.length === 0 ? (
          <div className="bg-card border border-primary-light rounded-xl p-6 text-center text-sm text-muted">
            Chưa có đơn hàng.
          </div>
        ) : (
          <ul className="bg-card border border-primary-light rounded-xl divide-y divide-primary-light overflow-hidden">
            {orders.map(o => {
              const info = ORDER_STATUS_LABEL[o.status] ?? {
                label: o.status,
                classes: 'bg-muted/20 text-muted',
              }
              return (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs text-foreground truncate">
                      {o.order_code}
                    </div>
                    <div className="text-xs text-muted">
                      {new Date(o.created_at).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-foreground">
                      {formatVND(o.total)}
                    </div>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${info.classes}`}
                    >
                      {info.label}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Lịch sử đổi quà */}
      <section className="mb-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-3">
          Quà đã đổi
        </h2>
        {!redemptions || redemptions.length === 0 ? (
          <div className="bg-card border border-primary-light rounded-xl p-6 text-center text-sm text-muted">
            Chưa đổi quà nào.
          </div>
        ) : (
          <ul className="bg-card border border-primary-light rounded-xl divide-y divide-primary-light overflow-hidden">
            {redemptions.map(r => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/yeu-cau-doi-qua/${r.redemption_code}`}
                    className="text-sm text-foreground hover:text-cta truncate block"
                  >
                    {r.gift_name_snapshot}
                  </Link>
                  <div className="text-xs text-muted font-mono truncate">
                    {r.redemption_code}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-reward">
                    -{r.points_used} 🎁
                  </div>
                  <RedemptionStatusBadge status={r.status} size="sm" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lịch sử điểm */}
      <section>
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-3">
          Lịch sử điểm
        </h2>
        {!pointsLog || pointsLog.length === 0 ? (
          <div className="bg-card border border-primary-light rounded-xl p-6 text-center text-sm text-muted">
            Chưa có giao dịch điểm.
          </div>
        ) : (
          <ul className="bg-card border border-primary-light rounded-xl divide-y divide-primary-light overflow-hidden">
            {pointsLog.map(t => (
              <li key={t.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {PT_TYPE_LABEL[t.type] ?? t.type}
                    </div>
                    {t.reason && (
                      <div className="text-xs text-muted truncate">
                        {t.reason}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-semibold ${
                        t.delta > 0
                          ? 'text-status-instock'
                          : t.delta < 0
                            ? 'text-status-out'
                            : 'text-muted'
                      }`}
                    >
                      {t.delta > 0 ? '+' : ''}
                      {t.delta}
                    </div>
                    <div className="text-[10px] text-muted">
                      Tồn: {t.balance_after}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-muted mt-1">
                  {new Date(t.created_at).toLocaleString('vi-VN')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

import Link from 'next/link'
import { Search, Receipt, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { formatVND } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Đơn hàng',
}

interface SearchParams {
  q?: string
  status?: string
  cancel_requested?: string
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(
      `id, order_code, status, total, points_to_earn, account_points_used,
       shipping_name, shipping_phone, cancel_requested_at, created_at,
       user:profiles!orders_user_id_fkey ( id, full_name, email )`
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (sp.q?.trim()) {
    const q = sp.q.trim()
    query = query.or(
      `order_code.ilike.%${q}%,shipping_name.ilike.%${q}%,shipping_phone.ilike.%${q}%`
    )
  }
  if (sp.status) query = query.eq('status', sp.status)
  if (sp.cancel_requested === 'true') {
    query = query
      .not('cancel_requested_at', 'is', null)
      .not('status', 'in', '(cancelled,refunded,completed)')
  }

  const { data: orders } = await query

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Đơn hàng
        </h1>
        <p className="text-sm text-muted">{orders?.length ?? 0} đơn</p>
      </div>

      {/* Quick filter chips */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <FilterChip href="/admin/don-hang" active={!sp.status && !sp.cancel_requested}>
          Tất cả
        </FilterChip>
        <FilterChip
          href="/admin/don-hang?status=pending"
          active={sp.status === 'pending'}
        >
          Chờ xác nhận
        </FilterChip>
        <FilterChip
          href="/admin/don-hang?status=confirmed"
          active={sp.status === 'confirmed'}
        >
          Đã xác nhận
        </FilterChip>
        <FilterChip
          href="/admin/don-hang?status=shipping"
          active={sp.status === 'shipping'}
        >
          Đang giao
        </FilterChip>
        <FilterChip
          href="/admin/don-hang?cancel_requested=true"
          active={sp.cancel_requested === 'true'}
          danger
        >
          Yêu cầu hủy
        </FilterChip>
      </div>

      <form
        method="GET"
        className="bg-card border border-primary-light rounded-xl p-3 mb-4 flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Mã đơn, tên, SĐT..."
            className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-lg border border-primary-light bg-card text-sm focus:outline-none focus:border-primary-dark"
          />
        </div>
        <select
          name="status"
          defaultValue={sp.status ?? ''}
          className="min-h-[40px] px-3 rounded-lg border border-primary-light bg-card text-sm"
        >
          <option value="">Mọi trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
          <option value="refunded">Hoàn tiền</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          Lọc
        </Button>
      </form>

      {!orders || orders.length === 0 ? (
        <div className="bg-card border border-primary-light rounded-xl p-10 text-center">
          <Receipt className="w-10 h-10 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">
            {sp.q || sp.status || sp.cancel_requested
              ? 'Không tìm thấy đơn phù hợp.'
              : 'Chưa có đơn hàng nào.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-primary-light rounded-xl overflow-hidden">
          {/* Desktop */}
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-section-soft text-xs text-muted uppercase">
              <tr>
                <th className="text-left px-4 py-2.5">Mã / Khách</th>
                <th className="text-right px-3 py-2.5">Tổng</th>
                <th className="text-center px-3 py-2.5">Điểm dùng</th>
                <th className="text-center px-3 py-2.5">Trạng thái</th>
                <th className="text-right px-4 py-2.5">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {orders.map(o => {
                const u = Array.isArray(o.user) ? o.user[0] : o.user
                return (
                  <tr key={o.id} className="hover:bg-section-soft">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/don-hang/${o.order_code}`}
                        className="block"
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-xs text-cta hover:underline">
                            {o.order_code}
                          </span>
                          {o.cancel_requested_at &&
                            !['cancelled', 'completed', 'refunded'].includes(
                              o.status
                            ) && (
                              <AlertCircle
                                className="w-3.5 h-3.5 text-status-pending"
                                aria-label="Yêu cầu hủy"
                              />
                            )}
                        </div>
                        <div className="text-xs text-muted truncate max-w-[220px]">
                          {o.shipping_name} · {o.shipping_phone}
                        </div>
                        {u?.email && (
                          <div className="text-[10px] text-subtle truncate max-w-[220px]">
                            {u.email}
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold">
                      {formatVND(o.total)}
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-muted">
                      {o.account_points_used > 0 ? (
                        <span className="text-reward">
                          🎁 {o.account_points_used}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted whitespace-nowrap">
                      {new Date(o.created_at).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Mobile */}
          <ul className="md:hidden divide-y divide-primary-light">
            {orders.map(o => (
              <li key={o.id}>
                <Link
                  href={`/admin/don-hang/${o.order_code}`}
                  className="block p-3 active:bg-section-soft"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-xs text-cta truncate">
                        {o.order_code}
                      </span>
                      {o.cancel_requested_at &&
                        !['cancelled', 'completed', 'refunded'].includes(
                          o.status
                        ) && (
                          <AlertCircle className="w-3.5 h-3.5 text-status-pending shrink-0" />
                        )}
                    </div>
                    <OrderStatusBadge status={o.status} size="sm" />
                  </div>
                  <div className="text-sm font-medium text-foreground truncate">
                    {o.shipping_name}
                  </div>
                  <div className="text-xs text-muted">{o.shipping_phone}</div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {formatVND(o.total)}
                    </span>
                    <span className="text-muted">
                      {new Date(o.created_at).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  href,
  active,
  danger,
  children,
}: {
  href: string
  active: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? danger
            ? 'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-status-out text-white'
            : 'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-cta text-white'
          : danger
            ? 'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-status-out/10 text-status-out border border-status-out/30 hover:bg-status-out/15'
            : 'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-primary-light text-muted hover:bg-section-soft'
      }
    >
      {children}
    </Link>
  )
}

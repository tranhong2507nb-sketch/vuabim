import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Package,
  Gift,
  Calendar,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { OrderStatusActions } from '@/components/admin/OrderStatusActions'
import { OrderCancelRequestActions } from '@/components/admin/OrderCancelRequestActions'
import { OrderRefundButton } from '@/components/admin/OrderRefundButton'
import {
  OrderChatBox,
  type OrderMessage,
} from '@/components/admin/OrderChatBox'
import { formatVND } from '@/lib/utils'
import type { OrderStatus } from '@/lib/admin-orders/actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Chi tiết đơn',
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ 'ma-don': string }>
}) {
  const code = (await params)['ma-don']
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(
      `id, order_code, status, subtotal, shipping_fee_original, shipping_fee, total,
       points_to_earn, points_earned_at,
       instant_points_used, instant_points_discount,
       account_points_used, account_points_discount, account_points_refunded_at,
       cancel_requested_at, cancel_request_reason,
       shipping_name, shipping_phone, shipping_email,
       province_name, district_name, ward_name, address_detail, note,
       payment_method, created_at, updated_at,
       user:profiles!orders_user_id_fkey ( id, full_name, email ),
       items:order_items (
         qty, unit_price_snapshot, points_per_unit_snapshot,
         product_name_snapshot, product_image_snapshot
       ),
       redemptions:gift_redemptions!gift_redemptions_ref_order_id_fkey (
         id, redemption_code, gift_name_snapshot, points_used, status
       )`
    )
    .eq('order_code', code)
    .single()

  if (!order) notFound()

  const { data: messages } = await supabase
    .from('order_messages')
    .select('id, sender_type, message, created_at, read_by_other')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true })
    .limit(200)

  const orderMessages = (messages ?? []) as OrderMessage[]

  const u = Array.isArray(order.user) ? order.user[0] : order.user
  const items = order.items ?? []
  const redemptions = order.redemptions ?? []

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-3xl mx-auto space-y-4">
      <Link
        href="/admin/don-hang"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-dark"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      {/* Header */}
      <div className="bg-card border border-primary-light rounded-xl p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
          <div>
            <div className="text-xs text-muted">Mã đơn</div>
            <div className="font-mono font-semibold text-foreground">
              {order.order_code}
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
          <Calendar className="w-3 h-3" />
          Đặt:{' '}
          {new Date(order.created_at).toLocaleString('vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </div>
        <div className="text-xs text-muted">
          Thanh toán: <strong>COD</strong>
        </div>
      </div>

      {/* Yêu cầu hủy (nếu có) */}
      {order.cancel_requested_at &&
        !['cancelled', 'completed', 'refunded'].includes(order.status) && (
          <OrderCancelRequestActions
            orderId={order.id}
            cancelReason={order.cancel_request_reason}
            cancelRequestedAt={order.cancel_requested_at}
          />
        )}

      {/* Khách */}
      <section className="bg-card border border-primary-light rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <User className="w-4 h-4 text-primary-dark" />
          Khách hàng
        </h2>
        <div className="space-y-1 text-sm">
          <div className="font-medium text-foreground">
            {u?.full_name || u?.email || '—'}
          </div>
          {u?.email && (
            <div className="flex items-center gap-1.5 text-muted">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{u.email}</span>
            </div>
          )}
          {u?.id && (
            <Link
              href={`/admin/khach-hang/${u.id}`}
              className="inline-block text-xs text-cta hover:text-primary-dark"
            >
              Xem hồ sơ khách →
            </Link>
          )}
        </div>
      </section>

      {/* Địa chỉ giao */}
      <section className="bg-card border border-primary-light rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary-dark" />
          Địa chỉ giao hàng
        </h2>
        <div className="space-y-1 text-sm">
          <div className="font-medium text-foreground">
            {order.shipping_name}
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <Phone className="w-3.5 h-3.5" />
            <a
              href={`tel:${order.shipping_phone}`}
              className="hover:text-cta"
            >
              {order.shipping_phone}
            </a>
          </div>
          <div className="text-foreground">
            {order.address_detail}, {order.ward_name}, {order.district_name},{' '}
            {order.province_name}
          </div>
          {order.note && (
            <div className="mt-2 pt-2 border-t border-primary-light text-sm">
              <span className="text-muted">Ghi chú: </span>
              <span className="text-foreground">{order.note}</span>
            </div>
          )}
        </div>
      </section>

      {/* Sản phẩm */}
      <section className="bg-card border border-primary-light rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Package className="w-4 h-4 text-primary-dark" />
          Sản phẩm ({items.length})
        </h2>
        <ul className="divide-y divide-primary-light">
          {items.map((item, i) => (
            <li key={i} className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0">
              <div className="w-12 h-12 flex-shrink-0 bg-section-soft rounded-lg overflow-hidden border border-primary-light">
                {item.product_image_snapshot && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product_image_snapshot}
                    alt={item.product_name_snapshot}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground line-clamp-2">
                  {item.product_name_snapshot}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  SL: {item.qty}
                  {item.points_per_unit_snapshot > 0 && (
                    <span className="ml-2 text-reward">
                      +{item.points_per_unit_snapshot * item.qty} điểm
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm font-semibold text-foreground whitespace-nowrap">
                {formatVND(item.unit_price_snapshot * item.qty)}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Quà đi kèm */}
      {redemptions.length > 0 && (
        <section className="bg-reward-light border border-reward rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-reward" />
            Quà đổi cùng đơn ({redemptions.length})
          </h2>
          <ul className="space-y-1.5">
            {redemptions.map(r => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <Link
                  href={`/admin/yeu-cau-doi-qua/${r.redemption_code}`}
                  className="truncate text-foreground hover:text-cta"
                >
                  {r.gift_name_snapshot}
                </Link>
                <span className="text-xs text-muted whitespace-nowrap">
                  -{r.points_used} 🎁 · {r.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tổng tiền */}
      <section className="bg-card border border-primary-light rounded-xl p-4 space-y-2">
        <Row label="Tạm tính" value={formatVND(order.subtotal)} />
        <Row
          label="Phí vận chuyển"
          value={
            order.shipping_fee === 0 ? (
              <span>
                <span className="line-through text-subtle mr-2">
                  {formatVND(order.shipping_fee_original)}
                </span>
                <span className="text-status-instock font-semibold">
                  Miễn phí
                </span>
              </span>
            ) : (
              formatVND(order.shipping_fee)
            )
          }
        />
        {order.account_points_discount > 0 && (
          <Row
            label="Giảm từ điểm tài khoản"
            value={
              <span className="text-status-instock">
                −{formatVND(order.account_points_discount)}
              </span>
            }
          />
        )}
        {order.instant_points_discount > 0 && (
          <Row
            label="Giảm từ điểm sản phẩm"
            value={
              <span className="text-status-instock">
                −{formatVND(order.instant_points_discount)}
              </span>
            }
          />
        )}
        <div className="pt-2 border-t border-primary-light flex justify-between">
          <span className="text-sm font-semibold text-foreground">
            Tổng thanh toán
          </span>
          <span className="text-lg font-bold text-cta">
            {formatVND(order.total)}
          </span>
        </div>
      </section>

      {/* Thông tin điểm */}
      {(order.points_to_earn > 0 ||
        order.account_points_used > 0 ||
        order.instant_points_used > 0) && (
        <section className="bg-card border border-primary-light rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-reward" />
            Thông tin điểm
          </h2>
          <div className="space-y-1 text-sm">
            {order.points_to_earn > 0 && (
              <div>
                <span className="text-muted">Sẽ tích khi hoàn thành:</span>{' '}
                <strong>+{order.points_to_earn} điểm</strong>
                {order.points_earned_at && (
                  <span className="ml-2 text-status-completed text-xs">
                    ✓ Đã cộng
                  </span>
                )}
              </div>
            )}
            {order.account_points_used > 0 && (
              <div>
                <span className="text-muted">Đã dùng điểm TK giảm tiền:</span>{' '}
                <strong>−{order.account_points_used} điểm</strong>
                {order.account_points_refunded_at && (
                  <span className="ml-2 text-status-instock text-xs">
                    ✓ Đã hoàn
                  </span>
                )}
              </div>
            )}
            {order.instant_points_used > 0 && (
              <div>
                <span className="text-muted">Đã dùng điểm SP giảm tiền:</span>{' '}
                <strong>{order.instant_points_used} điểm</strong>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Actions */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <section className="bg-card border border-primary-light rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Cập nhật đơn
          </h2>
          {order.status === 'completed' ? (
            <OrderRefundButton orderId={order.id} />
          ) : (
            <OrderStatusActions
              orderId={order.id}
              status={order.status as OrderStatus}
              hasCancelRequest={!!order.cancel_requested_at}
            />
          )}
        </section>
      )}

      {/* Chat */}
      <OrderChatBox orderId={order.id} messages={orderMessages} />
    </div>
  )
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  )
}

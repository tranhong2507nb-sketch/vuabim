import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Phone, Package, Gift } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge'
import { CancelOrderButton } from '@/components/account/CancelOrderButton'
import { formatVND } from '@/lib/utils'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ 'ma-don': string }>
}

export const metadata: Metadata = {
  title: 'Chi tiết đơn hàng',
  robots: { index: false, follow: false },
}

export default async function OrderDetailPage({ params }: PageProps) {
  const orderCode = (await params)['ma-don']
  const user = await getCurrentUser()
  if (!user) redirect('/dang-nhap')

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select(
      `id, order_code, status, subtotal,
       shipping_fee_original, shipping_fee, total,
       points_to_earn, points_earned_at,
       instant_points_used, instant_points_discount,
       account_points_used, account_points_discount, account_points_refunded_at,
       cancel_requested_at, cancel_request_reason,
       shipping_name, shipping_phone, shipping_email,
       province_name, district_name, ward_name, address_detail, note,
       created_at,
       order_items ( qty, unit_price_snapshot, points_per_unit_snapshot,
                     product_name_snapshot, product_image_snapshot ),
       redemptions:gift_redemptions!gift_redemptions_ref_order_id_fkey (
         id, redemption_code, gift_name_snapshot, points_used, status, refunded,
         gift:gifts ( image_url )
       )`
    )
    .eq('order_code', orderCode)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const redemptions = order.redemptions ?? []

  const canCancel = order.status === 'pending'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <nav className="text-xs text-muted mb-1">
        <Link href="/tai-khoan/don-hang" className="hover:text-primary-dark">
          ← Đơn hàng
        </Link>
      </nav>

      {/* Header */}
      <div className="bg-card border border-primary-light rounded-xl p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="text-xs text-muted">Mã đơn</div>
            <div className="font-mono font-semibold text-foreground">
              {order.order_code}
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="text-xs text-muted">
          Đặt lúc:{' '}
          {new Date(order.created_at).toLocaleString('vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </div>
        {order.cancel_requested_at && order.status === 'confirmed' && (
          <div className="mt-3 bg-status-pending/15 border border-status-pending rounded-lg p-3 text-sm">
            <strong>Đã gửi yêu cầu hủy</strong> — đợi shop duyệt.
            {order.cancel_request_reason && (
              <div className="text-xs text-muted mt-1">
                Lý do: {order.cancel_request_reason}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thông tin nhận hàng */}
      <section className="bg-card border border-primary-light rounded-xl p-4">
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary-dark" />
          Thông tin nhận hàng
        </h2>
        <div className="space-y-1 text-sm">
          <div>
            <span className="text-muted">Người nhận:</span>{' '}
            <span className="font-medium">{order.shipping_name}</span>
          </div>
          <div>
            <span className="text-muted">SĐT:</span>{' '}
            <span className="font-medium">{order.shipping_phone}</span>
          </div>
          <div>
            <span className="text-muted">Địa chỉ:</span>{' '}
            <span>
              {order.address_detail}, {order.ward_name}, {order.district_name},{' '}
              {order.province_name}
            </span>
          </div>
          {order.note && (
            <div>
              <span className="text-muted">Ghi chú:</span>{' '}
              <span>{order.note}</span>
            </div>
          )}
        </div>
      </section>

      {/* Sản phẩm */}
      <section className="bg-card border border-primary-light rounded-xl p-4">
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary-dark" />
          Sản phẩm ({order.order_items.length})
        </h2>
        <div className="divide-y divide-primary-light">
          {order.order_items.map((item, i) => (
            <div
              key={i}
              className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-section-soft rounded-lg overflow-hidden">
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
              <div className="text-sm font-semibold text-cta whitespace-nowrap">
                {formatVND(item.unit_price_snapshot * item.qty)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quà tặng kèm đơn */}
      {redemptions.length > 0 && (
        <section className="bg-reward-light border border-reward rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-reward" />
            Quà tặng kèm ({redemptions.length})
          </h2>
          <div className="divide-y divide-reward/40">
            {redemptions.map(r => {
              const gift = Array.isArray(r.gift) ? r.gift[0] : r.gift
              return (
                <div
                  key={r.id}
                  className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-card rounded-lg overflow-hidden border border-reward">
                    {gift?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={gift.image_url}
                        alt={r.gift_name_snapshot}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift className="w-5 h-5 text-reward" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground line-clamp-2">
                      {r.gift_name_snapshot}
                    </div>
                    <div className="text-xs text-muted mt-0.5 font-mono">
                      {r.redemption_code}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-reward whitespace-nowrap">
                    −{r.points_used} 🎁
                    {r.refunded && (
                      <div className="text-[10px] text-status-instock font-normal mt-0.5">
                        ✓ Đã hoàn
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted mt-3 pt-3 border-t border-reward/40">
            Quà sẽ được giao cùng đơn hàng đến địa chỉ trên.
          </p>
        </section>
      )}

      {/* Tổng tiền */}
      <section className="bg-card border border-primary-light rounded-xl p-4 space-y-2">
        <Row label="Tạm tính" value={formatVND(order.subtotal)} />
        <Row
          label="Phí vận chuyển"
          value={
            <span>
              <span className="line-through text-subtle mr-2">
                {formatVND(order.shipping_fee_original)}
              </span>
              <span className="text-status-instock font-semibold">Miễn phí</span>
            </span>
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
          <span className="text-base font-semibold text-foreground">
            Tổng thanh toán
          </span>
          <span className="text-xl font-bold text-cta">
            {formatVND(order.total)}
          </span>
        </div>
      </section>

      {/* Thông tin điểm */}
      {(order.points_to_earn > 0 ||
        order.account_points_used > 0 ||
        order.instant_points_used > 0) && (
        <section className="bg-reward-light border border-reward rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Gift className="w-4 h-4 text-reward" />
            Điểm thưởng
          </h2>
          <div className="space-y-1 text-sm">
            {order.points_to_earn > 0 && (
              <div>
                <span className="text-muted">Sẽ tích khi hoàn thành:</span>{' '}
                <strong>+{order.points_to_earn} điểm</strong>
                {order.points_earned_at && (
                  <span className="ml-2 text-status-completed text-xs">
                    ✓ Đã cộng vào tài khoản
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

      {/* Action — hủy đơn (chỉ pending) */}
      {canCancel && (
        <section className="bg-card border border-primary-light rounded-xl p-4">
          <p className="text-sm text-muted mb-3">
            Bạn có thể tự hủy đơn khi đang ở trạng thái <strong>Chờ xác nhận</strong>.
            Điểm tài khoản đã dùng sẽ được hoàn lại.
          </p>
          <CancelOrderButton orderId={order.id} />
        </section>
      )}

      {/* Trạng thái shipping/completed */}
      {(order.status === 'shipping' || order.status === 'completed') && (
        <section className="bg-section-soft border border-primary-light rounded-xl p-4 text-sm text-muted">
          {order.status === 'shipping'
            ? 'Đơn đang được vận chuyển. Nếu cần hỗ trợ, vui lòng liên hệ hotline.'
            : 'Đơn đã hoàn tất. Nếu cần đổi trả, vui lòng liên hệ shop.'}
        </section>
      )}
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

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ClearCartOnMount } from '@/components/cart/ClearCartOnMount'
import { formatVND } from '@/lib/utils'
import { CheckCircle, Package, Phone, Gift } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ 'ma-don': string }>
}

export const metadata: Metadata = {
  title: 'Đặt hàng thành công',
  robots: { index: false, follow: false },
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const orderCode = (await params)['ma-don']
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/dang-nhap')

  const { data: order } = await supabase
    .from('orders')
    .select(
      `
        id, order_code, status, subtotal,
        shipping_fee_original, shipping_fee, total,
        points_to_earn, points_earned_at,
        instant_points_used, instant_points_discount,
        account_points_used, account_points_discount,
        shipping_name, shipping_phone, shipping_email,
        province_name, district_name, ward_name, address_detail, note,
        created_at,
        order_items ( qty, unit_price_snapshot, product_name_snapshot, product_image_snapshot ),
        redemptions:gift_redemptions!gift_redemptions_ref_order_id_fkey (
          id, redemption_code, gift_name_snapshot, points_used,
          gift:gifts ( image_url )
        )
      `
    )
    .eq('order_code', orderCode)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const redemptions = order.redemptions ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <ClearCartOnMount />

      {/* Banner thành công */}
      <div className="bg-cta-bg border border-primary-light rounded-2xl p-6 md:p-8 text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-3 text-status-instock" />
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Đặt hàng thành công, shop sẽ liên hệ lại sớm
        </h1>
        <p className="text-sm text-muted">
          Mã đơn hàng:{' '}
          <span className="font-mono font-semibold text-foreground">
            {order.order_code}
          </span>
        </p>
        <p className="text-xs text-muted mt-2">
          Cảm ơn mẹ đã đặt hàng tại Vua Bỉm 🌿
        </p>
      </div>

      {/* Thông tin nhận hàng */}
      <section className="bg-card border border-primary-light rounded-xl p-4">
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary-dark" />
          Thông tin nhận hàng
        </h2>
        <div className="space-y-1 text-sm text-foreground">
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
            <span className="font-medium">
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
            <div key={i} className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0">
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
                <div className="text-xs text-muted mt-0.5">SL: {item.qty}</div>
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
        <div className="flex justify-between text-sm">
          <span className="text-muted">Tạm tính</span>
          <span>{formatVND(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Phí vận chuyển</span>
          <span>
            <span className="line-through text-subtle mr-2">
              {formatVND(order.shipping_fee_original)}
            </span>
            <span className="text-status-instock font-semibold">Miễn phí</span>
          </span>
        </div>
        {order.account_points_discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">Giảm từ điểm tài khoản</span>
            <span className="text-status-instock">
              −{formatVND(order.account_points_discount)}
            </span>
          </div>
        )}
        {order.instant_points_discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">Giảm từ điểm sản phẩm</span>
            <span className="text-status-instock">
              −{formatVND(order.instant_points_discount)}
            </span>
          </div>
        )}
        <div className="pt-2 border-t border-primary-light flex justify-between">
          <span className="text-base font-semibold text-foreground">
            Tổng thanh toán (COD)
          </span>
          <span className="text-xl font-bold text-cta">{formatVND(order.total)}</span>
        </div>
      </section>

      {/* Điểm sẽ tích */}
      {order.points_to_earn > 0 && (
        <section className="bg-reward-light border border-reward rounded-xl p-4 flex items-center gap-3">
          <Gift className="w-6 h-6 text-reward flex-shrink-0" />
          <div className="text-sm text-foreground">
            <strong>+{order.points_to_earn} điểm</strong> sẽ được tự động cộng vào tài
            khoản khi đơn hoàn thành.
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link href="/tai-khoan/don-hang" className="block">
          <Button variant="outline" size="lg" fullWidth>
            Xem đơn hàng
          </Button>
        </Link>
        <Link href="/san-pham" className="block">
          <Button variant="cta" size="lg" fullWidth>
            Tiếp tục mua
          </Button>
        </Link>
      </div>
    </div>
  )
}

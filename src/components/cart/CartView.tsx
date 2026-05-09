'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/cart/cartStore'
import { CartItemRow } from './CartItemRow'
import { Button } from '@/components/ui/Button'
import { formatVND } from '@/lib/utils'

/**
 * Toàn bộ trang giỏ hàng — Client Component dùng cart store.
 *
 * Layout mobile-first:
 * - List items (scroll dọc)
 * - Phần dưới: tóm tắt tiền + sticky CTA "Thanh toán"
 *
 * Empty state nếu giỏ rỗng.
 */
export function CartView() {
  const items = useCartStore(s => s.items)
  const hydrated = useCartStore(s => s.hydrated)
  const subtotal = useCartStore(s => s.getSubtotal())
  const rawPoints = useCartStore(s => s.getRawPointsToEarn())

  // Tránh hydration mismatch (server render rỗng, client load từ localStorage)
  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted">
        Đang tải giỏ hàng...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-3 text-subtle" />
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Giỏ hàng trống
        </h1>
        <p className="text-sm text-muted mb-6">
          Mẹ chưa thêm sản phẩm nào vào giỏ. Khám phá thương hiệu bỉm uy tín nhé!
        </p>
        <Link href="/san-pham">
          <Button variant="cta" size="lg">
            Mua bỉm ngay
          </Button>
        </Link>
      </div>
    )
  }

  const SHIPPING_FEE_ORIGINAL = 45000  // §29.5 — hằng số MVP free ship hiển thị
  const SHIPPING_FEE = 0
  const total = subtotal + SHIPPING_FEE

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">
        Giỏ hàng ({items.length} sản phẩm)
      </h1>

      <div className="space-y-3">
        {items.map(item => (
          <CartItemRow key={item.product_id} item={item} />
        ))}
      </div>

      {/* Summary card */}
      <div className="mt-6 bg-card border border-primary-light rounded-xl p-4 space-y-2">
        <Row label="Tạm tính" value={formatVND(subtotal)} />
        <Row
          label="Phí vận chuyển"
          value={
            <span>
              <span className="line-through text-subtle mr-2">
                {formatVND(SHIPPING_FEE_ORIGINAL)}
              </span>
              <span className="text-status-instock font-semibold">Miễn phí</span>
            </span>
          }
        />
        <Row
          label={
            <span className="inline-flex items-center gap-1 text-reward font-semibold">
              🎁 Sẽ tích được
            </span>
          }
          value={<span className="text-foreground font-medium">{rawPoints} điểm</span>}
        />
        <div className="pt-2 mt-2 border-t border-primary-light flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">Tổng cộng</span>
          <span className="text-xl font-bold text-cta">{formatVND(total)}</span>
        </div>
      </div>

      {/* Sticky bottom CTA mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary-light shadow-lg p-3 z-30">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted">Tổng thanh toán</div>
            <div className="text-lg font-bold text-cta truncate">
              {formatVND(total)}
            </div>
          </div>
          <Link href="/thanh-toan" className="flex-shrink-0">
            <Button variant="cta" size="lg">
              Thanh toán
            </Button>
          </Link>
        </div>
      </div>
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

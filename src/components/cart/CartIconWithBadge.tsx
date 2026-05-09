'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/cart/cartStore'

/**
 * Icon giỏ hàng + badge số lượng (sub-component của Header).
 * Tách Client để chỉ phần này re-render khi cart thay đổi, không bắt cả Header.
 */
export function CartIconWithBadge() {
  const itemCount = useCartStore(s => s.getItemCount())
  const hydrated = useCartStore(s => s.hydrated)

  return (
    <Link
      href="/gio-hang"
      className="tap-target relative flex items-center justify-center text-foreground hover:text-primary-dark"
      aria-label={`Giỏ hàng${hydrated && itemCount > 0 ? ` (${itemCount})` : ''}`}
    >
      <ShoppingCart className="w-5 h-5" />
      {hydrated && itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-cta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  )
}

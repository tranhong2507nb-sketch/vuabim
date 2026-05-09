'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/lib/cart/cartStore'

/**
 * Helper component — clear cart khi mount.
 * Dùng trên trang đặt hàng thành công.
 */
export function ClearCartOnMount() {
  useEffect(() => {
    useCartStore.getState().clear()
  }, [])
  return null
}

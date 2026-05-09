'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCartStore } from '@/lib/cart/cartStore'
import { cn } from '@/lib/utils'
import type { ProductWithBrand } from '@/lib/types'

interface Props {
  product: ProductWithBrand
  qty?: number
  fullWidth?: boolean
  variant?: 'card' | 'pdp'
  /** Đích sau khi thêm vào giỏ. Mặc định 'checkout' (PDP). Card dùng 'cart' */
  destination?: 'cart' | 'checkout'
}

/**
 * Nút "Mua ngay" — thêm vào giỏ rồi chuyển hướng:
 * - destination='checkout' → /thanh-toan (mặc định cho PDP)
 * - destination='cart'     → /gio-hang   (cho card list)
 */
export function BuyNowButton({
  product,
  qty = 2,
  fullWidth = false,
  variant = 'pdp',
  destination = 'checkout',
}: Props) {
  const router = useRouter()
  const addItem = useCartStore(s => s.addItem)
  const [pending, setPending] = useState(false)

  const inStock = product.stock > 0
  if (!inStock) {
    return (
      <button
        disabled
        className={cn(
          'flex items-center justify-center rounded-lg font-medium border-2 bg-section-soft text-muted border-primary-light cursor-not-allowed',
          variant === 'card'
            ? 'min-h-[36px] px-3 text-sm'
            : 'min-h-[48px] px-6 text-base',
          fullWidth && 'w-full'
        )}
      >
        Hết hàng
      </button>
    )
  }

  function handleClick(e: React.MouseEvent) {
    // Nếu đặt trong <Link> (như ProductCard) → chặn navigate sang trang sp
    e.preventDefault()
    e.stopPropagation()
    setPending(true)
    addItem(
      {
        product_id: product.id,
        slug: product.slug,
        name: product.name,
        brand_name: product.brand?.name ?? '',
        size: product.size,
        price: product.price,
        points_per_unit: product.points_per_unit,
        image: product.images?.[0] ?? null,
      },
      qty
    )
    router.push(destination === 'cart' ? '/gio-hang' : '/thanh-toan')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-70',
        variant === 'card'
          ? 'min-h-[36px] px-3 text-sm bg-cta text-white border border-cta hover:bg-cta-hover'
          : 'min-h-[48px] px-6 text-base border-2 bg-cta text-white border-cta hover:bg-cta-hover',
        fullWidth && 'w-full'
      )}
    >
      {pending ? 'Đang chuyển…' : 'Mua ngay'}
    </button>
  )
}

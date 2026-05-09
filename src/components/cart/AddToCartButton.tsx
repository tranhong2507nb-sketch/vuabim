'use client'

import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/cart/cartStore'
import { cn } from '@/lib/utils'
import type { ProductWithBrand } from '@/lib/types'

interface Props {
  product: ProductWithBrand
  qty?: number
  variant?: 'card' | 'pdp'  // 'card' compact, 'pdp' full-size
  fullWidth?: boolean
}

export function AddToCartButton({
  product,
  qty = 2,
  variant = 'card',
  fullWidth = false,
}: Props) {
  const addItem = useCartStore(s => s.addItem)
  const [justAdded, setJustAdded] = useState(false)

  const inStock = product.stock > 0
  if (!inStock) {
    return (
      <button
        disabled
        className={cn(
          'flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed border',
          variant === 'card'
            ? 'min-h-[36px] px-3 bg-section-soft border-primary-light text-muted'
            : 'min-h-[44px] px-4 bg-section-soft border-primary-light text-muted',
          fullWidth && 'w-full'
        )}
      >
        Hết hàng
      </button>
    )
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors',
        variant === 'card'
          ? 'min-h-[36px] px-3 bg-cta-bg text-cta-hover hover:bg-cta hover:text-white border border-cta'
          : 'min-h-[48px] px-6 text-base bg-cta-bg text-cta-hover hover:bg-cta hover:text-white border-2 border-cta',
        fullWidth && 'w-full',
        justAdded && '!bg-status-instock !text-white !border-status-instock'
      )}
    >
      {justAdded ? (
        <>
          <Check className="w-4 h-4" />
          Đã thêm
        </>
      ) : (
        <>
          <ShoppingCart className="w-3.5 h-3.5" />
          Thêm giỏ
        </>
      )}
    </button>
  )
}

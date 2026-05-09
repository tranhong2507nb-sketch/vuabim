'use client'

import { formatVND } from '@/lib/utils'
import type { CartItem } from '@/lib/cart/types'

interface Props {
  items: CartItem[]
}

export function OrderItemsList({ items }: Props) {
  return (
    <div className="bg-card border border-primary-light rounded-xl divide-y divide-primary-light">
      {items.map(item => (
        <div key={item.product_id} className="p-3 flex gap-3 items-center">
          <div className="w-14 h-14 flex-shrink-0 bg-section-soft rounded-lg overflow-hidden">
            {item.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground line-clamp-2">
              {item.name}
            </div>
            <div className="text-xs text-muted mt-0.5">
              {[item.brand_name, item.size].filter(Boolean).join(' · ')}
              {' · '}SL: {item.qty}
            </div>
          </div>
          <div className="text-sm font-bold text-cta whitespace-nowrap">
            {formatVND(item.price * item.qty)}
          </div>
        </div>
      ))}
    </div>
  )
}

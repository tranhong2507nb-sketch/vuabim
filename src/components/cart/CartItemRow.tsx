'use client'

import Link from 'next/link'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/lib/cart/cartStore'
import { formatVND } from '@/lib/utils'
import type { CartItem } from '@/lib/cart/types'

interface Props {
  item: CartItem
}

export function CartItemRow({ item }: Props) {
  const updateQty = useCartStore(s => s.updateQty)
  const removeItem = useCartStore(s => s.removeItem)

  return (
    <div className="bg-card border border-primary-light rounded-xl p-3 flex gap-3">
      {/* Ảnh */}
      <Link
        href={`/san-pham/${item.slug}`}
        className="flex-shrink-0 w-20 h-20 bg-section-soft rounded-lg overflow-hidden"
      >
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-subtle">
            —
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/san-pham/${item.slug}`}
            className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary-dark"
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(item.product_id)}
            className="text-muted hover:text-status-out flex-shrink-0 p-1"
            aria-label="Xóa khỏi giỏ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-muted mt-0.5">
          {[item.brand_name, item.size].filter(Boolean).join(' · ')}
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between">
          {/* Qty controls — tối thiểu 2 cái/sản phẩm */}
          <div className="flex items-center gap-0 border border-primary-light rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => updateQty(item.product_id, item.qty - 1)}
              disabled={item.qty <= 2}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              aria-label="Giảm"
              title={item.qty <= 2 ? 'Tối thiểu 2 cái — bấm 🗑 để xoá khỏi giỏ' : 'Giảm'}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-medium tabular-nums">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => updateQty(item.product_id, item.qty + 1)}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-primary-light"
              aria-label="Tăng"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Giá */}
          <div className="text-sm font-bold text-cta">
            {formatVND(item.price * item.qty)}
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ProductCard } from './ProductCard'
import type { ProductWithBrand } from '@/lib/types'

interface Props {
  products: ProductWithBrand[]
  emptyTitle?: string
  emptyDesc?: string
}

/**
 * Grid sản phẩm — 2 cột mobile, 3-4 cột desktop.
 * Có empty state.
 */
export function ProductGrid({
  products,
  emptyTitle = 'Chưa có sản phẩm',
  emptyDesc = 'Hiện chưa có sản phẩm trong danh mục này.',
}: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-section-soft border border-primary-light rounded-xl p-8 text-center">
        <div className="text-4xl mb-2">🛒</div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {emptyTitle}
        </h3>
        <p className="text-sm text-muted mb-4">{emptyDesc}</p>
        <Link href="/thuong-hieu">
          <Button variant="outline" size="md">
            Khám phá thương hiệu
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

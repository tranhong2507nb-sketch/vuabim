import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/product/ProductGrid'
import type { ProductWithBrand } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tất cả sản phẩm',
  description: 'Bỉm chính hãng từ 15 thương hiệu uy tín — Yingcool, RoyalSoft, Gooby, Honey, Merries, Moony...',
}

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(
      `
        id, slug, name, brand_id, size, weight_range,
        diaper_type, usage_day, usage_night,
        price, stock, points_per_unit, images,
        meta_title, meta_description, is_active,
        brand:brands ( id, slug, name, logo_url )
      `
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(48)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          Tất cả sản phẩm
        </h1>
        <p className="text-sm text-muted">
          {products?.length ?? 0} sản phẩm bỉm chính hãng cho mẹ và bé
        </p>
      </header>

      {/* Filter bottom sheet — Phase sau */}

      <ProductGrid
        products={(products ?? []) as unknown as ProductWithBrand[]}
        emptyTitle="Sản phẩm đang được cập nhật"
        emptyDesc="Admin đang chuẩn bị sản phẩm. Vui lòng quay lại sau."
      />
    </div>
  )
}

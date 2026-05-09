import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductWithBrand } from '@/lib/types'

/**
 * Section "Sản phẩm nổi bật" trên trang chủ.
 * Lấy 8 SP active mới nhất.
 */
export async function FeaturedProducts() {
  const supabase = await createClient()
  const { data } = await supabase
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
    .limit(8)

  const products = (data ?? []) as unknown as ProductWithBrand[]

  if (products.length === 0) {
    return (
      <div className="bg-section-soft border border-primary-light rounded-xl p-8 text-center text-sm text-muted">
        Sản phẩm sẽ hiển thị ở đây sau khi admin thêm vào hệ thống.
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

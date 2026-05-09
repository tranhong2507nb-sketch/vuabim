import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

/**
 * Lưới 15 hãng — Server Component fetch từ DB.
 * Mobile: 3 cột × 5 hàng. Desktop: 5 cột × 3 hàng.
 */
export async function BrandGrid() {
  const supabase = await createClient()
  const { data: brands } = await supabase
    .from('brands')
    .select('id, slug, name, logo_url')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (!brands || brands.length === 0) {
    return (
      <div className="text-center text-muted text-sm py-6">
        Chưa có thương hiệu nào.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {brands.map(brand => (
        <Link
          key={brand.id}
          href={`/thuong-hieu/${brand.slug}`}
          className="group bg-card border border-primary-light rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px] hover:border-primary-dark hover:bg-primary-light/30 transition-colors text-center"
        >
          {brand.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="w-20 h-20 md:w-24 md:h-24 object-contain mb-2"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold text-2xl md:text-3xl mb-2">
              {brand.name.charAt(0)}
            </div>
          )}
          <span className="text-sm md:text-base font-medium text-foreground group-hover:text-primary-dark line-clamp-2">
            {brand.name}
          </span>
        </Link>
      ))}
    </div>
  )
}

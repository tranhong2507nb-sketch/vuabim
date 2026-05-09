import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thương hiệu',
  description: '15 thương hiệu bỉm chính hãng được Vua Bỉm phân phối',
}

export default async function BrandsListPage() {
  const supabase = await createClient()
  const { data: brands } = await supabase
    .from('brands')
    .select('id, slug, name, logo_url, banner_url, meta_description')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          Thương hiệu
        </h1>
        <p className="text-sm text-muted">
          15 thương hiệu bỉm uy tín được Vua Bỉm phân phối chính hãng
        </p>
      </header>

      {!brands || brands.length === 0 ? (
        <div className="text-center text-muted py-8">Chưa có thương hiệu nào.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {brands.map(brand => (
            <Link
              key={brand.id}
              href={`/thuong-hieu/${brand.slug}`}
              className="group bg-card border border-primary-light rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] hover:border-primary-dark hover:bg-primary-light/30 transition-colors text-center"
            >
              {brand.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="w-16 h-16 object-contain mb-2"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-bold text-xl mb-2">
                  {brand.name.charAt(0)}
                </div>
              )}
              <span className="text-sm md:text-base font-medium text-foreground group-hover:text-primary-dark">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

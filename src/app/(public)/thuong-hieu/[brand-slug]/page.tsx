import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/product/ProductGrid'
import { sanitizeBrandStory } from '@/lib/sanitize/brand-story'
import type { Metadata } from 'next'
import type { Brand, ProductWithBrand } from '@/lib/types'

interface PageProps {
  params: Promise<{ 'brand-slug': string }>
}

async function getBrand(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Brand | null
}

async function getBrandProducts(brandId: string) {
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
    .eq('brand_id', brandId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return (data ?? []) as unknown as ProductWithBrand[]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = (await params)['brand-slug']
  const brand = await getBrand(slug)
  if (!brand) return { title: 'Thương hiệu không tìm thấy' }

  return {
    title: brand.meta_title ?? brand.name,
    description: brand.meta_description ?? `Bỉm ${brand.name} chính hãng tại Vua Bỉm`,
  }
}

export default async function BrandPage({ params }: PageProps) {
  const slug = (await params)['brand-slug']
  const brand = await getBrand(slug)
  if (!brand) notFound()

  const products = await getBrandProducts(brand.id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Banner hãng */}
      {brand.banner_url ? (
        <div className="rounded-2xl overflow-hidden mb-6 aspect-[3/1] md:aspect-[4/1] bg-section-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.banner_url}
            alt={brand.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary-light to-secondary-light rounded-2xl p-8 mb-6 text-center">
          {brand.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo_url} alt={brand.name} className="w-20 h-20 object-contain mx-auto mb-3" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-card text-primary-dark font-bold text-3xl flex items-center justify-center mx-auto mb-3">
              {brand.name.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">{brand.name}</h1>
        </div>
      )}

      {/* SP của hãng — lên trước câu chuyện */}
      <section className="mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          Sản phẩm {brand.name}
        </h2>
        <ProductGrid
          products={products}
          emptyTitle={`Chưa có sản phẩm ${brand.name}`}
          emptyDesc="Admin đang chuẩn bị sản phẩm cho thương hiệu này."
        />
      </section>

      {/* Câu chuyện thương hiệu — xuống cuối */}
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          Câu chuyện {brand.name}
        </h2>
        {brand.story_content ? (
          <article
            className="prose prose-sm md:prose max-w-none"
            // Sanitize lần 2 (defense in depth) — phòng dữ liệu cũ chưa qua sanitize
            dangerouslySetInnerHTML={{
              __html: sanitizeBrandStory(brand.story_content),
            }}
          />
        ) : (
          <div className="bg-section-soft border border-primary-light rounded-xl p-6 text-center text-sm text-muted">
            Câu chuyện thương hiệu đang được cập nhật...
          </div>
        )}
      </section>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatVND } from '@/lib/utils'
import { Gift, Sun, Moon } from 'lucide-react'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { BuyNowButton } from '@/components/cart/BuyNowButton'
import { OrderGiftSelector } from '@/components/redemption/OrderGiftSelector'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'
import { DIAPER_TYPE_LABEL, type ProductWithBrand } from '@/lib/types'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'http://localhost:3000'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
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
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return data as unknown as ProductWithBrand | null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm' }

  const title = product.meta_title ?? product.name
  const description =
    product.meta_description ?? `${product.name} — chính hãng tại Vua Bỉm`
  const firstImage = product.images?.[0]

  return {
    title,
    description,
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/san-pham/${product.slug}`,
      type: 'website',
      images: firstImage ? [{ url: firstImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [product, user] = await Promise.all([getProduct(slug), getCurrentUser()])
  if (!product) notFound()

  const inStock = product.stock > 0
  const firstImage = product.images?.[0]

  // JSON-LD Product schema
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.meta_description ?? `${product.name} chính hãng tại Vua Bỉm`,
    image: product.images && product.images.length > 0 ? product.images : undefined,
    sku: product.id,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand.name,
        }
      : undefined,
    category: 'Bỉm trẻ em',
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/san-pham/${product.slug}`,
      priceCurrency: 'VND',
      price: product.price,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  // JSON-LD Breadcrumb
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sản phẩm',
        item: `${SITE_URL}/san-pham`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${SITE_URL}/san-pham/${product.slug}`,
      },
    ],
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <nav className="text-xs text-muted mb-4">
        <Link href="/" className="hover:text-primary-dark">Trang chủ</Link>
        <span className="mx-1.5">/</span>
        <Link href="/san-pham" className="hover:text-primary-dark">Sản phẩm</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Gallery */}
        <div className="bg-section-soft border border-primary-light rounded-2xl overflow-hidden aspect-square">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-full object-cover"
              fetchPriority="high"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-subtle">
              Chưa có ảnh sản phẩm
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Hãng */}
          <Link
            href={`/thuong-hieu/${product.brand?.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-primary-dark hover:underline mb-2 self-start"
          >
            {product.brand?.name}
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {product.name}
          </h1>

          {/* Loại bỉm + thời điểm */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                product.diaper_type === 'pant'
                  ? 'bg-primary-light border-primary text-primary-dark'
                  : 'bg-secondary-light border-secondary text-secondary-dark'
              }`}
            >
              {DIAPER_TYPE_LABEL[product.diaper_type]}
            </span>
            {product.usage_day && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-reward-light border-reward text-foreground">
                <Sun className="w-3 h-3" />
                Ngày
              </span>
            )}
            {product.usage_night && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-foreground/10 border-foreground/40 text-foreground">
                <Moon className="w-3 h-3" />
                Đêm
              </span>
            )}
          </div>

          {(product.size || product.weight_range) && (
            <div className="text-sm text-muted mb-3">
              {[product.size, product.weight_range].filter(Boolean).join(' · ')}
            </div>
          )}

          <div className="text-3xl font-bold text-cta mb-2">
            {formatVND(product.price)}
          </div>

          <div className={`text-sm mb-4 ${inStock ? 'text-status-instock' : 'text-status-out'}`}>
            {inStock ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
          </div>

          {/* Mục TÍCH ĐIỂM */}
          <div className="bg-reward-light border border-reward rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-reward" />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  +{product.points_per_unit} điểm/sản phẩm
                </div>
                <div className="text-xs text-muted">
                  Tích vào tài khoản khi đơn hoàn thành
                </div>
              </div>
            </div>
          </div>

          {/* Đổi quà tặng kèm đơn */}
          <OrderGiftSelector
            isLoggedIn={!!user}
            currentPoints={user?.current_points ?? 0}
          />

          {/* Sticky bottom CTA */}
          <div className="flex gap-2">
            <AddToCartButton product={product} variant="pdp" fullWidth />
            <BuyNowButton product={product} fullWidth />
          </div>
        </div>
      </div>
    </div>
  )
}

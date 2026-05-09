import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { BrandGrid } from '@/components/home/BrandGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { JsonLd } from '@/components/seo/JsonLd'
import { Gift } from 'lucide-react'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'http://localhost:3000'

export default function HomePage() {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Vua Bỉm',
    url: `${SITE_URL}/`,
    description:
      'Mua bỉm chính hãng giá tốt — 15 thương hiệu uy tín. Tích điểm đổi quà.',
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/san-pham?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Vua Bỉm',
    url: `${SITE_URL}/`,
    description:
      'Cửa hàng bỉm trẻ em chính hãng. Tích điểm đổi quà, miễn phí giao hàng toàn quốc.',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={orgJsonLd} />
      {/* Hero — chỉ chữ, không nền banner */}
      <section className="text-center pt-4 pb-2 md:pt-8 md:pb-4">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-primary-dark leading-tight mb-3 md:mb-4 tracking-tight">
          Bỉm chính hãng cho mẹ và bé
        </h1>
        <p className="text-base md:text-xl text-foreground max-w-3xl mx-auto leading-relaxed">
          Mua bỉm giá tốt
          <span className="text-secondary-dark font-semibold"> — miễn phí giao hàng toàn quốc — </span>
          tích điểm đổi quà mỗi đơn hàng
        </p>
      </section>

      {/* Lưới hãng */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Chọn theo thương hiệu
          </h2>
          <Link href="/thuong-hieu" className="text-sm text-primary-dark hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <BrandGrid />
      </section>

      {/* SP nổi bật */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Sản phẩm nổi bật
          </h2>
          <Link href="/san-pham" className="text-sm text-primary-dark hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <FeaturedProducts />
      </section>

      {/* Box đổi quà */}
      <section className="bg-reward-light border-2 border-reward rounded-2xl p-6 md:p-8 text-center">
        <Gift className="w-12 h-12 mx-auto mb-3 text-reward" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Tích điểm — Đổi quà miễn phí
        </h2>
        <p className="text-muted mb-5 max-w-xl mx-auto">
          Mỗi đơn hàng tích điểm thưởng. Đổi điểm lấy quà tặng cho mẹ và bé.
        </p>
        <Link href="/doi-qua">
          <Button variant="reward" size="lg">
            Xem quà có thể đổi
          </Button>
        </Link>
      </section>
    </div>
  )
}


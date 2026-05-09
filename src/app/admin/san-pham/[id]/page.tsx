import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sửa sản phẩm',
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: brands }] = await Promise.all([
    supabase
      .from('products')
      .select(
        `id, slug, name, brand_id, size, weight_range,
         diaper_type, usage_day, usage_night,
         price, stock, points_per_unit, images, meta_title, meta_description, is_active`
      )
      .eq('id', id)
      .single(),
    supabase.from('brands').select('id, name').order('name'),
  ])

  if (!product) notFound()

  const initial = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand_id: product.brand_id,
    size: product.size ?? '',
    weight_range: product.weight_range ?? '',
    diaper_type: (product.diaper_type ?? 'tape') as 'tape' | 'pant',
    usage_day: !!product.usage_day,
    usage_night: !!product.usage_night,
    price: product.price,
    stock: product.stock,
    points_per_unit: product.points_per_unit,
    images: Array.isArray(product.images) ? (product.images as string[]) : [],
    meta_title: product.meta_title ?? '',
    meta_description: product.meta_description ?? '',
    is_active: product.is_active,
  }

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-3xl mx-auto">
      <Link
        href="/admin/san-pham"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-dark mb-3"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
            Sửa sản phẩm
          </h1>
          <p className="text-sm text-muted truncate max-w-md">{product.name}</p>
        </div>
        <Link
          href={`/san-pham/${product.slug}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-sm text-cta hover:text-primary-dark"
        >
          <ExternalLink className="w-4 h-4" />
          Xem trên web
        </Link>
      </div>

      <ProductForm brands={brands ?? []} initial={initial} />
    </div>
  )
}

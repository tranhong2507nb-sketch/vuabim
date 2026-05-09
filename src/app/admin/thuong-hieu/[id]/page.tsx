import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BrandForm } from '@/components/admin/BrandForm'
import { BrandStoryEditor } from '@/components/admin/BrandStoryEditor'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sửa hãng',
}

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: brand } = await supabase
    .from('brands')
    .select(
      `id, slug, name, logo_url, banner_url, story_content,
       meta_title, meta_description, display_order, is_active`
    )
    .eq('id', id)
    .single()

  if (!brand) notFound()

  const initial = {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo_url: brand.logo_url ?? '',
    banner_url: brand.banner_url ?? '',
    meta_title: brand.meta_title ?? '',
    meta_description: brand.meta_description ?? '',
    display_order: brand.display_order,
    is_active: brand.is_active,
  }

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-3xl mx-auto space-y-8">
      <div>
        <Link
          href="/admin/thuong-hieu"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-dark mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>

        <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
              Sửa hãng
            </h1>
            <p className="text-sm text-muted truncate max-w-md">{brand.name}</p>
          </div>
          <Link
            href={`/thuong-hieu/${brand.slug}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-sm text-cta hover:text-primary-dark"
          >
            <ExternalLink className="w-4 h-4" />
            Xem trên web
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-3">
          Thông tin chung
        </h2>
        <BrandForm initial={initial} />
      </section>

      <section className="border-t-2 border-primary-light pt-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-1">
          Câu chuyện thương hiệu
        </h2>
        <p className="text-sm text-muted mb-3">
          Nội dung này hiển thị ở cuối trang hãng — kể lịch sử, giá trị, đặc điểm.
          Có thể chèn ảnh, link, danh sách...
        </p>
        <BrandStoryEditor
          brandId={brand.id}
          initialContent={brand.story_content ?? ''}
        />
      </section>
    </div>
  )
}

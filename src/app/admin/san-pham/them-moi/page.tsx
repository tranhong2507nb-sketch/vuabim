import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Thêm sản phẩm',
}

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-3xl mx-auto">
      <Link
        href="/admin/san-pham"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-dark mb-3"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
        Thêm sản phẩm
      </h1>
      <p className="text-sm text-muted mb-5">
        Điền thông tin sản phẩm rồi bấm Tạo sản phẩm.
      </p>

      {!brands || brands.length === 0 ? (
        <div className="bg-status-low/10 border border-status-low/30 rounded-xl p-4 text-sm">
          Chưa có hãng nào đang hoạt động —{' '}
          <Link
            href="/admin/thuong-hieu"
            className="text-cta hover:text-primary-dark font-medium"
          >
            tạo hãng trước
          </Link>{' '}
          rồi quay lại.
        </div>
      ) : (
        <ProductForm brands={brands} />
      )}
    </div>
  )
}

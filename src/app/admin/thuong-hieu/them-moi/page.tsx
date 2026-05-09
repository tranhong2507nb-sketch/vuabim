import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BrandForm } from '@/components/admin/BrandForm'

export const metadata = {
  title: 'Thêm hãng',
}

export default function NewBrandPage() {
  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-3xl mx-auto">
      <Link
        href="/admin/thuong-hieu"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-dark mb-3"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
        Thêm hãng
      </h1>
      <p className="text-sm text-muted mb-5">
        Tạo hãng xong → bạn sẽ được chuyển sang trang sửa để nhập câu chuyện thương
        hiệu.
      </p>

      <BrandForm />
    </div>
  )
}

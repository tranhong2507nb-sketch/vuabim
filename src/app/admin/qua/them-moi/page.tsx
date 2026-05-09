import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { GiftForm } from '@/components/admin/GiftForm'

export const metadata = {
  title: 'Thêm quà',
}

export default function NewGiftPage() {
  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-2xl mx-auto">
      <Link
        href="/admin/qua"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-dark mb-3"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
        Thêm quà
      </h1>
      <p className="text-sm text-muted mb-5">
        Quà sẽ hiển thị trên trang /doi-qua sau khi tạo (nếu Đang hoạt động).
      </p>

      <GiftForm />
    </div>
  )
}

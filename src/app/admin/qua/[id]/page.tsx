import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GiftForm } from '@/components/admin/GiftForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sửa quà',
}

export default async function EditGiftPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: gift } = await supabase
    .from('gifts')
    .select('id, name, image_url, description, points_required, stock, is_active')
    .eq('id', id)
    .single()

  if (!gift) notFound()

  const initial = {
    id: gift.id,
    name: gift.name,
    image_url: gift.image_url ?? '',
    description: gift.description ?? '',
    points_required: gift.points_required,
    stock: gift.stock,
    is_active: gift.is_active,
  }

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
        Sửa quà
      </h1>
      <p className="text-sm text-muted truncate max-w-md mb-5">{gift.name}</p>

      <GiftForm initial={initial} />
    </div>
  )
}

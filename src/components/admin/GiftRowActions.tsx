'use client'

import Link from 'next/link'
import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { deleteGift, toggleGiftActive } from '@/lib/gifts/actions'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  name: string
  isActive: boolean
}

export function GiftRowActions({ id, name, isActive }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    setError(null)
    startTransition(async () => {
      const result = await toggleGiftActive(id, !isActive)
      if (!result.ok) setError(result.error)
      else router.refresh()
    })
  }

  function handleDelete() {
    if (
      !confirm(
        `Xóa quà "${name}"?\n\nLưu ý: nếu quà đã có yêu cầu đổi sẽ không xóa được — hãy "Tắt" thay vì xóa.`
      )
    )
      return

    setError(null)
    startTransition(async () => {
      const result = await deleteGift(id)
      if (!result.ok) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/qua/${id}`}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-section-soft hover:text-primary-dark"
        title="Sửa"
      >
        <Pencil className="w-4 h-4" />
      </Link>

      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center hover:bg-section-soft disabled:opacity-50',
          isActive ? 'text-status-instock' : 'text-muted'
        )}
        title={isActive ? 'Tắt hiển thị' : 'Bật hiển thị'}
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isActive ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-status-out hover:bg-status-out/10 disabled:opacity-50"
        title="Xóa"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {error && (
        <span
          className="ml-2 text-xs text-status-out max-w-[200px] truncate"
          title={error}
        >
          {error}
        </span>
      )}
    </div>
  )
}

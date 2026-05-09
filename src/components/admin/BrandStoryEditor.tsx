'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save, CheckCircle2 } from 'lucide-react'
import { updateBrandStory } from '@/lib/brands/actions'
import { Button } from '@/components/ui/Button'
import { TipTapEditor } from './TipTapEditor'

interface Props {
  brandId: string
  initialContent: string
}

export function BrandStoryEditor({ brandId, initialContent }: Props) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const dirty = content !== initialContent

  function save() {
    setServerError(null)
    startTransition(async () => {
      const result = await updateBrandStory({ id: brandId, story_content: content })
      if (!result.ok) {
        setServerError(result.error)
        return
      }
      setSavedAt(new Date())
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <TipTapEditor value={content} onChange={setContent} />

      {serverError && (
        <p className="text-sm text-status-out bg-status-out/10 px-3 py-2 rounded-lg">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-muted">
          {savedAt && !dirty ? (
            <span className="inline-flex items-center gap-1 text-status-instock">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã lưu lúc{' '}
              {savedAt.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          ) : dirty ? (
            <span>Có thay đổi chưa lưu</span>
          ) : (
            <span>Chưa có thay đổi</span>
          )}
        </div>

        <Button
          type="button"
          variant="cta"
          onClick={save}
          loading={pending}
          disabled={!dirty}
        >
          <Save className="w-4 h-4" />
          Lưu câu chuyện
        </Button>
      </div>
    </div>
  )
}

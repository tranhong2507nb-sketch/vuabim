'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const MAX_IMAGES = 8
const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
  bucket?: string
  pathPrefix?: string
}

export function ProductImagePicker({
  value,
  onChange,
  bucket = 'product-images',
  pathPrefix = 'products',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)

    const remaining = MAX_IMAGES - value.length
    const toUpload = Array.from(files).slice(0, remaining)

    if (files.length > remaining) {
      setError(`Chỉ tối đa ${MAX_IMAGES} ảnh — bỏ ${files.length - remaining} ảnh thừa`)
    }

    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of toUpload) {
      if (!ACCEPTED.includes(file.type)) {
        setError(`File "${file.name}" không phải JPG/PNG/WEBP`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" lớn hơn 3MB`)
        continue
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const uuid = crypto.randomUUID()
      const path = `${pathPrefix}/${uuid}.${ext}`

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '31536000',
          upsert: false,
        })

      if (upErr) {
        console.error('upload failed:', upErr)
        setError('Upload thất bại: ' + upErr.message)
        continue
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      newUrls.push(data.publicUrl)
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls])
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= value.length) return
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url, idx) => (
          <div
            key={url}
            draggable
            onDragStart={() => setDraggingIdx(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (draggingIdx !== null) move(draggingIdx, idx)
              setDraggingIdx(null)
            }}
            onDragEnd={() => setDraggingIdx(null)}
            className={cn(
              'relative aspect-square rounded-lg overflow-hidden border-2 group cursor-move',
              idx === 0
                ? 'border-primary-dark ring-2 ring-primary-dark/30'
                : 'border-primary-light',
              draggingIdx === idx && 'opacity-50'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
            {idx === 0 && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-primary-dark text-white text-[10px] font-semibold">
                Ảnh chính
              </span>
            )}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="w-6 h-6 rounded-full bg-status-out text-white flex items-center justify-center"
                aria-label="Xóa ảnh"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/60 text-white rounded p-0.5">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}

        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors',
              'border-primary-light text-muted hover:border-primary-dark hover:text-primary-dark',
              'disabled:opacity-50'
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">Đang tải…</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span className="text-xs">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      <p className="mt-2 text-xs text-muted">
        Ảnh đầu tiên là ảnh chính. Kéo-thả để sắp xếp. JPG/PNG/WEBP, tối đa 3MB/ảnh,{' '}
        {MAX_IMAGES} ảnh.
      </p>

      {error && (
        <p className="mt-1 text-xs text-status-out bg-status-out/10 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  )
}

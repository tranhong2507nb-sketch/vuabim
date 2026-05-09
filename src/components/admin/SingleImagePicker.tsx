'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 3 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

interface Props {
  value: string | null | undefined
  onChange: (url: string | null) => void
  bucket?: string
  pathPrefix?: string
  label?: string
  /** Tỉ lệ box preview, vd '1/1', '4/1'. Mặc định 1/1. */
  aspect?: '1/1' | '4/1' | '3/1' | '16/9'
}

const ASPECT_CLASS: Record<NonNullable<Props['aspect']>, string> = {
  '1/1': 'aspect-square',
  '4/1': 'aspect-[4/1]',
  '3/1': 'aspect-[3/1]',
  '16/9': 'aspect-video',
}

export function SingleImagePicker({
  value,
  onChange,
  bucket = 'product-images',
  pathPrefix = 'brands',
  label,
  aspect = '1/1',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)

    if (!ACCEPTED.includes(file.type)) {
      setError('File không phải JPG/PNG/WEBP')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File lớn hơn 3MB')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const uuid = crypto.randomUUID()
    const path = `${pathPrefix}/${uuid}.${ext}`

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '31536000', upsert: false })

    if (upErr) {
      console.error('upload failed:', upErr)
      setError('Upload thất bại: ' + upErr.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    onChange(data.publicUrl)
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative rounded-lg border-2 overflow-hidden',
          ASPECT_CLASS[aspect],
          value ? 'border-primary-light' : 'border-dashed border-primary-light'
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-status-out text-white flex items-center justify-center hover:opacity-90"
              aria-label="Xóa ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted hover:text-primary-dark transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Đang tải…</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-xs">Tải ảnh lên</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <p className="mt-1.5 text-xs text-muted">JPG/PNG/WEBP, tối đa 3MB</p>

      {error && (
        <p className="mt-1 text-xs text-status-out bg-status-out/10 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  )
}

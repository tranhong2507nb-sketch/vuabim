'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExt from '@tiptap/extension-link'
import ImageExt from '@tiptap/extension-image'
import { useRef, useState } from 'react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImageIcon,
  Heading2,
  Heading3,
  Loader2,
  Undo2,
  Redo2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (html: string) => void
}

const MAX_FILE_SIZE = 3 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export function TipTapEditor({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      ImageExt.configure({ allowBase64: false }),
      // Heading riêng — chỉ H2, H3 (StarterKit có sẵn nhưng cần override)
      // dùng StarterKit's builtin heading qua reconfigure
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm md:prose max-w-none min-h-[280px] px-3 py-2 focus:outline-none',
      },
    },
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return (
      <div className="h-[320px] rounded-lg border border-primary-light flex items-center justify-center text-sm text-muted">
        Đang tải editor…
      </div>
    )
  }

  function setHeading(level: 2 | 3) {
    editor!.chain().focus().toggleHeading({ level }).run()
  }

  function promptLink() {
    const previous = editor!.getAttributes('link').href as string | undefined
    const url = window.prompt('URL liên kết (https://…)', previous ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor!.chain().focus().unsetLink().run()
      return
    }
    if (!/^https?:\/\//.test(url) && !url.startsWith('mailto:')) {
      alert('URL phải bắt đầu bằng http://, https://, hoặc mailto:')
      return
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  async function handleImageFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      alert('Ảnh phải là JPG/PNG/WEBP')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('Ảnh lớn hơn 3MB')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const uuid = crypto.randomUUID()
    const path = `brand-stories/${uuid}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '31536000', upsert: false })

    if (error) {
      alert('Upload thất bại: ' + error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    editor!.chain().focus().setImage({ src: data.publicUrl, alt: '' }).run()
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const btn =
    'w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:bg-primary-light hover:text-primary-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
  const btnActive = 'bg-primary-light text-primary-dark'

  return (
    <div className="border border-primary-light rounded-xl overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap p-1.5 border-b border-primary-light bg-section-soft">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(btn, editor.isActive('bold') && btnActive)}
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(btn, editor.isActive('italic') && btnActive)}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-primary-light mx-1" />

        <button
          type="button"
          onClick={() => setHeading(2)}
          className={cn(btn, editor.isActive('heading', { level: 2 }) && btnActive)}
          title="Tiêu đề lớn"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setHeading(3)}
          className={cn(btn, editor.isActive('heading', { level: 3 }) && btnActive)}
          title="Tiêu đề nhỏ"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-primary-light mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(btn, editor.isActive('bulletList') && btnActive)}
          title="Danh sách"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(btn, editor.isActive('orderedList') && btnActive)}
          title="Danh sách đánh số"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(btn, editor.isActive('blockquote') && btnActive)}
          title="Trích dẫn"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-primary-light mx-1" />

        <button
          type="button"
          onClick={promptLink}
          className={cn(btn, editor.isActive('link') && btnActive)}
          title="Chèn link"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={btn}
          title="Chèn ảnh"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={btn}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={btn}
            title="Làm lại (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleImageFile(file)
        }}
      />
    </div>
  )
}

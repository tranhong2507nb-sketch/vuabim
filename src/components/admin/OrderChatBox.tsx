'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, MessageCircle, Info } from 'lucide-react'
import {
  sendOrderMessage,
  markOrderMessagesRead,
} from '@/lib/admin-orders/actions'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface OrderMessage {
  id: string
  sender_type: 'customer' | 'admin' | 'system'
  message: string
  created_at: string
  read_by_other: boolean
}

interface Props {
  orderId: string
  messages: OrderMessage[]
}

export function OrderChatBox({ orderId, messages }: Props) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Auto mark customer messages as read khi admin xem
  useEffect(() => {
    const hasUnread = messages.some(
      m => m.sender_type !== 'admin' && !m.read_by_other
    )
    if (!hasUnread) return
    markOrderMessagesRead(orderId).catch(() => {
      // ignore — không quan trọng nếu fail
    })
  }, [orderId, messages])

  function send() {
    setError(null)
    if (!text.trim()) return
    startTransition(async () => {
      const result = await sendOrderMessage(orderId, text)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setText('')
      router.refresh()
    })
  }

  return (
    <section className="bg-card border border-primary-light rounded-xl overflow-hidden">
      <header className="px-4 py-2.5 border-b border-primary-light bg-section-soft flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary-dark" />
        <h2 className="text-sm font-semibold text-foreground">
          Tin nhắn với khách
        </h2>
        <span className="ml-auto text-xs text-muted">
          {messages.length} tin
        </span>
      </header>

      <div className="max-h-[400px] overflow-y-auto p-3 space-y-2 bg-background">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted py-6">
            Chưa có tin nhắn nào.
          </div>
        ) : (
          messages.map(m => <ChatBubble key={m.id} message={m} />)
        )}
      </div>

      <div className="border-t border-primary-light p-3 bg-card">
        {error && (
          <p className="text-sm text-status-out bg-status-out/10 px-2 py-1.5 rounded mb-2">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                send()
              }
            }}
            rows={2}
            placeholder="Trả lời khách… (Ctrl+Enter để gửi)"
            className="flex-1 px-3 py-2 rounded-lg border border-primary-light bg-card text-sm resize-none focus:outline-none focus:border-primary-dark"
          />
          <Button
            type="button"
            variant="cta"
            onClick={send}
            loading={pending}
            disabled={!text.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

function ChatBubble({ message }: { message: OrderMessage }) {
  const time = new Date(message.created_at).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  if (message.sender_type === 'system') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted bg-section-soft border border-primary-light rounded px-2 py-1.5 max-w-md mx-auto">
        <Info className="w-3 h-3 shrink-0" />
        <span className="flex-1">{message.message}</span>
        <span className="text-[10px] text-subtle whitespace-nowrap">{time}</span>
      </div>
    )
  }

  const fromAdmin = message.sender_type === 'admin'

  return (
    <div className={cn('flex', fromAdmin ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[75%]', fromAdmin && 'text-right')}>
        <div
          className={cn(
            'inline-block px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words',
            fromAdmin
              ? 'bg-cta text-white rounded-br-sm'
              : 'bg-card border border-primary-light text-foreground rounded-bl-sm'
          )}
        >
          {message.message}
        </div>
        <div
          className={cn(
            'text-[10px] text-subtle mt-0.5',
            fromAdmin ? 'text-right' : 'text-left'
          )}
        >
          {fromAdmin ? 'Bạn' : 'Khách'} · {time}
          {fromAdmin && message.read_by_other && (
            <span className="ml-1 text-status-instock">✓ Đã đọc</span>
          )}
        </div>
      </div>
    </div>
  )
}

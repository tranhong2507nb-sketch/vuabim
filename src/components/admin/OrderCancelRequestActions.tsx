'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, AlertTriangle } from 'lucide-react'
import {
  approveCancelRequest,
  rejectCancelRequest,
} from '@/lib/admin-orders/actions'
import { Button } from '@/components/ui/Button'

interface Props {
  orderId: string
  cancelReason: string | null
  cancelRequestedAt: string
}

export function OrderCancelRequestActions({
  orderId,
  cancelReason,
  cancelRequestedAt,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [rejectMessage, setRejectMessage] = useState('')

  function handleApprove() {
    if (
      !confirm(
        'Duyệt yêu cầu hủy?\n\nĐơn sẽ chuyển sang trạng thái "Đã hủy", điểm và tồn kho sẽ tự hoàn lại.'
      )
    )
      return

    setError(null)
    startTransition(async () => {
      const result = await approveCancelRequest(orderId)
      if (!result.ok) setError(result.error)
      else router.refresh()
    })
  }

  function handleReject() {
    setError(null)
    startTransition(async () => {
      const result = await rejectCancelRequest(orderId, rejectMessage)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setShowReject(false)
      setRejectMessage('')
      router.refresh()
    })
  }

  return (
    <div className="bg-status-pending/10 border-2 border-status-pending rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-status-pending shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-foreground">
            Khách đang yêu cầu hủy
          </div>
          <div className="text-xs text-muted">
            Lúc:{' '}
            {new Date(cancelRequestedAt).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>

      {cancelReason && (
        <div className="bg-card border border-primary-light rounded-lg p-3">
          <div className="text-xs text-muted mb-1">Lý do khách nêu:</div>
          <div className="text-sm text-foreground">{cancelReason}</div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="cta"
          onClick={handleApprove}
          loading={pending}
        >
          <Check className="w-4 h-4" />
          Duyệt — hủy đơn
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowReject(s => !s)}
          disabled={pending}
        >
          <X className="w-4 h-4" />
          Từ chối yêu cầu
        </Button>
      </div>

      {showReject && (
        <div className="bg-card border border-primary-light rounded-lg p-3 space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Lý do từ chối (gửi cho khách qua chat)
          </label>
          <textarea
            value={rejectMessage}
            onChange={e => setRejectMessage(e.target.value)}
            rows={2}
            placeholder="vd: Đơn đã đóng gói, vui lòng nhận hàng rồi đổi trả..."
            className="w-full px-3 py-2 rounded-lg border border-primary-light bg-card text-sm focus:outline-none focus:border-primary-dark"
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowReject(false)}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="cta"
              size="sm"
              onClick={handleReject}
              loading={pending}
            >
              Gửi từ chối
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-status-out bg-status-out/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  )
}

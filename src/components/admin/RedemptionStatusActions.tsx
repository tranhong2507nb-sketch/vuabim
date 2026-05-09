'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, X, Loader2 } from 'lucide-react'
import {
  advanceRedemptionStatus,
  cancelRedemption,
  type RedemptionStatus,
} from '@/lib/admin-redemptions/actions'
import { Button } from '@/components/ui/Button'

const NEXT_LABEL: Record<RedemptionStatus, string | null> = {
  pending: 'Xác nhận đơn',
  confirmed: 'Bắt đầu giao',
  shipping: 'Hoàn thành',
  completed: null,
  cancelled: null,
}

interface Props {
  id: string
  status: RedemptionStatus
}

export function RedemptionStatusActions({ id, status }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showCancel, setShowCancel] = useState(false)
  const [reason, setReason] = useState('')

  const nextLabel = NEXT_LABEL[status]
  const canCancel = status !== 'completed' && status !== 'cancelled'

  function handleAdvance() {
    setError(null)
    startTransition(async () => {
      const result = await advanceRedemptionStatus(id)
      if (!result.ok) setError(result.error)
      else router.refresh()
    })
  }

  function handleCancel() {
    if (!confirm(`Hủy yêu cầu này? Điểm sẽ được hoàn trả về tài khoản khách.`))
      return

    setError(null)
    startTransition(async () => {
      const result = await cancelRedemption(id, reason)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setShowCancel(false)
      setReason('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {nextLabel && (
          <Button
            type="button"
            variant="cta"
            onClick={handleAdvance}
            loading={pending}
          >
            {nextLabel}
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        {canCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCancel(s => !s)}
            disabled={pending}
            className="text-status-out border-status-out hover:bg-status-out/10"
          >
            <X className="w-4 h-4" />
            Hủy & hoàn điểm
          </Button>
        )}
      </div>

      {showCancel && (
        <div className="bg-status-out/5 border border-status-out/30 rounded-lg p-3 space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Lý do hủy (sẽ ghi vào lịch sử điểm)
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder="vd: Hết hàng, khách yêu cầu hủy..."
            className="w-full px-3 py-2 rounded-lg border border-primary-light bg-card text-sm focus:outline-none focus:border-primary-dark"
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCancel(false)}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="cta"
              size="sm"
              onClick={handleCancel}
              loading={pending}
              className="bg-status-out hover:bg-status-out/90"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Xác nhận hủy'
              )}
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

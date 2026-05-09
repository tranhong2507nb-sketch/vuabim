'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'
import { refundCompletedOrder } from '@/lib/admin-orders/actions'
import { Button } from '@/components/ui/Button'

interface Props {
  orderId: string
}

export function OrderRefundButton({ orderId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [refundGifts, setRefundGifts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function submit() {
    if (
      !confirm(
        'Hoàn tiền đơn này?\n\n' +
          '• Trừ điểm sản phẩm đã cộng (clamp về 0 nếu khách đã tiêu)\n' +
          '• Hoàn điểm tài khoản đã dùng\n' +
          (refundGifts ? '• Hủy + hoàn các quà đã đổi cùng đơn\n' : '') +
          '• Hoàn tồn kho sản phẩm\n' +
          '• Đơn chuyển sang trạng thái "Hoàn tiền"'
      )
    )
      return

    setError(null)
    startTransition(async () => {
      const result = await refundCompletedOrder(orderId, reason, refundGifts)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setOpen(false)
      setReason('')
      router.refresh()
    })
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-status-out border-status-out hover:bg-status-out/10"
      >
        <RotateCcw className="w-4 h-4" />
        Hoàn tiền đơn này
      </Button>
    )
  }

  return (
    <div className="bg-status-out/5 border border-status-out/30 rounded-lg p-3 space-y-3">
      <div>
        <div className="font-semibold text-status-out mb-1">Hoàn tiền đơn</div>
        <p className="text-xs text-muted">
          Chỉ dùng khi khách trả hàng / khiếu nại. Hệ thống sẽ tự xử lý điểm + tồn kho.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Lý do *
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={2}
          placeholder="vd: Khách trả hàng do sản phẩm lỗi..."
          className="w-full px-3 py-2 rounded-lg border border-primary-light bg-card text-sm focus:outline-none focus:border-primary-dark"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
        <input
          type="checkbox"
          checked={refundGifts}
          onChange={e => setRefundGifts(e.target.checked)}
          className="w-4 h-4 accent-primary-dark"
        />
        <span>Hoàn cả quà đã đổi cùng đơn (refund_gifts)</span>
      </label>

      {error && (
        <p className="text-sm text-status-out bg-status-out/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Đóng
        </Button>
        <Button
          type="button"
          variant="cta"
          size="sm"
          onClick={submit}
          loading={pending}
          disabled={reason.trim().length < 3}
          className="bg-status-out hover:bg-status-out/90"
        >
          Xác nhận hoàn tiền
        </Button>
      </div>
    </div>
  )
}

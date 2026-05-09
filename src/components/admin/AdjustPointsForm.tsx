'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, CheckCircle2 } from 'lucide-react'
import { adjustCustomerPoints } from '@/lib/admin-customers/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface Props {
  userId: string
  currentPoints: number
}

export function AdjustPointsForm({ userId, currentPoints }: Props) {
  const router = useRouter()
  const [direction, setDirection] = useState<'add' | 'subtract'>('add')
  const [amount, setAmount] = useState<string>('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [pending, startTransition] = useTransition()

  const numericAmount = parseInt(amount, 10)
  const canSubmit =
    !isNaN(numericAmount) && numericAmount > 0 && reason.trim().length >= 3

  function submit() {
    setError(null)
    const delta = direction === 'add' ? numericAmount : -numericAmount

    startTransition(async () => {
      const result = await adjustCustomerPoints({
        user_id: userId,
        delta,
        reason: reason.trim(),
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSavedAt(new Date())
      setAmount('')
      setReason('')
      router.refresh()
    })
  }

  return (
    <div className="bg-card border border-primary-light rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-foreground">
          Điều chỉnh điểm thủ công
        </h2>
        <span className="text-xs text-muted">
          Hiện có:{' '}
          <span className="font-semibold text-reward">{currentPoints} điểm</span>
        </span>
      </div>

      {/* Direction toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setDirection('add')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-colors',
            direction === 'add'
              ? 'bg-status-instock/15 border-status-instock text-status-instock'
              : 'bg-card border-primary-light text-muted hover:bg-section-soft'
          )}
        >
          <Plus className="w-4 h-4" />
          Cộng điểm
        </button>
        <button
          type="button"
          onClick={() => setDirection('subtract')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-colors',
            direction === 'subtract'
              ? 'bg-status-out/15 border-status-out text-status-out'
              : 'bg-card border-primary-light text-muted hover:bg-section-soft'
          )}
        >
          <Minus className="w-4 h-4" />
          Trừ điểm
        </button>
      </div>

      <Input
        label="Số điểm"
        type="number"
        inputMode="numeric"
        min={1}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="vd: 50"
        hint={
          direction === 'subtract'
            ? `Trừ tối đa ${currentPoints} (vượt quá tự clamp về 0)`
            : undefined
        }
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Lý do *
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={2}
          placeholder="vd: Cộng bù điểm sự kiện 8/3, trừ điểm do khách trả hàng..."
          className="w-full px-3 py-2.5 rounded-lg border border-primary-light bg-card text-foreground focus:outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20"
        />
        <p className="mt-1 text-xs text-muted">
          Lý do sẽ ghi vào lịch sử điểm — bắt buộc, tối thiểu 3 ký tự
        </p>
      </div>

      {error && (
        <p className="text-sm text-status-out bg-status-out/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {savedAt && (
        <p className="inline-flex items-center gap-1 text-sm text-status-instock bg-status-instock/10 px-3 py-2 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          Đã điều chỉnh lúc{' '}
          {savedAt.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}

      <div className="pt-2 border-t border-primary-light">
        <Button
          type="button"
          variant="cta"
          onClick={submit}
          loading={pending}
          disabled={!canSubmit}
          fullWidth
        >
          {direction === 'add' ? 'Cộng' : 'Trừ'}{' '}
          {numericAmount > 0 ? numericAmount : ''} điểm
        </Button>
      </div>
    </div>
  )
}

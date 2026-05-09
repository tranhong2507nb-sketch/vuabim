'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { cancelOwnOrder } from '@/lib/orders/actions'

interface Props {
  orderId: string
}

export function CancelOrderButton({ orderId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    if (!confirm('Bạn chắc chắn muốn hủy đơn này? Điểm tài khoản đã dùng sẽ được hoàn lại.')) {
      return
    }
    setLoading(true)
    setError(null)
    const result = await cancelOwnOrder(orderId)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="md"
        fullWidth
        onClick={handleCancel}
        loading={loading}
      >
        Hủy đơn
      </Button>
      {error && (
        <p className="mt-2 text-sm text-status-out">{error}</p>
      )}
    </div>
  )
}

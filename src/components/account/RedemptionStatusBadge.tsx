import { cn } from '@/lib/utils'

const LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Đã giao',
  cancelled: 'Đã hủy',
}

const CLS: Record<string, string> = {
  pending: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  confirmed: 'bg-primary-light text-primary-dark border-primary-dark/30',
  shipping: 'bg-cta-bg text-cta border-cta/30',
  completed: 'bg-status-completed/15 text-status-completed border-status-completed/30',
  cancelled: 'bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30',
}

export function RedemptionStatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
        CLS[status] ?? CLS.pending,
        className
      )}
    >
      {LABEL[status] ?? status}
    </span>
  )
}

import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn',
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-status-pending/15 text-status-pending border-status-pending/30',
  confirmed: 'bg-primary-light text-primary-dark border-primary-dark/30',
  shipping: 'bg-cta-bg text-cta border-cta/30',
  completed: 'bg-status-completed/15 text-status-completed border-status-completed/30',
  cancelled: 'bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30',
  refunded: 'bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30',
}

interface Props {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
        STATUS_CLASS[status] ?? STATUS_CLASS.pending,
        className
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

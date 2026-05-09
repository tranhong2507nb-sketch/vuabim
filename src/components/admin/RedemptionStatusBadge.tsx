import type { RedemptionStatus } from '@/lib/admin-redemptions/actions'

const STATUS_INFO: Record<
  RedemptionStatus,
  { label: string; classes: string }
> = {
  pending: {
    label: 'Chờ xác nhận',
    classes: 'bg-status-pending/15 text-status-pending',
  },
  confirmed: {
    label: 'Đã xác nhận',
    classes: 'bg-primary-light text-primary-dark',
  },
  shipping: { label: 'Đang giao', classes: 'bg-cta/15 text-cta' },
  completed: {
    label: 'Hoàn thành',
    classes: 'bg-status-instock/15 text-status-instock',
  },
  cancelled: {
    label: 'Đã hủy',
    classes: 'bg-status-out/15 text-status-out',
  },
}

export function RedemptionStatusBadge({
  status,
  size = 'md',
}: {
  status: RedemptionStatus | string
  size?: 'sm' | 'md'
}) {
  const info =
    STATUS_INFO[status as RedemptionStatus] ?? {
      label: status,
      classes: 'bg-muted/20 text-muted',
    }
  const sizeClass =
    size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'

  return (
    <span
      className={`inline-block rounded-full font-medium ${sizeClass} ${info.classes}`}
    >
      {info.label}
    </span>
  )
}

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  tone?: 'default' | 'primary' | 'reward' | 'warning' | 'danger'
}

const TONE_CLASSES = {
  default: 'bg-card border-primary-light',
  primary: 'bg-primary-light/30 border-primary-light',
  reward: 'bg-reward/10 border-reward/30',
  warning: 'bg-status-low/10 border-status-low/30',
  danger: 'bg-status-out/10 border-status-out/30',
} as const

const ICON_TONE_CLASSES = {
  default: 'text-muted',
  primary: 'text-primary-dark',
  reward: 'text-reward',
  warning: 'text-status-low',
  danger: 'text-status-out',
} as const

export function StatCard({ label, value, hint, icon: Icon, tone = 'default' }: Props) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 md:p-5 flex items-start gap-3',
        TONE_CLASSES[tone]
      )}
    >
      {Icon && (
        <div
          className={cn(
            'w-10 h-10 rounded-lg bg-card flex items-center justify-center shrink-0',
            ICON_TONE_CLASSES[tone]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted uppercase tracking-wide">{label}</div>
        <div className="mt-1 text-xl md:text-2xl font-bold text-foreground truncate">
          {value}
        </div>
        {hint && <div className="mt-0.5 text-xs text-muted truncate">{hint}</div>}
      </div>
    </div>
  )
}

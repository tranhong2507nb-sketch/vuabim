import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'cta' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'reward'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  // CTA chính: Mua/Đặt/Xác nhận/Thanh toán — teal đậm
  cta: 'bg-cta text-white hover:bg-cta-hover active:bg-cta-hover shadow-sm',
  // Primary: action phụ trên teal
  primary: 'bg-primary text-white hover:bg-primary-dark',
  // Secondary: hồng baby (dùng tiết chế)
  secondary: 'bg-secondary text-white hover:opacity-90',
  // Outline: viền
  outline: 'border-2 border-primary text-primary-dark hover:bg-primary-light',
  // Ghost: text only, không nền
  ghost: 'text-foreground hover:bg-section-soft',
  // Reward: đổi quà / điểm thưởng (vàng)
  reward: 'bg-reward text-foreground hover:opacity-90',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]', // tap target ≥ 44px
  lg: 'px-6 py-3 text-base min-h-[48px] font-medium',
}

export function Button({
  variant = 'cta',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <span
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}

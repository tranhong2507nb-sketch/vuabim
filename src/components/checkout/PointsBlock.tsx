'use client'

import { Gift } from 'lucide-react'
import { formatVND } from '@/lib/utils'

interface Props {
  rawPointsToEarn: number
  currentPoints: number
  productPointChoice: 'earn' | 'use_instant'
  onProductChoiceChange: (choice: 'earn' | 'use_instant') => void
  accountPointsUsed: number
  onAccountPointsChange: (n: number) => void
  baseTotal: number
  // (Phase 2.2 sẽ thêm gift selection)
}

/**
 * Khối "Hệ thống điểm" trong checkout — 3 sub-block theo §9.1 THIET-KE.md.
 * Phase 2.1: UI hoàn chỉnh, validate clamp, chưa tích hợp đổi quà.
 */
export function PointsBlock({
  rawPointsToEarn,
  currentPoints,
  productPointChoice,
  onProductChoiceChange,
  accountPointsUsed,
  onAccountPointsChange,
  baseTotal,
}: Props) {
  const maxAccountUsable = Math.min(
    currentPoints,
    Math.floor(baseTotal / 1000)
  )

  return (
    <div className="space-y-3">
      {/* Khối 3.1 — Điểm SP */}
      <div className="bg-reward-light border border-reward rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-reward" />
          <h3 className="font-semibold text-foreground">
            Đơn này tích được: <span className="text-reward">+{rawPointsToEarn} điểm</span>
          </h3>
        </div>
        <div className="text-xs text-muted mb-3">⓵ Chỉ chọn 1 trong 2:</div>
        <div className="space-y-2">
          <RadioOption
            checked={productPointChoice === 'earn'}
            onChange={() => onProductChoiceChange('earn')}
            label={`Tích ${rawPointsToEarn} điểm vào tài khoản`}
            description="Cộng vào TK khi đơn hoàn thành"
          />
          <RadioOption
            checked={productPointChoice === 'use_instant'}
            onChange={() => onProductChoiceChange('use_instant')}
            label={`Dùng ngay ${rawPointsToEarn} điểm để giảm ${formatVND(rawPointsToEarn * 1000)}`}
            description="Giảm trực tiếp vào đơn này. Phần dư (nếu có) sẽ tự động tích vào TK."
          />
        </div>
      </div>

      {/* Khối 3.2 — Điểm TK giảm tiền */}
      <div className="bg-cta-bg border border-primary-light rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-1">
          Mẹ có <span className="text-primary-dark">{currentPoints} điểm</span> trong tài khoản
        </h3>
        <p className="text-xs text-muted mb-3">
          Dùng để giảm tiền đơn này (1 điểm = 1.000đ). Tối đa: {maxAccountUsable} điểm
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max={maxAccountUsable}
            value={accountPointsUsed}
            onChange={e => {
              const n = Math.max(0, Math.min(maxAccountUsable, Number(e.target.value) || 0))
              onAccountPointsChange(n)
            }}
            className="w-24 px-3 py-2 min-h-[44px] rounded-lg border border-primary-light bg-card focus:outline-none focus:border-primary-dark"
            placeholder="0"
          />
          <span className="text-sm text-muted">điểm →</span>
          <span className="text-sm font-semibold text-foreground">
            giảm {formatVND(accountPointsUsed * 1000)}
          </span>
        </div>
        {currentPoints === 0 && (
          <p className="mt-2 text-xs text-subtle">
            Bạn chưa có điểm. Mỗi đơn hàng hoàn thành sẽ tích điểm tự động.
          </p>
        )}
      </div>

      {/* Khối 3.3 — Đổi quà placeholder */}
      <div className="bg-section-soft border border-primary-light rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-1">
          🎁 Đổi quà bằng điểm có sẵn
        </h3>
        <p className="text-xs text-muted">
          Phase 2.2 sẽ tích hợp bottom sheet chọn quà. Tạm thời xem ở{' '}
          <a href="/doi-qua" className="text-primary-dark underline">
            /doi-qua
          </a>
        </p>
      </div>
    </div>
  )
}

function RadioOption({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: () => void
  label: string
  description?: string
}) {
  return (
    <label
      className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer border transition-colors ${
        checked
          ? 'bg-card border-primary-dark'
          : 'border-transparent hover:bg-card/50'
      }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1 w-4 h-4 accent-primary-dark"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted mt-0.5">{description}</div>
        )}
      </div>
    </label>
  )
}

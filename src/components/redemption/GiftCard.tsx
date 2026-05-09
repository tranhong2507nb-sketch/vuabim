'use client'

import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface GiftItem {
  id: string
  name: string
  image_url: string | null
  description: string | null
  points_required: number
  stock: number
}

interface Props {
  gift: GiftItem
  currentPoints: number
  onClickRedeem: () => void
}

export function GiftCard({ gift, currentPoints, onClickRedeem }: Props) {
  const enoughPoints = currentPoints >= gift.points_required
  const inStock = gift.stock > 0

  let buttonState: 'redeem' | 'no-points' | 'out-stock'
  if (!inStock) buttonState = 'out-stock'
  else if (!enoughPoints) buttonState = 'no-points'
  else buttonState = 'redeem'

  return (
    <div className="bg-card border border-primary-light rounded-xl overflow-hidden flex flex-col">
      {/* Ảnh */}
      <div className="aspect-square bg-section-soft relative">
        {gift.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gift.image_url}
            alt={gift.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-subtle">
            <Gift className="w-10 h-10" />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="bg-card text-status-out text-sm font-semibold px-3 py-1 rounded-full">
              Hết quà
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5em]">
          {gift.name}
        </h3>

        {gift.description && (
          <p className="text-xs text-muted line-clamp-2">{gift.description}</p>
        )}

        {/* Điểm cần đổi */}
        <div className="bg-reward-light px-2 py-1.5 rounded-md flex items-center gap-1.5 text-sm">
          <Gift className="w-3.5 h-3.5 text-reward" />
          <span className="font-semibold text-foreground">
            {gift.points_required} điểm
          </span>
        </div>

        {/* Tồn kho */}
        <div
          className={`text-xs ${
            !inStock
              ? 'text-status-out font-medium'
              : gift.stock <= 5
                ? 'text-status-pending font-medium'
                : 'text-status-instock'
          }`}
        >
          {!inStock
            ? 'Hết quà'
            : gift.stock <= 5
              ? `Sắp hết · còn ${gift.stock} phần`
              : `Còn ${gift.stock} phần`}
        </div>

        {/* Nút đổi */}
        <div className="mt-auto pt-1">
          {buttonState === 'redeem' && (
            <Button variant="reward" size="md" fullWidth onClick={onClickRedeem}>
              Đổi quà
            </Button>
          )}
          {buttonState === 'no-points' && (
            <Button variant="outline" size="md" fullWidth disabled>
              Cần thêm {gift.points_required - currentPoints} điểm
            </Button>
          )}
          {buttonState === 'out-stock' && (
            <Button variant="outline" size="md" fullWidth disabled>
              Hết quà
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

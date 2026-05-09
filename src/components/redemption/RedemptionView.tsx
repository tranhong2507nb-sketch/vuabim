'use client'

import { useState } from 'react'
import { Gift } from 'lucide-react'
import { GiftCard } from './GiftCard'
import { RedeemDialog } from './RedeemDialog'
import type { CurrentUser } from '@/lib/auth/getCurrentUser'

interface GiftItem {
  id: string
  name: string
  image_url: string | null
  description: string | null
  points_required: number
  stock: number
}

interface Props {
  user: CurrentUser
  gifts: GiftItem[]
}

export function RedemptionView({ user, gifts }: Props) {
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header điểm */}
      <div className="bg-reward-light border border-reward rounded-2xl p-4 md:p-5 mb-6 flex items-center gap-3">
        <Gift className="w-8 h-8 text-reward flex-shrink-0" />
        <div>
          <div className="text-sm text-muted">Bạn đang có</div>
          <div className="text-2xl md:text-3xl font-bold text-foreground">
            {user.current_points} điểm
          </div>
        </div>
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">
        Đổi quà bằng điểm
      </h1>

      {gifts.length === 0 ? (
        <div className="bg-section-soft border border-primary-light rounded-xl p-8 text-center">
          <Gift className="w-12 h-12 mx-auto mb-2 text-subtle" />
          <p className="text-sm text-muted">
            Hiện chưa có quà nào. Quay lại sau nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {gifts.map(gift => (
            <GiftCard
              key={gift.id}
              gift={gift}
              currentPoints={user.current_points}
              onClickRedeem={() => setSelectedGift(gift)}
            />
          ))}
        </div>
      )}

      {selectedGift && (
        <RedeemDialog
          gift={selectedGift}
          user={user}
          onClose={() => setSelectedGift(null)}
        />
      )}
    </div>
  )
}

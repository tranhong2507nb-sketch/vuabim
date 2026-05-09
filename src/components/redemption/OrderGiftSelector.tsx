'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Gift, X, Check, Loader2, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/cart/cartStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface GiftOption {
  id: string
  name: string
  image_url: string | null
  description: string | null
  points_required: number
  stock: number
}

interface Props {
  isLoggedIn: boolean
  currentPoints: number
}

export function OrderGiftSelector({ isLoggedIn, currentPoints }: Props) {
  const selectedGiftId = useCartStore(s => s.selectedGiftId)
  const setSelectedGift = useCartStore(s => s.setSelectedGift)
  const hydrated = useCartStore(s => s.hydrated)

  const [open, setOpen] = useState(false)
  const [gifts, setGifts] = useState<GiftOption[] | null>(null)
  const [loading, setLoading] = useState(false)

  // Body scroll lock khi open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Load gifts khi mở sheet lần đầu
  useEffect(() => {
    if (!open || gifts !== null) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('gifts')
      .select('id, name, image_url, description, points_required, stock')
      .eq('is_active', true)
      .order('points_required', { ascending: true })
      .then(({ data }) => {
        setGifts((data ?? []) as GiftOption[])
        setLoading(false)
      })
  }, [open, gifts])

  // Tìm thông tin quà đã chọn (để hiển thị trên card thu gọn)
  const selectedGift =
    selectedGiftId && gifts
      ? gifts.find(g => g.id === selectedGiftId) ?? null
      : null

  // Nếu chưa load gifts mà đã có selectedGiftId từ localStorage → fetch riêng
  useEffect(() => {
    if (!hydrated || !selectedGiftId || gifts !== null) return
    const supabase = createClient()
    supabase
      .from('gifts')
      .select('id, name, image_url, description, points_required, stock')
      .eq('is_active', true)
      .order('points_required', { ascending: true })
      .then(({ data }) => {
        setGifts((data ?? []) as GiftOption[])
      })
  }, [hydrated, selectedGiftId, gifts])

  if (!hydrated) {
    return (
      <div className="bg-cta-bg border border-primary-light rounded-xl p-3 mb-3 animate-pulse">
        <div className="h-5 bg-primary-light/40 rounded w-32 mb-2" />
        <div className="h-3 bg-primary-light/30 rounded w-48" />
      </div>
    )
  }

  // Card chính
  return (
    <>
      {selectedGift ? (
        <SelectedCard
          gift={selectedGift}
          onChange={() => setOpen(true)}
          onRemove={() => setSelectedGift(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full bg-reward-light border border-reward rounded-xl p-3 mb-3 text-left hover:bg-reward/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-reward/30 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground">
                Đổi quà tặng kèm đơn này
              </div>
              <div className="text-xs text-muted">
                {isLoggedIn
                  ? `Bạn có ${currentPoints} điểm — bấm để xem quà`
                  : 'Đăng nhập để dùng điểm đổi quà tặng kèm'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted shrink-0" />
          </div>
        </button>
      )}

      {open && (
        <GiftSheet
          gifts={gifts}
          loading={loading}
          isLoggedIn={isLoggedIn}
          currentPoints={currentPoints}
          selectedGiftId={selectedGiftId}
          onPick={id => {
            setSelectedGift(id)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function SelectedCard({
  gift,
  onChange,
  onRemove,
}: {
  gift: GiftOption
  onChange: () => void
  onRemove: () => void
}) {
  return (
    <div className="bg-reward-light border border-reward rounded-xl p-3 mb-3">
      <div className="flex items-center gap-2 mb-2 text-xs text-muted">
        <Check className="w-3.5 h-3.5 text-status-instock" />
        Đã chọn quà tặng kèm — sẽ giao cùng đơn
      </div>
      <div className="flex items-center gap-3">
        {gift.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gift.image_url}
            alt={gift.name}
            className="w-14 h-14 rounded-lg object-cover border border-reward shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-card border border-reward flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-reward" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground line-clamp-2">
            {gift.name}
          </div>
          <div className="text-xs text-reward font-semibold mt-0.5">
            🎁 −{gift.points_required} điểm
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="w-8 h-8 rounded-full bg-card hover:bg-status-out hover:text-white text-muted flex items-center justify-center shrink-0"
          aria-label="Bỏ quà"
          title="Bỏ chọn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="mt-2 text-xs text-cta hover:text-primary-dark font-medium"
      >
        Đổi sang quà khác →
      </button>
    </div>
  )
}

function GiftSheet({
  gifts,
  loading,
  isLoggedIn,
  currentPoints,
  selectedGiftId,
  onPick,
  onClose,
}: {
  gifts: GiftOption[] | null
  loading: boolean
  isLoggedIn: boolean
  currentPoints: number
  selectedGiftId: string | null
  onPick: (id: string) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full md:max-w-2xl max-h-[85vh] md:max-h-[80vh] bg-card md:rounded-2xl rounded-t-2xl shadow-xl flex flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-primary-light shrink-0">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Chọn quà tặng kèm
            </h3>
            <p className="text-xs text-muted">
              {isLoggedIn ? (
                <>
                  Bạn có{' '}
                  <span className="text-reward font-semibold">
                    {currentPoints} điểm
                  </span>{' '}
                  — quà sẽ giao cùng đơn
                </>
              ) : (
                'Đăng nhập để dùng điểm đổi quà'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-section-soft flex items-center justify-center text-muted shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3">
          {!isLoggedIn ? (
            <div className="text-center py-12">
              <Gift className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted mb-3">
                Vui lòng đăng nhập để xem các phần quà có thể đổi.
              </p>
              <Link
                href="/dang-nhap"
                onClick={onClose}
                className="inline-block px-4 py-2 rounded-lg bg-cta text-white text-sm font-medium hover:bg-cta-hover"
              >
                Đăng nhập
              </Link>
            </div>
          ) : loading ? (
            <div className="text-center py-12 text-muted">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Đang tải danh sách quà…</p>
            </div>
          ) : !gifts || gifts.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">
              Chưa có quà nào để đổi.
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-2">
              {gifts.map(g => {
                const inStock = g.stock > 0
                const enough = currentPoints >= g.points_required
                const disabled = !inStock || !enough
                const isSelected = g.id === selectedGiftId
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => !disabled && onPick(g.id)}
                      disabled={disabled}
                      className={cn(
                        'w-full text-left bg-card border-2 rounded-xl overflow-hidden flex flex-col transition-colors',
                        isSelected
                          ? 'border-cta ring-2 ring-cta/30'
                          : disabled
                            ? 'border-primary-light opacity-60 cursor-not-allowed'
                            : 'border-primary-light hover:border-reward'
                      )}
                    >
                      <div className="aspect-square bg-section-soft relative">
                        {g.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={g.image_url}
                            alt={g.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-subtle">
                            <Gift className="w-8 h-8" />
                          </div>
                        )}
                        {!inStock && (
                          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                            <span className="bg-card text-status-out text-xs font-semibold px-2 py-0.5 rounded-full">
                              Hết
                            </span>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-cta text-white flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 flex-1 flex flex-col gap-1">
                        <div className="text-xs font-medium text-foreground line-clamp-2 min-h-[2em]">
                          {g.name}
                        </div>
                        <div className="bg-reward-light px-1.5 py-1 rounded text-xs text-foreground">
                          🎁{' '}
                          <span className="font-semibold">
                            {g.points_required}
                          </span>{' '}
                          điểm
                        </div>
                        {!enough && inStock && (
                          <div className="text-[10px] text-status-out">
                            Thiếu {g.points_required - currentPoints} điểm
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-primary-light p-3 shrink-0 flex items-center justify-between gap-2">
          <Link
            href="/doi-qua"
            onClick={onClose}
            className="text-xs text-cta hover:text-primary-dark"
          >
            Xem trang đổi quà →
          </Link>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </footer>
      </div>
    </div>
  )
}

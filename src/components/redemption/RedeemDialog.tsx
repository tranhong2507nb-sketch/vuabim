'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { X, Gift } from 'lucide-react'
import { RedemptionSchema, type RedemptionInput } from '@/lib/redemption/schemas'
import { redeemGiftStandalone } from '@/lib/redemption/actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AddressSelector } from '@/components/checkout/AddressSelector'
import { formatVND } from '@/lib/utils'
import type { CurrentUser } from '@/lib/auth/getCurrentUser'

interface GiftItem {
  id: string
  name: string
  image_url: string | null
  points_required: number
}

interface Props {
  gift: GiftItem
  user: CurrentUser
  onClose: () => void
}

export function RedeemDialog({ gift, user, onClose }: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RedemptionInput>({
    resolver: zodResolver(RedemptionSchema),
    defaultValues: {
      gift_id: gift.id,
      shipping_name: user.full_name ?? '',
      shipping_email: user.email ?? '',
      shipping_phone: '',
      province_code: '',
      province_name: '',
      district_code: '',
      district_name: '',
      ward_code: '',
      ward_name: '',
      address_detail: '',
      note: '',
    },
  })

  const onSubmit = async (data: RedemptionInput) => {
    setServerError(null)
    const result = await redeemGiftStandalone(data)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    setSuccess(true)
    // Refresh để cập nhật điểm trong UserMenu + danh sách quà
    setTimeout(() => {
      router.refresh()
    }, 100)
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40">
        <div className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-status-instock/15 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8 text-status-instock" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Đổi quà thành công 🎉
          </h2>
          <p className="text-sm text-muted mb-5">
            Quà <strong>{gift.name}</strong> đã được ghi nhận. Nhân viên sẽ liên hệ để gửi quà cho mẹ.
          </p>
          <Button variant="cta" size="lg" onClick={onClose} fullWidth>
            Đóng
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-foreground/40 overflow-y-auto">
      <div className="bg-card w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-primary-light px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Đổi quà</h2>
          <button
            type="button"
            onClick={onClose}
            className="tap-target flex items-center justify-center text-foreground"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3" noValidate>
          {/* Quà preview */}
          <div className="bg-reward-light border border-reward rounded-xl p-3 flex gap-3 items-center">
            <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-card">
              {gift.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={gift.image_url} alt={gift.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground line-clamp-2">
                {gift.name}
              </div>
              <div className="text-xs text-muted">
                Cần: <span className="font-bold text-foreground">{gift.points_required} điểm</span>
                {' · '}
                Bạn có: <span className="font-bold text-foreground">{user.current_points} điểm</span>
              </div>
            </div>
          </div>

          {serverError && (
            <div className="bg-status-out/10 border border-status-out rounded-lg p-3 text-sm text-status-out">
              ⚠ {serverError}
            </div>
          )}

          <h3 className="font-semibold text-foreground pt-2">Thông tin nhận quà</h3>

          <Input
            label="Họ tên *"
            autoComplete="name"
            {...register('shipping_name')}
            error={errors.shipping_name?.message}
          />
          <Input
            label="Số điện thoại *"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="vd: 0912345678"
            {...register('shipping_phone')}
            error={errors.shipping_phone?.message}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            {...register('shipping_email')}
            error={errors.shipping_email?.message}
          />

          <AddressSelector
            values={{
              province_code: watch('province_code'),
              district_code: watch('district_code'),
              ward_code: watch('ward_code'),
            }}
            onChange={next => {
              setValue('province_code', next.province_code, { shouldValidate: true })
              setValue('province_name', next.province_name)
              setValue('district_code', next.district_code, { shouldValidate: true })
              setValue('district_name', next.district_name)
              setValue('ward_code', next.ward_code, { shouldValidate: true })
              setValue('ward_name', next.ward_name)
            }}
            errors={{
              province_code: errors.province_code?.message,
              district_code: errors.district_code?.message,
              ward_code: errors.ward_code?.message,
            }}
          />

          <Input
            label="Địa chỉ chi tiết *"
            autoComplete="street-address"
            placeholder="Số nhà, tên đường..."
            {...register('address_detail')}
            error={errors.address_detail?.message}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Ghi chú
            </label>
            <textarea
              {...register('note')}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-primary-light bg-card text-foreground focus:outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20"
              placeholder="(Tùy chọn)"
            />
          </div>

          <div className="pt-2 border-t border-primary-light flex items-center justify-between text-sm">
            <span className="text-muted">Sẽ trừ</span>
            <span className="font-bold text-reward">
              −{gift.points_required} điểm (≈{formatVND(gift.points_required * 1000)})
            </span>
          </div>

          <Button type="submit" variant="cta" size="lg" fullWidth loading={isSubmitting}>
            Xác nhận đổi quà
          </Button>
        </form>
      </div>
    </div>
  )
}

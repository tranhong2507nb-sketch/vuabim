'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, Check } from 'lucide-react'
import { useCartStore } from '@/lib/cart/cartStore'
import { CheckoutSchema, type CheckoutInput } from '@/lib/checkout/schemas'
import { placeOrder } from '@/lib/checkout/actions'
import {
  saveShippingDefaults,
  type ShippingDefaults,
} from '@/lib/checkout/save-shipping'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AddressSelector } from './AddressSelector'
import { OrderItemsList } from './OrderItemsList'
import { PointsBlock } from './PointsBlock'
import { OrderGiftSelector } from '@/components/redemption/OrderGiftSelector'
import { formatVND } from '@/lib/utils'
import type { CurrentUser } from '@/lib/auth/getCurrentUser'

interface Props {
  user: CurrentUser
  shippingDefaults?: ShippingDefaults | null
}

const SHIPPING_FEE_ORIGINAL = 45000
const SHIPPING_FEE = 0

export function CheckoutPage({ user, shippingDefaults }: Props) {
  const router = useRouter()
  const items = useCartStore(s => s.items)
  const hydrated = useCartStore(s => s.hydrated)
  const subtotal = useCartStore(s => s.getSubtotal())
  const rawPointsToEarn = useCartStore(s => s.getRawPointsToEarn())
  const selectedGiftId = useCartStore(s => s.selectedGiftId)
  const [serverError, setServerError] = useState<string | null>(null)
  const itemsBelowMin = items.filter(i => i.qty < 2)
  const minOrderMet = items.length > 0 && itemsBelowMin.length === 0
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savingDefaults, startSaving] = useTransition()

  const baseTotal = subtotal + SHIPPING_FEE

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      shipping_name:
        shippingDefaults?.shipping_name ?? user.full_name ?? '',
      shipping_email: user.email ?? '',
      shipping_phone: shippingDefaults?.shipping_phone ?? '',
      province_code: shippingDefaults?.province_code ?? '',
      province_name: shippingDefaults?.province_name ?? '',
      district_code: shippingDefaults?.district_code ?? '',
      district_name: shippingDefaults?.district_name ?? '',
      ward_code: shippingDefaults?.ward_code ?? '',
      ward_name: shippingDefaults?.ward_name ?? '',
      address_detail: shippingDefaults?.address_detail ?? '',
      note: '',
      product_point_choice: 'earn',
      account_points_used: 0,
      gift_id: null,
    },
  })

  const productPointChoice = watch('product_point_choice')
  const accountPointsUsed = watch('account_points_used')

  // Sync selectedGiftId từ cart store sang form gift_id
  useEffect(() => {
    setValue('gift_id', selectedGiftId)
  }, [selectedGiftId, setValue])

  // Tính toán discount + total preview
  const accountDiscount = Math.min(
    accountPointsUsed * 1000,
    baseTotal
  )
  const remainingAfterAccount = baseTotal - accountDiscount
  const instantPointsUsed =
    productPointChoice === 'use_instant'
      ? Math.min(rawPointsToEarn, Math.floor(remainingAfterAccount / 1000))
      : 0
  const instantDiscount = instantPointsUsed * 1000
  const finalTotal = Math.max(0, baseTotal - accountDiscount - instantDiscount)
  const pointsToEarn =
    productPointChoice === 'earn'
      ? rawPointsToEarn
      : rawPointsToEarn - instantPointsUsed

  // Redirect nếu cart trống (sau hydration)
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace('/gio-hang')
    }
  }, [hydrated, items.length, router])

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted">
        Đang tải...
      </div>
    )
  }

  if (items.length === 0) return null

  const onSubmit = async (data: CheckoutInput) => {
    setServerError(null)
    const result = await placeOrder({ form: data, items })

    if (!result.ok) {
      // Log chi tiết để debug, hiển thị message gọn cho khách
      console.error('placeOrder failed:', result.error)
      setServerError('Có lỗi xảy ra, vui lòng thử lại')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Đặt hàng OK → redirect tới trang thành công
    // (cart sẽ được clear bởi ClearCartOnMount trên trang đó —
    // tránh race với useEffect redirect /gio-hang khi cart rỗng)
    router.push(`/dat-hang-thanh-cong/${result.order_code}`)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl mx-auto px-4 py-6 pb-32 space-y-4"
      noValidate
    >
      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">
        Thanh toán
      </h1>

      {serverError && (
        <div className="bg-status-out/10 border border-status-out rounded-lg p-3 text-sm text-status-out">
          ⚠ {serverError}
        </div>
      )}

      {/* Khối 1 — Thông tin nhận hàng */}
      <section className="bg-card border border-primary-light rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-foreground">Thông tin nhận hàng</h2>

        <Input
          label="Họ và tên *"
          autoComplete="name"
          {...register('shipping_name')}
          error={errors.shipping_name?.message}
        />
        <Input
          label="Email *"
          type="email"
          autoComplete="email"
          inputMode="email"
          {...register('shipping_email')}
          error={errors.shipping_email?.message}
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
          placeholder="Số nhà, tên đường, tên tòa nhà..."
          {...register('address_detail')}
          error={errors.address_detail?.message}
        />

        {/* Lưu thông tin giao hàng làm mặc định */}
        <div className="bg-section-soft border border-primary-light rounded-lg p-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs text-muted">
              Lưu thông tin trên để lần sau không phải điền lại
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={savingDefaults}
              onClick={() => {
                setSaveError(null)
                const formValues = {
                  shipping_name: watch('shipping_name'),
                  shipping_phone: watch('shipping_phone'),
                  province_code: watch('province_code'),
                  province_name: watch('province_name'),
                  district_code: watch('district_code'),
                  district_name: watch('district_name'),
                  ward_code: watch('ward_code'),
                  ward_name: watch('ward_name'),
                  address_detail: watch('address_detail'),
                }
                startSaving(async () => {
                  const result = await saveShippingDefaults(formValues)
                  if (!result.ok) {
                    setSaveError(result.error)
                    return
                  }
                  setSavedAt(new Date())
                })
              }}
            >
              {savedAt ? (
                <>
                  <Check className="w-4 h-4 text-status-instock" />
                  Đã lưu
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu thông tin
                </>
              )}
            </Button>
          </div>
          {saveError && (
            <p className="text-xs text-status-out bg-status-out/10 px-2 py-1 rounded mt-2">
              {saveError}
            </p>
          )}
          {savedAt && !saveError && (
            <p className="text-xs text-status-instock mt-2">
              ✓ Đã lưu lúc{' '}
              {savedAt.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              — lần checkout sau sẽ tự điền
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Ghi chú đơn hàng
          </label>
          <textarea
            {...register('note')}
            rows={2}
            placeholder="Vd: Giao buổi tối, gọi trước khi giao..."
            className="w-full px-3 py-2 rounded-lg border border-primary-light bg-card text-foreground focus:outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20"
          />
          {errors.note && (
            <p className="mt-1 text-sm text-status-out">{errors.note.message}</p>
          )}
        </div>
      </section>

      {/* Khối 2 — Sản phẩm trong đơn */}
      <section>
        <h2 className="font-semibold text-foreground mb-2">
          Sản phẩm ({items.length})
        </h2>
        <OrderItemsList items={items} />
      </section>

      {/* Khối 3 — Hệ thống điểm */}
      <section>
        <h2 className="font-semibold text-foreground mb-2">Hệ thống điểm</h2>
        <PointsBlock
          rawPointsToEarn={rawPointsToEarn}
          currentPoints={user.current_points}
          productPointChoice={productPointChoice}
          onProductChoiceChange={c =>
            setValue('product_point_choice', c, { shouldValidate: true })
          }
          accountPointsUsed={accountPointsUsed}
          onAccountPointsChange={n =>
            setValue('account_points_used', n, { shouldValidate: true })
          }
          baseTotal={baseTotal}
        />
      </section>

      {/* Khối 3b — Đổi quà tặng kèm đơn */}
      <section>
        <h2 className="font-semibold text-foreground mb-2">Quà tặng kèm</h2>
        <OrderGiftSelector
          isLoggedIn
          currentPoints={user.current_points}
        />
      </section>

      {/* Khối 4 — Phương thức thanh toán */}
      <section className="bg-card border border-primary-light rounded-xl p-4">
        <h2 className="font-semibold text-foreground mb-2">
          Phương thức thanh toán
        </h2>
        <div className="flex items-center gap-2 p-3 bg-primary-light rounded-lg">
          <input type="radio" checked readOnly className="accent-primary-dark" />
          <div>
            <div className="text-sm font-medium text-foreground">
              Thanh toán khi nhận hàng (COD)
            </div>
            <div className="text-xs text-muted">
              Trả tiền mặt khi shipper giao đến
            </div>
          </div>
        </div>
      </section>

      {/* Khối 5 — Tổng cộng */}
      <section className="bg-card border border-primary-light rounded-xl p-4 space-y-2">
        <h2 className="font-semibold text-foreground mb-2">Tổng cộng</h2>
        <Row label="Tạm tính" value={formatVND(subtotal)} />
        <Row
          label="Phí vận chuyển"
          value={
            <span>
              <span className="line-through text-subtle mr-2">
                {formatVND(SHIPPING_FEE_ORIGINAL)}
              </span>
              <span className="text-status-instock font-semibold">Miễn phí</span>
            </span>
          }
        />
        {accountDiscount > 0 && (
          <Row
            label="Giảm từ điểm tài khoản"
            value={<span className="text-status-instock">−{formatVND(accountDiscount)}</span>}
          />
        )}
        {instantDiscount > 0 && (
          <Row
            label="Giảm từ điểm sản phẩm"
            value={<span className="text-status-instock">−{formatVND(instantDiscount)}</span>}
          />
        )}
        <div className="pt-2 border-t border-primary-light flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">
            Tổng thanh toán
          </span>
          <span className="text-xl font-bold text-cta">
            {formatVND(finalTotal)}
          </span>
        </div>
        {pointsToEarn > 0 && (
          <p className="text-xs text-reward-light bg-reward/15 text-foreground px-2 py-1.5 rounded">
            🎁 Sau khi đơn hoàn thành, bạn sẽ nhận được {pointsToEarn} điểm vào tài khoản.
          </p>
        )}
      </section>

      {/* Cảnh báo: mỗi sản phẩm tối thiểu 2 cái */}
      {!minOrderMet && itemsBelowMin.length > 0 && (
        <div className="bg-status-pending/10 border border-status-pending rounded-lg p-3 text-sm text-foreground">
          ⚠ Mỗi sản phẩm cần mua tối thiểu <strong>2 cái</strong>. Sản phẩm chưa đủ:
          <ul className="list-disc list-inside mt-1.5 space-y-0.5">
            {itemsBelowMin.map(i => (
              <li key={i.product_id}>
                <span className="font-medium">{i.name}</span> — đang có {i.qty} cái
              </li>
            ))}
          </ul>
          <div className="mt-2">
            <Link
              href="/gio-hang"
              className="text-cta hover:text-primary-dark underline font-medium"
            >
              Quay lại giỏ hàng
            </Link>{' '}
            để tăng số lượng.
          </div>
        </div>
      )}

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary-light shadow-lg p-3 z-30">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted">Tổng thanh toán</div>
            <div className="text-lg font-bold text-cta truncate">
              {formatVND(finalTotal)}
            </div>
          </div>
          <Button
            type="submit"
            variant="cta"
            size="lg"
            loading={isSubmitting}
            disabled={items.length === 0 || !minOrderMet}
          >
            Đặt hàng
          </Button>
        </div>
      </div>

      <div className="text-center text-xs text-muted pt-2">
        Bằng việc đặt hàng, bạn đồng ý với{' '}
        <Link href="/dieu-khoan-su-dung" className="text-primary-dark hover:underline">
          Điều khoản
        </Link>{' '}
        và{' '}
        <Link href="/chinh-sach-bao-mat" className="text-primary-dark hover:underline">
          Chính sách bảo mật
        </Link>
      </div>
    </form>
  )
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  )
}

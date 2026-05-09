import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tag,
  Gift,
  Receipt,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RedemptionStatusBadge } from '@/components/admin/RedemptionStatusBadge'
import { RedemptionStatusActions } from '@/components/admin/RedemptionStatusActions'
import type { RedemptionStatus } from '@/lib/admin-redemptions/actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Chi tiết đổi quà',
}

const SOURCE_LABEL: Record<string, string> = {
  checkout: 'Đổi cùng đơn hàng',
  standalone: 'Đổi riêng (sang trang đổi quà)',
  pdp: 'Đổi từ trang sản phẩm',
}

export default async function RedemptionDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const supabase = await createClient()

  const { data: redemption } = await supabase
    .from('gift_redemptions')
    .select(
      `
        id, redemption_code, gift_id, gift_name_snapshot, points_required_snapshot,
        points_used, status, source, refunded, ref_order_id,
        shipping_name, shipping_phone, shipping_email,
        province_name, district_name, ward_name, address_detail, note,
        created_at, updated_at,
        user:profiles!gift_redemptions_user_id_fkey ( id, full_name, email ),
        order:orders!gift_redemptions_ref_order_id_fkey ( order_code )
      `
    )
    .eq('redemption_code', code)
    .single()

  if (!redemption) notFound()

  const u = Array.isArray(redemption.user) ? redemption.user[0] : redemption.user
  const ord = Array.isArray(redemption.order) ? redemption.order[0] : redemption.order

  const fullAddress = [
    redemption.address_detail,
    redemption.ward_name,
    redemption.district_name,
    redemption.province_name,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-3xl mx-auto">
      <Link
        href="/admin/yeu-cau-doi-qua"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-dark mb-3"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div>
          <div className="font-mono text-sm text-muted mb-1">
            {redemption.redemption_code}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {redemption.gift_name_snapshot}
          </h1>
        </div>
        <RedemptionStatusBadge status={redemption.status} />
      </div>

      <div className="space-y-4">
        {/* Tóm tắt */}
        <section className="bg-card border border-primary-light rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Gift className="w-4 h-4 text-reward" />
            <span className="text-muted">Điểm đã trừ:</span>
            <span className="font-semibold text-foreground ml-auto">
              {redemption.points_used} điểm
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Tag className="w-4 h-4 text-muted" />
            <span className="text-muted">Nguồn:</span>
            <span className="text-foreground ml-auto">
              {SOURCE_LABEL[redemption.source] ?? redemption.source}
            </span>
          </div>
          {ord?.order_code && (
            <div className="flex items-center gap-2 text-sm">
              <Receipt className="w-4 h-4 text-muted" />
              <span className="text-muted">Đơn hàng đi kèm:</span>
              <span className="font-mono text-cta ml-auto">{ord.order_code}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted" />
            <span className="text-muted">Tạo lúc:</span>
            <span className="text-foreground ml-auto">
              {new Date(redemption.created_at).toLocaleString('vi-VN')}
            </span>
          </div>
          {redemption.refunded && (
            <div className="text-xs text-status-instock bg-status-instock/10 px-2 py-1.5 rounded">
              ✓ Đã hoàn điểm về tài khoản khách
            </div>
          )}
        </section>

        {/* Khách */}
        <section className="bg-card border border-primary-light rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-2">Khách hàng</h2>
          <div className="text-sm text-foreground font-medium">
            {u?.full_name || u?.email || '—'}
          </div>
          {u?.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {u.email}
            </div>
          )}
        </section>

        {/* Địa chỉ giao */}
        {(redemption.shipping_name || redemption.address_detail) && (
          <section className="bg-card border border-primary-light rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-2">
              Địa chỉ giao quà
            </h2>
            {redemption.shipping_name && (
              <div className="text-sm text-foreground font-medium">
                {redemption.shipping_name}
              </div>
            )}
            {redemption.shipping_phone && (
              <div className="flex items-center gap-1.5 text-sm text-muted mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <a
                  href={`tel:${redemption.shipping_phone}`}
                  className="hover:text-cta"
                >
                  {redemption.shipping_phone}
                </a>
              </div>
            )}
            {fullAddress && (
              <div className="flex items-start gap-1.5 text-sm text-muted mt-1">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{fullAddress}</span>
              </div>
            )}
            {redemption.note && (
              <div className="mt-2 pt-2 border-t border-primary-light text-sm">
                <span className="text-muted">Ghi chú: </span>
                <span className="text-foreground">{redemption.note}</span>
              </div>
            )}
          </section>
        )}

        {/* Actions */}
        {redemption.status !== 'completed' && redemption.status !== 'cancelled' && (
          <section className="bg-card border border-primary-light rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Cập nhật trạng thái
            </h2>
            <RedemptionStatusActions
              id={redemption.id}
              status={redemption.status as RedemptionStatus}
            />
          </section>
        )}
      </div>
    </div>
  )
}

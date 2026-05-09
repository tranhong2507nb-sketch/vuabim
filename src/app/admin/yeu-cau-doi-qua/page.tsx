import Link from 'next/link'
import { Search, Gift as GiftIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { RedemptionStatusBadge } from '@/components/admin/RedemptionStatusBadge'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Yêu cầu đổi quà',
}

interface SearchParams {
  q?: string
  status?: string
  source?: string
}

const SOURCE_LABEL: Record<string, string> = {
  checkout: 'Đặt hàng',
  standalone: 'Đổi riêng',
  pdp: 'Trang sp',
}

export default async function AdminRedemptionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('gift_redemptions')
    .select(
      `
        id, redemption_code, gift_name_snapshot, points_required_snapshot, points_used,
        status, source, shipping_name, shipping_phone, created_at,
        user:profiles!gift_redemptions_user_id_fkey ( id, full_name, email )
      `
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (sp.q?.trim()) {
    const q = sp.q.trim()
    query = query.or(
      `redemption_code.ilike.%${q}%,shipping_name.ilike.%${q}%,shipping_phone.ilike.%${q}%`
    )
  }
  if (sp.status) query = query.eq('status', sp.status)
  if (sp.source) query = query.eq('source', sp.source)

  const { data: redemptions } = await query

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Yêu cầu đổi quà
        </h1>
        <p className="text-sm text-muted">
          {redemptions?.length ?? 0} yêu cầu
        </p>
      </div>

      <form
        method="GET"
        className="bg-card border border-primary-light rounded-xl p-3 mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Mã, tên, SĐT..."
            className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-lg border border-primary-light bg-card text-sm focus:outline-none focus:border-primary-dark"
          />
        </div>
        <select
          name="status"
          defaultValue={sp.status ?? ''}
          className="min-h-[40px] px-3 rounded-lg border border-primary-light bg-card text-sm"
        >
          <option value="">Mọi trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select
          name="source"
          defaultValue={sp.source ?? ''}
          className="min-h-[40px] px-3 rounded-lg border border-primary-light bg-card text-sm"
        >
          <option value="">Mọi nguồn</option>
          <option value="checkout">Đặt hàng</option>
          <option value="standalone">Đổi riêng</option>
          <option value="pdp">Trang sp</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          Lọc
        </Button>
      </form>

      {!redemptions || redemptions.length === 0 ? (
        <div className="bg-card border border-primary-light rounded-xl p-10 text-center">
          <GiftIcon className="w-10 h-10 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">
            {sp.q || sp.status || sp.source
              ? 'Không tìm thấy yêu cầu phù hợp.'
              : 'Chưa có yêu cầu đổi quà nào.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-primary-light rounded-xl overflow-hidden">
          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-section-soft text-xs text-muted uppercase">
              <tr>
                <th className="text-left px-4 py-2.5">Mã / Khách</th>
                <th className="text-left px-3 py-2.5">Quà</th>
                <th className="text-right px-3 py-2.5">Điểm</th>
                <th className="text-center px-3 py-2.5">Nguồn</th>
                <th className="text-center px-3 py-2.5">Trạng thái</th>
                <th className="text-right px-4 py-2.5">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {redemptions.map(r => {
                const u = Array.isArray(r.user) ? r.user[0] : r.user
                return (
                  <tr key={r.id} className="hover:bg-section-soft">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/yeu-cau-doi-qua/${r.redemption_code}`}
                        className="block"
                      >
                        <div className="font-mono text-xs text-cta hover:underline truncate max-w-[180px]">
                          {r.redemption_code}
                        </div>
                        <div className="text-xs text-muted truncate max-w-[180px]">
                          {r.shipping_name ?? u?.full_name ?? u?.email ?? '—'}
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 truncate max-w-[260px] text-foreground">
                      {r.gift_name_snapshot}
                    </td>
                    <td className="px-3 py-2.5 text-right text-reward font-semibold">
                      🎁 {r.points_used}
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-muted">
                      {SOURCE_LABEL[r.source] ?? r.source}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <RedemptionStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-primary-light">
            {redemptions.map(r => {
              const u = Array.isArray(r.user) ? r.user[0] : r.user
              return (
                <li key={r.id}>
                  <Link
                    href={`/admin/yeu-cau-doi-qua/${r.redemption_code}`}
                    className="block p-3 active:bg-section-soft"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-mono text-xs text-cta truncate">
                        {r.redemption_code}
                      </div>
                      <RedemptionStatusBadge status={r.status} size="sm" />
                    </div>
                    <div className="text-sm font-medium text-foreground line-clamp-1">
                      {r.gift_name_snapshot}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {r.shipping_name ?? u?.full_name ?? u?.email ?? '—'}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-reward font-semibold">
                        🎁 {r.points_used} điểm
                      </span>
                      <span className="text-muted">
                        {new Date(r.created_at).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

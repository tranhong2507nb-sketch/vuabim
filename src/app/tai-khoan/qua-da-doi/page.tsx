import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Gift } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { RedemptionStatusBadge } from '@/components/account/RedemptionStatusBadge'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quà đã đổi',
  robots: { index: false, follow: false },
}

const SOURCE_LABEL: Record<string, string> = {
  checkout: 'Quà kèm đơn hàng',
  standalone: 'Đổi quà bằng điểm',
  pdp: 'Đổi từ trang sản phẩm',
}

export default async function MyRedemptionsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/dang-nhap')

  const supabase = await createClient()
  const { data: redemptions } = await supabase
    .from('gift_redemptions')
    .select(
      `id, redemption_code, status, source, ref_order_id,
       points_used, gift_name_snapshot, refunded, created_at,
       gift:gifts(image_url)`
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list = redemptions ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted mb-3">
        <Link href="/tai-khoan" className="hover:text-primary-dark">
          ← Tài khoản
        </Link>
      </nav>

      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
        Quà đã đổi
      </h1>
      <p className="text-sm text-muted mb-5">
        {list.length === 0 ? 'Chưa đổi quà nào' : `${list.length} quà`}
      </p>

      {list.length === 0 ? (
        <div className="bg-section-soft border border-primary-light rounded-xl p-8 text-center">
          <Gift className="w-12 h-12 mx-auto mb-2 text-subtle" />
          <p className="text-sm text-muted mb-4">
            Mẹ chưa đổi quà nào. Khám phá quà tặng bằng điểm thưởng nhé!
          </p>
          <Link href="/doi-qua">
            <Button variant="reward" size="md">
              Xem quà có thể đổi
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(r => {
            const giftImage = (r.gift as { image_url?: string | null })?.image_url
            return (
              <div
                key={r.id}
                className="bg-card border border-primary-light rounded-xl p-3 flex gap-3 items-center"
              >
                <div className="w-16 h-16 flex-shrink-0 bg-section-soft rounded-lg overflow-hidden">
                  {giftImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={giftImage}
                      alt={r.gift_name_snapshot}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-subtle">
                      <Gift className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs text-muted">
                      {r.redemption_code}
                    </span>
                    <RedemptionStatusBadge status={r.status} />
                    {r.refunded && (
                      <span className="text-xs text-status-instock">
                        ✓ Đã hoàn điểm
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-foreground line-clamp-2">
                    {r.gift_name_snapshot}
                  </div>
                  <div className="text-xs text-muted mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{SOURCE_LABEL[r.source] ?? r.source}</span>
                    <span>·</span>
                    <span className="text-reward font-semibold">
                      −{r.points_used} điểm
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(r.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

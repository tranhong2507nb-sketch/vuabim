import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { OrderStatusBadge } from '@/components/account/OrderStatusBadge'
import { Button } from '@/components/ui/Button'
import { formatVND } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đơn hàng của tôi',
  robots: { index: false, follow: false },
}

export default async function MyOrdersPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/dang-nhap')

  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select(
      `id, order_code, status, total, points_to_earn, created_at,
       order_items(qty)`
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list = orders ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted mb-3">
        <Link href="/tai-khoan" className="hover:text-primary-dark">
          ← Tài khoản
        </Link>
      </nav>

      <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
        Đơn hàng của tôi
      </h1>
      <p className="text-sm text-muted mb-5">
        {list.length === 0 ? 'Chưa có đơn nào' : `${list.length} đơn hàng`}
      </p>

      {list.length === 0 ? (
        <div className="bg-section-soft border border-primary-light rounded-xl p-8 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-subtle" />
          <p className="text-sm text-muted mb-4">
            Mẹ chưa có đơn hàng nào. Khám phá bỉm nhé!
          </p>
          <Link href="/san-pham">
            <Button variant="cta" size="md">
              Mua bỉm ngay
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(o => {
            const totalQty = o.order_items.reduce(
              (sum: number, i: { qty: number }) => sum + i.qty,
              0
            )
            return (
              <Link
                key={o.id}
                href={`/tai-khoan/don-hang/${o.order_code}`}
                className="bg-card border border-primary-light rounded-xl p-4 flex items-center gap-3 hover:border-primary-dark transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-muted">
                      {o.order_code}
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <div className="text-xs text-muted mb-1">
                    {new Date(o.created_at).toLocaleString('vi-VN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                    {' · '}
                    {totalQty} sản phẩm
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Tổng:</span>{' '}
                    <span className="font-bold text-cta">
                      {formatVND(o.total)}
                    </span>
                    {o.points_to_earn > 0 && (
                      <span className="ml-2 text-xs text-reward">
                        +{o.points_to_earn} điểm
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-subtle flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

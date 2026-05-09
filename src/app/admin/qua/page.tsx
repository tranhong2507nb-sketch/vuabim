import Link from 'next/link'
import { Plus, Search, Gift as GiftIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { GiftRowActions } from '@/components/admin/GiftRowActions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Quà đổi điểm',
}

interface SearchParams {
  q?: string
  status?: string
}

export default async function AdminGiftsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('gifts')
    .select('id, name, image_url, points_required, stock, is_active')
    .order('points_required', { ascending: true })

  if (sp.q?.trim()) {
    query = query.ilike('name', `%${sp.q.trim()}%`)
  }
  if (sp.status === 'active') query = query.eq('is_active', true)
  if (sp.status === 'inactive') query = query.eq('is_active', false)

  const { data: gifts } = await query

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Quà đổi điểm
          </h1>
          <p className="text-sm text-muted">{gifts?.length ?? 0} quà</p>
        </div>
        <Link href="/admin/qua/them-moi">
          <Button variant="cta" size="md">
            <Plus className="w-4 h-4" />
            Thêm quà
          </Button>
        </Link>
      </div>

      <form
        method="GET"
        className="bg-card border border-primary-light rounded-xl p-3 mb-4 flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Tìm theo tên..."
            className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-lg border border-primary-light bg-card text-sm focus:outline-none focus:border-primary-dark"
          />
        </div>
        <select
          name="status"
          defaultValue={sp.status ?? ''}
          className="min-h-[40px] px-3 rounded-lg border border-primary-light bg-card text-sm"
        >
          <option value="">Mọi trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã tắt</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          Lọc
        </Button>
      </form>

      {!gifts || gifts.length === 0 ? (
        <div className="bg-card border border-primary-light rounded-xl p-10 text-center">
          <GiftIcon className="w-10 h-10 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">
            {sp.q || sp.status
              ? 'Không tìm thấy quà phù hợp.'
              : 'Chưa có quà nào. Bấm "Thêm quà" để tạo.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-primary-light rounded-xl overflow-hidden">
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-section-soft text-xs text-muted uppercase">
              <tr>
                <th className="text-left px-4 py-2.5">Quà</th>
                <th className="text-right px-3 py-2.5">Điểm cần</th>
                <th className="text-right px-3 py-2.5">Tồn</th>
                <th className="text-center px-3 py-2.5">Trạng thái</th>
                <th className="text-right px-4 py-2.5">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {gifts.map(g => (
                <tr key={g.id} className="hover:bg-section-soft">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {g.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={g.image_url}
                          alt={g.name}
                          className="w-10 h-10 rounded-lg object-cover border border-primary-light shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-section-soft border border-primary-light flex items-center justify-center shrink-0">
                          <GiftIcon className="w-4 h-4 text-muted" />
                        </div>
                      )}
                      <div className="font-medium text-foreground truncate max-w-[300px]">
                        {g.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 text-reward font-semibold">
                      🎁 {g.points_required}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={
                        g.stock === 0
                          ? 'text-status-out font-medium'
                          : g.stock < 5
                            ? 'text-status-pending font-medium'
                            : 'text-foreground'
                      }
                    >
                      {g.stock}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {g.is_active ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-status-instock/15 text-status-instock font-medium">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-muted/20 text-muted font-medium">
                        Đã tắt
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <GiftRowActions id={g.id} name={g.name} isActive={g.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-primary-light">
            {gifts.map(g => (
              <li key={g.id} className="p-3 flex gap-3">
                {g.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.image_url}
                    alt={g.name}
                    className="w-16 h-16 rounded-lg object-cover border border-primary-light shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-section-soft border border-primary-light flex items-center justify-center shrink-0">
                    <GiftIcon className="w-5 h-5 text-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground line-clamp-2 text-sm">
                    {g.name}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="text-reward font-semibold">
                      🎁 {g.points_required} điểm
                    </span>
                    <span className="text-muted">·</span>
                    <span
                      className={
                        g.stock === 0
                          ? 'text-status-out'
                          : g.stock < 5
                            ? 'text-status-pending'
                            : 'text-muted'
                      }
                    >
                      Tồn: {g.stock}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    {g.is_active ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-status-instock/15 text-status-instock font-medium">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted/20 text-muted font-medium">
                        Đã tắt
                      </span>
                    )}
                    <GiftRowActions id={g.id} name={g.name} isActive={g.is_active} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

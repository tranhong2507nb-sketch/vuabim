import Link from 'next/link'
import { Plus, Search, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { BrandRowActions } from '@/components/admin/BrandRowActions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Thương hiệu',
}

interface SearchParams {
  q?: string
  status?: string
}

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('brands')
    .select('id, slug, name, logo_url, display_order, is_active, story_content')
    .order('display_order', { ascending: true })
    .order('name')

  if (sp.q?.trim()) {
    query = query.ilike('name', `%${sp.q.trim()}%`)
  }
  if (sp.status === 'active') query = query.eq('is_active', true)
  if (sp.status === 'inactive') query = query.eq('is_active', false)

  const [{ data: brands }, { data: counts }] = await Promise.all([
    query,
    supabase
      .from('products')
      .select('brand_id')
      .eq('is_active', true),
  ])

  // Đếm SP đang bán per hãng
  const productCount = new Map<string, number>()
  counts?.forEach(p => {
    productCount.set(p.brand_id, (productCount.get(p.brand_id) ?? 0) + 1)
  })

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Thương hiệu
          </h1>
          <p className="text-sm text-muted">{brands?.length ?? 0} hãng</p>
        </div>
        <Link href="/admin/thuong-hieu/them-moi">
          <Button variant="cta" size="md">
            <Plus className="w-4 h-4" />
            Thêm hãng
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

      {!brands || brands.length === 0 ? (
        <div className="bg-card border border-primary-light rounded-xl p-10 text-center">
          <Tag className="w-10 h-10 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">
            {sp.q || sp.status
              ? 'Không tìm thấy hãng phù hợp.'
              : 'Chưa có hãng nào. Bấm "Thêm hãng" để tạo.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-primary-light rounded-xl overflow-hidden">
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-section-soft text-xs text-muted uppercase">
              <tr>
                <th className="text-left px-4 py-2.5 w-16">Thứ tự</th>
                <th className="text-left px-3 py-2.5">Hãng</th>
                <th className="text-right px-3 py-2.5">SP đang bán</th>
                <th className="text-center px-3 py-2.5">Câu chuyện</th>
                <th className="text-center px-3 py-2.5">Trạng thái</th>
                <th className="text-right px-4 py-2.5">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {brands.map(b => (
                <tr key={b.id} className="hover:bg-section-soft">
                  <td className="px-4 py-2.5 text-muted">{b.display_order}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {b.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.logo_url}
                          alt={b.name}
                          className="w-9 h-9 rounded-lg object-contain bg-section-soft border border-primary-light shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-section-soft border border-primary-light flex items-center justify-center text-primary-dark font-bold text-sm shrink-0">
                          {b.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {b.name}
                        </div>
                        <div className="text-xs text-muted truncate">{b.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {productCount.get(b.id) ?? 0}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {b.story_content ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-status-instock/15 text-status-instock font-medium">
                        Đã có
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-muted/20 text-muted font-medium">
                        Trống
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {b.is_active ? (
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
                    <BrandRowActions
                      id={b.id}
                      name={b.name}
                      isActive={b.is_active}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-primary-light">
            {brands.map(b => (
              <li key={b.id} className="p-3 flex gap-3">
                {b.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.logo_url}
                    alt={b.name}
                    className="w-14 h-14 rounded-lg object-contain bg-section-soft border border-primary-light shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-section-soft border border-primary-light flex items-center justify-center text-primary-dark font-bold text-xl shrink-0">
                    {b.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate text-sm">
                    {b.name}
                  </div>
                  <div className="text-xs text-muted">
                    Thứ tự: {b.display_order} · SP đang bán:{' '}
                    {productCount.get(b.id) ?? 0}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {b.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-status-instock/15 text-status-instock font-medium">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted/20 text-muted font-medium">
                          Đã tắt
                        </span>
                      )}
                      {b.story_content ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-light text-primary-dark font-medium">
                          Có câu chuyện
                        </span>
                      ) : null}
                    </div>
                    <BrandRowActions
                      id={b.id}
                      name={b.name}
                      isActive={b.is_active}
                    />
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

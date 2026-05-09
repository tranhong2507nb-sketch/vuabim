import Link from 'next/link'
import { Plus, Search, Package, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { ProductRowActions } from '@/components/admin/ProductRowActions'
import { formatVND } from '@/lib/utils'
import { DIAPER_TYPE_LABEL } from '@/lib/types'
import type { DiaperType } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sản phẩm',
}

interface SearchParams {
  q?: string
  brand?: string
  status?: string
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(
      `
        id, slug, name, price, stock, points_per_unit, images, is_active,
        diaper_type, usage_day, usage_night,
        brand:brands ( id, name )
      `
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (sp.q?.trim()) {
    query = query.ilike('name', `%${sp.q.trim()}%`)
  }
  if (sp.brand) {
    query = query.eq('brand_id', sp.brand)
  }
  if (sp.status === 'active') query = query.eq('is_active', true)
  if (sp.status === 'inactive') query = query.eq('is_active', false)

  const [{ data: products }, { data: brands }] = await Promise.all([
    query,
    supabase.from('brands').select('id, name').order('name'),
  ])

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Sản phẩm</h1>
          <p className="text-sm text-muted">{products?.length ?? 0} sản phẩm</p>
        </div>
        <Link href="/admin/san-pham/them-moi">
          <Button variant="cta" size="md">
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Filter */}
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
          name="brand"
          defaultValue={sp.brand ?? ''}
          className="min-h-[40px] px-3 rounded-lg border border-primary-light bg-card text-sm"
        >
          <option value="">Tất cả hãng</option>
          {brands?.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={sp.status ?? ''}
          className="min-h-[40px] px-3 rounded-lg border border-primary-light bg-card text-sm"
        >
          <option value="">Mọi trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Đã tắt</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          Lọc
        </Button>
      </form>

      {!products || products.length === 0 ? (
        <div className="bg-card border border-primary-light rounded-xl p-10 text-center">
          <Package className="w-10 h-10 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">
            {sp.q || sp.brand || sp.status
              ? 'Không tìm thấy sản phẩm phù hợp.'
              : 'Chưa có sản phẩm nào. Bấm "Thêm sản phẩm" để tạo.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-primary-light rounded-xl overflow-hidden">
          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-section-soft text-xs text-muted uppercase">
              <tr>
                <th className="text-left px-4 py-2.5">Sản phẩm</th>
                <th className="text-left px-3 py-2.5">Hãng</th>
                <th className="text-right px-3 py-2.5">Giá</th>
                <th className="text-right px-3 py-2.5">Tồn</th>
                <th className="text-right px-3 py-2.5">Điểm</th>
                <th className="text-center px-3 py-2.5">Trạng thái</th>
                <th className="text-right px-4 py-2.5">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {products.map(p => {
                const brand = Array.isArray(p.brand) ? p.brand[0] : p.brand
                const firstImg = Array.isArray(p.images) ? p.images[0] : null
                return (
                  <tr key={p.id} className="hover:bg-section-soft">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {firstImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firstImg}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-primary-light shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-section-soft border border-primary-light flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-muted" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate max-w-[280px]">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                p.diaper_type === 'pant'
                                  ? 'bg-primary-light border-primary text-primary-dark'
                                  : 'bg-secondary-light border-secondary text-secondary-dark'
                              }`}
                            >
                              {DIAPER_TYPE_LABEL[p.diaper_type as DiaperType]}
                            </span>
                            {p.usage_day && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border bg-reward-light border-reward text-foreground">
                                <Sun className="w-2.5 h-2.5" />
                                Ngày
                              </span>
                            )}
                            {p.usage_night && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border bg-foreground/10 border-foreground/40 text-foreground">
                                <Moon className="w-2.5 h-2.5" />
                                Đêm
                              </span>
                            )}
                            <span className="text-xs text-muted truncate max-w-[180px]">
                              {p.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted">
                      {brand?.name ?? '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium">
                      {formatVND(p.price)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={
                          p.stock === 0
                            ? 'text-status-out font-medium'
                            : p.stock < 10
                              ? 'text-status-low font-medium'
                              : 'text-foreground'
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-reward">
                      +{p.points_per_unit}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {p.is_active ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-status-instock/15 text-status-instock font-medium">
                          Đang bán
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-muted/20 text-muted font-medium">
                          Đã tắt
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <ProductRowActions
                        id={p.id}
                        name={p.name}
                        isActive={p.is_active}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-primary-light">
            {products.map(p => {
              const brand = Array.isArray(p.brand) ? p.brand[0] : p.brand
              const firstImg = Array.isArray(p.images) ? p.images[0] : null
              return (
                <li key={p.id} className="p-3 flex gap-3">
                  {firstImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={firstImg}
                      alt={p.name}
                      className="w-16 h-16 rounded-lg object-cover border border-primary-light shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-section-soft border border-primary-light flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground line-clamp-2 text-sm">
                      {p.name}
                    </div>
                    <div className="text-xs text-muted">{brand?.name ?? '—'}</div>
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.diaper_type === 'pant'
                            ? 'bg-primary-light border-primary text-primary-dark'
                            : 'bg-secondary-light border-secondary text-secondary-dark'
                        }`}
                      >
                        {DIAPER_TYPE_LABEL[p.diaper_type as DiaperType]}
                      </span>
                      {p.usage_day && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border bg-reward-light border-reward text-foreground">
                          <Sun className="w-2.5 h-2.5" />
                          Ngày
                        </span>
                      )}
                      {p.usage_night && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border bg-foreground/10 border-foreground/40 text-foreground">
                          <Moon className="w-2.5 h-2.5" />
                          Đêm
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="font-semibold text-foreground">
                        {formatVND(p.price)}
                      </span>
                      <span className="text-muted">·</span>
                      <span
                        className={
                          p.stock === 0
                            ? 'text-status-out'
                            : p.stock < 10
                              ? 'text-status-low'
                              : 'text-muted'
                        }
                      >
                        Tồn: {p.stock}
                      </span>
                      <span className="text-muted">·</span>
                      <span className="text-reward">+{p.points_per_unit}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      {p.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-status-instock/15 text-status-instock font-medium">
                          Đang bán
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted/20 text-muted font-medium">
                          Đã tắt
                        </span>
                      )}
                      <ProductRowActions
                        id={p.id}
                        name={p.name}
                        isActive={p.is_active}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

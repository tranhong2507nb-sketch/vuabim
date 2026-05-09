import Link from 'next/link'
import { Search, Users, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Khách hàng',
}

interface SearchParams {
  q?: string
  role?: string
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, email, phone, full_name, role, current_points, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (sp.q?.trim()) {
    const q = sp.q.trim()
    query = query.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
    )
  }
  if (sp.role) query = query.eq('role', sp.role)

  const { data: customers } = await query

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Khách hàng
        </h1>
        <p className="text-sm text-muted">{customers?.length ?? 0} tài khoản</p>
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
            placeholder="Tìm tên, email, SĐT..."
            className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-lg border border-primary-light bg-card text-sm focus:outline-none focus:border-primary-dark"
          />
        </div>
        <select
          name="role"
          defaultValue={sp.role ?? ''}
          className="min-h-[40px] px-3 rounded-lg border border-primary-light bg-card text-sm"
        >
          <option value="">Mọi vai trò</option>
          <option value="customer">Khách</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          Lọc
        </Button>
      </form>

      {!customers || customers.length === 0 ? (
        <div className="bg-card border border-primary-light rounded-xl p-10 text-center">
          <Users className="w-10 h-10 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">
            {sp.q || sp.role
              ? 'Không tìm thấy khách phù hợp.'
              : 'Chưa có khách hàng nào.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-primary-light rounded-xl overflow-hidden">
          {/* Desktop */}
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-section-soft text-xs text-muted uppercase">
              <tr>
                <th className="text-left px-4 py-2.5">Khách</th>
                <th className="text-left px-3 py-2.5">Liên hệ</th>
                <th className="text-right px-3 py-2.5">Điểm</th>
                <th className="text-center px-3 py-2.5">Vai trò</th>
                <th className="text-right px-4 py-2.5">Tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-section-soft">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/khach-hang/${c.id}`}
                      className="block hover:text-primary-dark"
                    >
                      <div className="font-medium text-foreground truncate max-w-[260px]">
                        {c.full_name || '(chưa có tên)'}
                      </div>
                      <div className="text-xs text-muted font-mono truncate max-w-[260px]">
                        {c.id.slice(0, 8)}…
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-xs text-muted truncate max-w-[220px]">
                      {c.email}
                    </div>
                    {c.phone && (
                      <div className="text-xs text-muted">{c.phone}</div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-reward font-semibold">
                    🎁 {c.current_points}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {c.role === 'admin' ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-cta/15 text-cta font-medium">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-muted/15 text-muted font-medium">
                        Khách
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile */}
          <ul className="md:hidden divide-y divide-primary-light">
            {customers.map(c => (
              <li key={c.id}>
                <Link
                  href={`/admin/khach-hang/${c.id}`}
                  className="block p-3 active:bg-section-soft"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-medium text-foreground truncate">
                      {c.full_name || '(chưa có tên)'}
                    </div>
                    {c.role === 'admin' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-cta/15 text-cta font-medium shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Phone className="w-3 h-3" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-reward font-semibold">
                      🎁 {c.current_points} điểm
                    </span>
                    <span className="text-muted">
                      {new Date(c.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

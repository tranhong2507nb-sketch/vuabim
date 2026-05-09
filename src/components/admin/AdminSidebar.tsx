'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Gift,
  Receipt,
  GiftIcon,
  Users,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/san-pham', label: 'Sản phẩm', icon: ShoppingBag },
  { href: '/admin/thuong-hieu', label: 'Thương hiệu', icon: Tag },
  { href: '/admin/qua', label: 'Quà đổi điểm', icon: Gift },
  { href: '/admin/don-hang', label: 'Đơn hàng', icon: Receipt },
  { href: '/admin/yeu-cau-doi-qua', label: 'Đổi quà', icon: GiftIcon },
  { href: '/admin/khach-hang', label: 'Khách hàng', icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col bg-card border-r border-primary-light">
      <div className="px-5 py-4 border-b border-primary-light">
        <Link href="/admin" className="text-lg font-bold text-primary-dark">
          Vua Bỉm <span className="text-xs text-muted font-normal">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {ITEMS.map(item => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary-light text-primary-dark font-semibold border-l-4 border-primary-dark pl-4'
                  : 'text-foreground hover:bg-section-soft'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-3 border-t border-primary-light">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted hover:text-primary-dark"
        >
          <ExternalLink className="w-4 h-4" />
          Xem web khách
        </Link>
      </div>
    </aside>
  )
}

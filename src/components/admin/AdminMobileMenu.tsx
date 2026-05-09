'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  X,
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Gift,
  Receipt,
  GiftIcon,
  Users,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
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

interface Props {
  open: boolean
  onClose: () => void
}

export function AdminMobileMenu({ open, onClose }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] bg-card shadow-xl flex flex-col">
        <div className="h-14 px-4 flex items-center justify-between border-b border-primary-light">
          <span className="text-lg font-bold text-primary-dark">
            Vua Bỉm <span className="text-xs text-muted font-normal">Admin</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="tap-target flex items-center justify-center text-foreground"
            aria-label="Đóng menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {ITEMS.map(item => {
            const Icon = item.icon
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  isActive
                    ? 'bg-primary-light text-primary-dark font-semibold border-l-4 border-primary-dark pl-3'
                    : 'text-foreground hover:bg-section-soft'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-primary-light">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-3 text-sm text-muted hover:text-primary-dark"
          >
            <ExternalLink className="w-4 h-4" />
            Xem web khách
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-status-out border-t border-primary-light hover:bg-section-soft transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

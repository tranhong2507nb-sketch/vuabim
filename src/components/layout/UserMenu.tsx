'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { LogOut, User as UserIcon, ShoppingBag, Gift, Settings } from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
import type { CurrentUser } from '@/lib/auth/getCurrentUser'
import { cn } from '@/lib/utils'

interface Props {
  user: CurrentUser
}

export function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close khi click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const initials = (user.full_name || user.email || '?')
    .split(/\s+/)
    .map((s: string) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="tap-target flex items-center justify-center"
        aria-label="Tài khoản"
        aria-expanded={open}
      >
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt={user.full_name || user.email}
            className="w-8 h-8 rounded-full object-cover border-2 border-primary-light"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-lg border border-primary-light',
            'overflow-hidden z-50'
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-section-soft border-b border-primary-light">
            <div className="text-sm font-semibold text-foreground truncate">
              {user.full_name || 'Khách'}
            </div>
            <div className="text-xs text-muted truncate">{user.email}</div>
            <div className="mt-1.5 inline-flex items-center gap-1 text-xs">
              <span className="text-reward">🎁</span>
              <span className="font-semibold text-foreground">{user.current_points}</span>
              <span className="text-muted">điểm</span>
            </div>
          </div>

          {/* Menu items */}
          <nav className="py-1">
            <MenuItem href="/tai-khoan" icon={<UserIcon className="w-4 h-4" />} onClose={() => setOpen(false)}>
              Tài khoản của tôi
            </MenuItem>
            <MenuItem href="/tai-khoan/don-hang" icon={<ShoppingBag className="w-4 h-4" />} onClose={() => setOpen(false)}>
              Đơn hàng
            </MenuItem>
            <MenuItem href="/tai-khoan/qua-da-doi" icon={<Gift className="w-4 h-4" />} onClose={() => setOpen(false)}>
              Quà đã đổi
            </MenuItem>
            {user.role === 'admin' && (
              <MenuItem href="/admin" icon={<Settings className="w-4 h-4" />} onClose={() => setOpen(false)}>
                Trang quản trị
              </MenuItem>
            )}
          </nav>

          <div className="border-t border-primary-light">
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-status-out hover:bg-section-soft transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  href,
  icon,
  children,
  onClose,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-section-soft transition-colors"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </Link>
  )
}

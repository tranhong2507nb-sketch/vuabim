'use client'

import { useState } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
import { AdminMobileMenu } from './AdminMobileMenu'

interface Props {
  userName: string
  userEmail: string
}

export function AdminTopbar({ userName, userEmail }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = (userName || userEmail || '?')
    .split(/\s+/)
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <header className="h-14 bg-card border-b border-primary-light px-4 md:px-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="md:hidden tap-target flex items-center justify-center text-foreground"
          aria-label="Mở menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:block text-sm text-muted">
          Khu vực quản trị
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold text-foreground truncate max-w-[160px]">
              {userName || 'Admin'}
            </div>
            <div className="text-xs text-muted truncate max-w-[160px]">
              {userEmail}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <form action={signOut} className="hidden md:block">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-muted hover:text-status-out transition-colors px-2 py-1"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Đăng xuất</span>
            </button>
          </form>
        </div>
      </header>

      <AdminMobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

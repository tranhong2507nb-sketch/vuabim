'use client'

import Link from 'next/link'
import { X, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { signOut } from '@/lib/auth/actions'
import type { CurrentUser } from '@/lib/auth/getCurrentUser'

interface Props {
  open: boolean
  onClose: () => void
  user: CurrentUser | null
}

const menuItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Tất cả sản phẩm' },
  { href: '/thuong-hieu', label: 'Thương hiệu' },
  { href: '/doi-qua', label: 'Đổi quà' },
]

const userItems = [
  { href: '/tai-khoan', label: 'Tài khoản' },
  { href: '/tai-khoan/don-hang', label: 'Đơn hàng' },
  { href: '/tai-khoan/qua-da-doi', label: 'Quà đã đổi' },
]

export function MobileMenu({ open, onClose, user }: Props) {
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
          <span className="text-xl font-bold text-primary-dark">Vua Bỉm</span>
          <button
            type="button"
            onClick={onClose}
            className="tap-target flex items-center justify-center text-foreground"
            aria-label="Đóng menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {user && (
          <div className="px-4 py-3 bg-section-soft border-b border-primary-light">
            <div className="text-sm font-semibold text-foreground truncate">
              {user.full_name || 'Khách'}
            </div>
            <div className="text-xs text-muted truncate">{user.email}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs">
              <span className="text-reward">🎁</span>
              <span className="font-semibold text-foreground">{user.current_points}</span>
              <span className="text-muted">điểm</span>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block px-4 py-3 text-foreground hover:bg-primary-light hover:text-primary-dark transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <>
              <div className="px-4 py-2 text-xs text-subtle uppercase tracking-wider">Tài khoản</div>
              {userItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block px-4 py-3 text-foreground hover:bg-primary-light hover:text-primary-dark transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="block px-4 py-3 text-foreground hover:bg-primary-light hover:text-primary-dark transition-colors"
                >
                  Trang quản trị
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="border-t border-primary-light">
          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-4 py-3 text-status-out hover:bg-section-soft transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </form>
          ) : (
            <Link
              href="/dang-nhap"
              onClick={onClose}
              className="block px-4 py-3 text-primary-dark font-medium hover:bg-primary-light"
            >
              Đăng nhập / Đăng ký
            </Link>
          )}
          <div className="px-4 py-3 border-t border-primary-light text-xs text-muted">
            Hotline: <a href="tel:0900000000" className="text-cta font-medium">0900 000 000</a>
          </div>
        </div>
      </div>
    </div>
  )
}

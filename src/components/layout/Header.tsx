'use client'

import Link from 'next/link'
import { Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { MobileMenu } from './MobileMenu'
import { UserMenu } from './UserMenu'
import { CartIconWithBadge } from '@/components/cart/CartIconWithBadge'
import type { CurrentUser } from '@/lib/auth/getCurrentUser'

interface Props {
  user: CurrentUser | null
}

export function Header({ user }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-card border-b border-primary-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          {/* Hamburger menu — mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="tap-target flex items-center justify-center text-foreground hover:text-primary-dark md:hidden"
            aria-label="Mở menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-primary-dark tracking-tight"
            aria-label="Trang chủ Vua Bỉm"
          >
            Vua Bỉm
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 ml-6 flex-1">
            <Link href="/san-pham" className="text-foreground hover:text-primary-dark">
              Sản phẩm
            </Link>
            <Link href="/thuong-hieu" className="text-foreground hover:text-primary-dark">
              Thương hiệu
            </Link>
            <Link href="/doi-qua" className="text-foreground hover:text-primary-dark">
              Đổi quà
            </Link>
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            <Link
              href="/tim-kiem"
              className="tap-target flex items-center justify-center text-foreground hover:text-primary-dark"
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </Link>

            <CartIconWithBadge />

            {user ? (
              <>
                <Link
                  href="/tai-khoan"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-reward-light border border-reward text-xs font-semibold text-foreground hover:bg-reward/30 transition-colors"
                  aria-label={`${user.current_points} điểm — xem tài khoản`}
                  title="Điểm đang có"
                >
                  <span className="text-sm leading-none">🎁</span>
                  {user.current_points.toLocaleString('vi-VN')}
                </Link>
                <UserMenu user={user} />
              </>
            ) : (
              <Link
                href="/dang-nhap"
                className="ml-1 px-3 py-2 text-sm font-medium text-primary-dark hover:bg-primary-light rounded-lg transition-colors min-h-[36px] flex items-center"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
      />
    </>
  )
}

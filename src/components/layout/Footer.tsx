import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-12 border-t border-primary-light bg-card">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Cột 1 — Brand */}
        <div className="md:col-span-1">
          <div className="text-xl font-bold text-primary-dark mb-2">Vua Bỉm</div>
          <p className="text-sm text-muted">
            Bỉm chính hãng cho mẹ và bé. Tích điểm đổi quà.
          </p>
        </div>

        {/* Cột 2 — Mua sắm */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Mua sắm</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/san-pham" className="hover:text-primary-dark">Tất cả sản phẩm</Link></li>
            <li><Link href="/thuong-hieu" className="hover:text-primary-dark">Thương hiệu</Link></li>
            <li><Link href="/doi-qua" className="hover:text-primary-dark">Đổi quà bằng điểm</Link></li>
          </ul>
        </div>

        {/* Cột 3 — Chính sách */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Chính sách</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/chinh-sach-bao-mat" className="hover:text-primary-dark">Bảo mật</Link></li>
            <li><Link href="/dieu-khoan-su-dung" className="hover:text-primary-dark">Điều khoản</Link></li>
            <li><Link href="/chinh-sach-doi-tra" className="hover:text-primary-dark">Đổi trả</Link></li>
            <li><Link href="/lien-he" className="hover:text-primary-dark">Liên hệ</Link></li>
          </ul>
        </div>

        {/* Cột 4 — Hotline */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Liên hệ</h3>
          <p className="text-sm text-muted mb-1">Hotline đặt hàng:</p>
          <a href="tel:0900000000" className="text-lg font-semibold text-cta">
            0900 000 000
          </a>
          <p className="text-xs text-subtle mt-2">8:00 — 22:00 hằng ngày</p>
        </div>
      </div>

      <div className="border-t border-primary-light">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-subtle">
          © {new Date().getFullYear()} Vua Bỉm. Bỉm chính hãng cho mẹ và bé.
        </div>
      </div>
    </footer>
  )
}

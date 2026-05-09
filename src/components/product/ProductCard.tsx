import Link from 'next/link'
import { Sun, Moon } from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { BuyNowButton } from '@/components/cart/BuyNowButton'
import { DIAPER_TYPE_LABEL, type ProductWithBrand } from '@/lib/types'

interface Props {
  product: ProductWithBrand
}

/**
 * Card sản phẩm — dùng ở list, trang chủ, brand page.
 *
 * Mobile-first: 2 cột (md: 3-4 cột).
 * Hiển thị: ảnh, tên, hãng, size/cân nặng, giá, điểm tích, tồn kho, nút thêm giỏ.
 */
export function ProductCard({ product }: Props) {
  const firstImage = product.images?.[0]
  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group bg-card border border-primary-light rounded-xl overflow-hidden hover:border-primary-dark transition-colors flex flex-col"
    >
      {/* Ảnh */}
      <div className="aspect-square bg-section-soft relative overflow-hidden">
        {firstImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-subtle text-sm">
            Chưa có ảnh
          </div>
        )}

        {/* Badge điểm tích — góc dưới phải */}
        {product.points_per_unit > 0 && (
          <div className="absolute bottom-2 right-2 bg-reward text-foreground text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
            +{product.points_per_unit} điểm
          </div>
        )}

        {/* Badge hết hàng */}
        {!inStock && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="bg-card text-status-out text-sm font-semibold px-3 py-1 rounded-full">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-xs text-muted mb-1 line-clamp-1">
          {product.brand?.name ?? 'Hãng'}
        </div>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1 min-h-[2.5em]">
          {product.name}
        </h3>

        {/* Loại bỉm + thời điểm dùng */}
        <div className="flex items-center gap-1 mb-1.5 flex-wrap">
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              product.diaper_type === 'pant'
                ? 'bg-primary-light border-primary text-primary-dark'
                : 'bg-secondary-light border-secondary text-secondary-dark'
            }`}
          >
            {DIAPER_TYPE_LABEL[product.diaper_type]}
          </span>
          {product.usage_day && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border bg-reward-light border-reward text-foreground">
              <Sun className="w-2.5 h-2.5" />
              Ngày
            </span>
          )}
          {product.usage_night && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border bg-foreground/10 border-foreground/40 text-foreground">
              <Moon className="w-2.5 h-2.5" />
              Đêm
            </span>
          )}
        </div>

        {/* Size / cân nặng */}
        {(product.size || product.weight_range) && (
          <div className="text-xs text-muted mb-2">
            {[product.size, product.weight_range].filter(Boolean).join(' · ')}
          </div>
        )}

        {/* Giá */}
        <div className="text-base font-bold text-cta mb-1.5 mt-auto">
          {formatVND(product.price)}
        </div>

        {/* Tồn kho */}
        {inStock && (
          <div className={`text-xs mb-2 ${lowStock ? 'text-status-pending' : 'text-status-instock'}`}>
            {lowStock ? `Còn ${product.stock} sp` : 'Còn hàng'}
          </div>
        )}

        {/* Nút mua ngay → chuyển vào trang giỏ */}
        <BuyNowButton
          product={product}
          variant="card"
          destination="cart"
          fullWidth
        />
      </div>
    </Link>
  )
}

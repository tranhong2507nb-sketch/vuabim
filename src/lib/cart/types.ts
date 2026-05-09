/**
 * CartItem — snapshot khi khách thêm vào giỏ.
 *
 * Lưu giá tại thời điểm add. Khi vào checkout sẽ re-validate
 * giá thật từ DB (vì admin có thể đổi giá).
 */
export interface CartItem {
  product_id: string
  slug: string
  name: string
  brand_name: string
  size: string | null
  price: number          // snapshot giá lúc add
  points_per_unit: number // snapshot điểm tích
  image: string | null   // first image URL
  qty: number
  added_at: string       // ISO timestamp
}

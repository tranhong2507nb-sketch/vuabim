import { CartView } from '@/components/cart/CartView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giỏ hàng',
  description: 'Giỏ hàng của bạn tại Vua Bỉm',
}

export default function CartPage() {
  return <CartView />
}

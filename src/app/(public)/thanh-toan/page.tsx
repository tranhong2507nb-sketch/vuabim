import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getShippingDefaults } from '@/lib/checkout/save-shipping'
import { CheckoutPage } from '@/components/checkout/CheckoutPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thanh toán',
  description: 'Hoàn tất đơn hàng tại Vua Bỉm',
}

export default async function CheckoutPageRoute() {
  const user = await getCurrentUser()

  // Yêu cầu đăng nhập (có dùng điểm + ghi đơn vào DB)
  if (!user) {
    redirect('/dang-nhap?redirect_to=/thanh-toan')
  }

  const shippingDefaults = await getShippingDefaults()

  return <CheckoutPage user={user} shippingDefaults={shippingDefaults} />
}

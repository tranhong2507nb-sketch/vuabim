import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vua Bỉm — Bỉm chính hãng cho mẹ và bé',
    short_name: 'Vua Bỉm',
    description:
      'Mua bỉm chính hãng giá tốt, tích điểm đổi quà, miễn phí giao hàng.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF8F1',
    theme_color: '#0891B2',
    orientation: 'portrait',
    lang: 'vi-VN',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'parenting', 'lifestyle'],
  }
}

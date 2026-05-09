import type { MetadataRoute } from 'next'

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'http://localhost:3000'
  )
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/tai-khoan',
          '/tai-khoan/*',
          '/auth',
          '/auth/*',
          '/dang-nhap',
          '/dang-ky',
          '/quen-mat-khau',
          '/gio-hang',
          '/thanh-toan',
          '/dat-hang-thanh-cong',
          '/dat-hang-thanh-cong/*',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}

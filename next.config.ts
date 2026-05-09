import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cloudflare Workers không có Next.js Image Optimization → tắt
  // Web vẫn dùng <img> nguyên bản — đã sẵn vậy
  images: {
    unoptimized: true,
  },

  // sanitize-html cần Node compat khi chạy trên Workers
  // (đã bật `nodejs_compat` flag trong wrangler.toml)
  serverExternalPackages: ['sanitize-html'],
}

export default nextConfig

// Init OpenNext cho dev (giúp dev server giả lập Cloudflare bindings nếu cần)
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()

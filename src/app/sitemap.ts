import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'http://localhost:3000'
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const now = new Date()

  const supabase = await createClient()

  const [{ data: products }, { data: brands }] = await Promise.all([
    supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(5000),
    supabase
      .from('brands')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('display_order'),
  ])

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${base}/san-pham`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/thuong-hieu`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/doi-qua`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url: `${base}/san-pham/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const brandEntries: MetadataRoute.Sitemap = (brands ?? []).map(b => ({
    url: `${base}/thuong-hieu/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticEntries, ...brandEntries, ...productEntries]
}

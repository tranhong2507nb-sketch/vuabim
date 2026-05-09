/**
 * Type aliases cho domain Vua Bỉm.
 */

export interface Brand {
  id: string
  slug: string
  name: string
  logo_url: string | null
  banner_url: string | null
  story_content: string | null
  meta_title: string | null
  meta_description: string | null
  display_order: number
  is_active: boolean
}

export type DiaperType = 'pant' | 'tape'

export interface Product {
  id: string
  slug: string
  name: string
  brand_id: string
  size: string | null
  weight_range: string | null
  diaper_type: DiaperType
  usage_day: boolean
  usage_night: boolean
  price: number
  stock: number
  points_per_unit: number
  images: string[]
  meta_title: string | null
  meta_description: string | null
  is_active: boolean
}

export const DIAPER_TYPE_LABEL: Record<DiaperType, string> = {
  pant: 'Bỉm quần',
  tape: 'Bỉm dán',
}

export interface ProductWithBrand extends Product {
  brand: Pick<Brand, 'id' | 'slug' | 'name' | 'logo_url'>
}

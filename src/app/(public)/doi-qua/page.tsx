import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { RedemptionView } from '@/components/redemption/RedemptionView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đổi quà',
  description: 'Đổi điểm thưởng lấy quà tặng cho mẹ và bé',
}

export default async function RedemptionPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/dang-nhap?redirect_to=/doi-qua')
  }

  const supabase = await createClient()
  const { data: gifts } = await supabase
    .from('gifts')
    .select('id, name, image_url, description, points_required, stock')
    .eq('is_active', true)
    .order('points_required', { ascending: true })

  return <RedemptionView user={user} gifts={gifts ?? []} />
}

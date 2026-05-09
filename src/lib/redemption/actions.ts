'use server'

import { createClient } from '@/lib/supabase/server'
import { RedemptionSchema } from './schemas'

type RedeemResult =
  | { ok: true; redemption_id: string }
  | { ok: false; error: string }

/**
 * Server Action — gọi RPC redeem_gift_standalone (Phase 0 migration 0004).
 *
 * RPC tự xử lý:
 * - Validate gift còn tồn + user đủ điểm
 * - Trừ điểm khỏi current_points (FOR UPDATE — tránh race)
 * - Trừ stock quà
 * - Tạo gift_redemptions với source='standalone'
 * - Log points_transactions type='redeem_gift'
 */
export async function redeemGiftStandalone(input: unknown): Promise<RedeemResult> {
  const parsed = RedemptionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const supabase = await createClient()

  const { data: redemptionId, error } = await supabase.rpc('redeem_gift_standalone', {
    p_input: {
      ...parsed.data,
      source: 'standalone',
    },
  })

  if (error) {
    console.error('redeem_gift_standalone failed:', error)
    return { ok: false, error: 'Đổi quà thất bại: ' + error.message }
  }

  return { ok: true, redemption_id: redemptionId as string }
}

/**
 * Supabase ADMIN client (service_role).
 *
 * ⚠️ TUYỆT ĐỐI CHỈ DÙNG SERVER-SIDE.
 * Bypass RLS — có toàn quyền database.
 * KHÔNG import vào Client Components.
 *
 * Dùng cho:
 * - Seed data
 * - Migration helper
 * - Cron jobs
 * - Admin actions cần quyền cao
 */
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

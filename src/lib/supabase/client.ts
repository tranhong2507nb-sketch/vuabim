/**
 * Supabase client cho BROWSER (Client Components, useEffect, event handlers).
 *
 * Dùng `NEXT_PUBLIC_*` env — public, được nhúng vào bundle JS gửi cho khách.
 * RLS bảo vệ data, không lo lộ key.
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

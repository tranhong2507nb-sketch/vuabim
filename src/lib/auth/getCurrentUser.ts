import { createClient } from '@/lib/supabase/server'

/**
 * Fetch user hiện tại + profile data.
 * Dùng trong Server Components.
 *
 * @returns null nếu chưa login
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, current_points')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? profile?.email ?? '',
    full_name: profile?.full_name ?? '',
    role: (profile?.role ?? 'customer') as 'customer' | 'admin',
    current_points: profile?.current_points ?? 0,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  }
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>

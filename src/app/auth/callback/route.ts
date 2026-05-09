import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth callback handler.
 *
 * Flow:
 * 1. User click "Đăng nhập với Google/Facebook"
 * 2. Supabase redirect đến Google/FB → user authorize
 * 3. Google/FB redirect về Supabase với mã code
 * 4. Supabase tạo session, redirect về URL này (`/auth/callback?code=xxx&next=...`)
 * 5. Code này exchange code → session cookie + redirect về `next`
 *
 * Cũng xử lý:
 * - Email confirmation link (sau khi đăng ký)
 * - Password recovery link (?type=recovery)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/tai-khoan'
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Recovery: chuyển sang trang đổi mật khẩu (Phase sau)
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/tai-khoan/doi-mat-khau`)
      }
      // Bình thường: redirect về `next` (default /tai-khoan)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Lỗi: redirect về trang đăng nhập với thông báo
  return NextResponse.redirect(
    `${origin}/dang-nhap?error=${encodeURIComponent('Xác thực thất bại, vui lòng thử lại')}`
  )
}

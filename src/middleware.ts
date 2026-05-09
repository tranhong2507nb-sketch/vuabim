/**
 * Middleware Next.js — chạy mọi request trên Edge runtime.
 * Dùng tên file `middleware.ts` (thay vì proxy.ts) để chạy edge —
 * Cloudflare Workers chưa hỗ trợ Node proxy.
 *
 * Vai trò:
 * 1. Refresh Supabase auth session (cookie hết hạn → tự gia hạn)
 * 2. Bảo vệ route /admin/* (chỉ admin)
 * 3. Bảo vệ route /tai-khoan/* (chỉ user đã login)
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session (quan trọng — không gọi getUser sẽ không refresh)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Bảo vệ /admin: yêu cầu role='admin'
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dang-nhap'
      url.searchParams.set('redirect_to', pathname)
      return NextResponse.redirect(url)
    }

    // Check role admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Bảo vệ /tai-khoan: yêu cầu đã login
  if (pathname.startsWith('/tai-khoan') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dang-nhap'
    url.searchParams.set('redirect_to', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

// middleware.ts mặc định chạy Edge runtime — không cần khai báo runtime
export const config = {
  matcher: [
    /*
     * Match mọi route trừ:
     * - _next/static (static files)
     * - _next/image (image optimization — Cloudflare unoptimized nhưng vẫn skip)
     * - favicon.ico
     * - các file static (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)',
  ],
}

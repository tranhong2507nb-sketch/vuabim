'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
} from './schemas'

type ActionResult = { ok: true } | { ok: false; error: string }

/**
 * Đăng nhập bằng email + password.
 */
export async function signInWithEmail(input: unknown): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Dữ liệu không hợp lệ' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return {
      ok: false,
      error:
        error.message === 'Invalid login credentials'
          ? 'Email hoặc mật khẩu không đúng'
          : 'Đăng nhập thất bại: ' + error.message,
    }
  }

  return { ok: true }
}

/**
 * Đăng ký bằng email + password.
 * Trigger handle_new_user (migration 0002) sẽ tự tạo profiles row.
 */
export async function signUpWithEmail(input: unknown): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ',
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone || null,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return {
      ok: false,
      error:
        error.message.includes('already registered')
          ? 'Email này đã được đăng ký'
          : 'Đăng ký thất bại: ' + error.message,
    }
  }

  return { ok: true }
}

/**
 * Đăng xuất.
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

/**
 * Quên mật khẩu — gửi email reset.
 */
export async function forgotPassword(input: unknown): Promise<ActionResult> {
  const parsed = ForgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Email không hợp lệ' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?type=recovery`,
  })

  if (error) {
    return { ok: false, error: 'Không thể gửi email reset: ' + error.message }
  }

  return { ok: true }
}

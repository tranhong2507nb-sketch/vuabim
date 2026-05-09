import { z } from 'zod'

/**
 * Validation schemas cho auth forms.
 */

export const LoginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu'),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const RegisterSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Họ tên tối thiểu 2 ký tự')
      .max(60, 'Họ tên tối đa 60 ký tự'),
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
    phone: z
      .string()
      .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ (vd: 0912345678)')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(6, 'Mật khẩu tối thiểu 6 ký tự')
      .max(100),
    confirm_password: z.string(),
    accept_terms: z
      .boolean()
      .refine(v => v === true, {
        message: 'Vui lòng đồng ý điều khoản sử dụng',
      }),
  })
  .refine(data => data.password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Mật khẩu nhập lại không khớp',
  })

export type RegisterInput = z.infer<typeof RegisterSchema>

export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

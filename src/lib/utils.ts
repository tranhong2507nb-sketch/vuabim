import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes — handle conflict (vd bg-red + bg-blue → bg-blue).
 * Dùng trong components có classNames conditional.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format số tiền VND: 199000 → "199.000đ"
 */
export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

/**
 * Format điểm: 5 → "+5 điểm"
 */
export function formatPoints(points: number, prefix: '+' | '' = ''): string {
  return `${prefix}${points} điểm`
}

import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  refunded: 'Hoàn tiền',
}

interface OrderRow {
  // 8 trường yêu cầu chính
  name: string
  phone: string
  address: string
  product: string
  quantity: number
  total: number
  gift: string
  note: string

  // Trường bổ sung — admin có thể dùng để tham chiếu
  order_code: string
  created_at: string
  status: string
}

async function buildPayload(orderId: string): Promise<OrderRow> {
  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select(
      `order_code, status, total,
       shipping_name, shipping_phone,
       province_name, district_name, ward_name, address_detail, note,
       created_at,
       items:order_items ( qty, product_name_snapshot ),
       redemptions:gift_redemptions!gift_redemptions_ref_order_id_fkey (
         gift_name_snapshot
       )`
    )
    .eq('id', orderId)
    .single()

  if (!order) throw new Error(`Order ${orderId} not found`)

  const items = order.items ?? []
  const redemptions = order.redemptions ?? []

  // Gộp địa chỉ thành 1 chuỗi đầy đủ
  const fullAddress = [
    order.address_detail,
    order.ward_name,
    order.district_name,
    order.province_name,
  ]
    .filter(Boolean)
    .join(', ')

  // Sản phẩm: "2× Bỉm Merries M, 1× Bỉm Goon L"
  const productSummary = items
    .map(it => `${it.qty}× ${it.product_name_snapshot}`)
    .join(', ')

  // Tổng số lượng tất cả sản phẩm
  const totalQuantity = items.reduce((sum, it) => sum + (it.qty ?? 0), 0)

  // Quà tặng kèm: tên các quà cách nhau dấu phẩy (rỗng nếu không có)
  const giftSummary = redemptions
    .map(r => r.gift_name_snapshot)
    .join(', ')

  return {
    name: order.shipping_name,
    phone: order.shipping_phone,
    address: fullAddress,
    product: productSummary,
    quantity: totalQuantity,
    total: order.total,
    gift: giftSummary,
    note: order.note ?? '',

    order_code: order.order_code,
    created_at: new Date(order.created_at).toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
    status: STATUS_LABEL[order.status] ?? order.status,
  }
}

/**
 * Push 1 đơn lên Google Sheet thông qua App Script Web App URL.
 * Non-blocking: lỗi → log + return false (không throw).
 */
export async function pushOrderToSheet(orderId: string): Promise<boolean> {
  const url = process.env.GOOGLE_APP_SCRIPT_URL

  if (!url) {
    // Chưa config → bỏ qua âm thầm
    return false
  }

  try {
    const payload = await buildPayload(orderId)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    })

    const bodyText = await res.text()
    if (!res.ok) {
      console.error(
        `[google-sheets] HTTP ${res.status}: ${bodyText.slice(0, 300)}`
      )
      return false
    }

    // App Script luôn trả 200 — kiểm tra JSON body để biết thật sự success hay fail
    try {
      const body = JSON.parse(bodyText) as { ok?: boolean; error?: string }
      if (body.ok === true) {
        return true
      }
      console.error(
        `[google-sheets] App Script reported error: ${body.error ?? 'unknown'}`
      )
      return false
    } catch {
      // Không parse được JSON → coi như lỗi
      console.error(
        `[google-sheets] Non-JSON response from App Script: ${bodyText.slice(0, 300)}`
      )
      return false
    }
  } catch (e) {
    console.error('[google-sheets] Push failed:', e)
    return false
  }
}

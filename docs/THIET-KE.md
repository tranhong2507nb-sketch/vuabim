# THIẾT KẾ WEBSITE VUA BỈM

> **Phiên bản:** 1.0
> **Ngày chốt:** 2026-05-08
> **Trạng thái:** Chờ duyệt — cần được phê duyệt trước khi bắt đầu code, tạo project, hoặc viết migration.
> **Phạm vi:** Greenfield — website độc lập mới, KHÔNG kế thừa, KHÔNG sửa đổi web cũ nào.

---

## MỤC LỤC

1. [Tổng quan](#1-tổng-quan)
2. [Phạm vi](#2-phạm-vi)
3. [Nguyên tắc thiết kế](#3-nguyên-tắc-thiết-kế)
4. [Tech stack](#4-tech-stack)
5. [Routing & cấu trúc trang](#5-routing--cấu-trúc-trang)
6. [Module: Authentication](#6-module-authentication)
7. [Module: Sản phẩm & danh mục](#7-module-sản-phẩm--danh-mục)
8. [Module: Giỏ hàng](#8-module-giỏ-hàng)
9. [Module: Checkout & thanh toán](#9-module-checkout--thanh-toán)
10. [Module: Hệ thống điểm](#10-module-hệ-thống-điểm)
11. [Module: Đổi quà](#11-module-đổi-quà)
12. [Module: Tài khoản](#12-module-tài-khoản)
13. [Module: Admin](#13-module-admin)
14. [Module: Thương hiệu & câu chuyện thương hiệu](#14-module-thương-hiệu--câu-chuyện-thương-hiệu)
15. [Database schema](#15-database-schema)
16. [RPC functions](#16-rpc-functions)
17. [Bảo mật & RLS](#17-bảo-mật--rls)
18. [SEO](#18-seo)
19. [Hiệu năng & accessibility](#19-hiệu-năng--accessibility)
20. [Tuân thủ pháp luật VN](#20-tuân-thủ-pháp-luật-vn)
21. [Test checklist](#21-test-checklist)
22. [Quy ước phát triển](#22-quy-ước-phát-triển)
23. [Lộ trình triển khai](#23-lộ-trình-triển-khai)
24. [Phụ lục](#24-phụ-lục)
25. [Cảnh báo & câu hỏi mở](#25-cảnh-báo--câu-hỏi-mở)
26. [Module: Chatbox đơn hàng](#26-module-chatbox-đơn-hàng)
27. [Module: Cache & Cập nhật realtime admin](#27-module-cache--cập-nhật-realtime-admin)
28. [Module: Sanitize HTML — Brand Story](#28-module-sanitize-html--brand-story)
29. [Module: Cloudflare Edge Runtime Compat](#29-module-cloudflare-edge-runtime-compat)

---

## 1. TỔNG QUAN

| Thuộc tính | Giá trị |
|---|---|
| Tên dự án | Vua Bỉm |
| Ngành | Thương mại điện tử — bán bỉm trẻ em |
| Đối tượng | Mẹ bỉm Việt Nam, mua hàng chủ yếu trên điện thoại |
| MVP | Bán 15 hãng bỉm cố định + hệ thống tích/đổi điểm + COD |
| Loại dự án | Greenfield — web mới hoàn toàn |

**Tuyên bố:** Đây là website độc lập mới, không sửa đổi/tích hợp với web cũ nào.

---

## 2. PHẠM VI

### 2.1 Có trong MVP
- 15 hãng bỉm cố định
- Đăng ký / đăng nhập bằng email/SĐT + mật khẩu, Google, Facebook
- Trang sản phẩm, trang hãng, trang câu chuyện thương hiệu
- Giỏ hàng + checkout với form địa chỉ hành chính VN đầy đủ
- Thanh toán chỉ COD
- Hệ thống điểm (1 điểm = 1.000đ; admin set điểm cho từng sản phẩm)
- Đổi quà bằng điểm (2 luồng: trong checkout & độc lập)
- Trang tài khoản: đơn hàng, quà đã đổi, thông tin cá nhân
- Admin: sản phẩm, đơn hàng, quà, yêu cầu đổi quà, thương hiệu, câu chuyện thương hiệu, khách hàng

### 2.2 KHÔNG có (loại trừ rõ ràng)
- ❌ Cộng tác viên (CTV) / affiliate / hệ thống đại lý
- ❌ Săn điểm hằng ngày, nhiệm vụ tích điểm
- ❌ Phân khúc trung / cận cao cấp / cao cấp (không gắn nhãn)
- ❌ Voucher, mã giảm giá
- ❌ OTP / đăng nhập qua SMS
- ❌ Cổng thanh toán online (MoMo, ZaloPay, VNPay, thẻ, chuyển khoản tự động)
- ❌ Đánh giá sản phẩm, ảnh thật của mẹ khác
- ❌ Sản phẩm liên quan / cross-sell / upsell
- ❌ Mô tả sản phẩm dài, thông tin chất liệu
- ❌ Chat trực tiếp trong web (giai đoạn đầu — có thể thêm Zalo/Messenger floating sau)

---

## 3. NGUYÊN TẮC THIẾT KẾ

### 3.1 Mobile-first (BẮT BUỘC)
- Thiết kế cho mobile 320–480px **trước**, responsive lên tablet/desktop **sau**
- Tap target tối thiểu **44×44px**
- Phía khách: tuyệt đối **không kéo ngang**
- Ưu tiên **card** và **bottom sheet** thay vì table
- Body tối thiểu 14px, input tối thiểu 16px (chống iOS zoom khi focus)
- **Sticky CTA** dưới màn hình ở: PDP (mua/giỏ), giỏ hàng (thanh toán), checkout (đặt hàng)

### 3.2 Breakpoint
- Mobile: 320–767px (mặc định)
- Tablet: 768–1023px
- Desktop: 1024px+

### 3.3 Phía admin
- Ưu tiên desktop, có thể dùng table với scroll ngang nếu cần
- KHÔNG được vỡ trên mobile (chỉ cần sử dụng được)

---

## 4. TECH STACK

| Lớp | Công nghệ | Lý do |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** + TypeScript | SSR/ISR cho SEO, tách routing rõ, hỗ trợ mobile-first |
| Styling | **Tailwind CSS** | Mobile-first utility, build size nhỏ |
| Backend | **Supabase** (Postgres + Auth + Storage + Realtime) | Có sẵn auth đa provider, RLS, RPC, storage |
| State (client) | **Zustand** cho cart; **React Query** cho server state | Đơn giản, không over-engineering |
| Form | **React Hook Form** + **Zod** | Validation type-safe |
| Rich text (admin) | **TipTap** | Cho câu chuyện thương hiệu |
| Hosting | **Cloudflare Pages** + adapter `@cloudflare/next-on-pages` | Edge runtime, free tier rộng, gần VN. Cache qua Cloudflare KV. |
| Image | **Next/Image** + Supabase Storage | Optimize tự động + admin upload từ máy |

---

## 5. ROUTING & CẤU TRÚC TRANG

### 5.1 Trang công khai & khách hàng

| Path | Mô tả |
|---|---|
| `/` | Trang chủ |
| `/san-pham` | Danh sách tất cả sản phẩm |
| `/san-pham/[slug]` | Chi tiết sản phẩm (PDP) |
| `/thuong-hieu` | Danh sách 15 hãng |
| `/thuong-hieu/[brand-slug]` | Trang câu chuyện hãng + sản phẩm của hãng |
| `/gio-hang` | Giỏ hàng |
| `/thanh-toan` | Checkout |
| `/dat-hang-thanh-cong/[ma-don]` | Sau khi đặt hàng |
| `/doi-qua` | Trang đổi quà bằng điểm (độc lập) |
| `/dang-nhap` | Đăng nhập |
| `/dang-ky` | Đăng ký |
| `/quen-mat-khau` | Quên mật khẩu |
| `/auth/callback` | Xử lý OAuth callback |
| `/tai-khoan` | Dashboard tài khoản |
| `/tai-khoan/don-hang` | Danh sách đơn hàng |
| `/tai-khoan/don-hang/[ma-don]` | Chi tiết + theo dõi đơn |
| `/tai-khoan/qua-da-doi` | Lịch sử quà đã đổi |
| `/tai-khoan/thong-tin` | Sửa thông tin cá nhân |

### 5.2 Trang admin (yêu cầu role='admin')

| Path | Mô tả |
|---|---|
| `/admin` | Dashboard admin |
| `/admin/san-pham` | Quản lý sản phẩm |
| `/admin/san-pham/them` | Thêm sản phẩm |
| `/admin/san-pham/[id]` | Sửa sản phẩm |
| `/admin/thuong-hieu` | Quản lý 15 hãng + câu chuyện thương hiệu |
| `/admin/thuong-hieu/[id]` | Sửa hãng + viết câu chuyện |
| `/admin/qua` | Quản lý quà |
| `/admin/don-hang` | Quản lý đơn hàng |
| `/admin/don-hang/[id]` | Chi tiết đơn |
| `/admin/yeu-cau-doi-qua` | Quản lý đơn đổi quà (cả 2 luồng) |
| `/admin/khach-hang` | Danh sách khách hàng |
| `/admin/khach-hang/[id]` | Chi tiết + lịch sử của 1 khách |

### 5.3 Trang tĩnh
- `/chinh-sach-bao-mat`
- `/dieu-khoan-su-dung`
- `/chinh-sach-doi-tra`
- `/lien-he`

---

## 6. MODULE: AUTHENTICATION

### 6.1 Provider
- ✅ Email + mật khẩu
- ✅ Số điện thoại + mật khẩu (lưu vào cột `phone` của profile; auth qua Supabase dùng email — có thể dùng `<phone>@phone.local` làm email giả lập, hoặc dùng phone-based auth của Supabase)
- ✅ Google OAuth
- ✅ Facebook OAuth
- ❌ KHÔNG có OTP / SMS

### 6.2 Đăng ký
- Form: email/SĐT + mật khẩu + xác nhận mật khẩu + họ tên
- Tạo `auth.users` qua Supabase Auth
- **Trigger Postgres** tự tạo `profiles` row tương ứng (role='customer', current_points=0)
- Email verify: BẬT (theo cấu hình Supabase)

### 6.3 Đăng nhập
- Form: email/SĐT + mật khẩu
- Nút "Đăng nhập với Google", "Đăng nhập với Facebook"
- Link "Quên mật khẩu?", "Chưa có tài khoản? Đăng ký"

### 6.4 OAuth callback (`/auth/callback`)
- Nhận session từ Supabase
- Profile được trigger tự tạo nếu chưa có
- Redirect:
  - Nếu có `?redirect_to=...` → quay lại đó
  - Nếu đang trong checkout → quay về `/thanh-toan`
  - Mặc định → `/tai-khoan`
- KHÔNG để màn hình trắng. KHÔNG để lỗi profile null.

### 6.5 Session
- Cookie do Supabase Auth quản lý
- F5 KHÔNG bị logout
- Logout: xóa session, redirect `/`

### 6.6 Bảo mật
- Mật khẩu hash bcrypt (Supabase Auth tự xử lý)
- Rate limit login: cấu hình Supabase
- HTTPS bắt buộc trên production

### 6.7 Trải nghiệm khi chưa đăng nhập
Khi khách chưa login muốn dùng tính năng yêu cầu auth (đổi quà, xem đơn, dùng điểm), hiển thị:
> "Vui lòng đăng nhập để sử dụng chức năng này"
> [Đăng nhập ngay]

Lưu `redirect_to` để quay lại sau khi login.

---

## 7. MODULE: SẢN PHẨM & DANH MỤC

### 7.1 Trang chủ — layout mobile

```
┌─────────────────────────┐
│ Header                  │
│ Logo · ☰ · 🔍 · 🛒 · 👤  │
├─────────────────────────┤
│ Banner chính            │
│ [Mua bỉm ngay]          │
├─────────────────────────┤
│ CHỌN THEO HÃNG          │
│ Lưới 3 cột × 5 hàng     │
│ logo + tên              │
├─────────────────────────┤
│ SẢN PHẨM NỔI BẬT        │
│ Lưới 2 cột (card)       │
├─────────────────────────┤
│ ĐỔI QUÀ BẰNG ĐIỂM       │
│ Box: "Có điểm? Đổi      │
│ quà ngay" → /doi-qua    │
├─────────────────────────┤
│ Footer (chính sách,     │
│ liên hệ, hotline)       │
└─────────────────────────┘
```

**KHÔNG có trên trang chủ:** CTV, săn điểm, nhiệm vụ điểm, phân khúc giá.

### 7.2 Danh sách sản phẩm `/san-pham`
- Grid 2 cột mobile, 3-4 cột tablet/desktop
- Nút "🔽 Lọc" → mở **bottom sheet**:
  - Hãng (multi-select)
  - Size (multi-select)
  - Còn hàng (toggle)
  - Khoảng giá (slider)
- Sắp xếp: mới nhất (mặc định) / giá tăng / giá giảm
- **Infinite scroll**

### 7.3 Card sản phẩm

```
┌──────────────┐
│  [Ảnh SP]    │
│ Tên SP       │
│ Hãng         │
│ Size · Cân nặng │
│ 199.000đ     │
│ +5 điểm      │
│ Còn 25 sp    │
│ [+ Giỏ]      │
└──────────────┘
```

Bấm vào ảnh/tên → PDP. Bấm "+ Giỏ" → toast confirm + cập nhật badge giỏ.

### 7.4 Trang chi tiết sản phẩm — PDP `/san-pham/[slug]`

```
┌─────────────────────────┐
│ Gallery (vuốt ngang)    │
│ [●] [○] [○]             │
├─────────────────────────┤
│ Tên sản phẩm            │
│ Hãng (link)             │
│ Size · Cân nặng         │
│ 199.000đ                │
│ Tồn: 25                 │
├─────────────────────────┤
│ 🎁 ĐIỂM TÍCH            │
│ Mỗi sản phẩm: +5 điểm   │
├─────────────────────────┤
│ 🎁 BẢNG ĐỔI QUÀ          │
│ "Mẹ có 82 điểm"         │
│ ┌─────┐ ┌─────┐         │
│ │Quà 1│ │Quà 2│ …       │
│ │50 đ │ │100đ │         │
│ │[Đổi]│ │[Đủ] │          │
│ └─────┘ └─────┘         │
├─────────────────────────┤
│ (sticky bottom)         │
│ [- 1 +] [+ Giỏ][Mua ngay]│
└─────────────────────────┘
```

**Hành vi bảng đổi quà:**
- Bấm "Đổi" → mở bottom sheet form **đầy đủ thông tin/địa chỉ** (giống `/doi-qua`)
- Submit → tạo `gift_redemptions` với `source = 'pdp'`
- Đơn đổi quà này KHÔNG liên quan đến sản phẩm đang xem; sản phẩm chỉ là "điểm vào" tiện hơn

**KHÔNG có trên PDP:**
- Mô tả ngắn / dài
- Thông tin chất liệu
- Đánh giá sao + ảnh thật của mẹ khác
- Sản phẩm liên quan

### 7.5 Tìm kiếm
- Icon 🔍 ở header → mở overlay full-screen (mobile)
- Search theo tên + hãng (Postgres trigram hoặc full-text search)
- Lưu lịch sử tìm kiếm gần đây (localStorage)

---

## 8. MODULE: GIỎ HÀNG

### 8.1 Lưu trữ
- **Khách chưa login:** localStorage
- **Khách đã login:** bảng `cart_items` trong Supabase
- **Merge khi login:** gộp localStorage vào DB, dedup theo `product_id`, ưu tiên qty cao hơn

### 8.2 Trang `/gio-hang` — mobile

```
┌─────────────────────────┐
│ ← Giỏ hàng (3)          │
├─────────────────────────┤
│ ┌─[ảnh]─ Tên SP        │
│ │  Size M · 199.000đ   │
│ │  [- 2 +]      [🗑]   │
│ └────────────────────┐ │
│ ┌─[ảnh]─ Tên SP …    │ │
│ └────────────────────┘ │
├─────────────────────────┤
│ Tạm tính:    398.000đ   │
├─────────────────────────┤
│ (sticky bottom)         │
│ Tổng: 398.000đ          │
│ [Thanh toán]            │
└─────────────────────────┘
```

### 8.3 Validation tồn kho
- Khi vào checkout: re-fetch tồn kho. Nếu vượt → cảnh báo + điều chỉnh qty về tồn kho thực + cho khách xác nhận lại.

---

## 9. MODULE: CHECKOUT & THANH TOÁN

### 9.1 Form checkout (đầy đủ)

**Khối 1 — Thông tin nhận hàng**
- Họ tên *
- Email *
- Số điện thoại *
- Tỉnh/Thành phố * (dropdown)
- Quận/Huyện * (dropdown — phụ thuộc Tỉnh)
- Phường/Xã * (dropdown — phụ thuộc Quận)
- Địa chỉ chi tiết *
- Ghi chú đơn hàng (optional)

Dữ liệu hành chính VN: file JSON tĩnh seed vào project (63 tỉnh + ~700 huyện + ~11.000 xã).
Auto-fill từ profile khi đã login.

**Khối 2 — Sản phẩm trong đơn**
Liệt kê đầy đủ TẤT CẢ sản phẩm khách đang mua: ảnh, tên, qty, đơn giá, thành tiền.

**Khối 3 — Hệ thống điểm**

Có **2 nguồn điểm khác biệt** trong checkout, hiển thị thành **3 khối UI**:

**3.1 — Điểm của đơn hiện tại (sinh từ sản phẩm đang mua)**

```
┌─ Đơn này mẹ nhận được: +120 điểm ──┐
│ ⓘ Chỉ chọn 1 trong 2:               │
│ ○ Tích 120 điểm vào tài khoản       │
│ ○ Dùng ngay 120 điểm để giảm        │
│   120.000đ vào đơn này               │
└──────────────────────────────────────┘
```

**3.2 — Dùng điểm có sẵn trong tài khoản để giảm tiền**

```
┌─ Mẹ có 500 điểm ────────────────────┐
│ Dùng [___] điểm để giảm tiền        │
│ → giảm 0đ                            │
│ (1 điểm = 1.000đ)                    │
└──────────────────────────────────────┘
```

**3.3 — Đổi quà bằng điểm có sẵn trong tài khoản**

```
┌─ Bạn còn 400 điểm — đổi quà luôn?  │
│ ☐ Đổi quà đi kèm đơn này            │
│   [Mở bảng đổi quà]                  │
│   Đã chọn: Quà X (50 điểm)           │
└──────────────────────────────────────┘
```

**Quy tắc:**
- Khối 3.1: **chọn 1 trong 2** (tích vào TK HOẶC dùng ngay) — mặc định "Tích vào TK"
- Khối 3.2 và 3.3: **đều dùng điểm tài khoản** — tổng dùng KHÔNG vượt quá `current_points`
- Tất cả 3 khối hoạt động đồng thời được (trừ ràng buộc 1-trong-2 ở 3.1)
- Validation realtime: `account_points_used + gift_points_used ≤ current_points`

**Khối 4 — Phương thức thanh toán**
- Chỉ COD (radio duy nhất)

**Khối 5 — Tổng cộng**

```
Tạm tính:                          398.000đ
Phí vận chuyển:        ~~45.000đ~~  Miễn phí
Giảm từ điểm sản phẩm (instant):  -120.000đ   (nếu chọn 3.1.B)
Giảm từ điểm tài khoản:           -100.000đ   (nếu nhập ở 3.2)
─────────────────────────────────
Tổng thanh toán:                   178.000đ
```

**UI:** giá ship gốc 45.000đ hiển thị **gạch ngang** (text-decoration: line-through, màu xám) → bên cạnh là chữ **"Miễn phí"** (màu xanh, đậm). Tạo cảm giác khách "được tặng" 45k ship.

**Sticky bottom:** [Đặt hàng]

### 9.2 Phí vận chuyển

**MVP — Free ship toàn quốc với hiệu ứng UI "đã miễn":**
- Hằng số `DEFAULT_SHIPPING_FEE_ORIGINAL = 45.000đ`
- Mọi đơn hàng MVP đều **MIỄN PHÍ SHIP**
- Backend: `shipping_fee = 0` thực tế tính vào `total`
- DB lưu `shipping_fee_original = 45000` (để báo cáo doanh nghiệp "đã miễn X tiền ship cho khách")
- UI hiển thị: ~~45.000đ~~ kèm chữ "Miễn phí" — tạo cảm giác khuyến mãi

**Phase 2:** tích hợp GHN/GHTK API tính phí ship theo địa chỉ thực (ngoài phạm vi tài liệu này).

### 9.3 Sau khi đặt hàng thành công
Trang `/dat-hang-thanh-cong/[ma-don]`:
- Mã đơn lớn, dễ đọc
- Tổng tiền
- Hướng dẫn: "Nhân viên sẽ liên hệ xác nhận trong 24h"
- Nút [Xem đơn hàng] → `/tai-khoan/don-hang/[ma-don]`
- Nút [Tiếp tục mua sắm] → `/san-pham`

### 9.4 Quy tắc bắt buộc
- Tổng tiền cập nhật **ngay** khi khách bật/tắt/nhập điểm
- Tổng tiền sau khi trừ KHÔNG bao giờ < 0 (clamp về 0 nếu vượt)
- Khi đổi quà: mở bottom sheet, chỉ hiện quà đủ điểm + còn tồn
- **Validation `account_points_used + gift_points_used ≤ current_points`** — không cho dùng vượt
- **Thứ tự ưu tiên giảm tiền:** điểm tài khoản (account) **trước** → sau đó điểm sản phẩm (instant). Lý do: TK là tài sản thật, ưu tiên xử lý dứt điểm; phần dư điểm SP (do clamp) sẽ **tự động tích vào TK khi `completed`** (không bốc hơi).
- Frontend KHÔNG tự tính điểm/tiền — chỉ hiển thị; backend là nguồn sự thật duy nhất

---

## 10. MODULE: HỆ THỐNG ĐIỂM

### 10.1 Hằng số
- **1 điểm = 1.000đ**
- Mỗi sản phẩm có `points_per_unit` riêng do **admin set thủ công** (không tính theo % giá trị)
- Điểm **KHÔNG hết hạn**
- `current_points >= 0` luôn luôn (không bao giờ âm)

### 10.2 Trạng thái đơn

**Luồng chính (forward):**
```
pending ──► confirmed ──► shipping ──► completed ──► [refunded]
```

**Luồng hủy/hoàn (theo từng trạng thái):**
```
pending    ──► cancelled            (khách tự hủy HOẶC admin)
confirmed  ──► cancelled            (khách yêu cầu → admin duyệt; hoặc admin trực tiếp)
shipping   ──► [return flow]        ⚠️ KHÔNG cancel trực tiếp được — xem §10.2.1
completed  ──► refunded             (chỉ admin, qua refund_completed_order)
```

**ĐIỂM ĐƯỢC CỘNG VÀO `current_points` TẠI: `completed`**

#### 10.2.1 Đơn ở `shipping` — KHÔNG hủy trực tiếp

**Lý do:**
- Hàng đã rời kho, có thể đang ở đơn vị vận chuyển
- Nếu hủy + hoàn kho/điểm/quà ngay → khách vẫn có thể nhận hàng → sai số liệu
- Có rủi ro hoàn điểm khống

**MVP rule:**
- Admin KHÔNG có nút hủy đơn `shipping`
- Khách KHÔNG có nút hủy/yêu cầu hủy đơn `shipping` — chỉ hiển thị hotline
- Admin chỉ có thể chuyển đơn `shipping` sang:
  - `completed` (giao thành công, cộng điểm)
  - **Nếu cần hoàn:** xử lý ngoài hệ thống (gọi shipper, đợi hàng về kho), sau đó chuyển sang `completed` rồi gọi `refund_completed_order` để hoàn điểm/kho/quà chính xác

**Phase 2 (đã thiết kế trước):** thêm 3 status mới `return_requested → returning → returned` và 3 RPC `request_return_order`, `admin_mark_returning`, `admin_confirm_return_received` — chưa implement ở MVP.

### 10.3 Cột trên `orders` (đã cập nhật theo 2 nguồn điểm)

**Nhóm A — Điểm SẢN PHẨM (sinh từ đơn, không phải tài sản TK):**
| Cột | Ý nghĩa |
|---|---|
| `points_to_earn` | Số điểm sản phẩm SẼ cộng nếu đơn `completed` (option "tích"). Snapshot khi tạo đơn. |
| `points_earned_at` | Timestamp lúc thực sự cộng `points_to_earn`. NULL nếu chưa cộng. Chống cộng trùng. |
| `instant_points_used` | Số điểm sản phẩm khách chọn DÙNG NGAY giảm tiền (option "dùng ngay"). KHÔNG đụng `current_points` bao giờ. |
| `instant_points_discount` | Số tiền giảm từ `instant_points_used` (= `instant_points_used × 1000`). |

**Nhóm B — Điểm TÀI KHOẢN (điểm thật trong `current_points`):**
| Cột | Ý nghĩa |
|---|---|
| `account_points_used` | Số điểm TK khách dùng để giảm tiền đơn này. **TRỪ NGAY** khỏi `current_points` khi tạo đơn. |
| `account_points_discount` | Số tiền giảm từ `account_points_used` (= `account_points_used × 1000`). |
| `account_points_refunded_at` | Timestamp lúc đã hoàn `account_points_used` về TK. NULL nếu chưa hoàn. **Chống hoàn 2 lần.** |

**Lưu ý:**
- Điểm dùng đổi quà checkout (luồng A) không nằm trong `orders` mà ở `gift_redemptions.points_used`. Hoàn trùng chống bằng `gift_redemptions.refunded`.
- Tên cũ `points_used_direct` → đổi thành `instant_points_used` để **không nhầm với điểm tài khoản**.

### 10.4 Lifecycle điểm (đối xứng cho 3 nguồn)

**Nguyên tắc:** Sau khi đặt đơn rồi hủy đơn hợp lệ, `current_points` phải trở về đúng giá trị ban đầu.

#### Khi tạo đơn (status = pending)
- Tính `points_to_earn_raw` = Σ (qty × `points_per_unit_snapshot`)

- **Validate điểm tài khoản:**
  - `account_points_used + gift_points_used ≤ current_points`
  - `account_points_used ≤ floor(base_total / 1000)`
  - Nếu vi phạm: RAISE.

- **Áp điểm tài khoản TRƯỚC (giảm tiền):**
  - `account_points_discount = account_points_used × 1000`
  - `remaining_after_account = base_total − account_points_discount`

- **Lựa chọn điểm sản phẩm (1-trong-2) áp SAU:**
  - Nếu chọn **"tích"**:
    - `instant_points_used = 0`, `instant_points_discount = 0`
    - `points_to_earn = points_to_earn_raw` (toàn bộ tích khi completed)
  - Nếu chọn **"dùng ngay"**:
    - `instant_points_used = min(points_to_earn_raw, floor(remaining_after_account / 1000))`
    - `instant_points_discount = instant_points_used × 1000`
    - `points_to_earn = points_to_earn_raw − instant_points_used` ← **PHẦN DƯ CARRY** (tích khi completed, không bốc hơi)

- **Trừ điểm TK khỏi `current_points` NGAY:**
  - Nếu `account_points_used > 0`: `current_points -= account_points_used` + log `use_account_direct`
  - Nếu đổi quà checkout: `current_points -= gift.points_required` + log `redeem_gift`

- **KHÔNG đụng `current_points`**: `instant_points_used` (chỉ là discount) và `points_to_earn` (chưa completed)
- `points_earned_at = NULL`, `account_points_refunded_at = NULL`

#### Khi admin chuyển sang `completed`
- Nếu `points_earned_at IS NULL` AND `points_to_earn > 0`:
  - `current_points += points_to_earn`
  - `points_earned_at = NOW()`
  - Insert log `type = 'earn'`
- Nếu `points_earned_at` đã có → **bỏ qua** (idempotent)

#### Khi `cancelled` từ pending/confirmed/shipping

**Hoàn điểm tài khoản đã dùng giảm tiền** (chống trùng bằng `account_points_refunded_at`):
- Nếu `account_points_used > 0` AND `account_points_refunded_at IS NULL`:
  - `current_points += account_points_used`
  - `account_points_refunded_at = NOW()`
  - Log `type = 'refund_account_direct'`

**Hủy `gift_redemptions` gắn với đơn** (chống trùng bằng `refunded` flag):
- Cho mỗi redemption có `status != 'cancelled'` AND `refunded = false`:
  - `status = 'cancelled'`, `refunded = true`
  - `current_points += points_used`
  - Hoàn tồn kho quà
  - Log `type = 'refund_gift'`

**KHÔNG đụng:**
- `instant_points_used`: chưa từng vào TK, đơn hủy thì discount biến mất theo đơn
- `points_to_earn`: chưa cộng vì status chưa từng = completed

**Hoàn tồn kho sản phẩm.** Set `status = 'cancelled'`.

#### Khi `refunded` (đơn đã `completed` rồi hoàn lại)

**Hoàn điểm tài khoản đã dùng giảm tiền** (như cancel — chống trùng bằng `account_points_refunded_at`):
- Cùng logic: hoàn `account_points_used` nếu chưa hoàn, log `refund_account_direct`

**Trừ lại `points_to_earn` đã cộng** (clamp 0, không âm):
- Nếu `points_earned_at IS NOT NULL` AND `points_to_earn > 0`:
  - `actual_revoke = LEAST(points_to_earn, current_points)`
  - `current_points -= actual_revoke`
  - Log `type = 'revoke'` với `delta = -actual_revoke`
  - Nếu clamp xảy ra: log thêm `type = 'clamp'`

**KHÔNG hoàn `instant_points_used`** (chỉ là discount; shop hoàn tiền `total` là đủ).

**Hủy `gift_redemptions` gắn**: tùy param `p_refund_gifts` (mặc định MVP: hoàn nếu khách trả quà).

### 10.5 Quy tắc clamp (KHÔNG ÂM ĐIỂM)
- DB constraint: `current_points >= 0`
- Khi trừ điểm mà `current_points` không đủ:
  - Trừ tối đa = `current_points` hiện tại (về 0)
  - Ghi log `type = 'clamp'` với reason: `"clamped from -X to 0 (had Y, needed Z)"`
- KHÔNG để `current_points` âm trong bất kỳ trường hợp nào

### 10.6 Công thức tính tiền & clamp (TK trước, SP sau)

**Định nghĩa:**
```
subtotal       = SUM(item.qty × item.unit_price)
shipping_fee   = phí ship (MVP: 0 hoặc cố định)
base_total     = subtotal + shipping_fee
points_to_earn_raw = SUM(item.qty × item.points_per_unit)
```

**Bước 1 — Áp điểm tài khoản (account) TRƯỚC:**
```
account_points_discount = min(account_points_used × 1000, base_total)
remaining_after_account = base_total - account_points_discount
```

**Bước 2 — Áp điểm sản phẩm (instant) SAU (nếu chọn "dùng ngay"):**
```
instant_points_used     = min(points_to_earn_raw, floor(remaining_after_account / 1000))
instant_points_discount = instant_points_used × 1000
```
(Nếu chọn "tích": `instant_points_used = 0`, `instant_points_discount = 0`)

**Bước 3 — Phần dư SP tích vào TK khi completed:**
```
points_to_earn = points_to_earn_raw − instant_points_used
```
(Nếu chọn "tích": `points_to_earn = points_to_earn_raw`, không có instant)

**Bước 4 — Tính total cuối:**
```
final_total = max(0, base_total − account_points_discount − instant_points_discount)
```

**Ràng buộc clamp:**
- `account_points_used + gift_points_used ≤ current_points` (không vượt điểm thật)
- `account_points_used ≤ floor(base_total / 1000)` (không tạo discount âm)
- `instant_points_used ≤ floor(remaining_after_account / 1000)` (không tạo discount âm)
- `final_total ≥ 0` luôn (tổng đơn không âm)
- **`points_to_earn = points_to_earn_raw − instant_points_used`** — phần dư SP tích vào TK khi completed, **KHÔNG bốc hơi**

**Ví dụ A — TK + SP cùng giảm tiền, có phần dư SP:**
- Đơn 240k, ship 0đ → base_total = 240.000
- Khách có 500 điểm TK, nhập 200 → account_used=200, account_discount=200.000
- remaining_after_account = 40.000
- Điểm SP = 80, chọn "dùng ngay" → instant_used = min(80, 40) = 40 → discount = 40.000
- final_total = 0
- **points_to_earn = 80 − 40 = 40** (phần dư carry, tích sau)
- TK sau đặt: 500 − 200 = 300
- Khi `completed`: TK = 300 + 40 = **340**

**Ví dụ B — Đơn nhỏ hơn điểm SP, không có TK:**
- Đơn 100k, TK = 0, SP = 200 điểm, chọn "dùng ngay"
- account_used = 0
- instant_used = min(200, 100) = 100 → giảm 100k
- final_total = 0
- **points_to_earn = 200 − 100 = 100** (phần dư tích sau)
- Khi `completed`: TK = 0 + 100 = **100** (khách trả 0đ + được tặng 100 điểm)

### 10.7 Audit log: `points_transactions`
Mọi thay đổi `current_points` PHẢI có **đúng 1 row** tương ứng. **KHÔNG xóa rows.**

| Type | Khi nào | Delta |
|---|---|---|
| `earn` | Đơn completed → cộng `points_to_earn` | + |
| `revoke` | Đơn refunded → trừ điểm thưởng đã cộng | − |
| `use_account_direct` | Khách dùng điểm TK giảm tiền đơn (lúc tạo đơn) | − |
| `refund_account_direct` | Hủy/refund đơn → hoàn điểm TK đã dùng giảm tiền | + |
| `redeem_gift` | Đổi quà (checkout/standalone/pdp) → trừ điểm TK | − |
| `refund_gift` | Hủy đổi quà → hoàn điểm TK | + |
| `clamp` | Trừ bị clamp về 0 (đi kèm `revoke`) | 0 hoặc thực tế |
| `admin_adjust` | Admin chỉnh tay (có lý do bắt buộc) | ± |

**KHÔNG có type cho `instant_points_used`** — vì điểm này không bao giờ đụng `current_points`, không cần row trong `points_transactions`. Chỉ là discount lưu trên `orders`.

---

## 11. MODULE: ĐỔI QUÀ

### 11.1 Hai luồng tách biệt

| Tiêu chí | Luồng A: trong checkout | Luồng B: độc lập |
|---|---|---|
| `source` | `'checkout'` | `'standalone'` (`/doi-qua`) hoặc `'pdp'` (PDP) |
| Phải có đơn hàng kèm? | ✅ Có | ❌ Không |
| `ref_order_id` | Là id của đơn | NULL |
| Địa chỉ | Dùng địa chỉ của đơn — KHÔNG nhập lại | Phải nhập đầy đủ trong form riêng |
| Trừ điểm khi nào | Khi tạo đơn (đồng thời) | Khi tạo redemption |
| Khách tự hủy? | Theo đơn (nếu đơn hủy thì quà hủy) | ❌ Không — chỉ admin |

### 11.2 Trang `/doi-qua`

```
┌─────────────────────────┐
│ ← Đổi quà bằng điểm     │
├─────────────────────────┤
│ Bạn có: 82 điểm 🎁      │
├─────────────────────────┤
│ Lưới 2 cột (card):      │
│ ┌──────┐ ┌──────┐       │
│ │ ảnh  │ │ ảnh  │       │
│ │Quà 1 │ │Quà 2 │       │
│ │ 50 đ │ │100 đ │       │
│ │[Đổi] │ │[Chưa │       │
│ │      │ │ đủ]  │       │
│ └──────┘ └──────┘       │
└─────────────────────────┘
```

- Yêu cầu đăng nhập
- Bấm [Đổi] → modal xác nhận → form nhập **đầy đủ** thông tin/địa chỉ → submit → tạo redemption + trừ điểm

### 11.3 Trạng thái redemption

```
pending ──► confirmed ──► shipping ──► completed
  │             │              │
  └─────────────┴──────────────┴──► [cancelled]
                                       (chỉ admin)
```

### 11.4 Hủy redemption
- Chỉ admin gọi
- Nếu đã `cancelled` HOẶC `refunded = true` → reject (chống hoàn trùng)
- Hoàn `points_used` về `current_points`
- Set `status = 'cancelled'`, `refunded = true`
- Log `type = 'refund_gift'`
- Hoàn tồn kho quà

### 11.5 Khi đơn có quà checkout bị hủy
- Tự động: redemption `gift_redemptions` gắn → `cancelled` + `refunded = true` + hoàn điểm + hoàn tồn kho quà
- Logic ở RPC `cancel_order` / `refund_completed_order`

---

## 12. MODULE: TÀI KHOẢN

### 12.1 Dashboard `/tai-khoan`
- "Xin chào, [tên]"
- 🎁 **Điểm hiện có: 82** (lớn, nổi bật)
- Card menu: Đơn hàng / Quà đã đổi / Thông tin / Đăng xuất

### 12.2 Đơn hàng `/tai-khoan/don-hang`
- Filter theo trạng thái
- Mỗi đơn: mã đơn, ngày, tổng, trạng thái, [Xem chi tiết]

### 12.3 Chi tiết đơn `/tai-khoan/don-hang/[ma-don]`
- Thông tin nhận hàng
- Sản phẩm (đầy đủ)
- Quà đi kèm (nếu có)
- Timeline trạng thái
- **Phần điểm — hiển thị chi tiết theo từng nguồn:**
  - Điểm sản phẩm sẽ tích: `points_to_earn` điểm (trạng thái: chưa cộng / đã cộng vào TK / đã thu hồi)
  - Điểm sản phẩm dùng ngay: `instant_points_used` điểm — giảm `instant_points_discount`đ
  - Điểm tài khoản dùng giảm tiền: `account_points_used` điểm — giảm `account_points_discount`đ (trạng thái: đã trừ TK / đã hoàn)
  - Quà đổi kèm + điểm đổi quà (nếu có) — trạng thái redemption
**UI nút hủy theo trạng thái:**
- `pending` → [Hủy đơn] → popup xác nhận → gọi `customer_cancel_order` → cancel ngay + hoàn điểm TK + hủy quà gắn + hoàn tồn kho
- `confirmed` → [Yêu cầu hủy] → popup nhập lý do → gọi `request_cancel_order` → set `cancel_requested_at` + tự động post tin nhắn vào chatbox + admin duyệt
- `shipping` → KHÔNG có nút hủy. Hiển thị: "Đơn đang được vận chuyển. Nếu cần hỗ trợ, vui lòng nhắn tin với shop bên dưới hoặc gọi hotline: ____"
- `completed` → KHÔNG có nút hủy. Hiển thị: "Đơn đã hoàn tất. Nếu cần đổi trả, nhắn tin với shop hoặc liên hệ hotline."
- `cancelled` / `refunded` → không có hành động (chatbox vẫn xem được lịch sử)

**Section "Trao đổi với shop"** — xem chi tiết §26 (Module Chatbox đơn hàng).

### 12.4 Quà đã đổi `/tai-khoan/qua-da-doi`
- Hiển thị cả luồng A và B
- Mỗi item: ảnh quà, tên, điểm đã dùng, source, trạng thái

### 12.5 Thông tin `/tai-khoan/thong-tin`
- Sửa: họ tên, SĐT, email
- Đổi mật khẩu
- Nút [Xóa tài khoản] (theo Nghị định 13/2023)

**KHÔNG có:**
- Mã giới thiệu
- Hệ thống CTV
- Điểm thưởng riêng / điểm CTV

---

## 13. MODULE: ADMIN

### 13.1 Quyền truy cập
- Yêu cầu `profiles.role = 'admin'`
- **Middleware Next.js** check role trước khi render trang admin
- **RLS** chặn role='customer' truy cập admin tables/RPC

### 13.2 Quản lý sản phẩm
- Bảng list: ảnh, tên, hãng, giá, tồn, **điểm tích**, trạng thái, hành động
- Thêm/sửa: form đầy đủ
- **Upload ảnh từ máy:**
  - Chọn nhiều file
  - **Upload TRỰC TIẾP từ client** đến Supabase Storage bằng `supabase.storage.from('products').upload(...)` — KHÔNG đi qua Server Action (tránh giới hạn bundle size 1MB của Cloudflare Workers Free + tránh upload 2 chặng)
  - Resize browser-side trước upload (max chiều dài 1920px), convert sang WebP
  - Path: `products/{product_id}/{uuid}.webp` (xem §27.5)
  - Sau khi upload xong → gọi Server Action update `products.images` jsonb với URLs mới
  - Max 5MB/file, max 10 ảnh/sản phẩm
- Xóa: **xóa mềm** (`is_active = false`), không xóa cứng

### 13.3 Quản lý hãng
- 15 hãng cố định **seed sẵn** — KHÔNG xóa được
- Sửa: logo, banner, story (TipTap rich text), meta SEO, thứ tự hiển thị
- Bật/tắt hiển thị

### 13.4 Quản lý quà
- CRUD đầy đủ
- Upload ảnh quà (tương tự sản phẩm)
- Set điểm cần đổi, tồn kho
- Bật/tắt

### 13.5 Quản lý đơn hàng
- Filter: trạng thái, ngày, khách, mã đơn
- Xem chi tiết đầy đủ
- **Đổi trạng thái** đi tuần tự: pending → confirmed → shipping → completed
- Mỗi lần đổi → gọi RPC tương ứng (đảm bảo atomic)

**UI nút hành động theo trạng thái:**
- `pending`: [Hủy đơn] → `cancel_order(id, reason)`. Có badge "Khách đã hủy" nếu khách tự hủy trước.
- `confirmed`: [Hủy đơn] → `cancel_order(id, reason)`. Nếu khách đã yêu cầu hủy (`cancel_requested_at IS NOT NULL`) → hiện badge **"Khách yêu cầu hủy: <lý do>"** + nút [Duyệt hủy] (gọi cancel_order) hoặc [Từ chối yêu cầu] (xóa flag).
- `shipping`: **KHÔNG có nút hủy trực tiếp**. Hiện cảnh báo: *"Đơn đang vận chuyển. Không thể hủy trực tiếp. Cần xác nhận hàng hoàn về kho trước khi hoàn điểm/kho. Liên hệ vận chuyển hoặc đợi hoàn về kho rồi xử lý qua quy trình refund."*
  - **Phase 2:** thêm nút [Tạo yêu cầu hoàn hàng] gọi `request_return_order`
- `completed`: KHÔNG có nút hủy. Có nút [Hoàn đơn / Refund] → `refund_completed_order(id, reason, p_refund_gifts)`
- `cancelled` / `refunded`: chỉ xem, không hành động

**Chatbox với khách:** mỗi đơn có panel chatbox bên cạnh thông tin đơn — xem §26. Trong list `/admin/don-hang`: badge **"💬 N"** nếu có N tin chưa đọc từ khách.

### 13.6 Quản lý yêu cầu đổi quà
- Hiển thị TẤT CẢ redemption (cả luồng A và B)
- Filter theo source, trạng thái
- Đổi trạng thái tương tự đơn hàng
- Hủy: gọi RPC `cancel_gift_redemption(id, reason)`

### 13.7 Quản lý câu chuyện thương hiệu
- Vào `/admin/thuong-hieu/[id]`
- **TipTap editor** với extensions:
  - `StarterKit` (bold→`<strong>`, italic→`<em>`, paragraph, list, blockquote)
  - `Heading.configure({ levels: [2, 3] })` — CHỈ H2, H3 (H1 dành cho tên brand)
  - `Link` (chỉ http/https/mailto)
  - `Image` (chỉ src từ Supabase Storage)
- HTML output → **sanitize-html server-side** trước khi lưu vào `brands.story_content` — xem §28
- Có nút Preview (render HTML đã sanitize) trước khi save
- Auto-gen meta description từ 160 ký tự đầu nếu admin để trống

### 13.8 Quản lý khách hàng
- Danh sách: tên, email/SĐT, ngày đăng ký, tổng đơn, tổng chi tiêu, điểm hiện có
- Chi tiết: lịch sử đơn, lịch sử đổi quà, lịch sử điểm (`points_transactions`)
- KHÔNG cho admin sửa điểm trực tiếp ở UI thông thường — chỉ qua RPC `admin_adjust_points` với **lý do bắt buộc**

### 13.9 Dashboard `/admin`
- Số đơn mới hôm nay / tuần này
- Số đơn pending cần xử lý
- Số yêu cầu đổi quà pending
- **Số tin nhắn chưa đọc từ khách** (qua chatbox đơn hàng)
- Doanh thu hôm nay / tuần này / tháng này
- Top sản phẩm bán chạy
- Top hãng bán chạy

---

## 14. MODULE: THƯƠNG HIỆU & CÂU CHUYỆN THƯƠNG HIỆU

### 14.1 Trang danh sách `/thuong-hieu`
- Grid 15 hãng (logo + tên)
- Bấm vào hãng → trang câu chuyện hãng

### 14.2 Trang hãng `/thuong-hieu/[brand-slug]`
- Banner hãng
- Logo + tên
- **Câu chuyện thương hiệu** (HTML từ admin — rich text dài)
- Lưới sản phẩm thuộc hãng
- Meta tags + OpenGraph + JSON-LD `Brand` schema (tốt cho SEO)

### 14.3 15 hãng cố định
Yingcool · RoyalSoft · Gooby · Honey · Bemom · Mamogom · Yacool · Rouya · Eom Eon · BB Nature · Momorabit · Merries · Ualarogo · Moony · Mompa.

Seed sẵn vào DB. Admin có thể sửa logo/story/banner/SEO nhưng KHÔNG xóa.

---

## 15. DATABASE SCHEMA

```sql
-- profiles (mở rộng auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  phone text,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  current_points integer not null default 0 check (current_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- brands
create table brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  banner_url text,
  story_content text,
  meta_title text,
  meta_description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- products
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand_id uuid not null references brands(id),
  size text,
  weight_range text,
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  points_per_unit integer not null default 0 check (points_per_unit >= 0),
  images jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- gifts
create table gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  description text,
  points_required integer not null check (points_required > 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- cart_items (chỉ user đã login)
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id),
  qty integer not null check (qty > 0),
  added_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,                 -- VB-YYYYMMDD-XXXX
  user_id uuid references profiles(id),
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipping','completed','cancelled','refunded')),
  subtotal integer not null check (subtotal >= 0),
  shipping_fee_original integer not null default 45000 check (shipping_fee_original >= 0),  -- giá ship gốc hiển thị (gạch ngang ở UI)
  shipping_fee integer not null default 0 check (shipping_fee >= 0),  -- ship thực tế tính vào total (MVP: luôn = 0)
  -- Nhóm A: điểm SẢN PHẨM (sinh từ đơn, không phải tài sản TK)
  points_to_earn integer not null default 0 check (points_to_earn >= 0),
  points_earned_at timestamptz,
  instant_points_used integer not null default 0 check (instant_points_used >= 0),
  instant_points_discount integer not null default 0 check (instant_points_discount >= 0),
  -- Nhóm B: điểm TÀI KHOẢN (điểm thật, đã trừ khỏi current_points khi tạo đơn)
  account_points_used integer not null default 0 check (account_points_used >= 0),
  account_points_discount integer not null default 0 check (account_points_discount >= 0),
  account_points_refunded_at timestamptz,

  -- Yêu cầu hủy (khách yêu cầu khi đơn ở 'confirmed', admin duyệt)
  cancel_requested_at timestamptz,
  cancel_request_reason text,

  total integer not null check (total >= 0),
  payment_method text not null default 'cod',
  shipping_name text not null,
  shipping_phone text not null,
  shipping_email text,
  province_code text not null,
  province_name text not null,
  district_code text not null,
  district_name text not null,
  ward_code text not null,
  ward_name text not null,
  address_detail text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- order_items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  qty integer not null check (qty > 0),
  unit_price_snapshot integer not null,
  points_per_unit_snapshot integer not null,
  product_name_snapshot text not null,
  product_image_snapshot text
);

-- gift_redemptions
create table gift_redemptions (
  id uuid primary key default gen_random_uuid(),
  redemption_code text unique not null,            -- DQ-YYYYMMDD-XXXX
  user_id uuid not null references profiles(id),
  gift_id uuid not null references gifts(id),
  points_used integer not null check (points_used > 0),
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipping','completed','cancelled')),
  refunded boolean not null default false,
  source text not null check (source in ('checkout','standalone','pdp')),
  ref_order_id uuid references orders(id),
  shipping_name text,
  shipping_phone text,
  shipping_email text,
  province_code text,
  province_name text,
  district_code text,
  district_name text,
  ward_code text,
  ward_name text,
  address_detail text,
  note text,
  gift_name_snapshot text not null,
  points_required_snapshot integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- order_messages (chatbox khách ↔ admin per đơn — xem §26)
create table order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  sender_type text not null check (sender_type in ('customer','admin','system')),
  sender_id uuid references profiles(id),                  -- NULL nếu sender_type='system'
  message text not null check (length(trim(message)) > 0),
  attachments jsonb not null default '[]'::jsonb,           -- array URL ảnh, max 3
  read_by_other boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_om_order on order_messages(order_id, created_at);
create index idx_om_unread on order_messages(order_id, sender_type)
  where read_by_other = false;

-- points_transactions (audit log — bất biến)
create table points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  delta integer not null,
  type text not null check (type in
    ('earn','revoke',
     'use_account_direct','refund_account_direct',
     'redeem_gift','refund_gift',
     'clamp','admin_adjust')),
  reason text,
  ref_order_id uuid references orders(id),
  ref_redemption_id uuid references gift_redemptions(id),
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_orders_user on orders(user_id, created_at desc);
create index idx_orders_status on orders(status);
create index idx_redemptions_user on gift_redemptions(user_id, created_at desc);
create index idx_pt_user on points_transactions(user_id, created_at desc);
create index idx_products_brand on products(brand_id) where is_active = true;
create index idx_products_search on products using gin(to_tsvector('simple', name));
```

### 15.1 Trigger

**Auto tạo `profiles` khi `auth.users` được tạo:**
```sql
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role, current_points)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer',
    0
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

**Auto cập nhật `updated_at`:**
```sql
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Áp dụng cho mọi bảng có cột updated_at
create trigger trg_profiles_updated_at        before update on profiles        for each row execute function set_updated_at();
create trigger trg_brands_updated_at          before update on brands          for each row execute function set_updated_at();
create trigger trg_products_updated_at        before update on products        for each row execute function set_updated_at();
create trigger trg_gifts_updated_at           before update on gifts           for each row execute function set_updated_at();
create trigger trg_orders_updated_at          before update on orders          for each row execute function set_updated_at();
create trigger trg_redemptions_updated_at     before update on gift_redemptions for each row execute function set_updated_at();
```

**Lưu ý:** `order_items`, `cart_items`, `points_transactions`, `order_messages` KHÔNG cần `updated_at` (immutable hoặc append-only).

---

## 16. RPC FUNCTIONS

Tất cả mutation liên quan đến **tiền/điểm/tồn kho** PHẢI đi qua RPC để đảm bảo atomic. Tất cả là `SECURITY DEFINER` và check `auth.uid()` + role bên trong.

| RPC | Mục đích | Người gọi |
|---|---|---|
| `place_order(p_input jsonb) → uuid` | Tạo đơn atomic. Validate `account_points_used + gift_points_used ≤ current_points`. **Trừ `account_points_used` + điểm đổi quà checkout khỏi `current_points` ngay.** KHÔNG cộng `points_to_earn`. KHÔNG đụng `instant_points_used` vào TK. | Customer đã login |
| `complete_order(p_order_id) → void` | Idempotent: chuyển đơn sang completed + cộng `points_to_earn` vào TK nếu chưa cộng. | Admin |
| `update_order_status(p_order_id, p_new_status, p_reason) → void` | Wrapper validate transitions, gọi RPC con. | Admin |
| `customer_cancel_order(p_order_id) → void` | **Khách tự hủy** đơn `pending` (chỉ pending, không cho confirmed/shipping/completed). Hoàn `account_points_used` (chống trùng `account_points_refunded_at`). Hủy gift_redemption gắn. Hoàn tồn kho. | Customer (chính chủ) |
| `cancel_order(p_order_id, p_reason) → void` | Admin hủy đơn. **CHỈ cho phép `pending` hoặc `confirmed`** — RAISE nếu `shipping` ("Đơn đang vận chuyển, vui lòng dùng quy trình hoàn hàng"). Logic giống `customer_cancel_order` + có `reason`. | Admin |
| `refund_completed_order(p_order_id, p_reason, p_refund_gifts boolean) → void` | Refund đơn đã `completed`. Hoàn `account_points_used` (nếu chưa). Trừ `points_to_earn` đã cộng (clamp 0). KHÔNG hoàn `instant_points_used`. Hủy gift_redemption nếu `p_refund_gifts=true`. | Admin |
| `request_cancel_order(p_order_id, p_reason) → void` | Customer yêu cầu hủy ở `confirmed`. **CHỈ cho phép confirmed** — RAISE nếu shipping/completed. Set `cancel_requested_at = NOW()` + `cancel_request_reason = p_reason`. **Tự động post 1 message vào `order_messages`** với `sender_type='system'`, content `"Khách yêu cầu hủy đơn. Lý do: <p_reason>"`. KHÔNG tự hủy đơn. Admin xem badge + chatbox và quyết định. | Customer |
| `send_order_message(p_order_id, p_message, p_attachments jsonb) → uuid` | Gửi tin nhắn vào chatbox đơn. Validate: customer chỉ gửi đơn của mình; admin gửi mọi đơn. Validate `attachments` array có max 3 URL. Insert vào `order_messages` với `sender_type` tự suy ra từ role. Trả về message_id. | Customer & Admin |
| `mark_order_messages_read(p_order_id) → void` | Đánh dấu tất cả tin của bên kia là đã đọc (`read_by_other = true`). Customer mark tin admin → đã đọc; admin mark tin customer → đã đọc. | Customer & Admin |
| `redeem_gift_standalone(p_input jsonb) → uuid` | Tạo redemption source='standalone'/'pdp'. Trừ điểm + tồn kho quà. | Customer đã login |
| `cancel_gift_redemption(p_id, p_reason) → void` | Hủy redemption độc lập (admin), hoàn điểm + tồn kho. | Admin |
| `admin_adjust_points(p_user_id, p_delta, p_reason) → void` | Chỉnh điểm thủ công với reason bắt buộc. | Admin |

**RPC dự kiến cho Phase 2 (chưa implement ở MVP — return flow cho đơn `shipping`):**

| RPC | Mục đích |
|---|---|
| `request_return_order(p_order_id, p_reason)` | Admin tạo yêu cầu hoàn hàng. `status: shipping → return_requested`. CHƯA hoàn kho/điểm/quà. |
| `admin_mark_returning(p_order_id)` | Hàng đang được vận chuyển trả về kho. `status: return_requested → returning`. |
| `admin_confirm_return_received(p_order_id, p_reason)` | Admin xác nhận đã nhận hàng/quà về kho. `status: returning → returned`. **Hoàn kho + hoàn `account_points_used` + hủy gift_redemption + tồn quà.** Nếu đơn từng `completed` (đã cộng `points_to_earn`) → trừ lại clamp 0. |

### 16.1 Pseudocode `place_order`

```
BEGIN TRANSACTION
  uid = auth.uid()
  SELECT current_points FROM profiles WHERE id = uid FOR UPDATE

  -- 1. Validate cart + tính cơ bản
  validate cart items (tồn tại, is_active, đủ tồn kho, giá khớp)
  subtotal              = SUM(qty × unit_price)
  shipping_fee_original = 45000              -- MVP free ship hiển thị
  shipping_fee          = 0                  -- MVP thực tế tính vào total
  base_total            = subtotal + shipping_fee
  points_to_earn_raw    = SUM(qty × points_per_unit)

  -- 2. Xử lý điểm TÀI KHOẢN TRƯỚC (giảm tiền)
  account_points_used = input.account_points_used (default 0)
  gift_points_used    = (nếu có gift checkout) input.gift.points_required ELSE 0

  IF account_points_used + gift_points_used > current_points:
    RAISE 'Không đủ điểm trong tài khoản'

  max_usable_account = floor(base_total / 1000)
  IF account_points_used > max_usable_account:
    RAISE 'Điểm tài khoản dùng vượt giá trị đơn'

  account_points_discount = account_points_used × 1000
  remaining_after_account = base_total - account_points_discount

  -- 3. Xử lý điểm SẢN PHẨM SAU (1 trong 2)
  IF input.product_point_choice = 'earn':
    instant_points_used     = 0
    instant_points_discount = 0
    points_to_earn          = points_to_earn_raw                  -- toàn bộ tích khi completed
  ELIF input.product_point_choice = 'use_instant':
    max_usable_instant      = floor(remaining_after_account / 1000)
    instant_points_used     = min(points_to_earn_raw, max_usable_instant)
    instant_points_discount = instant_points_used × 1000
    points_to_earn          = points_to_earn_raw - instant_points_used  -- PHẦN DƯ CARRY (tích khi completed)

  -- 4. Tính total cuối
  total = max(0, base_total - account_points_discount - instant_points_discount)

  -- 5. Trừ điểm tài khoản (atomic)
  IF account_points_used > 0:
    UPDATE profiles SET current_points = current_points - account_points_used WHERE id = uid
    INSERT points_transactions (
      user_id=uid, type='use_account_direct', delta=-account_points_used,
      ref_order_id=NEW_ORDER_ID, balance_after=...
    )

  -- 6. Đổi quà checkout (nếu có)
  IF input.gift_id IS NOT NULL:
    SELECT points_required, stock FROM gifts WHERE id = input.gift_id FOR UPDATE
    IF stock <= 0: RAISE 'Hết quà'
    UPDATE profiles SET current_points = current_points - points_required WHERE id = uid
    UPDATE gifts    SET stock          = stock - 1                         WHERE id = input.gift_id
    INSERT gift_redemptions (
      user_id=uid, gift_id=input.gift_id,
      source='checkout', ref_order_id=NEW_ORDER_ID,
      points_used=points_required,
      gift_name_snapshot=..., points_required_snapshot=...,
      ...
    )
    INSERT points_transactions (
      user_id=uid, type='redeem_gift', delta=-points_required,
      ref_order_id=NEW_ORDER_ID, ref_redemption_id=..., balance_after=...
    )

  -- 7. Tạo đơn
  INSERT orders (
    user_id=uid, order_code=gen_order_code(),
    status='pending',
    subtotal, shipping_fee_original, shipping_fee, total,
    points_to_earn, points_earned_at=NULL,
    instant_points_used, instant_points_discount,
    account_points_used, account_points_discount,
    account_points_refunded_at=NULL,
    cancel_requested_at=NULL, cancel_request_reason=NULL,
    payment_method='cod',
    shipping_name, shipping_phone, shipping_email,
    province_code, province_name, district_code, district_name,
    ward_code, ward_name, address_detail, note
  )
  INSERT order_items (... với snapshot price/points/name/image cho mỗi item)

  -- 8. Trừ tồn kho sản phẩm
  FOR EACH item IN cart:
    UPDATE products SET stock = stock - item.qty WHERE id = item.product_id

  RETURN NEW_ORDER_ID
COMMIT
```

### 16.2 Pseudocode `cancel_order` (& `customer_cancel_order`)

```
BEGIN TRANSACTION
  SELECT * FROM orders WHERE id = p_order_id FOR UPDATE

  -- Validate
  IF status IN ('cancelled','refunded'): RAISE 'Đã hủy/hoàn rồi'
  IF caller = customer:
    IF orders.user_id != auth.uid(): RAISE 'Không phải đơn của bạn'
    IF status != 'pending': RAISE 'Chỉ được tự hủy khi đơn đang pending'
  ELSE (admin):
    IF status = 'shipping':
      RAISE 'Đơn đang vận chuyển, vui lòng dùng quy trình hoàn hàng (return flow)'
    IF status NOT IN ('pending','confirmed'):
      RAISE 'Đơn ở trạng thái này dùng refund_completed_order thay vì cancel'

  -- 1. Hoàn điểm TÀI KHOẢN đã dùng giảm tiền (chống trùng)
  IF account_points_used > 0 AND account_points_refunded_at IS NULL:
    UPDATE profiles SET current_points = current_points + account_points_used
                  WHERE id = orders.user_id
    UPDATE orders SET account_points_refunded_at = NOW() WHERE id = p_order_id
    INSERT points_transactions (
      user_id=orders.user_id, type='refund_account_direct',
      delta=+account_points_used, ref_order_id=p_order_id, balance_after=...
    )

  -- 2. Hủy gift_redemptions gắn (hoàn điểm + tồn quà, chống trùng)
  FOR EACH r IN gift_redemptions WHERE ref_order_id = p_order_id
                                  AND status != 'cancelled' AND refunded = false:
    UPDATE gift_redemptions SET status='cancelled', refunded=true WHERE id = r.id
    UPDATE profiles SET current_points = current_points + r.points_used
                  WHERE id = orders.user_id
    UPDATE gifts SET stock = stock + 1 WHERE id = r.gift_id
    INSERT points_transactions (
      user_id=orders.user_id, type='refund_gift', delta=+r.points_used,
      ref_order_id=p_order_id, ref_redemption_id=r.id, balance_after=...
    )

  -- 3. Hoàn tồn kho sản phẩm
  FOR EACH item IN order_items WHERE order_id = p_order_id:
    UPDATE products SET stock = stock + item.qty WHERE id = item.product_id

  -- KHÔNG hoàn instant_points_used (sinh từ đơn, không phải tài sản TK)
  -- KHÔNG động points_to_earn (chưa cộng vì status chưa từng = completed)

  UPDATE orders SET status='cancelled', updated_at=NOW() WHERE id = p_order_id
COMMIT
```

### 16.3 Pseudocode `refund_completed_order`

```
BEGIN TRANSACTION
  SELECT * FROM orders WHERE id = p_order_id FOR UPDATE
  IF status != 'completed': RAISE 'Chỉ refund được đơn đã completed'

  -- 1. Hoàn điểm TÀI KHOẢN đã dùng giảm tiền (chống trùng)
  IF account_points_used > 0 AND account_points_refunded_at IS NULL:
    UPDATE profiles SET current_points = current_points + account_points_used
                  WHERE id = orders.user_id
    UPDATE orders SET account_points_refunded_at = NOW() WHERE id = p_order_id
    INSERT points_transactions (
      user_id=orders.user_id, type='refund_account_direct',
      delta=+account_points_used, ref_order_id=p_order_id, balance_after=...
    )

  -- 2. Trừ lại points_to_earn đã cộng (clamp 0, không âm)
  IF points_earned_at IS NOT NULL AND points_to_earn > 0:
    SELECT current_points FROM profiles WHERE id = orders.user_id FOR UPDATE
    actual = LEAST(points_to_earn, current_points)
    UPDATE profiles SET current_points = current_points - actual
                  WHERE id = orders.user_id
    INSERT points_transactions (
      user_id=orders.user_id, type='revoke', delta=-actual,
      ref_order_id=p_order_id, balance_after=...
    )
    IF actual < points_to_earn:
      INSERT points_transactions (
        user_id=orders.user_id, type='clamp', delta=0,
        reason='clamped: needed=' || points_to_earn || ' available=' || actual,
        ref_order_id=p_order_id, balance_after=...
      )

  -- 3. Hủy gift_redemptions gắn (chỉ khi p_refund_gifts=true)
  IF p_refund_gifts:
    FOR EACH r IN gift_redemptions WHERE ref_order_id = p_order_id
                                    AND status != 'cancelled' AND refunded = false:
      UPDATE gift_redemptions SET status='cancelled', refunded=true WHERE id = r.id
      UPDATE profiles SET current_points = current_points + r.points_used
                    WHERE id = orders.user_id
      UPDATE gifts SET stock = stock + 1 WHERE id = r.gift_id
      INSERT points_transactions (
        user_id=orders.user_id, type='refund_gift', delta=+r.points_used,
        ref_order_id=p_order_id, ref_redemption_id=r.id, balance_after=...
      )

  -- KHÔNG hoàn instant_points_used (chỉ là discount; refund tiền = total đã thu là đủ)

  -- 4. Hoàn tồn kho sản phẩm (mặc định: hoàn)
  FOR EACH item IN order_items WHERE order_id = p_order_id:
    UPDATE products SET stock = stock + item.qty WHERE id = item.product_id

  UPDATE orders SET status='refunded', updated_at=NOW() WHERE id = p_order_id
COMMIT
```

### 16.4 Pseudocode `complete_order`

```
BEGIN TRANSACTION
  SELECT * FROM orders WHERE id = p_order_id FOR UPDATE

  -- Validate transition
  IF status NOT IN ('shipping','completed'):
    RAISE 'Chỉ chuyển sang completed từ shipping (hoặc đã completed thì idempotent)'

  -- Idempotent: nếu đã cộng rồi → bỏ qua
  IF points_earned_at IS NOT NULL:
    UPDATE orders SET status='completed', updated_at=NOW() WHERE id = p_order_id
    RETURN

  -- Cộng points_to_earn (gồm phần dư carry nếu có) vào TK
  IF points_to_earn > 0:
    UPDATE profiles SET current_points = current_points + points_to_earn
                  WHERE id = orders.user_id
    INSERT points_transactions (
      user_id=orders.user_id, type='earn', delta=+points_to_earn,
      ref_order_id=p_order_id, balance_after=...
    )

  UPDATE orders SET
    status='completed',
    points_earned_at=NOW(),
    updated_at=NOW()
  WHERE id = p_order_id
COMMIT
```

### 16.5 Pseudocode `request_cancel_order`

```
BEGIN TRANSACTION
  SELECT * FROM orders WHERE id = p_order_id FOR UPDATE

  -- Validate
  IF orders.user_id != auth.uid(): RAISE 'Không phải đơn của bạn'
  IF status != 'confirmed':
    RAISE 'Chỉ được yêu cầu hủy khi đơn ở trạng thái confirmed'
  IF cancel_requested_at IS NOT NULL:
    RAISE 'Yêu cầu hủy đã được gửi trước đó'

  -- 1. Set flag yêu cầu hủy
  UPDATE orders SET
    cancel_requested_at = NOW(),
    cancel_request_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_order_id

  -- 2. Tự động post system message vào chatbox (xem §26.5)
  INSERT order_messages (
    order_id = p_order_id,
    sender_type = 'system',
    sender_id = NULL,
    message = 'Khách yêu cầu hủy đơn. Lý do: ' || p_reason,
    attachments = '[]',
    read_by_other = false  -- để admin thấy badge
  )
COMMIT
```

---

## 17. BẢO MẬT & RLS

### 17.1 Nguyên tắc
- Bật RLS cho tất cả bảng
- Default DENY
- Mọi mutation về tiền/điểm/tồn kho qua RPC `SECURITY DEFINER`
- Helper function `is_admin(uid)`

### 17.2 Helper

```sql
create or replace function is_admin(p_uid uuid) returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from profiles where id = p_uid and role = 'admin'
  )
$$;
```

### 17.3 Policies (tóm tắt)

| Bảng | Customer | Admin |
|---|---|---|
| `profiles` | SELECT/UPDATE chính mình | SELECT all |
| `products`, `brands`, `gifts` | SELECT khi `is_active = true` | ALL |
| `cart_items` | ALL khi `user_id = auth.uid()` | SELECT all |
| `orders`, `order_items` | SELECT chính mình; INSERT/UPDATE chỉ qua RPC | SELECT all; UPDATE chỉ qua RPC |
| `gift_redemptions` | SELECT chính mình; INSERT chỉ qua RPC | SELECT all; UPDATE chỉ qua RPC |
| `points_transactions` | SELECT chính mình; **không INSERT/UPDATE/DELETE** | SELECT all; INSERT chỉ qua RPC |
| `order_messages` | SELECT khi `EXISTS(orders WHERE id=order_id AND user_id=auth.uid())`; INSERT chỉ qua RPC `send_order_message`; UPDATE `read_by_other` chỉ qua RPC `mark_order_messages_read` | SELECT all; INSERT/UPDATE chỉ qua RPC |

### 17.4 Yêu cầu bắt buộc
- User chỉ xem được đơn của chính mình
- User chỉ xem được quà đã đổi của chính mình
- User chỉ xem được tin nhắn chatbox của đơn mình
- User KHÔNG xem được dữ liệu admin
- Customer KHÔNG truy cập `/admin/*`
- OAuth user cũng có profile role='customer'
- `points_transactions` KHÔNG cho phép DELETE/UPDATE từ bất kỳ ai (immutable audit log) — chỉ INSERT qua RPC SECURITY DEFINER

### 17.5 Storage RLS

Policies cho Supabase Storage buckets:

| Bucket | Policy |
|---|---|
| `products`, `brands`, `gifts` | SELECT (anon + auth): public; INSERT/UPDATE/DELETE: chỉ admin |
| `order-message-attachments` | SELECT (auth): customer chỉ folder `{auth.uid()}/...`; admin: all. INSERT (auth): customer chỉ folder `{auth.uid()}/...`; admin: all |

---

## 18. SEO

### 18.1 Yêu cầu
- Mỗi trang có meta title + meta description
- OpenGraph + Twitter card
- JSON-LD structured data:
  - PDP: schema `Product` (name, image, brand, offers, sku)
  - Trang hãng: schema `Brand`
  - Trang chủ: schema `Organization`
- `sitemap.xml` tự sinh từ DB
- `robots.txt` allow tất cả trừ `/admin`, `/tai-khoan`, `/auth`, `/dat-hang-thanh-cong`

### 18.2 URL slug
- Slug sản phẩm: `tên-san-pham-size-x` (kebab, không dấu)
- Slug hãng: tên hãng kebab (vd: `royal-soft`)
- Auto-gen khi tạo, admin có thể sửa thủ công

### 18.3 Câu chuyện thương hiệu
- Long-form content do admin viết — mỏ vàng SEO
- Có heading hierarchy đúng (H1 = tên hãng, H2/H3 cho mục con)
- Internal link từ trang hãng → các sản phẩm của hãng

---

## 19. HIỆU NĂNG & ACCESSIBILITY

### 19.1 Performance budget
- LCP < 2.5s trên 4G
- CLS < 0.1
- INP < 200ms
- Initial JS bundle < 200KB gzip
- Ảnh: WebP, resize browser-side khi upload (max 1920px chiều dài), lazy load (trừ hero), `srcset` responsive
- Dùng `<Image>` của Next.js với prop **`unoptimized`** (vì Cloudflare Pages edge KHÔNG hỗ trợ Next/Image API) — serve trực tiếp từ Supabase Storage URL. Xem §29.

### 19.2 Accessibility
- Tap target ≥ 44×44px
- WCAG AA contrast ratio
- Alt text cho mọi ảnh
- Focus visible cho keyboard nav
- Form `<label>` đúng (htmlFor, aria-label)
- Input type/inputmode chuẩn:
  - SĐT: `type="tel"`, `inputmode="numeric"`
  - Email: `type="email"`
  - Số: `inputmode="numeric"`

### 19.3 Loading & error states
- Skeleton thay vì spinner full-page
- Empty states (giỏ trống, chưa có đơn, chưa đủ điểm)
- Error states rõ ràng
- Toast cho thao tác nhỏ (thêm giỏ, copy mã)

---

## 20. TUÂN THỦ PHÁP LUẬT VN

- Trang **Chính sách bảo mật** (Nghị định 13/2023 về bảo vệ dữ liệu cá nhân)
- Trang **Điều khoản sử dụng**
- Trang **Chính sách đổi trả**
- Checkbox đồng ý điều khoản khi đăng ký (BẮT BUỘC)
- Checkbox đồng ý nhận marketing (TÁCH RIÊNG, không gộp vào điều khoản)
- Quyền **xóa tài khoản** ở `/tai-khoan/thong-tin`

---

## 21. TEST CHECKLIST

Trước khi launch, mọi mục dưới đây phải pass:

**Trang khách hàng:**
1. ☐ Trang chủ mobile hiển thị đẹp
2. ☐ Menu mở/đóng dễ dùng
3. ☐ Chọn hãng → lọc sản phẩm
4. ☐ List sản phẩm không vỡ, không kéo ngang
5. ☐ Card sản phẩm dễ bấm
6. ☐ Thêm giỏ hàng OK, toast xuất hiện
7. ☐ Tăng/giảm qty trong giỏ
8. ☐ Checkout không kéo ngang
9. ☐ Tổng tiền đúng, cập nhật ngay khi đổi tùy chọn
10. ☐ Dùng điểm trừ trực tiếp đúng
11. ☐ Đổi quà trong checkout mở bottom sheet đúng
12. ☐ Đổi quà từ PDP mở form địa chỉ đúng
13. ☐ Đổi quà từ /doi-qua tạo redemption đúng

**Auth:**
14. ☐ Đăng ký bằng email được
15. ☐ Đăng nhập email được
16. ☐ Đăng nhập Google được
17. ☐ Đăng nhập Facebook được
18. ☐ Profile tự tạo sau OAuth
19. ☐ F5 không bị logout
20. ☐ Logout xóa session

**Tài khoản:**
21. ☐ Hiển thị đơn hàng đúng (chỉ của user)
22. ☐ Hiển thị quà đã đổi đúng
23. ☐ Hiển thị điểm hiện có đúng

**Hệ thống điểm:**
24. ☐ Đặt đơn, chọn "tích" → `points_to_earn` lưu, KHÔNG cộng TK
25. ☐ Admin set completed → cộng `points_to_earn` đúng vào TK
26. ☐ Admin set completed lần 2 → KHÔNG cộng lần 2 (idempotent)
27. ☐ Đặt đơn dùng `instant_points_used` → TK KHÔNG đổi (chưa từng vào TK)
28. ☐ Hủy đơn pending có `instant_points_used` → TK KHÔNG đổi (không hoàn)
29. ☐ Đặt đơn dùng `account_points_used = N` → TK trừ ngay N điểm
30. ☐ Hủy đơn pending có `account_points_used = N` → TK hoàn ngay +N + set `account_points_refunded_at`
31. ☐ Hủy đơn 2 lần → KHÔNG hoàn 2 lần (`account_points_refunded_at` đã có)
32. ☐ Refund đơn completed → hoàn `account_points_used` (nếu chưa) + trừ `points_to_earn` clamp 0; KHÔNG hoàn `instant_points_used`
33. ☐ Đặt đơn dùng `account_points_used + gift_points_used > current_points` → REJECT
34. ☐ Đặt đơn `account_points_used > floor(base_total/1000)` → REJECT (TK trước)
35. ☐ Đặt đơn `points_to_earn_raw > floor(remaining_after_account/1000)` & chọn "use_instant" → `instant_points_used` bị clamp về max, **phần dư = `points_to_earn` được lưu để tích vào TK khi completed** (không bốc hơi)
36. ☐ Đối xứng: TK=500, đặt đơn dùng 100 account + 300 gift → TK=100. Hủy → TK=500
37. ☐ Đối xứng: TK=50, đặt đơn instant 80 → TK=50. Hủy → TK=50
38. ☐ Đối xứng: TK=50, đặt đơn earn 120 → TK=50. Completed → TK=170. Refund → TK=50
39. ☐ Đổi quà standalone → trừ điểm đúng
40. ☐ Admin hủy redemption → hoàn điểm đúng, không hoàn 2 lần
41. ☐ Đơn có quà checkout, hủy đơn → quà cancel + hoàn điểm + hoàn tồn kho
42. ☐ Mọi thay đổi `current_points` có row trong `points_transactions` (audit hoàn chỉnh)

**Hủy đơn theo trạng thái:**
43. ☐ Khách hủy đơn `pending` → cancel ngay + hoàn điểm TK + hủy quà gắn + hoàn tồn kho
44. ☐ Khách hủy đơn `confirmed` → REJECT (chỉ pending tự hủy được)
45. ☐ Khách yêu cầu hủy `confirmed` → `cancel_requested_at` set + admin thấy badge
46. ☐ Khách yêu cầu hủy đơn `shipping`/`completed` → REJECT (UI chỉ hiển thị hotline)
47. ☐ Admin gọi `cancel_order` với `pending` → OK
48. ☐ Admin gọi `cancel_order` với `confirmed` → OK
49. ☐ Admin gọi `cancel_order` với `shipping` → RAISE "Đơn đang vận chuyển..."
50. ☐ Admin gọi `cancel_order` với `completed` → RAISE (dùng refund_completed_order)
51. ☐ Admin từ chối yêu cầu hủy → xóa `cancel_requested_at`, đơn tiếp tục bình thường
52. ☐ Đơn 0đ (dùng 100% điểm): cho phép tạo đơn, COD vẫn xác nhận

**Admin:**
53. ☐ Admin upload ảnh sản phẩm OK (resize, max size, max count)
54. ☐ Admin sửa câu chuyện thương hiệu OK (TipTap)
55. ☐ Admin đổi trạng thái đơn đúng tuần tự
56. ☐ Admin không thể đổi từ pending → completed (skip step)
57. ☐ Admin KHÔNG thấy nút hủy ở đơn `shipping` (chỉ cảnh báo)
58. ☐ Admin thấy badge "Khách yêu cầu hủy" khi `cancel_requested_at IS NOT NULL`
59. ☐ RLS chặn customer truy cập `/admin/*`

**Chatbox đơn hàng:**
60. ☐ Khách gửi tin từ trang chi tiết đơn → admin nhận realtime, không cần refresh
61. ☐ Admin gửi tin → khách nhận realtime
62. ☐ Khách upload 1-3 ảnh đính kèm → resize browser-side, hiển thị ở 2 phía
63. ☐ Khách upload >3 ảnh → REJECT với lỗi
64. ☐ Khách gửi tin về đơn của user khác → REJECT (RLS)
65. ☐ Khi khách bấm "Yêu cầu hủy" → `request_cancel_order` set flag + tự động tạo system message vào chatbox
66. ☐ Mở trang chi tiết đơn → tự động `mark_order_messages_read`
67. ☐ Admin list đơn hiển thị badge "💬 N" cho đơn có N tin chưa đọc từ khách
68. ☐ Dashboard admin hiển thị tổng số tin chưa đọc

**Bảo mật:**
69. ☐ User A KHÔNG xem được đơn user B
70. ☐ User A KHÔNG xem được redemption user B
71. ☐ User A KHÔNG xem được chatbox đơn user B
72. ☐ Customer không gọi được RPC admin

**Build:**
73. ☐ Console KHÔNG có lỗi đỏ
74. ☐ `npm run build` PASS
75. ☐ Lighthouse mobile score ≥ 85 (Performance)

---

## 22. QUY ƯỚC PHÁT TRIỂN

- **KHÔNG** thêm tính năng ngoài tài liệu này
- **KHÔNG** sửa phần không liên quan đến task hiện tại
- **KHÔNG** làm hỏng checkout/cart/orders/admin/điểm/đổi quà
- **KHÔNG** lưu ảnh/base64 trong localStorage
- **Frontend KHÔNG tự tính điểm/tiền** — chỉ hiển thị; backend là nguồn sự thật
- Mọi mutation tiền/điểm/tồn kho qua RPC (SECURITY DEFINER, atomic)
- Sau mỗi feature: `npm run build` PASS, console không lỗi đỏ
- Code style: TypeScript strict, no `any`
- Commit message tiếng Việt hoặc Anh đều được, miêu tả rõ scope

---

## 23. LỘ TRÌNH TRIỂN KHAI

| Phase | Nội dung | Thời gian dự kiến |
|---|---|---|
| **Phase 0** | Khởi tạo Next.js + Tailwind + Supabase. Apply migration đầy đủ. Seed 15 hãng. | 1–2 ngày |
| **Phase 1** | Trang khách public: chủ, list SP, PDP, trang hãng. Auth (email + Google + FB). Giỏ hàng (localStorage). | 3–5 ngày |
| **Phase 2** | Checkout đầy đủ. Hệ thống điểm trong checkout. Đổi quà checkout. Trang `/doi-qua`. PDP đổi quà. | 3–5 ngày |
| **Phase 3** | Tài khoản: dashboard, đơn hàng, quà đã đổi, thông tin. Theo dõi đơn. | 2–3 ngày |
| **Phase 4** | Admin: CRUD sản phẩm + upload, hãng + câu chuyện, quà, đơn, redemption, khách hàng. | 4–6 ngày |
| **Phase 5** | SEO + meta tags + sitemap + JSON-LD. Performance optimize. Accessibility audit. Test toàn diện. | 2–3 ngày |
| **Phase 6** | **Deploy Cloudflare Pages**: cài `@cloudflare/next-on-pages`, tạo KV namespace cho cache revalidate, connect domain, set env vars production. Test E2E trên domain thật. | 1–2 ngày |

**Tổng MVP:** 16–27 ngày làm việc cho 1 dev fulltime.

### 23.1 Lưu ý deploy Cloudflare

- Dùng adapter **`@cloudflare/next-on-pages`** để build Next.js cho Cloudflare Pages
- Tạo **Cloudflare KV namespace** để hỗ trợ `revalidateTag`/`revalidatePath` (Next.js cần persistent cache, Cloudflare KV thay role này)
- **Image optimization:** không dùng Next/Image optimize trên edge (không hỗ trợ). Serve trực tiếp từ Supabase Storage URL — đã resize browser-side trước upload (max 1920px).
- **Sanitize-html:** kiểm tra compat với edge runtime; nếu lỗi → fallback `xss` package (đã có sẵn trong §28.2 là backup)
- **Server Actions:** hoạt động OK trên `@cloudflare/next-on-pages` v2+
- **Domain:** trỏ DNS qua Cloudflare → enable Pages project

### 23.2 Chiến lược Free vs Paid (chốt khi deploy Phase 6)

**Phase 0–5 (code & test local):**
- KHÔNG phụ thuộc Cloudflare Paid
- Code, test, build local hoạt động độc lập
- Mọi rule trong §29 phải áp dụng để giữ bundle nhẹ + edge-compatible

**Phase 6 (deploy thật):** quyết định dựa trên kết quả build thực tế

- **Thử Free trước** nếu:
  - Build bundle gọn (< 1MB sau minify)
  - Sanitize-html / TipTap không làm phình runtime public
  - Server Actions chạy < 10ms CPU time
  - Test E2E pass

- **Nâng lên Paid ($5/tháng) ngay** nếu gặp **bất kỳ** lỗi:
  - CPU time limit (10ms) bị vượt
  - Bundle size > 1MB
  - Pages Functions timeout
  - Sanitize-html hoặc TipTap làm bundle nặng quá mức
  - Server Action chậm/timeout

**Khuyến nghị vận hành (production bán hàng thật):**
- **Nên dùng Paid** để ổn định
- Chi phí $5/tháng chấp nhận được cho web TMĐT thật
- KHÔNG để web bán hàng bị chậm/lỗi chỉ vì cố dùng Free
- Free chỉ phù hợp giai đoạn MVP demo, traffic thấp, không có khách hàng thật

**Yêu cầu code (giữ luôn edge-compatible):**
- TipTap chỉ dùng trong admin route, **lazy load** nếu có thể (`dynamic(() => import(...), { ssr: false })`)
- Sanitize-html chỉ chạy server-side khi **lưu** brand story (Server Action) — KHÔNG bundle vào trang public
- KHÔNG đưa thư viện quá nặng vào runtime của bất kỳ trang public nào nếu không cần
- Lazy-load các module admin riêng — không cùng bundle với public

---

## 24. PHỤ LỤC

### Phụ lục A — 15 hãng cố định
Yingcool, RoyalSoft, Gooby, Honey, Bemom, Mamogom, Yacool, Rouya, Eom Eon, BB Nature, Momorabit, Merries, Ualarogo, Moony, Mompa.

### Phụ lục B — Cấu trúc thư mục dự kiến

```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                         # /
│   │   ├── san-pham/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── thuong-hieu/
│   │   │   ├── page.tsx
│   │   │   └── [brand-slug]/page.tsx
│   │   ├── gio-hang/page.tsx
│   │   ├── thanh-toan/page.tsx
│   │   ├── dat-hang-thanh-cong/[ma-don]/page.tsx
│   │   └── doi-qua/page.tsx
│   ├── (auth)/
│   │   ├── dang-nhap/page.tsx
│   │   ├── dang-ky/page.tsx
│   │   ├── quen-mat-khau/page.tsx
│   │   └── auth/callback/route.ts
│   ├── tai-khoan/
│   │   ├── page.tsx
│   │   ├── don-hang/page.tsx
│   │   ├── don-hang/[ma-don]/page.tsx
│   │   ├── qua-da-doi/page.tsx
│   │   └── thong-tin/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                       # check role
│   │   ├── page.tsx
│   │   ├── san-pham/...
│   │   ├── thuong-hieu/...
│   │   ├── qua/...
│   │   ├── don-hang/...
│   │   ├── yeu-cau-doi-qua/...
│   │   └── khach-hang/...
│   ├── api/                                 # nếu cần API routes
│   ├── sitemap.ts                           # auto-gen sitemap
│   ├── robots.ts
│   └── layout.tsx
├── components/
│   ├── ui/                                  # primitives: Button, Input, Sheet, Toast
│   ├── product/                             # ProductCard, ProductGallery, etc
│   ├── checkout/                            # CheckoutForm, PointsBox, GiftPicker
│   └── admin/
├── lib/
│   ├── supabase/
│   │   ├── client.ts                        # browser
│   │   ├── server.ts                        # server components
│   │   └── admin.ts                         # service-role (server only)
│   ├── stores/
│   │   └── cart.ts                          # Zustand
│   ├── validators/                          # Zod schemas
│   ├── data/
│   │   └── vn-administrative.json           # 63 tỉnh + huyện + xã
│   └── utils/
├── public/
│   └── images/
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql
│   │   ├── 0002_rls.sql
│   │   ├── 0003_rpc.sql
│   │   └── 0004_seed_brands.sql
│   └── seed.sql
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Phụ lục C — Quy ước mã đơn hàng / mã đổi quà
- Đơn hàng: `VB-YYYYMMDD-XXXX` (X = số tăng dần / random alnum 4 ký tự)
- Đổi quà: `DQ-YYYYMMDD-XXXX`

---

## 25. CẢNH BÁO & CÂU HỎI MỞ

Các điểm dưới đây cần xem xét lại trước khi code Phase 2. Hiện tại tài liệu đã ghi theo quyết định ở rule, nhưng có rủi ro nghiệp vụ cần làm rõ:

### 25.A ✅ ĐÃ GIẢI QUYẾT — 2 nguồn điểm tách biệt + đối xứng cho hủy đơn

**Quyết định cuối (chốt 2026-05-08):** Tách rõ **2 nguồn điểm** trong checkout, mỗi nguồn có lifecycle riêng:

| Nguồn | Tên cột | Có động `current_points` không? | Hoàn khi hủy? |
|---|---|---|---|
| Điểm SP — tích vào TK | `points_to_earn` | Chỉ khi `completed` | Trừ lại nếu refund (clamp 0) |
| Điểm SP — dùng ngay | `instant_points_used` | ❌ KHÔNG bao giờ | ❌ Không (chỉ là discount đơn) |
| Điểm TK — giảm tiền | `account_points_used` | ✅ Trừ ngay khi tạo đơn | ✅ Hoàn (chống trùng) |
| Điểm TK — đổi quà | `gift_redemptions.points_used` | ✅ Trừ ngay khi tạo đơn | ✅ Hoàn (chống trùng) |

**Đối xứng được kiểm chứng qua 3 ví dụ:**
1. TK=500. Đặt đơn dùng 100 account + 300 gift → TK=100. Hủy → TK=500 ✅
2. TK=50. Đặt đơn instant 80 → TK=50. Hủy → TK=50 ✅
3. TK=50. Đặt đơn earn 120 → TK=50. Completed → TK=170. Refund → TK=50 ✅

**Hệ quả:**
- Không có vector lạm dụng → khách tự hủy đơn `pending` được
- Tên cũ `points_used_direct` đổi thành `instant_points_used` để **không nhầm với điểm tài khoản**
- Bỏ cờ `points_refunded` (đổi tên thành `account_points_refunded_at` để chống hoàn trùng cho điểm TK)
- Thêm types `use_account_direct`, `refund_account_direct` vào `points_transactions`

### 25.B ✅ ĐÃ GIẢI QUYẾT — Phần dư SP tích vào TK (không bốc hơi)

**Quyết định cuối (chốt 2026-05-08):** Khi khách chọn "dùng ngay" mà `instant_points_used` bị clamp (do `remaining_after_account` không đủ), phần dư = `points_to_earn_raw − instant_points_used` được lưu vào `points_to_earn` và sẽ **tự động cộng vào TK khi đơn `completed`**.

**Đồng thời:** Đổi thứ tự ưu tiên giảm tiền sang **TK trước, SP sau** — để khách dùng dứt điểm điểm thật, phần dư SP tự nhiên thuộc về phần "tích" vào TK.

**Hệ quả:** Khách KHÔNG bao giờ bị mất điểm sản phẩm. UX công bằng. Implementation: chỉ thay đổi cách tính `points_to_earn` ban đầu trong RPC `place_order` (xem §16.1). Lifecycle khác giữ nguyên.

### 25.C ✅ ĐÃ GIẢI QUYẾT — Phí ship MVP

**Quyết định cuối (chốt 2026-05-08):** Free ship toàn quốc cho mọi đơn MVP.
- DB: `shipping_fee_original = 45.000đ` + `shipping_fee = 0`
- UI: hiển thị ~~45.000đ~~ Miễn phí (tạo cảm giác khuyến mãi)
- Backend tính: `base_total = subtotal + shipping_fee = subtotal + 0`

**Chuyển sang Phase 2:** tích hợp GHN/GHTK tính ship thật theo địa chỉ.

### 25.D ✅ ĐÃ GIẢI QUYẾT — Sanitize HTML brand story chống XSS

**Quyết định cuối (chốt 2026-05-08):** Dùng `sanitize-html` server-side với whitelist chặt chẽ trước khi lưu DB. Thêm sanitize lớp client-side trước render. Chi tiết đầy đủ ở **§28**.

**Tóm tắt:**
- 12 tag được phép: `p, h2, h3, strong, em, ul, ol, li, blockquote, a, img, br`
- Cấm: script, iframe, style, form, input, button, video, audio, object, embed, svg, canvas, table (table chuyển Phase 2 nếu cần)
- Cấm mọi `on*` event handlers
- Link `href` chỉ `http/https/mailto`; ảnh `src` chỉ Supabase Storage HTTPS
- Auto thêm `rel="noopener noreferrer"` cho `target="_blank"`

### 25.E ✅ ĐÃ GIẢI QUYẾT — Edge cases về điểm

**1. Đơn về 0đ (dùng 100% điểm):** ✅ **CHO PHÉP** đặt đơn 0đ. COD vẫn xác nhận, khách nhận hàng không trả tiền.

**2. Hủy đơn ở `shipping`:** ✅ **CẤM hủy trực tiếp.** Xem §10.2.1 — admin chỉ chuyển `shipping → completed` rồi dùng `refund_completed_order` nếu cần hoàn. Phase 2 sẽ thêm return flow chuẩn.

**3. Hủy đổi quà standalone:** ✅ Đã có rule (§11.4) — `cancel_gift_redemption` chống trùng bằng `refunded` flag.

**4. Race condition đổi quà cuối:** ✅ Đã giải bằng `SELECT ... FOR UPDATE` trong RPC `redeem_gift_standalone` và `place_order`.

---

## 26. MODULE: CHATBOX ĐƠN HÀNG

### 26.1 Mục đích
Cho phép khách hàng và admin trao đổi trực tiếp trong context của một đơn hàng cụ thể. Use cases:
- Khách muốn đổi địa chỉ giao
- Khách yêu cầu hủy đơn ở `confirmed` (tích hợp với `request_cancel_order`)
- Khách hỏi tình trạng giao hàng
- Admin chủ động liên hệ (vd: SP hết hàng, đề xuất thay)
- Lịch sử chat lưu vĩnh viễn theo đơn — kể cả sau khi đơn `cancelled`/`refunded`

### 26.2 Phạm vi
- Chat **per đơn hàng** (gắn `order_id`), không phải chat tổng quát
- Chỉ giữa **1 customer** (chủ đơn) và **admin team** (mọi admin đều thấy/trả lời được)
- Hỗ trợ text + ảnh đính kèm (max 3 ảnh/tin, max 2MB/ảnh)
- Realtime qua **Supabase Realtime** (không polling)

### 26.3 UI khách (trong `/tai-khoan/don-hang/[ma-don]`)

```
┌─────────────────────────────────┐
│ 💬 Trao đổi với shop             │
├─────────────────────────────────┤
│ [Khách 14:20]                    │
│ Mình muốn đổi địa chỉ thành ABC  │
│ [📷 ảnh 1] [📷 ảnh 2]            │
├─────────────────────────────────┤
│ [Shop 14:25]                     │
│ Dạ chị cho em xin địa chỉ mới   │
├─────────────────────────────────┤
│ [System 14:30]                   │
│ Khách yêu cầu hủy đơn.           │
│ Lý do: đặt nhầm size              │
├─────────────────────────────────┤
│ [Nhập tin nhắn...]               │
│ [📎 Đính kèm ảnh]      [Gửi]    │
└─────────────────────────────────┘
```

- Subscribe `order_messages` filter `order_id` → tin mới hiện ngay
- Auto `mark_order_messages_read` khi mở trang
- System messages (`sender_type='system'`) hiển thị màu khác, biểu tượng riêng
- Phân biệt rõ `[Khách]` / `[Shop]` / `[System]`

### 26.4 UI admin (trong `/admin/don-hang/[id]`)

- Panel chatbox hiển thị **bên cạnh** thông tin đơn (desktop) hoặc tab riêng (mobile)
- Layout giống §26.3
- **Trong list `/admin/don-hang`:** badge **"💬 N"** trên mỗi dòng đơn nếu có N tin chưa đọc từ khách
- **Trong sidebar admin:** counter tổng tin chưa đọc
- **Trong dashboard `/admin`:** "Số tin chưa đọc" — bấm vào → list đơn có tin mới

### 26.5 Tích hợp với `request_cancel_order` (auto-post)

Khi khách bấm [Yêu cầu hủy] ở đơn `confirmed`:
1. Popup nhập lý do
2. Submit → gọi RPC `request_cancel_order(order_id, reason)`
3. RPC set `cancel_requested_at = NOW()`, `cancel_request_reason = reason`
4. RPC **đồng thời** insert 1 row `order_messages` với:
   - `sender_type = 'system'`
   - `sender_id = NULL`
   - `message = 'Khách yêu cầu hủy đơn. Lý do: ' || p_reason`
   - `read_by_other = false` (admin sẽ đọc)
5. Realtime push tin tới UI admin

→ Admin xem chatbox thấy message system này + badge "Khách yêu cầu hủy" trên đơn → quyết định hủy hoặc từ chối → có thể nhắn lại trong chatbox để giải thích.

### 26.6 Realtime

- Sử dụng Supabase Realtime: subscribe `postgres_changes` trên bảng `order_messages`
- Customer subscribe: `WHERE order_id = (đơn đang xem) AND order.user_id = auth.uid()`
- Admin subscribe: `WHERE order_id = (đơn đang xem)`
- Toàn bộ admin nhận realtime cho mọi đơn (qua Realtime broadcast hoặc subscribe global filter `sender_type = 'customer'` ở dashboard)

### 26.7 Upload ảnh đính kèm

- Bucket Supabase Storage: `order-message-attachments`
- Path: `{user_id}/{order_id}/{uuid}.webp`
- Quy tắc:
  - Max **3 ảnh/tin**
  - Max **2MB/ảnh** sau resize
  - Resize browser-side trước upload: max chiều dài 1280px, format WebP/JPEG
  - Validate MIME type ở client + server
- Lưu URL vào cột `attachments` của `order_messages` (jsonb array)
- RLS Storage:
  - Customer: upload/đọc thư mục `{user_id}/...` của mình
  - Admin: đọc tất cả

### 26.8 Đánh dấu đã đọc

- `read_by_other`: bool, mặc định `false`
- Customer mở trang chi tiết đơn → gọi `mark_order_messages_read` → set `true` cho mọi tin có `sender_type='admin'` của đơn này
- Admin mở chatbox → gọi `mark_order_messages_read` → set `true` cho mọi tin có `sender_type='customer'` của đơn này
- System messages: customer mở thấy thì cũng mark là đã đọc (vì là tin do hệ thống tạo từ hành vi của khách)

### 26.9 Validation
- `message` không trống (sau trim)
- `attachments` array tối đa 3 phần tử
- Mỗi URL trong `attachments` phải là URL Supabase Storage hợp lệ
- Customer chỉ gửi tin vào đơn của chính mình (RLS + RPC validate)
- Admin có thể gửi tin vào mọi đơn

### 26.10 Lưu ý vận hành
- Khi đơn `cancelled`/`refunded`: chatbox vẫn xem được lịch sử nhưng KHÔNG cho gửi tin mới (read-only). UI hiển thị thông báo "Đơn đã đóng, không thể gửi tin mới."
- Khi xóa đơn (rất hiếm — chỉ qua admin RPC đặc biệt): xóa cascade `order_messages` (foreign key `ON DELETE CASCADE`). Ảnh trên Storage cần job dọn riêng (phase 2).
- Không có chức năng xóa/sửa tin nhắn ở MVP (audit trail). Phase 2 có thể thêm soft delete cho admin.

---

## 27. MODULE: CACHE & CẬP NHẬT REALTIME ADMIN

### 27.1 Mục tiêu

Đảm bảo trải nghiệm cập nhật dữ liệu trong admin **đồng bộ và đáng tin cậy**:

1. Admin bấm "Lưu" → dữ liệu hiển thị mới **ngay** trong admin UI, **không cần F5**
2. Public web (`/`, `/san-pham`, `/san-pham/[slug]`, `/thuong-hieu/...`, `/doi-qua`) nhận dữ liệu mới **nhanh nhất có thể**
3. **Không update UI giả** khi database lưu lỗi
4. Cache **granular theo ID** — không revalidate bừa toàn bộ
5. Không để khách thấy giá/tên/ảnh **cũ** sau khi admin đã đổi
6. Không dùng localStorage làm nguồn dữ liệu admin chính

### 27.2 Quy ước tag cache (granular theo ID)

**Tag cache chuẩn:**

| Tag | Phạm vi |
|---|---|
| `home` | Trang chủ `/` |
| `products` | List sản phẩm `/san-pham` (toàn bộ) |
| `product-${id}` | Chi tiết sản phẩm `/san-pham/[slug]` |
| `brands` | List thương hiệu `/thuong-hieu` |
| `brand-${slug}` | Trang thương hiệu `/thuong-hieu/[brand-slug]` (gồm câu chuyện) |
| `brand-products-${brand_id}` | Lưới SP theo hãng (trong trang brand) |
| `gifts` | List quà ở `/doi-qua` + checkout gift modal + bảng đổi quà PDP |
| `gift-${id}` | Chi tiết 1 quà (nếu có trang riêng) |

**Mapping hành động → tags revalidate:**

| Hành động admin | revalidateTag |
|---|---|
| Update sản phẩm A (giá/tên/ảnh/kho/điểm) | `products`, `product-${A.id}`, `brand-products-${A.brand_id}`, `home` (nếu A đang ở SP nổi bật) |
| Toggle `is_active` SP A | tương tự trên |
| Thêm SP mới vào hãng B | `products`, `brand-products-${B.id}`, `home` |
| Update brand B (logo/banner/SEO/order) | `brands`, `brand-${B.slug}`, `home` |
| Update câu chuyện thương hiệu B | `brand-${B.slug}` |
| Update quà G | `gifts`, `gift-${G.id}` (nếu có), `home` (nếu home có box đổi quà) |
| Toggle `is_active` quà | tương tự trên |

**Nguyên tắc:** Chỉ revalidate những tag thực sự bị ảnh hưởng — tránh rebuild cache không cần thiết.

### 27.3 Pattern Server Action + RPC + revalidate

Dùng **Next.js Server Actions** (không phải API route) cho admin mutations.

**Luồng chuẩn:**
```
Admin form
  ↓ (1) submit
Server Action
  ↓ (2) Zod validate
Supabase update / RPC
  ↓ (3) success
revalidateTag(...) granular
  ↓ (4) return data
Client nhận response
  ↓ (5)
queryClient.invalidateQueries(...)
  ↓ (6) refetch admin data
Admin UI hiện dữ liệu mới
  ↓ (7)
toast.success() + close modal
```

**Ví dụ implementation:**
```typescript
// app/admin/san-pham/actions.ts
'use server'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  points_per_unit: z.number().int().nonnegative(),
  brand_id: z.string().uuid(),
  images: z.array(z.string().url()).max(10),
})

export async function updateProduct(id: string, input: unknown) {
  const parsed = ProductSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Dữ liệu không hợp lệ' }
  }

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('products')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateProduct failed:', error)
    return { ok: false, error: 'Cập nhật thất bại: ' + error.message }
  }

  // Revalidate granular
  revalidateTag('products')
  revalidateTag(`product-${id}`)
  revalidateTag(`brand-products-${data.brand_id}`)
  revalidateTag('home')

  return { ok: true, data }
}
```

**Server Component fetch dùng tag:**
```typescript
// app/(public)/san-pham/page.tsx
import { unstable_cache } from 'next/cache'

const getActiveProducts = unstable_cache(
  async () => {
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('products').select('*').eq('is_active', true)
    return data
  },
  ['products-list'],
  { tags: ['products'] }
)
```

### 27.4 Pattern React Query invalidation cho admin

Admin dùng **React Query** quản lý server state. Mutations gọi Server Action + invalidate cache:

```typescript
'use client'
const queryClient = useQueryClient()

const updateMutation = useMutation({
  mutationFn: async (input) => {
    const result = await updateProduct(id, input)
    if (!result.ok) throw new Error(result.error)
    return result.data
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    queryClient.invalidateQueries({ queryKey: ['admin-product', id] })
    toast.success('Cập nhật thành công')
    closeModal()
  },
  onError: (err) => {
    toast.error(err.message)
    // KHÔNG đóng modal — giữ data đang nhập để admin sửa
    // KHÔNG update UI list (vì DB chưa đổi)
  }
})
```

### 27.5 Cache ảnh — quy tắc URL UUID

**Quy tắc bắt buộc:** Mỗi lần upload ảnh mới → tạo URL/path **mới** với UUID. KHÔNG upload đè cùng path cũ.

**Cloudflare-specific:** Ảnh serve **trực tiếp từ Supabase Storage URL**, KHÔNG đi qua Next/Image optimize endpoint (vì Cloudflare Pages không hỗ trợ Image Optimization). Resize browser-side khi upload (max 1920px) → kích thước ảnh đã đủ dùng cho mọi viewport. Cloudflare CDN sẽ tự cache ảnh theo URL.

**Path quy ước:**

| Loại ảnh | Path |
|---|---|
| Sản phẩm | `products/{product_id}/{uuid}.webp` |
| Logo brand | `brands/{brand_id}/logo-{uuid}.webp` |
| Banner brand | `brands/{brand_id}/banner-{uuid}.webp` |
| Quà | `gifts/{gift_id}/{uuid}.webp` |
| Order message attachment | `order-message-attachments/{user_id}/{order_id}/{uuid}.webp` |

**KHÔNG dùng:** `products/{product_id}/main.webp` (sẽ bị CDN/browser cache giữ ảnh cũ).

**Lý do:**
- CDN cache ảnh theo URL — URL mới = cache miss = khách tải ảnh mới
- Tránh stale image trên trình duyệt khách
- URL mới giúp Next/Image tự refresh

**Vòng đời ảnh cũ:**
- Sau khi save URL mới vào DB, ảnh cũ KHÔNG còn được tham chiếu nhưng vẫn nằm trên Storage
- **MVP:** giữ lại để có thể rollback / xem lịch sử
- **Phase 2:** cleanup job định kỳ xóa ảnh không còn được tham chiếu (so sánh với DB)

### 27.6 Optimistic update — khi nào được dùng

**KHÔNG optimistic update cho form lớn:**
- Sửa sản phẩm (name, price, stock, points, ảnh, mô tả)
- Sửa brand (logo, banner, story, SEO)
- Sửa quà (image, name, points_required, stock)
- Sửa câu chuyện thương hiệu

→ Phải chờ DB confirm rồi mới update UI. An toàn, không "UI giả".

**ĐƯỢC optimistic update cho thao tác nhỏ:**
- Toggle `is_active` sản phẩm/brand/gift
- Đổi `display_order` (drag & drop sắp xếp hãng)

→ Phải có **rollback** nếu lỗi.

**Pattern optimistic với rollback:**
```typescript
const toggleActive = useMutation({
  mutationFn: ({ id, value }) => toggleProductActiveAction(id, value),
  onMutate: async ({ id, value }) => {
    // Cancel ongoing queries để tránh ghi đè
    await queryClient.cancelQueries({ queryKey: ['admin-products'] })
    // Snapshot cho rollback
    const previous = queryClient.getQueryData(['admin-products'])
    // Optimistic update
    queryClient.setQueryData(['admin-products'], (old) =>
      old.map(p => p.id === id ? { ...p, is_active: value } : p)
    )
    return { previous }
  },
  onError: (err, vars, context) => {
    // Rollback
    queryClient.setQueryData(['admin-products'], context.previous)
    toast.error('Thao tác thất bại, vui lòng thử lại')
  },
  onSettled: () => {
    // Đảm bảo data đồng bộ với server
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }
})
```

### 27.7 Concurrency multi-admin — Phase 2

**MVP:** Skip — giả định chỉ 1 admin chính.

**Yêu cầu chuẩn bị từ MVP để Phase 2 dễ làm:**
- TẤT CẢ bảng chính có cột `updated_at`: `profiles`, `products`, `brands`, `gifts`, `orders`, `gift_redemptions` — ✅ đã có trong schema
- Trigger `set_updated_at` tự động update khi UPDATE — ✅ đã có (xem §15.1)

**Phase 2 — Optimistic concurrency control:**

Khi admin mở form sửa SP:
- Lưu `original_updated_at` (timestamp khi mở form)

Khi admin bấm Lưu:
```sql
UPDATE products
SET name = $1, price = $2, ..., updated_at = NOW()
WHERE id = $3 AND updated_at = $4   -- $4 = original_updated_at
```

Kết quả:
- **1 row affected** → save thành công
- **0 row affected** → admin khác đã sửa trong khi mình đang mở form → báo lỗi:
  > "Dữ liệu này đã được cập nhật bởi người khác. Vui lòng tải lại."
- KHÔNG ghi đè dữ liệu mới của admin khác

Có thể thay `updated_at` bằng cột `version int` tăng dần (rõ ràng hơn). Quyết định cụ thể ở Phase 2.

### 27.8 Rule tuyệt đối

| # | Rule |
|---|---|
| 1 | KHÔNG update UI giả nếu DB lưu lỗi |
| 2 | KHÔNG đóng modal/form khi DB lỗi — giữ data để admin sửa |
| 3 | KHÔNG dùng localStorage làm nguồn dữ liệu admin chính (chỉ dùng cho cart guest user) |
| 4 | Mọi mutation phải có **loading state** + **error state** |
| 5 | Toast lỗi phải **rõ ràng**, có thông báo cụ thể (không chỉ "Lỗi") |
| 6 | Log error vào `console.error` để dễ debug |
| 7 | Sau success: **luôn refetch hoặc invalidate** — không tin tưởng response làm UI duy nhất |
| 8 | Public revalidateTag chạy **server-side** trong Server Action — không gọi từ client |
| 9 | Không dùng index làm React `key` — dùng row ID |
| 10 | Form lớn không optimistic update; form nhỏ optimistic phải có rollback |

### 27.9 Test checklist

**Test 1 — Cập nhật giá:**
- [ ] Admin đổi giá 240k → 250k, bấm Lưu
- [ ] Admin table hiện 250k ngay (không F5)
- [ ] `/san-pham` hiện 250k
- [ ] `/san-pham/[slug]` hiện 250k
- [ ] Trang chủ hiện 250k (nếu SP nằm trong "SP nổi bật")

**Test 2 — Cập nhật ảnh:**
- [ ] Admin upload ảnh mới
- [ ] URL ảnh mới có UUID khác URL cũ
- [ ] Admin table hiện ảnh mới
- [ ] Public hiện ảnh mới (không cache ảnh cũ)

**Test 3 — Cập nhật tên/slug:**
- [ ] Admin đổi tên SP, bấm Lưu
- [ ] Admin table hiện tên mới
- [ ] `/san-pham/[slug-cũ]` còn redirect hoặc đổi sang slug mới
- [ ] `/san-pham/[slug-mới]` hoạt động

**Test 4 — Cập nhật điểm:**
- [ ] Admin đổi `points_per_unit` từ 40 → 100
- [ ] Admin table hiện 100
- [ ] Checkout sản phẩm đó tính `points_to_earn = 100 × qty` (không phải 40)

**Test 5 — Cập nhật logo thương hiệu:**
- [ ] Admin upload logo mới
- [ ] Admin thấy logo mới
- [ ] Trang chủ (lưới hãng) thấy logo mới
- [ ] `/thuong-hieu` thấy logo mới
- [ ] `/thuong-hieu/[slug]` thấy logo mới

**Test 6 — Cập nhật quà đổi điểm:**
- [ ] Admin đổi `points_required` từ 300 → 500
- [ ] Admin table hiện 500
- [ ] `/doi-qua` hiện 500
- [ ] Bảng đổi quà ở PDP hiện 500
- [ ] Checkout gift modal hiện 500

**Test 7 — DB update lỗi:**
- [ ] Mock DB error (vd: tắt mạng, RLS reject)
- [ ] Admin bấm Lưu → toast lỗi rõ ràng
- [ ] Modal KHÔNG đóng, data đang nhập GIỮ NGUYÊN
- [ ] Admin table giữ data CŨ (không update giả)
- [ ] `console.error` log lỗi

**Test 8 — Toggle ẩn/hiện thất bại (rollback optimistic):**
- [ ] Bấm toggle is_active sản phẩm → UI đổi ngay (optimistic)
- [ ] Mock action fail
- [ ] UI rollback về trạng thái cũ
- [ ] Toast lỗi hiển thị

**Build:**
- [ ] Console KHÔNG có lỗi đỏ
- [ ] `npm run build` PASS

---

## 28. MODULE: SANITIZE HTML — BRAND STORY

### 28.1 Mục tiêu

Brand story (`brands.story_content`) là **rich HTML** do admin viết qua TipTap editor — render trên trang `/thuong-hieu/[brand-slug]` cho khách. Phải đảm bảo:

1. KHÔNG cho phép XSS (script injection, event handler, javascript: URL...)
2. KHÔNG cho phép tabnabbing qua `target="_blank"` không có `rel="noopener noreferrer"`
3. KHÔNG cho phép hot-link ảnh từ domain lạ
4. KHÔNG vỡ layout mobile (cấm `<table>` ở MVP)
5. Sanitize **2 lớp** — defense in depth

### 28.2 Thư viện

- **Server-side (chính):** `sanitize-html` (npm) — kiểm tra edge compat trên Cloudflare. Nếu lỗi runtime → fallback sang **`xss`** package (lightweight, edge-compatible 100%).
- **Client-side (phụ):** `isomorphic-dompurify`
- Config dùng chung — đặt ở `lib/sanitize/brand-story.ts` để 2 lớp dùng cùng whitelist
- **Lưu ý Cloudflare:** Server Action chạy trên edge runtime — nếu `sanitize-html` lỗi (vd require Node API), chuyển sang `xss`. Cách dùng tương tự, support whitelist và transform.

### 28.3 Whitelist tag

**Cho phép (12 tag):**
| Tag | Mục đích |
|---|---|
| `p` | Đoạn văn |
| `h2`, `h3` | Heading mục con (H1 = tên brand) |
| `strong`, `em` | Nhấn mạnh (TipTap config dùng `<strong>`, `<em>` chứ không `<b>`, `<i>`) |
| `ul`, `ol`, `li` | Danh sách |
| `blockquote` | Trích dẫn |
| `a` | Liên kết |
| `img` | Ảnh minh họa |
| `br` | Xuống dòng |

**Cấm (loại hết):**
- Script-injection: `script`, `iframe`, `object`, `embed`, `form`, `input`, `button`, `svg`, `canvas`, `style`
- Media phức tạp: `video`, `audio`
- Layout phức tạp: `table`, `thead`, `tbody`, `tr`, `td`, `th` (Phase 2 đánh giá lại)
- Mọi event handler: `onclick`, `onerror`, `onload`, `onmouseover`, `onfocus`, ...

### 28.4 Whitelist attribute

```typescript
allowedAttributes: {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt'],
  // các tag khác: không attr
}
```

**KHÔNG cho:**
- `style` (chống CSS injection)
- `class`, `id` (admin không cần)
- `data-*` (TipTap có thể thêm — strip hết)
- `width`, `height` (responsive tự xử lý qua CSS)

### 28.5 Quy tắc link & ảnh

**Link `<a>`:**
```typescript
allowedSchemes: ['http', 'https', 'mailto']
// Cấm: javascript:, data:, vbscript:, file:, ftp:
```

Auto thêm `rel="noopener noreferrer"` khi `target="_blank"`:
```typescript
transformTags: {
  'a': (tagName, attribs) => {
    if (attribs.target === '_blank') {
      attribs.rel = 'noopener noreferrer'
    }
    return { tagName, attribs }
  }
}
```

**Ảnh `<img>`:**
```typescript
allowedSchemesByTag: {
  img: ['https']  // bắt buộc HTTPS
}
allowedSchemes: ['http', 'https', 'mailto']  // cho href
```

Whitelist domain ảnh (chống hot-link / phishing):
```typescript
const ALLOWED_IMAGE_HOSTS = [
  '<project-id>.supabase.co',  // Supabase Storage chính
  // Phase 2: thêm CDN nếu có
]

// Trong transformTags hoặc filter sau sanitize:
if (img.src) {
  const url = new URL(img.src)
  if (!ALLOWED_IMAGE_HOSTS.includes(url.hostname)) {
    return null  // strip ảnh nếu domain lạ
  }
}
```

### 28.6 Luồng admin save

```
Admin TipTap editor
  ↓ submit HTML raw
Server Action `updateBrandStory(brand_id, html)`
  ↓ check role admin (RLS + RPC)
Sanitize HTML server-side (sanitize-html với config §28.4-5)
  ↓ HTML đã sạch
UPDATE brands SET story_content = sanitized WHERE id = ?
  ↓ revalidate granular
revalidateTag(`brand-${slug}`)
revalidatePath(`/thuong-hieu/${slug}`)
  ↓
Client invalidate React Query
Toast "Cập nhật thành công"
```

**Code mẫu:**
```typescript
// app/admin/thuong-hieu/actions.ts
'use server'
import sanitizeHtml from 'sanitize-html'
import { brandStoryConfig } from '@/lib/sanitize/brand-story'

export async function updateBrandStory(brandId: string, rawHtml: string) {
  // Validate role admin trong RPC
  const sanitized = sanitizeHtml(rawHtml, brandStoryConfig)

  const { data, error } = await supabase
    .from('brands')
    .update({ story_content: sanitized })
    .eq('id', brandId)
    .select('slug')
    .single()

  if (error) return { ok: false, error: 'Lưu thất bại' }

  revalidateTag(`brand-${data.slug}`)
  revalidatePath(`/thuong-hieu/${data.slug}`)

  return { ok: true }
}
```

**Config chung `lib/sanitize/brand-story.ts`:**
```typescript
import type { IOptions } from 'sanitize-html'

export const brandStoryConfig: IOptions = {
  allowedTags: [
    'p', 'h2', 'h3', 'strong', 'em',
    'ul', 'ol', 'li', 'blockquote',
    'a', 'img', 'br'
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['https'] },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  disallowedTagsMode: 'discard',
  transformTags: {
    'a': (tagName, attribs) => {
      if (attribs.target === '_blank') {
        attribs.rel = 'noopener noreferrer'
      }
      return { tagName, attribs }
    },
    'img': (tagName, attribs) => {
      const ALLOWED_IMAGE_HOSTS = ['<project-id>.supabase.co']
      try {
        const url = new URL(attribs.src ?? '')
        if (!ALLOWED_IMAGE_HOSTS.includes(url.hostname)) {
          // Strip ảnh từ domain lạ
          return { tagName: 'span', text: '' } as any
        }
      } catch {
        return { tagName: 'span', text: '' } as any
      }
      return { tagName, attribs }
    }
  }
}
```

### 28.7 Render public

Trong Server Component `app/(public)/thuong-hieu/[brand-slug]/page.tsx`:

```typescript
const brand = await getBrandBySlug(slug)  // story_content đã sạch khi save

return (
  <article>
    <h1>{brand.name}</h1>
    <div
      className="prose"
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(brand.story_content, brandStoryConfig)
        // Sanitize lại lần nữa (defense in depth)
      }}
    />
  </article>
)
```

**Quy tắc:**
- KHÔNG render HTML thô (chưa sanitize)
- KHÔNG dùng `dangerouslySetInnerHTML` với data từ user khác (chỉ cho admin content đã sanitize)
- Sanitize lại lần 2 trước render — phòng dữ liệu cũ trong DB chưa qua sanitize hoặc bị inject từ kênh khác

### 28.8 TipTap config phải khớp whitelist

Trong admin editor (`/admin/thuong-hieu/[id]`):

```typescript
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Heading } from '@tiptap/extension-heading'

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: false,  // override để chỉ cho H2, H3
      // bold, italic của StarterKit dùng <strong>, <em> mặc định ✅
    }),
    Heading.configure({ levels: [2, 3] }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      protocols: ['http', 'https', 'mailto'],
    }),
    Image.configure({
      // upload qua admin, không cho paste base64
      allowBase64: false,
    }),
  ]
})
```

**Lý do:** Nếu TipTap output `<b>` mà whitelist chỉ có `<strong>` → sanitize sẽ strip → admin save xong tưởng OK nhưng dữ liệu mất bold. **Whitelist và TipTap phải đồng bộ.**

### 28.9 Test checklist

**Test 1 — Script injection:**
- Input: `<script>alert(1)</script>Hello`
- Sau save: `Hello` (script bị strip)
- Render: không có alert, không có thẻ script

**Test 2 — Event handler:**
- Input: `<img src="https://abc.supabase.co/x.jpg" onerror="alert(1)">`
- Sau save: `<img src="https://abc.supabase.co/x.jpg">` (onerror bị strip)

**Test 3 — javascript: URL:**
- Input: `<a href="javascript:alert(1)">click</a>`
- Sau save: `click` hoặc `<a>click</a>` (href javascript: bị strip)

**Test 4 — Iframe:**
- Input: `<iframe src="https://evil.com"></iframe>`
- Sau save: chuỗi rỗng (iframe bị xóa hoàn toàn)

**Test 5 — Hot-link ảnh từ domain lạ:**
- Input: `<img src="https://evil.com/track.jpg">`
- Sau save: ảnh bị strip (domain không trong whitelist)

**Test 6 — Nội dung hợp lệ render đẹp:**
- Input:
  ```html
  <h2>Câu chuyện Gooby</h2>
  <p>Gooby là thương hiệu bỉm <strong>Việt Nam</strong>...</p>
  <img src="https://abc.supabase.co/brand/gooby/banner.jpg" alt="Gooby">
  <a href="https://gooby.vn" target="_blank">Website</a>
  ```
- Sau save: giữ nguyên + auto thêm `rel="noopener noreferrer"` cho `<a>`
- Render: hiển thị đẹp, không vỡ mobile

**Test 7 — TipTap output khớp whitelist:**
- Bold trong TipTap → `<strong>` (không phải `<b>`) ✅
- Italic → `<em>` ✅
- H2/H3 (không có H1, H4-H6) ✅

**Test 8 — Defense in depth:**
- DB có chuỗi HTML chưa sanitize (giả lập): `<script>x</script>Hello`
- Render bằng `dangerouslySetInnerHTML` qua sanitize lớp 2 → `Hello`

---

## 29. MODULE: CLOUDFLARE EDGE RUNTIME COMPAT

### 29.1 Mục tiêu

Đảm bảo toàn bộ codebase **chạy được trên Cloudflare Pages edge runtime** (V8 isolate, không phải Node.js full). Liệt kê các adjustment so với Vercel default.

### 29.2 Tóm tắt khác biệt Vercel vs Cloudflare Pages

| Tính năng | Vercel | Cloudflare Pages |
|---|---|---|
| Runtime | Node.js full + Edge | **Edge only** (V8 isolate) |
| Next/Image optimize | ✅ Built-in | ❌ KHÔNG hỗ trợ — dùng `unoptimized` |
| `revalidateTag`/`unstable_cache` | ✅ Persistent qua Vercel | ⚠️ Cần **Cloudflare KV namespace** |
| Server Actions | ✅ | ✅ (qua `@cloudflare/next-on-pages` v1.13+) |
| Bundle size | Rộng | 1MB (Free Workers) / 10MB (Paid) |
| CPU time/request | 60s+ | 10ms (Free) / 30s (Paid) |
| WebSocket (Realtime Supabase) | ✅ | ✅ (client-side OK) |
| File system (`fs`) | ✅ | ❌ Không có |
| Native modules (sharp, bcrypt) | ✅ | ❌ Không có |

### 29.3 Adapter `@cloudflare/next-on-pages`

Là package convert Next.js App Router → Cloudflare Pages Functions. Cài + cấu hình ở Phase 6.

```bash
npm install -D @cloudflare/next-on-pages
```

Trong `package.json` thêm script build cho Cloudflare:
```json
{
  "scripts": {
    "build:cf": "next-on-pages",
    "preview:cf": "wrangler pages dev .vercel/output/static"
  }
}
```

`wrangler.toml` (cấu hình Cloudflare Pages):
```toml
name = "vua-bim"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]   # bật Node.js compatibility layer

[[kv_namespaces]]
binding = "NEXT_CACHE"
id = "<KV_NAMESPACE_ID>"  # tạo trong Cloudflare dashboard
```

### 29.4 Cloudflare KV cho cache `revalidateTag`

Next.js cần persistent cache cho `unstable_cache` và `revalidateTag`/`revalidatePath`. Vercel có sẵn; Cloudflare cần KV.

**Setup:**
1. Trong Cloudflare dashboard → Workers & Pages → KV → Create namespace tên `NEXT_CACHE`
2. Copy KV ID vào `wrangler.toml`
3. `@cloudflare/next-on-pages` sẽ auto-bind KV cho Next.js cache layer

**Code KHÔNG đổi:** vẫn dùng `revalidateTag('products')` như §27 — adapter handle phía sau.

### 29.5 Image strategy (KHÔNG dùng Next/Image optimize)

**Quy tắc:**
- KHÔNG dùng `<Image src="..." />` không có prop `unoptimized`
- Cách dùng đúng:
  ```tsx
  import Image from 'next/image'
  <Image
    src={product.images[0]}  // URL Supabase Storage trực tiếp
    alt={product.name}
    width={400}
    height={400}
    unoptimized  // ← BẮT BUỘC trên Cloudflare Pages
  />
  ```
- Resize browser-side khi upload (max 1920px chiều dài) → ảnh đã đủ kích thước cho mọi viewport mobile
- Cloudflare CDN tự cache theo URL (URL có UUID → cache miss khi đổi)
- **Phase 2 (nếu cần ảnh tối ưu hơn):** dùng Cloudflare Images service (paid)

### 29.6 NPM packages compat check

| Package | Edge compat | Action |
|---|---|---|
| `next` (14+) | ✅ qua adapter | Dùng |
| `react`, `react-dom` | ✅ | Dùng |
| `@supabase/supabase-js` | ✅ | Dùng |
| `@supabase/ssr` | ✅ | Dùng cho server components |
| `@tanstack/react-query` | ✅ | Dùng |
| `react-hook-form` + `zod` | ✅ | Dùng |
| `tailwindcss` | ✅ (build-time) | Dùng |
| `@tiptap/*` | ✅ (client-side) | Dùng — chỉ ở admin |
| `zustand` | ✅ | Dùng cho cart |
| `sanitize-html` | ⚠️ Test edge | Fallback `xss` nếu lỗi |
| `isomorphic-dompurify` | ⚠️ Cần JSDOM polyfill | Hoặc dùng `dompurify` client-only |
| `bcrypt` | ❌ | KHÔNG dùng — Supabase Auth tự xử lý |
| `sharp` | ❌ | KHÔNG dùng — resize browser-side |
| `nodemailer` | ❌ | KHÔNG dùng — Supabase Auth gửi email auth; nếu cần email khác → dùng Resend API |

### 29.7 Realtime + WebSocket

Supabase Realtime dùng WebSocket → hoạt động OK với Cloudflare Pages vì subscribe **chạy phía client** (browser), không phải server. Server side chỉ INSERT vào DB → Postgres notify → Supabase Realtime broadcast.

```tsx
// Client component - chạy trong browser, không phụ thuộc edge
'use client'
useEffect(() => {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', {...}, handler)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [orderId])
```

### 29.8 Bundle size & limits — chiến lược Free vs Paid

**Cloudflare Workers Free:** 1MB bundle, 10ms CPU, 30s wall time
**Cloudflare Workers Paid ($5/month):** 10MB bundle, 30s CPU, 30s wall time

**Quyết định KHÔNG chốt ở phase code — chốt ở Phase 6 deploy** dựa trên kết quả build thực tế. Xem §23.2 chi tiết.

**Phase 0–5:** code phải edge-compatible (mọi rule trong §29.12), giữ bundle nhẹ tự nhiên không cần bận tâm Free/Paid.

**Phase 6:**
- **Thử Free trước** nếu build < 1MB và test E2E pass
- **Lên Paid ngay** nếu vượt giới hạn CPU/bundle/timeout
- **Production thật:** khuyến nghị Paid để ổn định ($5/tháng)

**Tránh bundle phình (rule luôn áp dụng):**
- KHÔNG import full lodash → dùng `lodash-es/specific-fn`
- KHÔNG import `moment` → dùng `date-fns` hoặc native `Intl.DateTimeFormat`
- KHÔNG bundle TipTap vào server route — chỉ client component, lazy load: `const TipTapEditor = dynamic(() => import('@/components/admin/tiptap-editor'), { ssr: false })`
- KHÔNG bundle sanitize-html vào trang public — chỉ chạy server-side trong Server Action save brand story
- Lazy-load admin features — admin code KHÔNG cùng bundle với public route
- Dùng route group `(public)` vs `admin/` riêng → Next.js auto code-split

### 29.9 File upload — qua client SDK

**KHÔNG upload qua Server Action** (sẽ qua Cloudflare Workers, tốn CPU time + bundle):

```tsx
// Sai: upload qua Server Action
async function uploadProductImage(formData) {
  'use server'
  const file = formData.get('file')
  await supabaseAdmin.storage.upload(...)  // ❌ tốn CPU, bundle file lớn
}

// Đúng: upload từ client trực tiếp
'use client'
async function handleUpload(file: File) {
  // Resize trước
  const resized = await resizeImage(file, 1920)
  // Upload thẳng lên Supabase
  const { data, error } = await supabase.storage
    .from('products')
    .upload(`${productId}/${crypto.randomUUID()}.webp`, resized)
  // Trả URL về Server Action chỉ để update DB
  await updateProductImagesAction(productId, data.path)
}
```

### 29.10 Setup Cloudflare Pages step-by-step (Phase 6)

1. **Tạo Cloudflare account** (free): https://dash.cloudflare.com/sign-up
2. **Workers & Pages → Create → Pages → Connect to Git** (link GitHub repo)
3. **Build settings:**
   - Build command: `npm run build:cf` (alias cho `next-on-pages`)
   - Build output: `.vercel/output/static`
   - Node version: 20
4. **Environment variables** (Settings → Environment variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (TUYỆT MẬT)
5. **KV namespace binding** (Settings → Functions → KV namespace bindings):
   - Variable name: `NEXT_CACHE`
   - KV namespace: chọn namespace đã tạo
6. **Compatibility flags** (Settings → Functions):
   - Add: `nodejs_compat`
7. **Custom domain** (Custom domains tab):
   - Add domain → Cloudflare DNS auto-config
8. **Test deploy:** push commit → Pages auto build → check log
9. **Verify edge:** kiểm tra Server Actions hoạt động + Supabase auth + revalidate

### 29.11 Test E2E sau deploy

- [ ] Trang chủ load < 2s từ VN
- [ ] Đăng nhập Google/Facebook hoạt động (redirect URL phải có domain Cloudflare)
- [ ] Upload ảnh sản phẩm trong admin
- [ ] Tạo đơn → DB lưu đúng
- [ ] Realtime chatbox hoạt động
- [ ] `revalidateTag` sau update sản phẩm → public thấy giá mới (qua KV)
- [ ] Sanitize HTML brand story không lỗi runtime
- [ ] Console không có error edge runtime

### 29.12 Rule tuyệt đối khi code

| # | Rule |
|---|---|
| 1 | KHÔNG dùng Node-only API: `fs`, `path`, `child_process`, `os` |
| 2 | KHÔNG `import sharp` hay native module nặng |
| 3 | KHÔNG upload file qua Server Action — dùng client SDK trực tiếp |
| 4 | LUÔN dùng `unoptimized` trên Next/Image |
| 5 | LUÔN test sanitize-html khi build CF — fallback `xss` nếu lỗi |
| 6 | LUÔN dùng `crypto.randomUUID()` (Web Crypto), không `uuid` package nếu tránh được |
| 7 | KHÔNG bundle TipTap vào server route — chỉ dynamic import client |
| 8 | Server Action giữ nhỏ — không xử lý file/buffer lớn trong action |

---

## KẾT THÚC TÀI LIỆU

Tài liệu này là nguồn sự thật duy nhất cho dự án Vua Bỉm v1.0.
Mọi câu hỏi/thay đổi phải được phê duyệt và cập nhật vào tài liệu này trước khi code.

**Chờ user duyệt để chuyển sang Phase 0 (khởi tạo project + migration).**

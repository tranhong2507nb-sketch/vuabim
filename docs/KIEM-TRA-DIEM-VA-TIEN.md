# KIỂM TRA: ĐẶT HÀNG · TÍNH ĐIỂM · TRỪ TIỀN

> Trích riêng từ THIET-KE.md để bạn rà soát logic mua hàng, hệ thống điểm, công thức tính tiền và lifecycle hủy/hoàn.
> Cập nhật: 2026-05-08

---

## 1. HAI NGUỒN ĐIỂM TÁCH BIỆT

| Nguồn | Bản chất | Cột trong `orders` | Có đụng `current_points`? |
|---|---|---|---|
| **A1. Điểm SP — tích** | Điểm sinh từ đơn, tích vào TK khi `completed` | `points_to_earn`, `points_earned_at` | Chỉ khi `completed` |
| **A2. Điểm SP — dùng ngay** | Điểm sinh từ đơn, dùng giảm tiền đơn này | `instant_points_used`, `instant_points_discount` | ❌ KHÔNG bao giờ |
| **B1. Điểm TK — giảm tiền** | Điểm thật khách dùng giảm tiền đơn | `account_points_used`, `account_points_discount`, `account_points_refunded_at` | ✅ Trừ ngay khi tạo đơn |
| **B2. Điểm TK — đổi quà** | Điểm thật khách dùng đổi quà | `gift_redemptions.points_used`, `gift_redemptions.refunded` | ✅ Trừ ngay khi tạo đơn |

**Hằng số:**
- 1 điểm = 1.000đ
- Mỗi sản phẩm có `points_per_unit` riêng, do admin set thủ công (không tính theo %)
- Điểm KHÔNG hết hạn
- `current_points >= 0` luôn (DB constraint)

**Lựa chọn của khách trong checkout:**
- **A1 và A2 LOẠI TRỪ NHAU** — chỉ chọn 1 trong 2 (mặc định A1)
- **B1 và B2 ĐỘC LẬP** — đều dùng điểm TK, có thể bật cùng lúc
- Tổng: `account_points_used + gift_points_used ≤ current_points`

---

## 2. UI CHECKOUT — 3 KHỐI ĐIỂM

### Khối 3.1 — Điểm của đơn hiện tại

```
┌─ Đơn này mẹ nhận được: +120 điểm ──┐
│ ⓘ Chỉ chọn 1 trong 2:               │
│ ○ Tích 120 điểm vào tài khoản       │
│ ○ Dùng ngay 120 điểm để giảm        │
│   120.000đ vào đơn này               │
└──────────────────────────────────────┘
```

### Khối 3.2 — Dùng điểm TK giảm tiền

```
┌─ Mẹ có 500 điểm ────────────────────┐
│ Dùng [___] điểm để giảm tiền        │
│ → giảm 0đ                            │
│ (1 điểm = 1.000đ)                    │
└──────────────────────────────────────┘
```

### Khối 3.3 — Đổi quà bằng điểm TK

```
┌─ Bạn còn 400 điểm — đổi quà luôn?  │
│ ☐ Đổi quà đi kèm đơn này            │
│   [Mở bảng đổi quà]                  │
│   Đã chọn: Quà X (50 điểm)           │
└──────────────────────────────────────┘
```

### Khối Tổng cộng

```
Tạm tính:                          398.000đ
Phí vận chuyển:                          0đ
Giảm từ điểm sản phẩm (instant):  -120.000đ
Giảm từ điểm tài khoản:           -100.000đ
─────────────────────────────────
Tổng thanh toán:                   178.000đ
```

**Sticky bottom:** [Đặt hàng]

---

## 3. CÔNG THỨC TÍNH TIỀN (TK trước, SP sau, dư SP tích TK)

```
subtotal              = SUM(item.qty × item.unit_price)
shipping_fee_original = 45.000đ  (chỉ hiển thị UI gạch ngang, không tính)
shipping_fee          = 0        (MVP free ship toàn quốc)
base_total            = subtotal + shipping_fee = subtotal + 0
points_to_earn_raw    = SUM(item.qty × item.points_per_unit)
```

**UI hiển thị phí ship:** ~~45.000đ~~ **Miễn phí** (text-decoration: line-through cho 45k, "Miễn phí" màu xanh đậm)

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

**Bước 3 — Phần dư SP tích vào TK khi `completed`:**
```
points_to_earn = points_to_earn_raw − instant_points_used
```
(Nếu chọn "tích": `points_to_earn = points_to_earn_raw`)

**Bước 4 — Total cuối:**
```
final_total = max(0, base_total − account_points_discount − instant_points_discount)
```

**Ràng buộc clamp:**
- `account_points_used + gift_points_used ≤ current_points`
- `account_points_used ≤ floor(base_total / 1000)`
- `instant_points_used ≤ floor(remaining_after_account / 1000)`
- `final_total ≥ 0` luôn
- **`points_to_earn = points_to_earn_raw − instant_points_used`** — phần dư SP tích vào TK khi `completed`, **KHÔNG bốc hơi**

**Thứ tự ưu tiên:** điểm TK (account) **trước** → điểm SP (instant) **sau**.
*Lý do: TK là tài sản thật, ưu tiên xử lý dứt điểm; phần dư SP do clamp tự động tích vào TK khi `completed` — khách không bị mất điểm.*

---

## 4. VÍ DỤ TÍNH TIỀN

### Ví dụ A — Khách dùng cả TK + SP, có phần dư SP

- Đơn 240k, ship 0đ → `base_total = 240.000`
- Khách có 500 điểm TK, nhập 200 → `account_used=200`, `account_discount=200.000`
- `remaining_after_account = 40.000`
- Điểm SP = 80, chọn "dùng ngay" → `instant_used = min(80, 40) = 40` → `discount = 40.000`
- `final_total = max(0, 240.000 − 200.000 − 40.000) = 0`
- **Phần dư SP:** `points_to_earn = 80 − 40 = 40` → tích vào TK khi `completed`
- TK sau đặt: `500 − 200 = 300`
- Khi `completed`: TK = `300 + 40 = 340`

### Ví dụ B — Đơn nhỏ hơn điểm SP, không có TK

- Đơn 100k, TK = 0, SP = 200 điểm, chọn "dùng ngay"
- `account_used = 0`
- `instant_used = min(200, floor(100k/1000)) = min(200, 100) = 100` → giảm 100k
- `final_total = 0`
- **Phần dư SP:** `points_to_earn = 200 − 100 = 100` → tích sau
- Khi `completed`: TK = `0 + 100 = 100` (khách trả 0đ + được tặng 100 điểm)

### Ví dụ C — Ví dụ user đã chốt: TK 200 + SP 200, đơn 300k

- Đơn 300k → `base_total = 300.000`
- TK = 200, khách nhập 200 → `account_used=200`, `account_discount=200.000`
- `remaining_after_account = 100.000`
- SP = 200, chọn "dùng ngay" → `instant_used = min(200, 100) = 100` → `discount = 100.000`
- `final_total = max(0, 300.000 − 200.000 − 100.000) = 0`
- **Phần dư SP:** `points_to_earn = 200 − 100 = 100` → tích vào TK khi `completed`
- TK sau đặt: `200 − 200 = 0`
- Khi `completed`: TK = `0 + 100 = 100` ✅ (đúng theo rule user chốt)

### Ví dụ D — Reject vì vượt điểm TK

- Khách có 50 điểm TK
- Cố nhập: `account_points_used = 30`, đổi quà 30 điểm
- `30 + 30 = 60 > 50` → REJECT, không tạo đơn

---

## 5. LIFECYCLE ĐIỂM

### 5.1 Khi tạo đơn (status = pending) — TK trước, SP sau

**Tính:**
- `points_to_earn_raw = SUM(qty × points_per_unit_snapshot)`

**Validate điểm TK:**
- `account_points_used + gift_points_used ≤ current_points` → nếu vi phạm: RAISE
- `account_points_used ≤ floor(base_total / 1000)` → nếu vi phạm: RAISE

**Áp điểm TK trước (giảm tiền):**
- `account_points_discount = account_points_used × 1000`
- `remaining_after_account = base_total − account_points_discount`

**Lựa chọn điểm SP áp sau (1-trong-2):**
- Nếu chọn **A1 "tích"**:
  - `instant_points_used = 0`, `instant_points_discount = 0`
  - `points_to_earn = points_to_earn_raw` (toàn bộ tích khi completed)
- Nếu chọn **A2 "dùng ngay"**:
  - `instant_points_used = min(points_to_earn_raw, floor(remaining_after_account/1000))`
  - `instant_points_discount = instant_points_used × 1000`
  - `points_to_earn = points_to_earn_raw − instant_points_used` ← **PHẦN DƯ CARRY**

**Trừ điểm TK khỏi `current_points` NGAY:**
- Nếu `account_points_used > 0`: `current_points -= account_points_used` + log `use_account_direct`
- Nếu có đổi quà checkout: `current_points -= gift.points_required` + log `redeem_gift`

**Không đụng `current_points`:**
- `instant_points_used` (chỉ là discount đơn)
- `points_to_earn` (chưa cộng — `points_earned_at = NULL`)

**Cờ trạng thái:** `account_points_refunded_at = NULL`, `points_earned_at = NULL`

### 5.2 Khi admin chuyển sang `completed`

- Idempotent. Nếu `points_earned_at IS NULL` AND `points_to_earn > 0`:
  - `current_points += points_to_earn`
  - `points_earned_at = NOW()`
  - Log `type = 'earn'`
- Nếu đã có timestamp → bỏ qua.

### 5.3 Khi `cancelled` (CHỈ pending hoặc confirmed)

> ⚠️ **Đơn `shipping` KHÔNG được cancel trực tiếp.** Admin phải đợi hàng về kho rồi mới xử lý hoàn (qua `refund_completed_order` sau khi mark completed, hoặc Phase 2 dùng return flow). Khách không có nút hủy/yêu cầu hủy ở `shipping`, chỉ hotline.

**A. Hoàn điểm TK đã dùng giảm tiền** (chống trùng bằng `account_points_refunded_at`):
- Nếu `account_points_used > 0` AND `account_points_refunded_at IS NULL`:
  - `current_points += account_points_used`
  - `account_points_refunded_at = NOW()`
  - Log `type = 'refund_account_direct'`

**B. Hủy gift_redemptions gắn** (chống trùng bằng `refunded`):
- Cho mỗi redemption `status != 'cancelled'` AND `refunded = false`:
  - `status = 'cancelled'`, `refunded = true`
  - `current_points += points_used`
  - Hoàn tồn kho quà
  - Log `type = 'refund_gift'`

**C. KHÔNG đụng:**
- `instant_points_used` (chưa từng vào TK, đơn hủy → discount biến mất theo đơn)
- `points_to_earn` (chưa cộng vì status chưa từng = completed)

**D. Hoàn tồn kho sản phẩm.** Set `status = 'cancelled'`.

### 5.4 Khi `refunded` (đã `completed` rồi hoàn lại)

**A. Hoàn `account_points_used`** (như cancel — cùng cờ chống trùng).

**B. Trừ lại `points_to_earn` đã cộng** (clamp 0):
- Nếu `points_earned_at IS NOT NULL` AND `points_to_earn > 0`:
  - `actual = LEAST(points_to_earn, current_points)`
  - `current_points -= actual`
  - Log `revoke` (delta = −actual)
  - Nếu `actual < points_to_earn` → log thêm `clamp` với reason

**C. KHÔNG hoàn `instant_points_used`** (chỉ là discount; shop hoàn tiền `total` đã thu là đủ).

**D. Hủy gift_redemptions:** tùy param `p_refund_gifts` (mặc định MVP: hoàn nếu khách trả quà).

---

## 6. ĐỐI XỨNG — 3 VÍ DỤ KIỂM CHỨNG

Sau khi đặt đơn rồi hủy đơn hợp lệ, `current_points` phải trở về đúng giá trị ban đầu.

### Đối xứng 1 — TK + đổi quà

```
TK ban đầu = 500
Đặt đơn: account_points_used=100, gift checkout=300
  → trừ 100 (use_account_direct) + trừ 300 (redeem_gift)
  → TK = 500 − 100 − 300 = 100
Hủy đơn:
  → hoàn 100 (refund_account_direct, set timestamp)
  → hoàn 300 (refund_gift, redemption.refunded=true)
  → TK = 100 + 100 + 300 = 500 ✅
```

### Đối xứng 2 — Instant không đụng TK

```
TK ban đầu = 50
Đặt đơn: instant_points_used=80
  → KHÔNG đụng TK
  → TK = 50
Hủy đơn:
  → KHÔNG hoàn instant
  → TK = 50 ✅
```

### Đối xứng 3 — Earn rồi refund

```
TK ban đầu = 50
Đặt đơn: points_to_earn=120 (chọn A1 tích)
  → KHÔNG cộng (chưa completed)
  → TK = 50
Admin completed:
  → cộng 120 (earn, points_earned_at=now)
  → TK = 170
Refund:
  → trừ 120 (revoke, clamp 0 nếu cần)
  → TK = 50 ✅
```

---

## 7. SCHEMA `orders` (chỉ phần điểm/tiền)

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  user_id uuid references profiles(id),
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipping','completed','cancelled','refunded')),

  subtotal integer not null check (subtotal >= 0),
  shipping_fee integer not null default 0 check (shipping_fee >= 0),

  -- Nhóm A: điểm SẢN PHẨM (sinh từ đơn, không phải tài sản TK)
  points_to_earn integer not null default 0 check (points_to_earn >= 0),
  points_earned_at timestamptz,
  instant_points_used integer not null default 0 check (instant_points_used >= 0),
  instant_points_discount integer not null default 0 check (instant_points_discount >= 0),

  -- Nhóm B: điểm TÀI KHOẢN (điểm thật, đã trừ khỏi current_points khi tạo đơn)
  account_points_used integer not null default 0 check (account_points_used >= 0),
  account_points_discount integer not null default 0 check (account_points_discount >= 0),
  account_points_refunded_at timestamptz,

  total integer not null check (total >= 0),
  payment_method text not null default 'cod',

  -- (... cột địa chỉ shipping ...)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 8. SCHEMA `points_transactions` (audit log)

```sql
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
```

**Type values:**

| Type | Khi nào | Delta |
|---|---|---|
| `earn` | Đơn completed → cộng `points_to_earn` | + |
| `revoke` | Đơn refunded → trừ điểm thưởng đã cộng | − |
| `use_account_direct` | Khách dùng điểm TK giảm tiền (lúc tạo đơn) | − |
| `refund_account_direct` | Hủy/refund đơn → hoàn điểm TK đã dùng giảm tiền | + |
| `redeem_gift` | Đổi quà (checkout/standalone/pdp) → trừ điểm TK | − |
| `refund_gift` | Hủy đổi quà → hoàn điểm TK | + |
| `clamp` | Trừ bị clamp về 0 (đi kèm `revoke`) | 0 hoặc thực tế |
| `admin_adjust` | Admin chỉnh tay (có lý do bắt buộc) | ± |

**KHÔNG có type cho `instant_points_used`** — vì điểm này không bao giờ đụng `current_points`.

KHÔNG xóa rows. Mọi thay đổi `current_points` PHẢI có 1 row tương ứng.

---

## 9. PSEUDOCODE — RPC `place_order`

```
BEGIN TRANSACTION
  SELECT current_points FROM profiles WHERE id = auth.uid() FOR UPDATE

  -- 1. Validate cart
  validate cart items (tồn tại, is_active, đủ tồn kho, giá khớp)
  subtotal = SUM(qty × unit_price)
  shipping_fee = ... (MVP: 0 hoặc cố định)
  base_total = subtotal + shipping_fee
  points_to_earn_raw = SUM(qty × points_per_unit)

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
    instant_points_used = 0
    instant_points_discount = 0
    points_to_earn = points_to_earn_raw                        -- toàn bộ tích khi completed
  ELIF input.product_point_choice = 'use_instant':
    max_usable_instant = floor(remaining_after_account / 1000)
    instant_points_used = min(points_to_earn_raw, max_usable_instant)
    instant_points_discount = instant_points_used × 1000
    points_to_earn = points_to_earn_raw - instant_points_used  -- PHẦN DƯ CARRY (tích sau khi completed)

  -- 4. Tính total cuối
  total = max(0, base_total - account_points_discount - instant_points_discount)

  -- 5. Trừ điểm tài khoản (atomic)
  IF account_points_used > 0:
    UPDATE profiles SET current_points = current_points - account_points_used
    INSERT points_transactions (
      type='use_account_direct',
      delta=-account_points_used,
      ref_order_id=NEW_ORDER_ID, ...
    )

  -- 6. Đổi quà checkout (nếu có)
  IF input.gift_id IS NOT NULL:
    SELECT points_required, stock FROM gifts WHERE id = input.gift_id FOR UPDATE
    IF stock <= 0: RAISE 'Hết quà'
    UPDATE profiles SET current_points = current_points - points_required
    UPDATE gifts SET stock = stock - 1
    INSERT gift_redemptions (
      source='checkout', ref_order_id=NEW_ORDER_ID,
      points_used=points_required, ...
    )
    INSERT points_transactions (type='redeem_gift', delta=-points_required, ...)

  -- 7. Tạo đơn
  INSERT orders (
    status='pending', subtotal, shipping_fee, total,
    points_to_earn, points_earned_at=NULL,
    instant_points_used, instant_points_discount,
    account_points_used, account_points_discount,
    account_points_refunded_at=NULL,
    ...
  )
  INSERT order_items (... với snapshot)

  -- 8. Trừ tồn kho
  UPDATE products SET stock = stock - qty (mỗi item)

  RETURN order_id
COMMIT
```

---

## 10. PSEUDOCODE — RPC `cancel_order` & `customer_cancel_order`

```
BEGIN TRANSACTION
  SELECT * FROM orders WHERE id = p_order_id FOR UPDATE

  -- Validate
  IF status IN ('cancelled','refunded'): RAISE 'Đã hủy/hoàn rồi'
  IF caller = customer:
    IF orders.user_id != auth.uid(): RAISE 'Không phải đơn của bạn'
    IF status != 'pending': RAISE 'Chỉ tự hủy khi pending'
  ELSE (admin):
    IF status NOT IN ('pending','confirmed','shipping'):
      RAISE 'Trạng thái này dùng refund_completed_order thay vì cancel'

  -- 1. Hoàn điểm TÀI KHOẢN đã dùng giảm tiền (chống trùng)
  IF account_points_used > 0 AND account_points_refunded_at IS NULL:
    UPDATE profiles SET current_points = current_points + account_points_used
                  WHERE id = orders.user_id
    UPDATE orders SET account_points_refunded_at = now()
    INSERT points_transactions (
      type='refund_account_direct',
      delta=+account_points_used,
      ref_order_id=p_order_id, ...
    )

  -- 2. Hủy gift_redemptions gắn (chống trùng)
  FOR EACH r IN gift_redemptions WHERE ref_order_id = p_order_id
                                  AND status != 'cancelled' AND refunded = false:
    UPDATE r SET status='cancelled', refunded=true
    UPDATE profiles SET current_points = current_points + r.points_used
    UPDATE gifts SET stock = stock + 1
    INSERT points_transactions (type='refund_gift', delta=+r.points_used, ...)

  -- 3. Hoàn tồn kho sản phẩm
  FOR EACH item IN order_items:
    UPDATE products SET stock = stock + item.qty

  -- KHÔNG hoàn instant_points_used (sinh từ đơn, không phải tài sản TK)
  -- KHÔNG động points_to_earn (chưa cộng vì status chưa từng = completed)

  UPDATE orders SET status='cancelled', updated_at=now()
COMMIT
```

---

## 11. PSEUDOCODE — RPC `refund_completed_order`

```
BEGIN TRANSACTION
  SELECT * FROM orders WHERE id = p_order_id FOR UPDATE
  IF status != 'completed': RAISE 'Chỉ refund được đơn đã completed'

  -- 1. Hoàn điểm TÀI KHOẢN đã dùng giảm tiền (chống trùng)
  IF account_points_used > 0 AND account_points_refunded_at IS NULL:
    UPDATE profiles SET current_points = current_points + account_points_used
                  WHERE id = orders.user_id
    UPDATE orders SET account_points_refunded_at = now()
    INSERT points_transactions (
      type='refund_account_direct',
      delta=+account_points_used,
      ref_order_id=p_order_id, ...
    )

  -- 2. Trừ lại points_to_earn đã cộng (clamp 0)
  IF points_earned_at IS NOT NULL AND points_to_earn > 0:
    SELECT current_points FROM profiles WHERE id = orders.user_id FOR UPDATE
    actual = LEAST(points_to_earn, current_points)
    UPDATE profiles SET current_points = current_points - actual
    INSERT points_transactions (type='revoke', delta=-actual, ...)
    IF actual < points_to_earn:
      INSERT points_transactions (
        type='clamp', delta=0,
        reason='clamped: needed=' || points_to_earn || ' available=' || actual
      )

  -- 3. Hủy gift_redemptions gắn (tùy p_refund_gifts)
  IF p_refund_gifts:
    FOR EACH r IN gift_redemptions WHERE ref_order_id = p_order_id
                                    AND status != 'cancelled' AND refunded = false:
      UPDATE r SET status='cancelled', refunded=true
      UPDATE profiles SET current_points = current_points + r.points_used
      UPDATE gifts SET stock = stock + 1
      INSERT points_transactions (type='refund_gift', delta=+r.points_used, ...)

  -- KHÔNG hoàn instant_points_used (chỉ là discount; refund tiền = total đã thu là đủ)

  -- 4. Hoàn tồn kho sản phẩm
  FOR EACH item IN order_items:
    UPDATE products SET stock = stock + item.qty

  UPDATE orders SET status='refunded', updated_at=now()
COMMIT
```

---

## 12. TEST CHECKLIST (chỉ phần điểm/tiền)

### 12.1 Tạo đơn — điểm sản phẩm
- [ ] Đặt đơn chọn "tích" → `points_to_earn` lưu, `current_points` KHÔNG đổi
- [ ] Đặt đơn chọn "dùng ngay" → `instant_points_used` lưu, `current_points` KHÔNG đổi
- [ ] `instant_points_used > floor(base_total/1000)` → bị clamp về max, phần dư bốc hơi
- [ ] Phần dư khi clamp KHÔNG được tự động chuyển sang tích vào TK

### 12.2 Tạo đơn — điểm tài khoản
- [ ] Đặt đơn `account_points_used = N` → `current_points` trừ ngay N + log `use_account_direct`
- [ ] Đặt đơn có đổi quà checkout → `current_points` trừ thêm `gift.points_required` + log `redeem_gift`
- [ ] `account_points_used + gift_points_used > current_points` → REJECT
- [ ] `account_points_used > floor(remaining_after_instant / 1000)` → REJECT

### 12.3 Tính tiền
- [ ] `final_total = base_total − instant_discount − account_discount`, clamp ≥ 0
- [ ] Tổng tiền KHÔNG bao giờ âm
- [ ] Cập nhật realtime khi khách thay đổi điểm dùng
- [ ] Frontend KHÔNG tự tính — chỉ hiển thị; backend là nguồn sự thật

### 12.4 Hoàn thành đơn
- [ ] Admin chuyển `completed` → cộng `points_to_earn` vào TK + set `points_earned_at` + log `earn`
- [ ] Chuyển `completed` lần 2 (idempotent) → KHÔNG cộng lần 2

### 12.5 Hủy đơn (CHỈ pending hoặc confirmed — KHÔNG shipping)
- [ ] Hủy đơn có `account_points_used = N` → hoàn N vào TK + set `account_points_refunded_at` + log `refund_account_direct`
- [ ] Hủy đơn 2 lần → KHÔNG hoàn 2 lần (cờ đã có)
- [ ] Hủy đơn có gift_redemption gắn → redemption `cancelled` + `refunded=true` + hoàn `points_used` + log `refund_gift`
- [ ] Hủy đơn có `instant_points_used` → `current_points` KHÔNG đổi (không hoàn)
- [ ] Hủy đơn có `points_to_earn` (chưa completed) → KHÔNG động `points_to_earn`, TK không đổi
- [ ] Hoàn tồn kho sản phẩm

### 12.6 Refund đơn completed
- [ ] Refund → hoàn `account_points_used` (nếu chưa) + log đúng
- [ ] Refund → trừ `points_to_earn` đã cộng, clamp về 0 nếu không đủ + log `revoke` + `clamp` (nếu cần)
- [ ] Refund 2 lần → KHÔNG hoàn 2 lần
- [ ] KHÔNG hoàn `instant_points_used`

### 12.7 Đối xứng (3 ví dụ chính)
- [ ] **Đối xứng 1:** TK=500, đặt đơn 100 account + 300 gift → TK=100. Hủy → TK=500
- [ ] **Đối xứng 2:** TK=50, đặt đơn instant 80 → TK=50. Hủy → TK=50
- [ ] **Đối xứng 3:** TK=50, đặt earn 120 → TK=50. Completed → TK=170. Refund → TK=50

### 12.8 Audit log
- [ ] Mọi thay đổi `current_points` đều có 1 row `points_transactions` tương ứng
- [ ] `points_transactions` không bao giờ bị xóa (chỉ INSERT)
- [ ] `balance_after` ghi đúng giá trị `current_points` sau giao dịch

---

## 13. CÁC ĐIỂM ĐÃ CHỐT

- ✅ **Tổng đơn về 0đ** (dùng 100% điểm) — **CHO PHÉP** đặt đơn, COD vẫn xác nhận, khách nhận hàng không trả tiền
- ✅ **Phí ship MVP** — `shipping_fee_original = 45.000đ` (UI gạch ngang) + `shipping_fee = 0` (free ship toàn quốc thực tế)
- ✅ **`p_refund_gifts` mặc định** — `true` (giả định khách trả quà khi refund đơn completed)
- ✅ **Hủy đơn theo trạng thái:**
  - `pending`: khách tự hủy / admin hủy → `cancel_order` / `customer_cancel_order`
  - `confirmed`: khách yêu cầu (`request_cancel_order`) → admin duyệt (`cancel_order`); admin có thể hủy thẳng
  - `shipping`: KHÔNG hủy trực tiếp. Admin chuyển → `completed` rồi `refund_completed_order` nếu cần. Phase 2 thêm return flow.
  - `completed`: chỉ admin → `refund_completed_order`

---

**Đây là tất cả logic mua hàng + tính điểm + trừ tiền. Các phần khác (auth, admin, brand, SEO...) ở file `THIET-KE.md` chính.**

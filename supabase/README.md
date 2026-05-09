# Supabase Migrations

5 file SQL migration cho database Vua Bỉm.

## Thứ tự apply

Phải chạy theo đúng thứ tự (thứ tự dependencies):

| # | File | Nội dung |
|---|------|---------|
| 1 | `migrations/0001_schema.sql` | 10 bảng + indexes |
| 2 | `migrations/0002_triggers.sql` | Auto-tạo profiles + auto updated_at |
| 3 | `migrations/0003_rls.sql` | RLS policies + helper `is_admin()` |
| 4 | `migrations/0004_rpc.sql` | 12 RPC functions (place_order, cancel_order, ...) |
| 5 | `migrations/0005_seed_brands.sql` | Seed 15 hãng bỉm |

## Cách apply (Supabase Dashboard → SQL Editor)

1. Vào https://supabase.com/dashboard/project/gfwrshbvumcfaxkurnhv/sql/new
2. Mở file `0001_schema.sql` — copy toàn bộ nội dung — paste vào editor — bấm **Run**
3. Đợi notification "Success. No rows returned"
4. Lặp lại với các file 0002, 0003, 0004, 0005 theo thứ tự

## Verify sau khi apply

Mở **Table Editor** ở sidebar Supabase, phải thấy 10 bảng:
- profiles, brands, products, gifts, cart_items
- orders, order_items, gift_redemptions, order_messages, points_transactions

Trong `brands`, phải có 15 row đã seed.

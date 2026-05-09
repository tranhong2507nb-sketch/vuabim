-- ============================================================
-- Vua Bỉm — Migration 0007: Seed quà đổi điểm cho DEV
-- ============================================================
-- 5 quà demo để test luồng đổi quà.
-- Ảnh placeholder. Admin sẽ thay sau.

insert into public.gifts (name, image_url, description, points_required, stock, is_active)
values
  ('Khăn ướt cao cấp Merries 80 tờ',
   'https://placehold.co/600x600/22C7C9/ffffff/png?text=Khan+uot',
   'Khăn ướt mềm mại, không hương liệu. Phù hợp da nhạy cảm của bé.',
   30, 50, true),

  ('Bộ 2 yếm ăn dặm chống thấm',
   'https://placehold.co/600x600/FF7EB6/ffffff/png?text=Yem+an+dam',
   'Yếm silicone mềm, có máng hứng thức ăn rơi. Dễ vệ sinh.',
   80, 30, true),

  ('Kem chống hăm Bübchen 20g',
   'https://placehold.co/600x600/FFC83D/333333/png?text=Kem+chong+ham',
   'Kem chống hăm nhập khẩu Đức. An toàn cho bé sơ sinh.',
   120, 20, true),

  ('Bình sữa Pigeon Plus PPSU 240ml',
   'https://placehold.co/600x600/0891B2/ffffff/png?text=Binh+sua',
   'Núm ti silicone mô phỏng vú mẹ. Chống đầy hơi.',
   200, 15, true),

  ('Combo bỉm M (1 gói 30 miếng) — quà tri ân',
   'https://placehold.co/600x600/22C7C9/ffffff/png?text=Combo+bim+M',
   'Quà đặc biệt cho mẹ tích lũy nhiều điểm.',
   500, 5, true)
on conflict do nothing;

-- DONE — 5 quà demo seed

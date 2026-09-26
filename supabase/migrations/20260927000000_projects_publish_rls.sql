-- =====================================================================
-- Migration: proyek yang belum dipublikasikan tidak bisa dibaca lewat
--            API anon (REST / supabase-js dengan anon key).
--
-- Sebelumnya policy SELECT publik di tabel projects memakai USING (true),
-- sehingga setiap orang dengan anon key bisa membaca baris draft lewat
-- endpoint /rest/v1/projects. Frontend memang menyembunyikannya, tetapi
-- datanya tetap bocor lewat API.
--
-- Setelah migration ini:
--   * anon / authenticated  -> hanya bisa membaca baris terpublikasi
--   * admin (role='admin')  -> tetap bisa membaca semua baris, termasuk
--                              draft, lewat policy "admin manage projects"
--
-- Aman dijalankan berulang (idempotent).
-- Cara pakai: jalankan di Supabase Dashboard -> SQL Editor,
-- atau `supabase db push` / `supabase migration up` bila memakai CLI.
-- =====================================================================

-- 1. Pastikan kolomnya ada (untuk database lama yang dibuat sebelum
--    kolom ini ada). Kolom baru, tidak menghapus data apa pun.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- 2. Baris lama yang belum punya nilai dianggap terpublikasi, supaya
--    tidak ada proyek yang mendadak hilang dari situs.
UPDATE public.projects
SET is_published = true
WHERE is_published IS NULL;

-- 3. RLS harus aktif (no-op bila sudah aktif).
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. Ganti policy baca publik: hanya proyek terpublikasi yang terbaca.
--    "IS NOT FALSE" dipilih supaya cocok dengan perilaku frontend
--    (src/utils/projects.js): true/null = tampil, false = tersembunyi.
DROP POLICY IF EXISTS "public read projects" ON public.projects;
DROP POLICY IF EXISTS "public read published projects" ON public.projects;

CREATE POLICY "public read published projects"
ON public.projects
FOR SELECT
USING (is_published IS NOT FALSE);

-- 5. Admin tetap boleh membaca SEMUA baris (termasuk draft) dan melakukan
--    insert/update/delete. Policy ini sudah ada pada setup awal; dibuat
--    ulang dari nol supaya migration ini juga berjalan sendiri di
--    database yang belum memilikinya (efeknya sama, policy di-OR-kan).
DROP POLICY IF EXISTS "admin manage projects" ON public.projects;

CREATE POLICY "admin manage projects"
ON public.projects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================================
-- Verifikasi (jalankan manual, satu blok per blok, di SQL Editor):
--
--   -- sebagai anon: harus muncul hanya baris terpublikasi
--   SET ROLE anon;
--   SELECT id, "Title", is_published FROM public.projects;
--   RESET ROLE;
--
--   -- sebagai admin: semua baris, termasuk draft
--   -- (butuh auth.uid() yang terdaftar di public.profiles dengan role
--   --  'admin', jadi biasanya diuji lewat aplikasi, bukan SQL Editor)
--
--   -- daftar policy harus memuat "public read published projects" dan
--   -- "admin manage projects" untuk tabel projects:
--   SELECT policyname, cmd, qual
--   FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'projects';
-- =====================================================================

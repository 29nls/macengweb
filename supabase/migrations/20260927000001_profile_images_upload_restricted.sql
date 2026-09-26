-- =====================================================================
-- Migration: batasi upload anonim ke bucket `profile-images`
--
-- Policy lama (juga terdokumentasi di README sebelum perbaikan ini):
--
--   CREATE POLICY "public upload profile images"
--   ON storage.objects FOR INSERT TO public
--   WITH CHECK (bucket_id = 'profile-images');
--
-- Policy itu mengizinkan SIAPA SAJA (termasuk akun anonim) menyimpan file
-- dengan nama apa pun ke bucket publik: file HTML/SVG (risiko XSS pada
-- domain storage), arsip, biner besar, dsb. — penyalahgunaan storage.
--
-- Fitur yang harus tetap berjalan: pengunjung mengunggah foto profil saat
-- berkomentar (src/components/Commentar.jsx sudah memvalidasi tipe gambar
-- dan ukuran maks 5 MB di sisi klien), jadi INSERT publik TIDAK dihapus —
-- hanya dibatasi berkas gambar.
--
-- Policy SELECT publik untuk bucket ini tidak diubah (dibutuhkan untuk
-- menampilkan foto komentar), begitu pula tidak ada UPDATE/DELETE publik.
--
-- Aman dijalankan berulang (idempotent).
-- Cara pakai: Supabase Dashboard -> SQL Editor, atau `supabase db push`.
-- =====================================================================

-- 1. Buang policy lama (tanpa filter) dan policy ini bila sudah dibuat
--    oleh run sebelumnya.
DROP POLICY IF EXISTS "public upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "profile images are images only" ON storage.objects;

-- 2. Pasang versi yang menyaring berdasarkan ekstensi nama file.
--    `name` adalah path objek dalam bucket, jadi selalu tersedia saat INSERT
--    — tidak bergantung pada kolom metadata yang bisa bernilai NULL.
CREATE POLICY "profile images are images only"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'profile-images'
  AND name ~* '\.(jpg|jpeg|png|gif|webp|avif)$'
);

-- =====================================================================
-- Catatan batasan & verifikasi
--
-- * Filter ini menolak nama file non-gambar. Ukuran file TIDAK bisa
--   dibatasi dengan aman lewat RLS (metadata->>'size' bisa NULL saat
--   INSERT, sehingga upload justru bisa gagal semua). Pembatasan ukuran
--   tetap di sisi klien (Commentar.jsx, 5MB).
-- * Verifikasi dari SQL Editor:
--
--     -- harus BERHASIL:
--     INSERT INTO storage.objects (bucket_id, name, owner, metadata)
--     VALUES ('profile-images', 'profile-images/test.jpg', NULL, NULL);
--     ROLLBACK;
--
--     -- harus DITOLAK:
--     INSERT INTO storage.objects (bucket_id, name, owner, metadata)
--     VALUES ('profile-images', 'profile-images/test.html', NULL, NULL);
--     ROLLBACK;
--
--     SELECT policyname, cmd, qual
--     FROM pg_policies
--     WHERE schemaname = 'storage' AND tablename = 'objects'
--       AND policyname = 'profile images are images only';
-- =====================================================================

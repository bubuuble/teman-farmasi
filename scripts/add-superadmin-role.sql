-- ============================================================
-- Migration: Tambah role 'superadmin' ke tabel profiles
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Cek apakah kolom role menggunakan CHECK constraint dan update jika perlu
-- Coba hapus constraint lama jika ada
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Tambah constraint baru yang mencakup 'superadmin'
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'mentor', 'admin', 'superadmin'));

-- 3. (Opsional) Set superadmin pertama secara manual dengan mengubah email berikut
-- UPDATE profiles SET role = 'superadmin' WHERE email = 'your-superadmin@email.com';

-- Verifikasi
SELECT id, full_name, email, role FROM profiles WHERE role = 'superadmin';

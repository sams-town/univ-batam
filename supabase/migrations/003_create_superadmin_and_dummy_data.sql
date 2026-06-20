
-- ============================================
-- SKRIP SQL UNTUK MEMBUAT SUPERADMIN DAN DATA DUMMY
-- ============================================

-- CATATAN:
-- 1. Jalankan script ini di Supabase SQL Editor
-- 2. PASTIKAN kamu sudah membuat user di Supabase Auth terlebih dahulu!
-- 3. Ganti 'YOUR_AUTH_USER_ID' dengan user ID dari Supabase Auth

-- ============================================
-- 1. PASTIKAN ROLE 'super_admin' ADA DI TABEL roles
-- ============================================
INSERT INTO roles (name, description)
VALUES ('super_admin', 'Super Administrator with full access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description)
VALUES ('admin_akademik', 'Academic Administrator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description)
VALUES ('dosen', 'Lecturer')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description)
VALUES ('mahasiswa', 'Student')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. DATA DUMMY FAKULTAS, JURUSAN, PROGRAM STUDI
-- ============================================
INSERT INTO faculties (name, code, description)
VALUES 
('Fakultas Teknik', 'FT', 'Fakultas Teknik'),
('Fakultas Ilmu Komputer', 'FIK', 'Fakultas Ilmu Komputer'),
('Fakultas Ekonomi dan Bisnis', 'FEB', 'Fakultas Ekonomi dan Bisnis')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (name, code, faculty_id, description)
SELECT 
  'Teknik Informatika', 'TI', id, 'Departemen Teknik Informatika'
FROM faculties WHERE code = 'FT'
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (name, code, faculty_id, description)
SELECT 
  'Teknik Industri', 'TIND', id, 'Departemen Teknik Industri'
FROM faculties WHERE code = 'FT'
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (name, code, faculty_id, description)
SELECT 
  'Sistem Informasi', 'SI', id, 'Departemen Sistem Informasi'
FROM faculties WHERE code = 'FIK'
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (name, code, faculty_id, description)
SELECT 
  'Manajemen', 'MAN', id, 'Departemen Manajemen'
FROM faculties WHERE code = 'FEB'
ON CONFLICT (code) DO NOTHING;

INSERT INTO programs (name, code, department_id, degree, description)
SELECT 
  'S1 Teknik Informatika', 'TI-S1', id, 'S1', 'Program Sarjana Teknik Informatika'
FROM departments WHERE code = 'TI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO programs (name, code, department_id, degree, description)
SELECT 
  'S1 Sistem Informasi', 'SI-S1', id, 'S1', 'Program Sarjana Sistem Informasi'
FROM departments WHERE code = 'SI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO programs (name, code, department_id, degree, description)
SELECT 
  'S1 Manajemen', 'MAN-S1', id, 'S1', 'Program Sarjana Manajemen'
FROM departments WHERE code = 'MAN'
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 3. DATA DUMMY TAHUN AJARAN DAN SEMESTER
-- ============================================
INSERT INTO academic_years (name, start_date, end_date, is_active)
VALUES 
('2023/2024', '2023-08-01', '2024-05-31', false),
('2024/2025', '2024-08-01', '2025-05-31', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO semesters (academic_year_id, name, term, start_date, end_date, is_active)
SELECT 
  id, 'Ganjil 2023/2024', 'ganjil', '2023-08-01', '2024-01-31', false
FROM academic_years WHERE name = '2023/2024'
ON CONFLICT DO NOTHING;

INSERT INTO semesters (academic_year_id, name, term, start_date, end_date, is_active)
SELECT 
  id, 'Genap 2023/2024', 'genap', '2024-02-01', '2024-05-31', false
FROM academic_years WHERE name = '2023/2024'
ON CONFLICT DO NOTHING;

INSERT INTO semesters (academic_year_id, name, term, start_date, end_date, is_active)
SELECT 
  id, 'Ganjil 2024/2025', 'ganjil', '2024-08-01', '2025-01-31', true
FROM academic_years WHERE name = '2024/2025'
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. DATA DUMMY RUANG KELAS
-- ============================================
INSERT INTO classrooms (name, code, capacity, location)
VALUES 
('Ruang Kuliah 101', 'RK-101', 50, 'Gedung A Lt. 1'),
('Ruang Kuliah 102', 'RK-102', 30, 'Gedung A Lt. 1'),
('Ruang Komputer 201', 'R-Kom-201', 40, 'Gedung B Lt. 2'),
('Ruang Kuliah 301', 'RK-301', 50, 'Gedung C Lt. 3')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 5. DATA DUMMY MATA KULIAH
-- ============================================
INSERT INTO courses (name, code, credits, description)
VALUES
('Pemrograman Web', 'PW', 3, 'Pemrograman Web dengan HTML, CSS, dan JavaScript'),
('Basis Data', 'BD', 3, 'Dasar-dasar Basis Data dan SQL'),
('Struktur Data dan Algoritma', 'SDA', 4, 'Struktur data dan algoritma dasar'),
('Analisis dan Desain Sistem Informasi', 'ADSI', 3, 'Analisis dan desain sistem informasi'),
('Manajemen Keuangan', 'MK', 3, 'Dasar-dasar manajemen keuangan')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 6. BUAT SUPERADMIN OTOMATIS
-- ============================================
-- Langkah-langkah:
-- 1. Buka Supabase Dashboard > Authentication > Users
-- 2. Klik "Add user" > Create new user
--    - Email: admin@example.com
--    - Password: admin123
--    - Centang "Auto Confirm User"
-- 3. Copy User UID yang muncul
-- 4. Jalankan query di bawah ini (ganti YOUR_AUTH_USER_ID):

-- INSERT INTO profiles (id, first_name, last_name, email, role_id)
-- SELECT 
--   'YOUR_AUTH_USER_ID',
--   'Super',
--   'Admin',
--   'admin@example.com',
--   id
-- FROM roles WHERE name = 'super_admin'
-- ON CONFLICT (id) DO NOTHING;



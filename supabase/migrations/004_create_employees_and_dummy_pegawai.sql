-- ============================================
-- 1. TAMBAH ROLE PEGAWAI / KARYAWAN
-- ============================================
INSERT INTO public.roles (name, description)
VALUES ('pegawai', 'Pegawai / Karyawan')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. CREATE EMPLOYEES TABLE (IF NOT EXISTS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    nip VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. DUMMY PEGAWAI (INSTRUKSI MANUAL)
-- ============================================
-- Karena login di Supabase membutuhkan auth.users, jalankan ini setelah Anda:
-- 1. Buat User baru di Supabase Dashboard (Authentication > Users > Add user)
-- 2. Isi Email: pegawai.dummy@univbatam.ac.id | Password: pegawai123
-- 3. Copy User UID yang muncul dan ganti 'YOUR_AUTH_USER_ID' di bawah ini:

-- INSERT INTO public.profiles (id, first_name, last_name, email, role_id)
-- SELECT 
--   'YOUR_AUTH_USER_ID',
--   'Pegawai',
--   'Dummy',
--   'pegawai.dummy@univbatam.ac.id',
--   id
-- FROM public.roles WHERE name = 'pegawai'
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO public.employees (profile_id, nip, status)
-- VALUES (
--   'YOUR_AUTH_USER_ID',
--   '123456789012345678',
--   'Tetap'
-- ) ON CONFLICT DO NOTHING;

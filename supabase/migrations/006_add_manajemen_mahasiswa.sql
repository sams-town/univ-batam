-- =======================================================
-- MIGRATION: ADD MANAJEMEN MAHASISWA MODULE
-- VERSION: 1.0
-- DESCRIPTION: Creates tables and fields for student life-cycle management
-- =======================================================

-- 1. Update public.students with missing attributes
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS status_akademik VARCHAR(50) DEFAULT 'Aktif',
ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS kelas VARCHAR(50) DEFAULT 'Reguler A',
ADD COLUMN IF NOT EXISTS dosen_pa_id UUID REFERENCES public.lecturers(id) ON DELETE SET NULL;

-- 2. Create Master Registration Tables (to support master data forms)
CREATE TABLE IF NOT EXISTS public.student_academics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.faculties(id) ON DELETE SET NULL,
    study_program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    admission_year VARCHAR(10),
    entry_semester VARCHAR(20),
    admission_path VARCHAR(50),
    student_status VARCHAR(50) DEFAULT 'Aktif',
    academic_advisor_id UUID REFERENCES public.lecturers(id) ON DELETE SET NULL,
    current_semester INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    father_name VARCHAR(100),
    father_nik VARCHAR(30),
    father_birth_date DATE,
    father_education VARCHAR(50),
    father_job VARCHAR(50),
    father_income VARCHAR(50),
    father_phone VARCHAR(30),
    mother_name VARCHAR(100),
    mother_nik VARCHAR(30),
    mother_birth_date DATE,
    mother_education VARCHAR(50),
    mother_job VARCHAR(50),
    mother_income VARCHAR(50),
    mother_phone VARCHAR(30),
    guardian_name VARCHAR(100),
    guardian_relation VARCHAR(50),
    guardian_job VARCHAR(50),
    guardian_phone VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    previous_school_name VARCHAR(255),
    school_major VARCHAR(100),
    graduation_year VARCHAR(10),
    certificate_number VARCHAR(100),
    nisn VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_finances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    ukt_group VARCHAR(50),
    ukt_amount NUMERIC,
    payment_status VARCHAR(50) DEFAULT 'Belum Lunas',
    is_scholarship BOOLEAN DEFAULT FALSE,
    scholarship_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Student Status History Table
CREATE TABLE IF NOT EXISTS public.status_akademik_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    status_lama VARCHAR(50),
    status_baru VARCHAR(50),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create KRS and KRS Items Tables
CREATE TABLE IF NOT EXISTS public.krs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
    status_persetujuan VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Disetujui', 'Ditolak'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, semester_id)
);

CREATE TABLE IF NOT EXISTS public.krs_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    krs_id UUID REFERENCES public.krs(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(krs_id, course_id)
);

-- 5. Create Nilai Mahasiswa Table (for KHS and Transcript)
CREATE TABLE IF NOT EXISTS public.nilai_mahasiswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    nilai_angka NUMERIC NOT NULL DEFAULT 0,
    nilai_huruf VARCHAR(10) NOT NULL DEFAULT 'E',
    bobot NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, semester_id, course_id)
);

-- 6. Create Student Permit/Sick Attendance Leave Table
CREATE TABLE IF NOT EXISTS public.perizinan_absensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    jenis_izin VARCHAR(20) NOT NULL, -- 'Sakit', 'Izin'
    keterangan TEXT,
    file_url TEXT,
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Disetujui', 'Ditolak'
    dosen_id UUID REFERENCES public.lecturers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Student Violations Table
CREATE TABLE IF NOT EXISTS public.pelanggaran_mahasiswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    jenis_pelanggaran VARCHAR(100), -- 'Ringan', 'Sedang', 'Berat'
    poin INTEGER DEFAULT 0,
    keterangan TEXT,
    tindakan_sp VARCHAR(50) DEFAULT 'Tidak Ada', -- 'Tidak Ada', 'SP1', 'SP2', 'SP3'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Student Achievements Table
CREATE TABLE IF NOT EXISTS public.prestasi_mahasiswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    jenis_prestasi VARCHAR(50), -- 'Akademik', 'Non Akademik'
    nama_prestasi VARCHAR(255),
    sertifikat_url TEXT,
    piagam_url TEXT,
    dokumentasi_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create Student Scholarship Table
CREATE TABLE IF NOT EXISTS public.beasiswa_mahasiswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    jenis_beasiswa VARCHAR(100),
    periode VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Aktif',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create Internship/PKL Table
CREATE TABLE IF NOT EXISTS public.pkl_magang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    tempat_magang VARCHAR(255),
    pembimbing_kampus UUID REFERENCES public.lecturers(id) ON DELETE SET NULL,
    pembimbing_lapangan VARCHAR(100),
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    nilai NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Create Skripsi/Tugas Akhir Table
CREATE TABLE IF NOT EXISTS public.skripsi_ta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
    judul TEXT,
    pembimbing_1 UUID REFERENCES public.lecturers(id) ON DELETE SET NULL,
    pembimbing_2 UUID REFERENCES public.lecturers(id) ON DELETE SET NULL,
    penguji VARCHAR(255),
    tgl_sempro DATE,
    tgl_semhas DATE,
    tgl_sidang DATE,
    nilai_akhir VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Create Alumni Table
CREATE TABLE IF NOT EXISTS public.alumni (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
    tahun_lulus INTEGER,
    ipk NUMERIC,
    lama_studi VARCHAR(50),
    no_ijazah VARCHAR(100),
    status_pekerjaan VARCHAR(100),
    tempat_kerja VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

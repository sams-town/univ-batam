-- =======================================================
-- MIGRATION: ADD PAYROLL DOSEN MODULE
-- VERSION: 1.0
-- DESCRIPTION: Creates tables for lecturer payroll and configuration
-- =======================================================

-- 1. Update public.attendance_sessions to support Payroll Dosen validations
ALTER TABLE public.attendance_sessions 
ADD COLUMN IF NOT EXISTS token VARCHAR(10),
ADD COLUMN IF NOT EXISTS berita_acara TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Selesai',
ADD COLUMN IF NOT EXISTS mode VARCHAR(10) DEFAULT 'luring', -- 'daring' or 'luring'
ADD COLUMN IF NOT EXISTS pertemuan INTEGER;

-- 2. Create Master Tarif Mengajar Table
CREATE TABLE IF NOT EXISTS public.tarif_dosen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dosen_id UUID REFERENCES public.lecturers(id) ON DELETE CASCADE UNIQUE,
    status_dosen VARCHAR(50) NOT NULL, -- e.g. 'Tetap', 'Luar Biasa', 'Kontrak'
    tarif_daring NUMERIC NOT NULL DEFAULT 75000,
    tarif_luring NUMERIC NOT NULL DEFAULT 100000,
    gaji_pokok NUMERIC NOT NULL DEFAULT 0,
    tunjangan NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Payroll Dosen Table
CREATE TABLE IF NOT EXISTS public.payroll_dosen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periode VARCHAR(50) NOT NULL, -- Format: 'Bulan Tahun' contoh 'Juni 2026'
    dosen_id UUID REFERENCES public.lecturers(id) ON DELETE CASCADE,
    gaji_pokok NUMERIC NOT NULL DEFAULT 0,
    insentif_daring NUMERIC NOT NULL DEFAULT 0,
    insentif_luring NUMERIC NOT NULL DEFAULT 0,
    tunjangan NUMERIC NOT NULL DEFAULT 0,
    potongan NUMERIC NOT NULL DEFAULT 0,
    total_gaji NUMERIC NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Locked', 'Cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(periode, dosen_id)
);

-- 4. Create Payroll Dosen Detail Table
CREATE TABLE IF NOT EXISTS public.payroll_dosen_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_id UUID REFERENCES public.payroll_dosen(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE UNIQUE, -- Mencegah session dibayar ganda
    jadwal_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    pertemuan INTEGER NOT NULL,
    mode VARCHAR(10) NOT NULL, -- 'daring' or 'luring'
    sks INTEGER NOT NULL,
    tarif NUMERIC NOT NULL,
    jumlah NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insert dummy tariffs for testing
INSERT INTO public.tarif_dosen (dosen_id, status_dosen, tarif_daring, tarif_luring, gaji_pokok, tunjangan, is_active)
SELECT 
    id, 
    CASE 
        WHEN nip = '198001012005011001' THEN 'Tetap' 
        WHEN nip = '198203032007031003' THEN 'Kontrak'
        ELSE 'Luar Biasa' 
    END AS status_dosen,
    75000 AS tarif_daring, 
    100000 AS tarif_luring, 
    CASE 
        WHEN nip = '198001012005011001' THEN 5000000 
        WHEN nip = '198203032007031003' THEN 3000000
        ELSE 0 
    END AS gaji_pokok,
    CASE 
        WHEN nip = '198001012005011001' THEN 1500000 
        WHEN nip = '198203032007031003' THEN 500000
        ELSE 0 
    END AS tunjangan,
    TRUE AS is_active
FROM public.lecturers
ON CONFLICT (dosen_id) DO NOTHING;

-- 6. Update existing dummy attendance sessions with required fields to be valid for testing
-- Session 1: completed, luring, token set, berita acara filled, status Selesai, pertemuan 1
UPDATE public.attendance_sessions
SET 
    token = 'A7B2',
    berita_acara = 'Materi Bab 1: Pengenalan Pemrograman Dasar dan Syntax Java.',
    status = 'Selesai',
    mode = 'luring',
    pertemuan = 1
WHERE id = (SELECT id FROM public.attendance_sessions LIMIT 1 OFFSET 0);

-- Session 2: completed, daring, token set, berita acara filled, status Selesai, pertemuan 2
UPDATE public.attendance_sessions
SET 
    token = 'F4G1',
    berita_acara = 'Materi Bab 2: Struktur Kontrol Percabangan IF-ELSE dan SWITCH.',
    status = 'Selesai',
    mode = 'daring',
    pertemuan = 2
WHERE id = (SELECT id FROM public.attendance_sessions LIMIT 1 OFFSET 1);

-- 7. Add RPC Function to perform transaction safe payroll generation
CREATE OR REPLACE FUNCTION public.create_payroll_with_details(
    p_periode VARCHAR,
    p_dosen_id UUID,
    p_gaji_pokok NUMERIC,
    p_insentif_daring NUMERIC,
    p_insentif_luring NUMERIC,
    p_tunjangan NUMERIC,
    p_potongan NUMERIC,
    p_total_gaji NUMERIC,
    p_details JSONB
) RETURNS UUID AS $$
DECLARE
    v_payroll_id UUID;
    v_detail JSONB;
BEGIN
    -- Delete existing payroll for the period and dosen if it exists and is in 'Draft' status (allows regeneration)
    DELETE FROM public.payroll_dosen 
    WHERE periode = p_periode AND dosen_id = p_dosen_id AND status = 'Draft';

    -- Insert payroll main
    INSERT INTO public.payroll_dosen (
        periode, dosen_id, gaji_pokok, insentif_daring, insentif_luring, tunjangan, potongan, total_gaji, status
    ) VALUES (
        p_periode, p_dosen_id, p_gaji_pokok, p_insentif_daring, p_insentif_luring, p_tunjangan, p_potongan, p_total_gaji, 'Draft'
    ) RETURNING id INTO v_payroll_id;

    -- Insert details
    FOR v_detail IN SELECT * FROM jsonb_array_elements(p_details) LOOP
        INSERT INTO public.payroll_dosen_detail (
            payroll_id, session_id, jadwal_id, pertemuan, mode, sks, tarif, jumlah
        ) VALUES (
            v_payroll_id,
            (v_detail->>'session_id')::UUID,
            (v_detail->>'jadwal_id')::UUID,
            (v_detail->>'pertemuan')::INTEGER,
            v_detail->>'mode',
            (v_detail->>'sks')::INTEGER,
            (v_detail->>'tarif')::NUMERIC,
            (v_detail->>'jumlah')::NUMERIC
        );
    END LOOP;

    RETURN v_payroll_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

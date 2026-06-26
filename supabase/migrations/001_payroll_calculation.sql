-- ============================================
-- Payroll Calculation System for Dosen
-- ============================================

-- 1. First, ensure our tables exist (reference structure)
-- These are reference table structures; adjust to match your actual schema!

-- CREATE TABLE IF NOT EXISTS master_tarif_mengajar (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   metode VARCHAR(50) NOT NULL, -- 'Daring', 'Luring', 'Praktikum', 'Teori'
--   nominal NUMERIC(15,2) NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE IF NOT EXISTS absensi_kelas (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   dosen_id UUID NOT NULL,
--   metode VARCHAR(50) NOT NULL,
--   sesi INT NOT NULL,
--   status VARCHAR(50) DEFAULT 'Selesai',
--   tanggal DATE NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE IF NOT EXISTS slip_gaji_dosen (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   dosen_id UUID NOT NULL,
--   period_start DATE NOT NULL,
--   period_end DATE NOT NULL,
--   total_sesi INT NOT NULL,
--   total_honorarium NUMERIC(15,2) NOT NULL,
--   status VARCHAR(50) DEFAULT 'Pending',
--   created_at TIMESTAMP DEFAULT NOW(),
--   UNIQUE(dosen_id, period_start, period_end) -- Idempotency constraint!
-- );

-- ============================================
-- 2. Payroll Calculation Function
-- ============================================
CREATE OR REPLACE FUNCTION calculate_dosen_payroll(
  p_dosen_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS TABLE (
  total_sesi INT,
  total_honorarium NUMERIC(15,2),
  breakdown JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_sesi INT := 0;
  v_total_honorarium NUMERIC(15,2) := 0;
  v_breakdown JSONB := '[]'::jsonb;
  v_metode_record RECORD;
BEGIN
  -- ==========================================
  -- TRANSACTION SAFETY: Use explicit transaction handling
  -- ==========================================
  
  -- 1. Idempotency Check: If payroll already exists for this period, return existing!
  PERFORM id FROM slip_gaji_dosen
  WHERE dosen_id = p_dosen_id
  AND period_start = p_period_start
  AND period_end = p_period_end;
  
  IF FOUND THEN
    RAISE NOTICE 'Payroll already calculated for this period. Returning existing data.';
    RETURN QUERY
    SELECT total_sesi, total_honorarium, '[]'::jsonb AS breakdown
    FROM slip_gaji_dosen
    WHERE dosen_id = p_dosen_id
    AND period_start = p_period_start
    AND period_end = p_period_end;
    RETURN;
  END IF;

  -- 2. Calculate total sesi per metode
  FOR v_metode_record IN (
    SELECT 
      ak.metode,
      COUNT(*) AS sesi_count,
      mt.nominal
    FROM absensi_kelas ak
    JOIN master_tarif_mengajar mt ON ak.metode = mt.metode
    WHERE ak.dosen_id = p_dosen_id
    AND ak.tanggal BETWEEN p_period_start AND p_period_end
    AND ak.status = 'Selesai'
    GROUP BY ak.metode, mt.nominal
  ) LOOP
    v_total_sesi := v_total_sesi + v_metode_record.sesi_count;
    v_total_honorarium := v_total_honorarium + (v_metode_record.sesi_count * v_metode_record.nominal);
    
    v_breakdown := v_breakdown || jsonb_build_object(
      'metode', v_metode_record.metode,
      'sesi', v_metode_record.sesi_count,
      'nominal_per_sesi', v_metode_record.nominal,
      'subtotal', v_metode_record.sesi_count * v_metode_record.nominal
    );
  END LOOP;

  -- 3. Insert new payroll slip (idempotent due to UNIQUE constraint)
  BEGIN
    INSERT INTO slip_gaji_dosen (dosen_id, period_start, period_end, total_sesi, total_honorarium)
    VALUES (p_dosen_id, p_period_start, p_period_end, v_total_sesi, v_total_honorarium);
  EXCEPTION WHEN unique_violation THEN
    -- If another transaction inserted it just now, return existing
    RETURN QUERY
    SELECT total_sesi, total_honorarium, '[]'::jsonb AS breakdown
    FROM slip_gaji_dosen
    WHERE dosen_id = p_dosen_id
    AND period_start = p_period_start
    AND period_end = p_period_end;
    RETURN;
  END;

  RETURN QUERY
  SELECT v_total_sesi, v_total_honorarium, v_breakdown;
END;
$$;

-- ============================================
-- Example Usage:
-- ============================================
-- SELECT * FROM calculate_dosen_payroll(
--   'dosen-uuid-here', 
--   '2024-01-01'::DATE, 
--   '2024-01-31'::DATE
-- );

-- =======================================================
-- MIGRATION: ENTERPRISE SCHEMA (SOFT DELETES & AUDIT LOGS)
-- VERSION: 1.0
-- DESCRIPTION: Implements soft deletes, strict academic_year relationships, and trigger-based audit logs
-- =======================================================

-- 1. Add academic_year_id columns to transactional tables with ON DELETE RESTRICT
ALTER TABLE public.krs 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE RESTRICT;

ALTER TABLE public.schedules 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE RESTRICT;

ALTER TABLE public.attendance_sessions 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE RESTRICT;

ALTER TABLE public.student_finances 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE RESTRICT;

-- 2. Add soft delete tracking columns to critical transactional/master tables
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.lecturers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.attendance_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.attendance_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.krs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.nilai_mahasiswa ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.payroll_dosen ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Create HR employee attendance and salary integration tables
CREATE TABLE IF NOT EXISTS public.employee_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE RESTRICT,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    attendance_date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status VARCHAR(50) DEFAULT 'present', -- 'present', 'late', 'absent', 'leave'
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'allowance', 'deduction'
    default_amount NUMERIC DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payroll_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE RESTRICT,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    period VARCHAR(50) NOT NULL,
    basic_salary NUMERIC DEFAULT 0,
    allowances NUMERIC DEFAULT 0,
    deductions NUMERIC DEFAULT 0,
    net_salary NUMERIC DEFAULT 0,
    attendance_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Draft',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Audit Logs table and automated trigger processing function
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action_type VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.process_audit_log() 
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    old_val JSONB := NULL;
    new_val JSONB := NULL;
    rec_id UUID := NULL;
BEGIN
    -- Safely attempt to fetch active user ID from Supabase Session context
    BEGIN
        current_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        old_val := to_jsonb(OLD);
        BEGIN
            rec_id := (old_val->>'id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            rec_id := NULL;
        END;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_val := to_jsonb(OLD);
        new_val := to_jsonb(NEW);
        BEGIN
            rec_id := (new_val->>'id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            rec_id := NULL;
        END;
    ELSIF (TG_OP = 'INSERT') THEN
        new_val := to_jsonb(NEW);
        BEGIN
            rec_id := (new_val->>'id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            rec_id := NULL;
        END;
    END IF;

    INSERT INTO public.audit_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address
    ) VALUES (
        current_user_id,
        TG_OP,
        TG_TABLE_NAME,
        rec_id,
        old_val,
        new_val,
        inet_client_addr()::VARCHAR
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach audit triggers to master data and transactional tables
DROP TRIGGER IF EXISTS audit_students_trigger ON public.students;
CREATE TRIGGER audit_students_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_lecturers_trigger ON public.lecturers;
CREATE TRIGGER audit_lecturers_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.lecturers
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_employees_trigger ON public.employees;
CREATE TRIGGER audit_employees_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_nilai_mahasiswa_trigger ON public.nilai_mahasiswa;
CREATE TRIGGER audit_nilai_mahasiswa_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.nilai_mahasiswa
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_payroll_dosen_trigger ON public.payroll_dosen;
CREATE TRIGGER audit_payroll_dosen_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.payroll_dosen
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_attendance_sessions_trigger ON public.attendance_sessions;
CREATE TRIGGER audit_attendance_sessions_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.attendance_sessions
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_krs_trigger ON public.krs;
CREATE TRIGGER audit_krs_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.krs
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_payroll_generations_trigger ON public.payroll_generations;
CREATE TRIGGER audit_payroll_generations_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.payroll_generations
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

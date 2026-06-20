
-- =============================================
-- ADD UNIQUE CONSTRAINTS
-- =============================================

-- Add unique constraint to semesters (academic_year_id, name)
ALTER TABLE public.semesters
ADD CONSTRAINT IF NOT EXISTS unique_semester_academic_year_name UNIQUE (academic_year_id, name);

-- Add unique constraint to schedules (course_id, lecturer_id, classroom_id, semester_id, day, start_time)
ALTER TABLE public.schedules
ADD CONSTRAINT IF NOT EXISTS unique_schedule UNIQUE (course_id, lecturer_id, classroom_id, semester_id, day, start_time);


-- =============================================
-- Smart Campus Attendance - Supabase Schema
-- Production-Ready Version
-- =============================================

-- Enable extensions (pgcrypto is enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- Custom Types
-- =============================================

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'late', 'sick', 'excused', 'absent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Updated At Function
-- =============================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =============================================
-- Tables
-- =============================================

-- Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculties Table
CREATE TABLE IF NOT EXISTS public.faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES public.faculties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    degree VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic Years Table
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_date_order CHECK (end_date > start_date)
);

-- Semesters Table
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    term VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_semester_date_order CHECK (end_date > start_date)
);

-- Classrooms Table
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    capacity INTEGER CHECK (capacity > 0 OR capacity IS NULL),
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lecturers Table
CREATE TABLE IF NOT EXISTS public.lecturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    nip VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    nim VARCHAR(50) UNIQUE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    enrollment_year INTEGER CHECK (enrollment_year > 2000 OR enrollment_year IS NULL),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    credits INTEGER CHECK (credits > 0 OR credits IS NULL),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lecturer_id UUID REFERENCES public.lecturers(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
    day day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_time_order CHECK (end_time > start_time)
);

-- Schedule Students Junction Table
CREATE TABLE IF NOT EXISTS public.schedule_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(schedule_id, student_id)
);

-- Attendance Sessions Table
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    lecturer_id UUID REFERENCES public.lecturers(id) ON DELETE CASCADE,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'absent',
    checked_in_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- Face Registrations Table
CREATE TABLE IF NOT EXISTS public.face_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    image_urls TEXT[],
    embeddings JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Insert Default Data
-- =============================================

INSERT INTO public.roles (name, description) VALUES
    ('super_admin', 'Super Administrator with full access'),
    ('admin_akademik', 'Academic Administrator'),
    ('dosen', 'Lecturer'),
    ('mahasiswa', 'Student')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_departments_faculty_id ON public.departments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_programs_department_id ON public.programs(department_id);
CREATE INDEX IF NOT EXISTS idx_semesters_academic_year_id ON public.semesters(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_lecturers_profile_id ON public.lecturers(profile_id);
CREATE INDEX IF NOT EXISTS idx_lecturers_department_id ON public.lecturers(department_id);
CREATE INDEX IF NOT EXISTS idx_students_profile_id ON public.students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_program_id ON public.students(program_id);
CREATE INDEX IF NOT EXISTS idx_schedules_course_id ON public.schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_lecturer_id ON public.schedules(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_schedules_classroom_id ON public.schedules(classroom_id);
CREATE INDEX IF NOT EXISTS idx_schedules_semester_id ON public.schedules(semester_id);
CREATE INDEX IF NOT EXISTS idx_schedule_students_schedule_id ON public.schedule_students(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_students_student_id ON public.schedule_students(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_schedule_id ON public.attendance_sessions(schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_lecturer_id ON public.attendance_sessions(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_face_registrations_student_id ON public.face_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_academic_years_is_active ON public.academic_years(is_active);
CREATE INDEX IF NOT EXISTS idx_semesters_is_active ON public.semesters(is_active);

-- =============================================
-- Enable Row Level Security (RLS)
-- =============================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Drop existing policies (for idempotency)
-- =============================================

DROP POLICY IF EXISTS "Public roles are viewable by everyone" ON public.roles;
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON public.roles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert/update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Master data is viewable by authenticated users" ON public.faculties;
DROP POLICY IF EXISTS "Faculties are viewable by authenticated users" ON public.faculties;
DROP POLICY IF EXISTS "Admins can manage master data" ON public.faculties;
DROP POLICY IF EXISTS "Admins can insert faculties" ON public.faculties;
DROP POLICY IF EXISTS "Admins can update faculties" ON public.faculties;
DROP POLICY IF EXISTS "Admins can delete faculties" ON public.faculties;
DROP POLICY IF EXISTS "Master data is viewable by authenticated users" ON public.departments;
DROP POLICY IF EXISTS "Departments are viewable by authenticated users" ON public.departments;
DROP POLICY IF EXISTS "Admins can manage master data" ON public.departments;
DROP POLICY IF EXISTS "Admins can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can update departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can delete departments" ON public.departments;
DROP POLICY IF EXISTS "Master data is viewable by authenticated users" ON public.programs;
DROP POLICY IF EXISTS "Programs are viewable by authenticated users" ON public.programs;
DROP POLICY IF EXISTS "Admins can manage master data" ON public.programs;
DROP POLICY IF EXISTS "Admins can insert programs" ON public.programs;
DROP POLICY IF EXISTS "Admins can update programs" ON public.programs;
DROP POLICY IF EXISTS "Admins can delete programs" ON public.programs;
DROP POLICY IF EXISTS "Academic years are viewable by authenticated users" ON public.academic_years;
DROP POLICY IF EXISTS "Admins can manage academic years" ON public.academic_years;
DROP POLICY IF EXISTS "Admins can insert academic years" ON public.academic_years;
DROP POLICY IF EXISTS "Admins can update academic years" ON public.academic_years;
DROP POLICY IF EXISTS "Admins can delete academic years" ON public.academic_years;
DROP POLICY IF EXISTS "Semesters are viewable by authenticated users" ON public.semesters;
DROP POLICY IF EXISTS "Admins can manage semesters" ON public.semesters;
DROP POLICY IF EXISTS "Admins can insert semesters" ON public.semesters;
DROP POLICY IF EXISTS "Admins can update semesters" ON public.semesters;
DROP POLICY IF EXISTS "Admins can delete semesters" ON public.semesters;
DROP POLICY IF EXISTS "Classrooms are viewable by authenticated users" ON public.classrooms;
DROP POLICY IF EXISTS "Admins can manage classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Admins can insert classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Admins can update classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Admins can delete classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Lecturers are viewable by authenticated users" ON public.lecturers;
DROP POLICY IF EXISTS "Admins can manage lecturers" ON public.lecturers;
DROP POLICY IF EXISTS "Admins can insert lecturers" ON public.lecturers;
DROP POLICY IF EXISTS "Admins can update lecturers" ON public.lecturers;
DROP POLICY IF EXISTS "Admins can delete lecturers" ON public.lecturers;
DROP POLICY IF EXISTS "Students are viewable by authenticated users" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
DROP POLICY IF EXISTS "Admins can update students" ON public.students;
DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
DROP POLICY IF EXISTS "Courses are viewable by authenticated users" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
DROP POLICY IF EXISTS "Schedules are viewable by authenticated users" ON public.schedules;
DROP POLICY IF EXISTS "Admins and lecturers can manage schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins and lecturers can insert schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins and lecturers can update schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins and lecturers can delete schedules" ON public.schedules;
DROP POLICY IF EXISTS "Schedule students are viewable by authenticated users" ON public.schedule_students;
DROP POLICY IF EXISTS "Admins and lecturers can manage schedule students" ON public.schedule_students;
DROP POLICY IF EXISTS "Admins and lecturers can insert schedule students" ON public.schedule_students;
DROP POLICY IF EXISTS "Admins and lecturers can update schedule students" ON public.schedule_students;
DROP POLICY IF EXISTS "Admins and lecturers can delete schedule students" ON public.schedule_students;
DROP POLICY IF EXISTS "Attendance sessions are viewable by authenticated users" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Lecturers can manage their attendance sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Lecturers can insert attendance sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Lecturers can update attendance sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Lecturers can delete attendance sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Attendance records are viewable by authenticated users" ON public.attendance_records;
DROP POLICY IF EXISTS "Students can create their own attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Lecturers can manage attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Lecturers can update attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Lecturers can delete attendance records" ON public.attendance_records;
DROP POLICY IF EXISTS "Students can view their own face registrations" ON public.face_registrations;
DROP POLICY IF EXISTS "Students can manage their own face registrations" ON public.face_registrations;
DROP POLICY IF EXISTS "Students can insert face registrations" ON public.face_registrations;
DROP POLICY IF EXISTS "Students can update face registrations" ON public.face_registrations;
DROP POLICY IF EXISTS "Students can delete face registrations" ON public.face_registrations;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can send notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;

-- =============================================
-- Helper Function: Get User Role
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    role_name VARCHAR;
BEGIN
    SELECT r.name INTO role_name
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = user_id;
    RETURN role_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================
-- RLS Policies
-- =============================================

-- Roles Policies
CREATE POLICY "Roles are viewable by authenticated users"
ON public.roles FOR SELECT
TO authenticated
USING (true);

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Faculties Policies
CREATE POLICY "Faculties are viewable by authenticated users"
ON public.faculties FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert faculties"
ON public.faculties FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update faculties"
ON public.faculties FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete faculties"
ON public.faculties FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Departments Policies
CREATE POLICY "Departments are viewable by authenticated users"
ON public.departments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert departments"
ON public.departments FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update departments"
ON public.departments FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete departments"
ON public.departments FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Programs Policies
CREATE POLICY "Programs are viewable by authenticated users"
ON public.programs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert programs"
ON public.programs FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update programs"
ON public.programs FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete programs"
ON public.programs FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Academic Years Policies
CREATE POLICY "Academic years are viewable by authenticated users"
ON public.academic_years FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert academic years"
ON public.academic_years FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update academic years"
ON public.academic_years FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete academic years"
ON public.academic_years FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Semesters Policies
CREATE POLICY "Semesters are viewable by authenticated users"
ON public.semesters FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert semesters"
ON public.semesters FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update semesters"
ON public.semesters FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete semesters"
ON public.semesters FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Classrooms Policies
CREATE POLICY "Classrooms are viewable by authenticated users"
ON public.classrooms FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert classrooms"
ON public.classrooms FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update classrooms"
ON public.classrooms FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete classrooms"
ON public.classrooms FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Lecturers Policies
CREATE POLICY "Lecturers are viewable by authenticated users"
ON public.lecturers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert lecturers"
ON public.lecturers FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update lecturers"
ON public.lecturers FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete lecturers"
ON public.lecturers FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Students Policies
CREATE POLICY "Students are viewable by authenticated users"
ON public.students FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert students"
ON public.students FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update students"
ON public.students FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete students"
ON public.students FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Courses Policies
CREATE POLICY "Courses are viewable by authenticated users"
ON public.courses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can update courses"
ON public.courses FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete courses"
ON public.courses FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- Schedules Policies
CREATE POLICY "Schedules are viewable by authenticated users"
ON public.schedules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and lecturers can insert schedules"
ON public.schedules FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik', 'dosen'));

CREATE POLICY "Admins and lecturers can update schedules"
ON public.schedules FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik', 'dosen'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik', 'dosen'));

CREATE POLICY "Admins and lecturers can delete schedules"
ON public.schedules FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik', 'dosen'));

-- Schedule Students Policies
CREATE POLICY "Schedule students are viewable by authenticated users"
ON public.schedule_students FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and lecturers can insert schedule students"
ON public.schedule_students FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik', 'dosen'));

CREATE POLICY "Admins and lecturers can update schedule students"
ON public.schedule_students FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik', 'dosen'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik', 'dosen'));

CREATE POLICY "Admins and lecturers can delete schedule students"
ON public.schedule_students FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik', 'dosen'));

-- Attendance Sessions Policies
CREATE POLICY "Attendance sessions are viewable by authenticated users"
ON public.attendance_sessions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Lecturers can insert attendance sessions"
ON public.attendance_sessions FOR INSERT
TO authenticated
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.lecturers l
        WHERE l.id = attendance_sessions.lecturer_id
        AND l.profile_id = auth.uid()
    )
);

CREATE POLICY "Lecturers can update attendance sessions"
ON public.attendance_sessions FOR UPDATE
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.lecturers l
        WHERE l.id = attendance_sessions.lecturer_id
        AND l.profile_id = auth.uid()
    )
)
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.lecturers l
        WHERE l.id = attendance_sessions.lecturer_id
        AND l.profile_id = auth.uid()
    )
);

CREATE POLICY "Lecturers can delete attendance sessions"
ON public.attendance_sessions FOR DELETE
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.lecturers l
        WHERE l.id = attendance_sessions.lecturer_id
        AND l.profile_id = auth.uid()
    )
);

-- Attendance Records Policies
CREATE POLICY "Attendance records are viewable by authenticated users"
ON public.attendance_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Students can create their own attendance records"
ON public.attendance_records FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = attendance_records.student_id
        AND s.profile_id = auth.uid()
    )
);

CREATE POLICY "Lecturers can update attendance records"
ON public.attendance_records FOR UPDATE
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.attendance_sessions sess
        JOIN public.lecturers l ON sess.lecturer_id = l.id
        WHERE sess.id = attendance_records.session_id
        AND l.profile_id = auth.uid()
    )
)
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.attendance_sessions sess
        JOIN public.lecturers l ON sess.lecturer_id = l.id
        WHERE sess.id = attendance_records.session_id
        AND l.profile_id = auth.uid()
    )
);

CREATE POLICY "Lecturers can delete attendance records"
ON public.attendance_records FOR DELETE
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.attendance_sessions sess
        JOIN public.lecturers l ON sess.lecturer_id = l.id
        WHERE sess.id = attendance_records.session_id
        AND l.profile_id = auth.uid()
    )
);

-- Face Registrations Policies
CREATE POLICY "Students can view their own face registrations"
ON public.face_registrations FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = face_registrations.student_id
        AND s.profile_id = auth.uid()
    )
);

CREATE POLICY "Students can insert face registrations"
ON public.face_registrations FOR INSERT
TO authenticated
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = face_registrations.student_id
        AND s.profile_id = auth.uid()
    )
);

CREATE POLICY "Students can update face registrations"
ON public.face_registrations FOR UPDATE
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = face_registrations.student_id
        AND s.profile_id = auth.uid()
    )
)
WITH CHECK (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = face_registrations.student_id
        AND s.profile_id = auth.uid()
    )
);

CREATE POLICY "Students can delete face registrations"
ON public.face_registrations FOR DELETE
TO authenticated
USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik') OR
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = face_registrations.student_id
        AND s.profile_id = auth.uid()
    )
);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can send notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

CREATE POLICY "Admins can delete notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('super_admin', 'admin_akademik'));

-- =============================================
-- Triggers for Updated At
-- =============================================

DO $$ BEGIN
    CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_faculties_updated_at
    BEFORE UPDATE ON public.faculties
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON public.departments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON public.programs
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_academic_years_updated_at
    BEFORE UPDATE ON public.academic_years
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_semesters_updated_at
    BEFORE UPDATE ON public.semesters
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_classrooms_updated_at
    BEFORE UPDATE ON public.classrooms
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_lecturers_updated_at
    BEFORE UPDATE ON public.lecturers
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_attendance_sessions_updated_at
    BEFORE UPDATE ON public.attendance_sessions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_attendance_records_updated_at
    BEFORE UPDATE ON public.attendance_records
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_face_registrations_updated_at
    BEFORE UPDATE ON public.face_registrations
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- Profile Creation Trigger (On User Signup)
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        (NEW.raw_user_meta_data->>'first_name')::VARCHAR(100),
        (NEW.raw_user_meta_data->>'last_name')::VARCHAR(100)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


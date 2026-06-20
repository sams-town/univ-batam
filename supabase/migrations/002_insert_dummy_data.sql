
-- =============================================
-- DUMMY DATA FOR SMART CAMPUS ATTENDANCE
-- VERSION: SAFE & WORKING
-- =============================================

-- =============================================
-- FIRST: CLEAN EXISTING DATA (OPTIONAL)
-- Uncomment if you want to reset everything
-- =============================================
-- DELETE FROM public.attendance_records;
-- DELETE FROM public.attendance_sessions;
-- DELETE FROM public.schedule_students;
-- DELETE FROM public.schedules;
-- DELETE FROM public.students;
-- DELETE FROM public.lecturers;
-- DELETE FROM public.courses;
-- DELETE FROM public.classrooms;
-- DELETE FROM public.semesters;
-- DELETE FROM public.academic_years;
-- DELETE FROM public.programs;
-- DELETE FROM public.departments;
-- DELETE FROM public.faculties;

-- =============================================
-- INSERT DUMMY FACULTIES
-- =============================================
INSERT INTO public.faculties (name, code, description) VALUES
('Fakultas Teknik', 'FT', 'Fakultas Teknik Universitas'),
('Fakultas Ilmu Komputer', 'FIK', 'Fakultas Ilmu Komputer'),
('Fakultas Ekonomi', 'FE', 'Fakultas Ekonomi dan Bisnis');

-- =============================================
-- INSERT DUMMY DEPARTMENTS
-- =============================================
INSERT INTO public.departments (faculty_id, name, code, description) VALUES
((SELECT id FROM public.faculties WHERE code = 'FT'), 'Teknik Sipil', 'TS', 'Departemen Teknik Sipil'),
((SELECT id FROM public.faculties WHERE code = 'FT'), 'Teknik Mesin', 'TM', 'Departemen Teknik Mesin'),
((SELECT id FROM public.faculties WHERE code = 'FIK'), 'Teknik Informatika', 'TI', 'Departemen Teknik Informatika'),
((SELECT id FROM public.faculties WHERE code = 'FIK'), 'Sistem Informasi', 'SI', 'Departemen Sistem Informasi'),
((SELECT id FROM public.faculties WHERE code = 'FE'), 'Manajemen', 'MN', 'Departemen Manajemen');

-- =============================================
-- INSERT DUMMY PROGRAMS
-- =============================================
INSERT INTO public.programs (department_id, name, code, degree, description) VALUES
((SELECT id FROM public.departments WHERE code = 'TI'), 'S1 Teknik Informatika', 'S1-TI', 'S1', 'Program Sarjana Teknik Informatika'),
((SELECT id FROM public.departments WHERE code = 'SI'), 'S1 Sistem Informasi', 'S1-SI', 'S1', 'Program Sarjana Sistem Informasi'),
((SELECT id FROM public.departments WHERE code = 'TS'), 'S1 Teknik Sipil', 'S1-TS', 'S1', 'Program Sarjana Teknik Sipil'),
((SELECT id FROM public.departments WHERE code = 'TM'), 'S1 Teknik Mesin', 'S1-TM', 'S1', 'Program Sarjana Teknik Mesin'),
((SELECT id FROM public.departments WHERE code = 'MN'), 'S1 Manajemen', 'S1-MN', 'S1', 'Program Sarjana Manajemen');

-- =============================================
-- INSERT DUMMY ACADEMIC YEARS
-- =============================================
INSERT INTO public.academic_years (name, start_date, end_date, is_active) VALUES
('2023/2024', '2023-08-01', '2024-07-31', false),
('2024/2025', '2024-08-01', '2025-07-31', true);

-- =============================================
-- INSERT DUMMY SEMESTERS
-- =============================================
INSERT INTO public.semesters (academic_year_id, name, term, start_date, end_date, is_active) VALUES
((SELECT id FROM public.academic_years WHERE name = '2024/2025'), 'Ganjil 2024/2025', 'Ganjil', '2024-08-01', '2025-01-31', true),
((SELECT id FROM public.academic_years WHERE name = '2024/2025'), 'Genap 2024/2025', 'Genap', '2025-02-01', '2025-07-31', false);

-- =============================================
-- INSERT DUMMY CLASSROOMS
-- =============================================
INSERT INTO public.classrooms (name, code, capacity, location) VALUES
('Ruang Kelas 101', 'R101', 40, 'Gedung A, Lantai 1'),
('Ruang Kelas 102', 'R102', 40, 'Gedung A, Lantai 1'),
('Ruang Kelas 201', 'R201', 35, 'Gedung A, Lantai 2'),
('Ruang Kelas 202', 'R202', 35, 'Gedung A, Lantai 2'),
('Lab Komputer 1', 'LK1', 30, 'Gedung B, Lantai 1'),
('Lab Komputer 2', 'LK2', 30, 'Gedung B, Lantai 1');

-- =============================================
-- INSERT DUMMY COURSES
-- =============================================
INSERT INTO public.courses (code, name, credits, description) VALUES
('IF101', 'Pemrograman Dasar', 4, 'Mata kuliah dasar pemrograman'),
('IF102', 'Struktur Data', 3, 'Mata kuliah struktur data dan algoritma'),
('IF201', 'Basis Data', 3, 'Mata kuliah basis data'),
('IF202', 'Pemrograman Web', 3, 'Mata kuliah pemrograman web'),
('IF301', 'Machine Learning', 3, 'Mata kuliah machine learning'),
('SI101', 'Analisis Sistem Informasi', 3, 'Mata kuliah analisis sistem'),
('MN101', 'Pengantar Manajemen', 3, 'Mata kuliah pengantar manajemen');

-- =============================================
-- UPDATE PROFILES WITH ROLES
-- =============================================
-- Assign roles to profiles based on email pattern
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin_akademik')
WHERE email LIKE '%admin%';

UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'dosen')
WHERE email LIKE '%dosen%';

UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'mahasiswa')
WHERE email NOT LIKE '%dosen%' AND email NOT LIKE '%admin%';

-- =============================================
-- INSERT DUMMY LECTURERS
-- =============================================
INSERT INTO public.lecturers (profile_id, nip, department_id) VALUES
((SELECT id FROM public.profiles WHERE email = 'dosen1@unbat.com'), '198001012005011001', (SELECT id FROM public.departments WHERE code = 'TI')),
((SELECT id FROM public.profiles WHERE email = 'dosen2@unbat.com'), '198102022006021002', (SELECT id FROM public.departments WHERE code = 'TI')),
((SELECT id FROM public.profiles WHERE email = 'dosen3@unbat.com'), '198203032007031003', (SELECT id FROM public.departments WHERE code = 'SI'));

-- =============================================
-- INSERT DUMMY STUDENTS
-- =============================================
INSERT INTO public.students (profile_id, nim, program_id, enrollment_year) VALUES
((SELECT id FROM public.profiles WHERE email = 'diana@unbat.com'), '2210511001', (SELECT id FROM public.programs WHERE code = 'S1-TI'), 2022),
((SELECT id FROM public.profiles WHERE email = 'endi@unbat.com'), '2210511002', (SELECT id FROM public.programs WHERE code = 'S1-TI'), 2022),
((SELECT id FROM public.profiles WHERE email = 'fitri@unbat.com'), '2210511003', (SELECT id FROM public.programs WHERE code = 'S1-TI'), 2022),
((SELECT id FROM public.profiles WHERE email = 'heru@unbat.com'), '2210511004', (SELECT id FROM public.programs WHERE code = 'S1-TI'), 2022),
((SELECT id FROM public.profiles WHERE email = 'markonah@unbat.com'), '2210511005', (SELECT id FROM public.programs WHERE code = 'S1-TI'), 2022),
((SELECT id FROM public.profiles WHERE email = 'natsir@unbat.com'), '2210512001', (SELECT id FROM public.programs WHERE code = 'S1-SI'), 2022),
((SELECT id FROM public.profiles WHERE email = 'rio@unbat.com'), '2210512002', (SELECT id FROM public.programs WHERE code = 'S1-SI'), 2022);

-- =============================================
-- INSERT DUMMY SCHEDULES
-- =============================================
INSERT INTO public.schedules (course_id, lecturer_id, classroom_id, semester_id, day, start_time, end_time) VALUES
((SELECT id FROM public.courses WHERE code = 'IF101'), (SELECT id FROM public.lecturers WHERE nip = '198001012005011001'), (SELECT id FROM public.classrooms WHERE code = 'R101'), (SELECT id FROM public.semesters WHERE is_active = true), 'monday', '08:00:00', '10:00:00'),
((SELECT id FROM public.courses WHERE code = 'IF102'), (SELECT id FROM public.lecturers WHERE nip = '198102022006021002'), (SELECT id FROM public.classrooms WHERE code = 'R102'), (SELECT id FROM public.semesters WHERE is_active = true), 'monday', '10:00:00', '12:00:00'),
((SELECT id FROM public.courses WHERE code = 'IF201'), (SELECT id FROM public.lecturers WHERE nip = '198001012005011001'), (SELECT id FROM public.classrooms WHERE code = 'LK1'), (SELECT id FROM public.semesters WHERE is_active = true), 'tuesday', '08:00:00', '10:00:00'),
((SELECT id FROM public.courses WHERE code = 'IF202'), (SELECT id FROM public.lecturers WHERE nip = '198102022006021002'), (SELECT id FROM public.classrooms WHERE code = 'LK2'), (SELECT id FROM public.semesters WHERE is_active = true), 'wednesday', '13:00:00', '15:00:00'),
((SELECT id FROM public.courses WHERE code = 'SI101'), (SELECT id FROM public.lecturers WHERE nip = '198203032007031003'), (SELECT id FROM public.classrooms WHERE code = 'R201'), (SELECT id FROM public.semesters WHERE is_active = true), 'thursday', '08:00:00', '10:00:00');

-- =============================================
-- INSERT DUMMY SCHEDULE STUDENTS
-- =============================================
-- Assign TI students to IF courses
INSERT INTO public.schedule_students (schedule_id, student_id)
SELECT
    s.id AS schedule_id,
    st.id AS student_id
FROM public.schedules s
CROSS JOIN public.students st
WHERE s.course_id IN (SELECT id FROM public.courses WHERE code IN ('IF101', 'IF102', 'IF201', 'IF202'))
AND st.program_id = (SELECT id FROM public.programs WHERE code = 'S1-TI');

-- Assign SI students to SI course
INSERT INTO public.schedule_students (schedule_id, student_id)
SELECT
    s.id AS schedule_id,
    st.id AS student_id
FROM public.schedules s
CROSS JOIN public.students st
WHERE s.course_id = (SELECT id FROM public.courses WHERE code = 'SI101')
AND st.program_id = (SELECT id FROM public.programs WHERE code = 'S1-SI');

-- =============================================
-- INSERT DUMMY ATTENDANCE SESSIONS
-- =============================================
INSERT INTO public.attendance_sessions (schedule_id, lecturer_id, opened_at, closed_at, is_open) VALUES
((SELECT id FROM public.schedules LIMIT 1 OFFSET 0), (SELECT id FROM public.lecturers WHERE nip = '198001012005011001'), NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours', false),
((SELECT id FROM public.schedules LIMIT 1 OFFSET 1), (SELECT id FROM public.lecturers WHERE nip = '198102022006021002'), NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour', false),
((SELECT id FROM public.schedules LIMIT 1 OFFSET 0), (SELECT id FROM public.lecturers WHERE nip = '198001012005011001'), NOW(), NULL, true);

-- =============================================
-- INSERT DUMMY ATTENDANCE RECORDS
-- =============================================
INSERT INTO public.attendance_records (session_id, student_id, status, checked_in_at)
SELECT
    sess.id AS session_id,
    st.id AS student_id,
    CASE WHEN RANDOM() > 0.1 THEN 'present'::attendance_status ELSE 'absent'::attendance_status END AS status,
    sess.opened_at + INTERVAL '5 minutes' + (RANDOM() * INTERVAL '30 minutes') AS checked_in_at
FROM public.attendance_sessions sess
CROSS JOIN public.students st
JOIN public.schedule_students ss ON ss.student_id = st.id AND ss.schedule_id = sess.schedule_id
WHERE sess.is_open = false;

-- =============================================
-- VERIFY INSERTED DATA
-- =============================================
SELECT 'Faculties:' AS info, COUNT(*) AS count FROM public.faculties
UNION ALL
SELECT 'Departments:', COUNT(*) FROM public.departments
UNION ALL
SELECT 'Programs:', COUNT(*) FROM public.programs
UNION ALL
SELECT 'Academic Years:', COUNT(*) FROM public.academic_years
UNION ALL
SELECT 'Semesters:', COUNT(*) FROM public.semesters
UNION ALL
SELECT 'Classrooms:', COUNT(*) FROM public.classrooms
UNION ALL
SELECT 'Courses:', COUNT(*) FROM public.courses
UNION ALL
SELECT 'Lecturers:', COUNT(*) FROM public.lecturers
UNION ALL
SELECT 'Students:', COUNT(*) FROM public.students
UNION ALL
SELECT 'Schedules:', COUNT(*) FROM public.schedules
UNION ALL
SELECT 'Schedule Students:', COUNT(*) FROM public.schedule_students
UNION ALL
SELECT 'Attendance Sessions:', COUNT(*) FROM public.attendance_sessions
UNION ALL
SELECT 'Attendance Records:', COUNT(*) FROM public.attendance_records;

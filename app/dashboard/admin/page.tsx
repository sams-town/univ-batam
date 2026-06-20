'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  BellRing,
  Award,
  DollarSign,
  ChevronRight,
  Building
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend
} from 'recharts'

// Mock data for charts
const attendanceTrendData = [
  { day: 'Senin', mahasiswa: 85, dosen: 95 },
  { day: 'Selasa', mahasiswa: 88, dosen: 92 },
  { day: 'Rabu', mahasiswa: 90, dosen: 96 },
  { day: 'Kamis', mahasiswa: 87, dosen: 94 },
  { day: 'Jumat', mahasiswa: 82, dosen: 91 },
  { day: 'Sabtu', mahasiswa: 78, dosen: 89 },
  { day: 'Minggu', mahasiswa: 0, dosen: 0 },
]

const facultyEfficiencyData = [
  { faculty: 'Teknik', percentage: 92 },
  { faculty: 'Ekonomi', percentage: 88 },
  { faculty: 'Hukum', percentage: 85 },
  { faculty: 'Ilmu Komputer', percentage: 90 },
]

// Mock data for perizinan
const studentRequests = [
  { id: 1, name: 'Ahmad Rizky Pratama', reason: 'Sakit', date: '2026-06-19', status: 'pending' },
  { id: 2, name: 'Siti Nurhaliza', reason: 'Izin Keluarga', date: '2026-06-19', status: 'pending' },
  { id: 3, name: 'Budi Santoso', reason: 'Izin', date: '2026-06-18', status: 'approved' },
]

const lecturerRequests = [
  { id: 1, name: 'Dr. Budi Santoso', reason: 'Pengganti Kelas', date: '2026-06-19', status: 'pending' },
  { id: 2, name: 'Prof. Siti Aminah', reason: 'Izin', date: '2026-06-18', status: 'approved' },
]

// Mock data for calendar events
const calendarEvents = [
  { id: 1, title: 'Ujian Tengah Semester', date: '2026-06-20', type: 'exam' },
  { id: 2, title: 'Rapat Dosen', date: '2026-06-21', type: 'meeting' },
  { id: 3, title: 'Pendaftaran KRS', date: '2026-06-22', type: 'registration' },
]

// Mock data for birthdays
const birthdays = [
  { id: 1, name: 'Ahmad', role: 'Mahasiswa', date: '2026-06-19' },
  { id: 2, name: 'Siti', role: 'Dosen', date: '2026-06-20' },
  { id: 3, name: 'Budi', role: 'Karyawan', date: '2026-06-21' },
]

export default function AdminDashboardPage() {
  const { profile } = useAuth()
  const [activePerizinanTab, setActivePerizinanTab] = useState('mahasiswa')
  const [seedingStatus, setSeedingStatus] = useState<string>('')
  const [isSeeding, setIsSeeding] = useState(false)
  const [facultiesList, setFacultiesList] = useState<{ code: string; name: string }[]>([])
  
  const initials = (profile?.first_name?.charAt(0) || '') + (profile?.last_name?.charAt(0) || '') || 'AD'

  // Auto-seed target faculties on load
  useEffect(() => {
    const autoSeedFaculties = async () => {
      const targetFaculties = [
        { code: 'FH', name: 'Fakultas Hukum', description: 'Fakultas Hukum' },
        { code: 'FK', name: 'Fakultas Kedokteran', description: 'Fakultas Kedokteran' },
        { code: 'FT', name: 'Fakultas Teknik', description: 'Fakultas Teknik' },
        { code: 'FEB', name: 'Fakultas Ekonomi Bisnis', description: 'Fakultas Ekonomi Bisnis' },
        { code: 'FIKM', name: 'Fakultas Ilmu Kesehatan Masyarakat', description: 'Fakultas Ilmu Kesehatan Masyarakat' }
      ]

      try {
        const { data, error } = await supabase
          .from('faculties')
          .select('id, code, name')

        if (error) throw error

        const targetCodes = new Set(targetFaculties.map(f => f.code))
        const unwanted = data?.filter(f => !targetCodes.has(f.code)) || []

        if (unwanted.length > 0) {
          console.log('Deleting unwanted faculties:', unwanted)
          const unwantedIds = unwanted.map(f => f.id)
          await supabase.from('faculties').delete().in('id', unwantedIds)
        }

        // Re-fetch
        const { data: currentData } = await supabase
          .from('faculties')
          .select('code, name')

        const existingCodes = new Set(currentData?.map(f => f.code) || [])
        const missing = targetFaculties.filter(f => !existingCodes.has(f.code))

        if (missing.length > 0) {
          const { error: insertError } = await supabase
            .from('faculties')
            .insert(missing)
          if (insertError) throw insertError
          
          // Re-fetch
          const { data: updatedData } = await supabase
            .from('faculties')
            .select('code, name')
          setFacultiesList(updatedData || targetFaculties)
        } else {
          setFacultiesList(currentData || [])
        }
      } catch (err) {
        console.error('Auto-seed faculties failed:', err)
      }
    }

    autoSeedFaculties()
  }, [])

  const handleSeedAllDummyData = async () => {
    setIsSeeding(true)
    setSeedingStatus('Memulai seeding data dummy...')
    try {
      setSeedingStatus('Membersihkan data lama...')
      // Clear database tables to prevent FK/duplicate errors
      await supabase.from('attendance_records').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('attendance_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('schedule_students').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('lecturers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('classrooms').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('semesters').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('academic_years').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('faculties').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      // 1. Insert Target Faculties
      setSeedingStatus('Menyisipkan 5 Fakultas Baru...')
      const targetFaculties = [
        { code: 'FH', name: 'Fakultas Hukum', description: 'Fakultas Hukum' },
        { code: 'FK', name: 'Fakultas Kedokteran', description: 'Fakultas Kedokteran' },
        { code: 'FT', name: 'Fakultas Teknik', description: 'Fakultas Teknik' },
        { code: 'FEB', name: 'Fakultas Ekonomi Bisnis', description: 'Fakultas Ekonomi Bisnis' },
        { code: 'FIKM', name: 'Fakultas Ilmu Kesehatan Masyarakat', description: 'Fakultas Ilmu Kesehatan Masyarakat' }
      ]
      await supabase.from('faculties').insert(targetFaculties)

      const { data: faculties } = await supabase.from('faculties').select('id, code')
      const facultyMap: Record<string, string> = {}
      faculties?.forEach(f => {
        facultyMap[f.code] = f.id
      })

      // 2. Insert Departments
      setSeedingStatus('Menyisipkan Departemen/Jurusan...')
      const departmentsData = [
        { name: 'Teknik Informatika', code: 'TI', faculty_id: facultyMap['FT'], description: 'Departemen Teknik Informatika' },
        { name: 'Teknik Sipil', code: 'TS', faculty_id: facultyMap['FT'], description: 'Departemen Teknik Sipil' },
        { name: 'Pendidikan Dokter', code: 'PD', faculty_id: facultyMap['FK'], description: 'Departemen Pendidikan Dokter' },
        { name: 'Ilmu Hukum', code: 'IH', faculty_id: facultyMap['FH'], description: 'Departemen Ilmu Hukum' },
        { name: 'Manajemen', code: 'MAN', faculty_id: facultyMap['FEB'], description: 'Departemen Manajemen' },
        { name: 'Kesehatan Masyarakat', code: 'KM', faculty_id: facultyMap['FIKM'], description: 'Departemen Kesehatan Masyarakat' }
      ]
      
      for (const dept of departmentsData) {
        if (!dept.faculty_id) continue;
        await supabase.from('departments').upsert(dept, { onConflict: 'code' })
      }

      // Fetch departments
      const { data: depts } = await supabase.from('departments').select('id, code')
      const deptMap: Record<string, string> = {}
      depts?.forEach(d => {
        deptMap[d.code] = d.id
      })

      // 3. Insert Programs
      setSeedingStatus('Menyisipkan Program Studi...')
      const programsData = [
        { name: 'S1 Teknik Informatika', code: 'TI-S1', department_id: deptMap['TI'], degree: 'S1', description: 'Program Sarjana Teknik Informatika' },
        { name: 'S1 Teknik Sipil', code: 'TS-S1', department_id: deptMap['TS'], degree: 'S1', description: 'Program Sarjana Teknik Sipil' },
        { name: 'S1 Pendidikan Dokter', code: 'PD-S1', department_id: deptMap['PD'], degree: 'S1', description: 'Program Sarjana Pendidikan Dokter' },
        { name: 'S1 Ilmu Hukum', code: 'IH-S1', department_id: deptMap['IH'], degree: 'S1', description: 'Program Sarjana Ilmu Hukum' },
        { name: 'S1 Manajemen', code: 'MAN-S1', department_id: deptMap['MAN'], degree: 'S1', description: 'Program Sarjana Manajemen' },
        { name: 'S1 Kesehatan Masyarakat', code: 'KM-S1', department_id: deptMap['KM'], degree: 'S1', description: 'Program Sarjana Kesehatan Masyarakat' }
      ]

      for (const prog of programsData) {
        if (!prog.department_id) continue;
        await supabase.from('programs').upsert(prog, { onConflict: 'code' })
      }

      // 4. Insert Academic Years & Semesters
      setSeedingStatus('Menyisipkan Tahun Ajaran & Semester...')
      const { data: acYear } = await supabase.from('academic_years').upsert({
        name: '2024/2025',
        start_date: '2024-08-01',
        end_date: '2025-07-31',
        is_active: true
      }, { onConflict: 'name' }).select('id').single()

      if (acYear) {
        await supabase.from('semesters').upsert({
          academic_year_id: acYear.id,
          name: 'Ganjil 2024/2025',
          term: 'ganjil',
          start_date: '2024-08-01',
          end_date: '2025-01-31',
          is_active: true
        })
      }

      // 5. Insert Classrooms
      setSeedingStatus('Menyisipkan Ruang Kelas...')
      const classroomsData = [
        { name: 'Ruang Aula Hukum', code: 'RK-HUK', capacity: 100, location: 'Gedung Hukum Lt. 1' },
        { name: 'Lab Anatomi Kedokteran', code: 'LAB-MED', capacity: 30, location: 'Gedung Kedokteran Lt. 2' },
        { name: 'Ruang Kuliah Teknik 1', code: 'RK-TEK1', capacity: 50, location: 'Gedung Teknik Lt. 1' },
        { name: 'Ruang Kuliah Ekonomi 1', code: 'RK-EKO1', capacity: 40, location: 'Gedung Ekonomi Lt. 1' },
        { name: 'Ruang Lab Kesehatan', code: 'LAB-KES', capacity: 40, location: 'Gedung Kesehatan Lt. 2' }
      ]
      for (const room of classroomsData) {
        await supabase.from('classrooms').upsert(room, { onConflict: 'code' })
      }

      // 6. Insert Courses
      setSeedingStatus('Menyisipkan Mata Kuliah...')
      const coursesData = [
        { code: 'HK101', name: 'Pengantar Hukum Indonesia', credits: 3, description: 'Hukum dasar Indonesia' },
        { code: 'KD101', name: 'Anatomi Dasar', credits: 4, description: 'Anatomi dasar kedokteran' },
        { code: 'TK101', name: 'Kalkulus Teknik', credits: 3, description: 'Kalkulus dasar untuk teknik' },
        { code: 'EK101', name: 'Pengantar Bisnis', credits: 3, description: 'Dasar-dasar bisnis dan ekonomi' },
        { code: 'KM101', name: 'Epidemiologi Dasar', credits: 3, description: 'Pengantar epidemiologi' }
      ]
      for (const course of coursesData) {
        await supabase.from('courses').upsert(course, { onConflict: 'code' })
      }

      setSeedingStatus('Seeding berhasil diselesaikan! 🎉')
      setTimeout(() => setSeedingStatus(''), 5000)
    } catch (err) {
      console.error('Seeding error:', err)
      setSeedingStatus('Gagal menyisipkan data dummy. Silakan cek console.')
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-white/30 shadow-lg">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-teal-800 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Halo, Superadmin Pusat! 👋
              </h1>
              <p className="text-teal-100 mt-1 text-lg">
                Panel Kendali Sistem Absensi & Data Akademik Universitas Batam
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 px-4 py-2 rounded-xl flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="bg-yellow-400/90 text-yellow-900 px-4 py-2 rounded-xl flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              <span className="font-semibold">3 Ulang Tahun Hari Ini</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seeder & Faculty Panel */}
      <Card className="border border-slate-200 bg-white hover:shadow-lg transition-all duration-200 rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Building className="h-5 w-5 text-teal-600" />
            Panel Inisialisasi Data & Fakultas
          </CardTitle>
          <CardDescription className="text-slate-500">
            Status Fakultas Aktif: {facultiesList.map(f => f.name).join(', ') || 'Memuat...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            {seedingStatus ? (
              <span className="font-medium text-teal-600 animate-pulse">{seedingStatus}</span>
            ) : (
              <span>Sistem mendeteksi 5 fakultas utama (Hukum, Kedokteran, Teknik, Ekonomi & Bisnis, Ilmu Kesehatan Masyarakat). Tekan tombol untuk menginisiasi data dummy lengkap.</span>
            )}
          </div>
          <Button 
            onClick={handleSeedAllDummyData} 
            disabled={isSeeding}
            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold shadow"
          >
            {isSeeding ? 'Menyisipkan...' : 'Inisiasi Data Dummy Lengkap'}
          </Button>
        </CardContent>
      </Card>

      {/* Row 1: Enhanced Academic Metrics (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-slate-100 bg-white hover:shadow-xl transition-all duration-200 rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <GraduationCap className="h-6 w-6 text-teal-600" />
              Total Mahasiswa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-900 mb-2">1,245 Active</p>
            <p className="text-sm text-slate-500">Reguler: 900 | Karyawan: 345</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white hover:shadow-xl transition-all duration-200 rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <Users className="h-6 w-6 text-blue-600" />
              Total Dosen & Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-900 mb-2">87 Personel</p>
            <p className="text-sm text-slate-500">Dosen: 52 | Karyawan/Staff: 35</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white hover:shadow-xl transition-all duration-200 rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <Briefcase className="h-6 w-6 text-purple-600" />
              Program Studi & Fakultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-900 mb-2">12 Program Studi</p>
            <p className="text-sm text-slate-500">4 Fakultas</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white hover:shadow-xl transition-all duration-200 rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <Calendar className="h-6 w-6 text-orange-600" />
              Jadwal Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-extrabold text-slate-900">24 Sesi Kuliah</p>
              <Badge className="bg-teal-500 text-white">3 Sesi Sedang Berlangsung</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Financial Overview Cards (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-100 bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:shadow-xl transition-all duration-200 rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Total UKT Semester Ini
            </CardTitle>
            <CardDescription className="text-cyan-100">Target Tercapai</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold">Rp 2.450.000.000</p>
            <p className="text-sm text-cyan-100 mt-2">85% Target Tercapai</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-xl transition-all duration-200 rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Sirkulasi Dana Bulan Ini
            </CardTitle>
            <CardDescription className="text-emerald-100">Kas Masuk Bersih</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold">Rp 420.000.000</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-gradient-to-br from-rose-500 to-red-600 text-white hover:shadow-xl transition-all duration-200 rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <XCircle className="h-6 w-6" />
              Tunggakan & Belum Registrasi
            </CardTitle>
            <CardDescription className="text-rose-100">Mahasiswa Belum Bayar</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold">Rp 180.000.000</p>
            <p className="text-sm text-rose-100 mt-2">42 Mahasiswa Belum Bayar</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Operation Double-Column (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Perizinan & Approval Hub */}
        <Card className="border border-slate-100 bg-white rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-700">
              <FileText className="h-6 w-6 text-blue-500" />
              Perizinan & Approval Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Tabs defaultValue="mahasiswa" value={activePerizinanTab} onValueChange={setActivePerizinanTab}>
              <TabsList className="w-full max-w-md mb-6 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="mahasiswa" className="flex items-center gap-2 data-[state=active]:bg-white rounded-lg font-medium">
                  Perizinan Mahasiswa
                </TabsTrigger>
                <TabsTrigger value="dosen" className="flex items-center gap-2 data-[state=active]:bg-white rounded-lg font-medium">
                  Perizinan Dosen & Kelas Pengganti
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mahasiswa" className="mt-0 space-y-4">
                {studentRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-teal-100 text-teal-700">
                          {req.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-800">{req.name}</p>
                        <p className="text-xs text-slate-500">{req.reason} • {req.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Setujui
                          </Button>
                          <Button variant="destructive" size="sm">
                            <XCircle className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-emerald-500 text-white">Disetujui</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="dosen" className="mt-0 space-y-4">
                {lecturerRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {req.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-800">{req.name}</p>
                        <p className="text-xs text-slate-500">{req.reason} • {req.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Setujui
                          </Button>
                          <Button variant="destructive" size="sm">
                            <XCircle className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-emerald-500 text-white">Disetujui</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Column: Live Calendar & Birthday Box */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="border border-slate-100 bg-white rounded-2xl shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-700">
                <Calendar className="h-6 w-6 text-purple-500" />
                Kalender Akademik
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {calendarEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50">
                  <div className={`p-2 rounded-lg ${
                    event.type === 'exam' ? 'bg-red-100' :
                    event.type === 'meeting' ? 'bg-blue-100' : 'bg-emerald-100'
                  }`}>
                    <Calendar className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{event.title}</p>
                    <p className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white rounded-2xl shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-700">
                <BellRing className="h-6 w-6 text-orange-500" />
                Ulang Tahun Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {birthdays.map((person) => (
                <div key={person.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-orange-100 text-orange-700">
                      {person.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{person.name}</p>
                    <p className="text-xs text-slate-500">{person.role}</p>
                  </div>
                  <Badge className="bg-orange-500 text-white">🎉</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 4: Data Visualization (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-100 bg-white rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-700">
              <Clock className="h-6 w-6 text-teal-500" />
              Trend Kehadiran 7 Hari Terakhir
            </CardTitle>
            <CardDescription className="text-slate-500">Perbandingan kehadiran mahasiswa vs dosen</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-80 min-w-0 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={attendanceTrendData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="mahasiswa" stroke="#14b8a6" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="dosen" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-white rounded-2xl shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-700">
              <Award className="h-6 w-6 text-blue-500" />
              Efisiensi Kelas Per Fakultas
            </CardTitle>
            <CardDescription className="text-slate-500">Persentase kehadiran per fakultas</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-80 min-w-0 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={facultyEfficiencyData} 
                  layout="vertical" 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" domain={[0, 100]} />
                  <YAxis dataKey="faculty" type="category" stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                  <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

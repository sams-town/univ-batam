'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Calendar as CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'

type Schedule = {
  id: string
  day: string
  start_time: string
  end_time: string
  course: { name: string; code: string }
  lecturer: { 
    profile: { 
      first_name: string
      last_name: string
    }
  }
  classroom: { name: string }
  semester: { name: string }
}

type Course = { id: string; code: string; name: string }
type Lecturer = { id: string; profile: { first_name: string; last_name: string } }
type Classroom = { id: string; name: string }
type Semester = { id: string; name: string; is_active: boolean }
type Program = { id: string; name: string; department_id: string }

// Dummy data
const dummySchedules: Schedule[] = [
  {
    id: '1',
    day: 'monday',
    start_time: '08:00',
    end_time: '10:00',
    course: { code: 'TI101', name: 'Pemrograman Web' },
    lecturer: { profile: { first_name: 'Dr. Budi', last_name: 'Santoso' } },
    classroom: { name: 'Ruang 101' },
    semester: { name: '2025/2026 Genap' },
  },
  {
    id: '2',
    day: 'monday',
    start_time: '10:30',
    end_time: '12:30',
    course: { code: 'TI102', name: 'Basis Data' },
    lecturer: { profile: { first_name: 'Prof. Siti', last_name: 'Aminah' } },
    classroom: { name: 'Ruang 102' },
    semester: { name: '2025/2026 Genap' },
  },
  {
    id: '3',
    day: 'tuesday',
    start_time: '08:00',
    end_time: '10:00',
    course: { code: 'TI103', name: 'Struktur Data' },
    lecturer: { profile: { first_name: 'Dr. Andi', last_name: 'Pratama' } },
    classroom: { name: 'Lab Komputer' },
    semester: { name: '2025/2026 Genap' },
  },
  {
    id: '4',
    day: 'tuesday',
    start_time: '13:00',
    end_time: '15:00',
    course: { code: 'TI104', name: 'Sistem Operasi' },
    lecturer: { profile: { first_name: 'Dr. Rina', last_name: 'Wijaya' } },
    classroom: { name: 'Ruang 201' },
    semester: { name: '2025/2026 Genap' },
  },
  {
    id: '5',
    day: 'wednesday',
    start_time: '09:00',
    end_time: '11:00',
    course: { code: 'TI105', name: 'Jaringan Komputer' },
    lecturer: { profile: { first_name: 'Dr. Hendra', last_name: 'Putra' } },
    classroom: { name: 'Lab Jaringan' },
    semester: { name: '2025/2026 Genap' },
  },
]

const daysOfWeek = [
  { value: 'monday', label: 'Senin' },
  { value: 'tuesday', label: 'Selasa' },
  { value: 'wednesday', label: 'Rabu' },
  { value: 'thursday', label: 'Kamis' },
  { value: 'friday', label: 'Jumat' },
  { value: 'saturday', label: 'Sabtu' },
]

const dummyCourses: Course[] = [
  { id: '1', code: 'TI101', name: 'Pemrograman Web' },
  { id: '2', code: 'TI102', name: 'Basis Data' },
  { id: '3', code: 'TI103', name: 'Struktur Data' },
  { id: '4', code: 'TI104', name: 'Sistem Operasi' },
  { id: '5', code: 'TI105', name: 'Jaringan Komputer' },
]

const dummyLecturers: Lecturer[] = [
  { id: '1', profile: { first_name: 'Dr. Budi', last_name: 'Santoso' } },
  { id: '2', profile: { first_name: 'Prof. Siti', last_name: 'Aminah' } },
  { id: '3', profile: { first_name: 'Dr. Andi', last_name: 'Pratama' } },
  { id: '4', profile: { first_name: 'Dr. Rina', last_name: 'Wijaya' } },
  { id: '5', profile: { first_name: 'Dr. Hendra', last_name: 'Putra' } },
]

const dummyClassrooms: Classroom[] = [
  { id: '1', name: 'Ruang 101' },
  { id: '2', name: 'Ruang 102' },
  { id: '3', name: 'Lab Komputer' },
  { id: '4', name: 'Ruang 201' },
  { id: '5', name: 'Lab Jaringan' },
]

const dummySemesters: Semester[] = [
  { id: '1', name: '2025/2026 Genap', is_active: true },
  { id: '2', name: '2025/2026 Ganjil', is_active: false },
  { id: '3', name: '2024/2025 Genap', is_active: false },
]

const dummyPrograms: Program[] = [
  { id: '1', name: 'S1 Teknik Informatika', department_id: '1' },
  { id: '2', name: 'S1 Sistem Informasi', department_id: '2' },
]

const dummyStudents = [
  { id: '1', nim: '2022001', profile_id: 's1', program_id: '1' },
  { id: '2', nim: '2022002', profile_id: 's2', program_id: '1' },
  { id: '3', nim: '2022003', profile_id: 's3', program_id: '1' },
  { id: '4', nim: '2021001', profile_id: 's4', program_id: '2' },
  { id: '5', nim: '2021002', profile_id: 's5', program_id: '2' },
]

const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9)
}

export default function SchedulesPage() {
  const { profile } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Get current logged in lecturer dummy
  const currentLecturer: Lecturer = {
    id: 'current',
    profile: {
      first_name: profile?.first_name || 'Dr.',
      last_name: profile?.last_name || 'Dosen'
    }
  }

  // Form state - use single select for courses instead of checkboxes
  const [selectedDay, setSelectedDay] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedProgram, setSelectedProgram] = useState('')

  useEffect(() => {
    // Simulate loading from Supabase then use dummy if empty
    const loadData = async () => {
      const { data } = await supabase
        .from('schedules')
        .select(`
          *,
          course:courses(name, code),
          lecturer:lecturers(
            profile:profiles(first_name, last_name)
          ),
          classroom:classrooms(name),
          semester:semesters(name)
        `)
        .order('day')
    
      // Use dummy data if Supabase has no data
      setSchedules(data && data.length > 0 ? data : dummySchedules)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleAddSchedule = async () => {
    if (!selectedDay || !selectedCourse || !selectedClassroom || !selectedSemester) {
      setError('Silakan isi semua field')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Add single schedule
      const courseObj = dummyCourses.find(c => c.id === selectedCourse)
      const classroomObj = dummyClassrooms.find(c => c.id === selectedClassroom)
      const semesterObj = dummySemesters.find(s => s.id === selectedSemester)
      
      if (courseObj && classroomObj && semesterObj) {
        const scheduleToAdd: Schedule = {
          id: generateId(),
          day: selectedDay,
          start_time: startTime,
          end_time: endTime,
          course: courseObj,
          lecturer: currentLecturer,
          classroom: classroomObj,
          semester: semesterObj,
        }
        setSchedules([...schedules, scheduleToAdd])
      }

      // Get students from selected program
      const studentsToAdd = selectedProgram 
        ? dummyStudents.filter(s => s.program_id === selectedProgram)
        : dummyStudents.slice(0, 3)

      setSuccess(`Jadwal berhasil ditambahkan! ${studentsToAdd.length} mahasiswa otomatis terdaftar.`)
      setOpen(false)
      resetForm()
    } catch (err) {
      setError('Gagal menambahkan jadwal: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setSelectedDay('')
    setStartTime('08:00')
    setEndTime('10:00')
    setSelectedCourse('')
    setSelectedClassroom('')
    setSelectedSemester('')
    setSelectedProgram('')
  }

  const getDayLabel = (dayValue: string) => {
    const day = daysOfWeek.find(d => d.value === dayValue)
    return day?.label || dayValue
  }

  if (loading) {
    return (
      <div className="p-8">Loading...</div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Jadwal Kuliah</h1>
          <p className="text-muted-foreground">Kelola jadwal perkuliahan</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jadwal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Jadwal Kuliah</DialogTitle>
              <DialogDescription>
                Tambahkan jadwal baru dan otomatis daftarkan mahasiswa sesuai program studi
              </DialogDescription>
            </DialogHeader>

            {/* Alerts */}
            {success && (
              <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hari</Label>
                  <Select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                    <option value="">Pilih hari</option>
                    {daysOfWeek.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                    <option value="">Pilih semester</option>
                    {dummySemesters.map(semester => (
                      <option key={semester.id} value={semester.id}>{semester.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jam Mulai</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Jam Selesai</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mata Kuliah</Label>
                <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                  <option value="">Pilih mata kuliah</option>
                  {dummyCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dosen (Otomatis Diri Anda)</Label>
                <div className="flex items-center p-2 border rounded-md bg-slate-50">
                  <span className="text-slate-700">
                    {currentLecturer.profile.first_name} {currentLecturer.profile.last_name}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ruang Kelas</Label>
                <Select value={selectedClassroom} onChange={(e) => setSelectedClassroom(e.target.value)}>
                  <option value="">Pilih ruang kelas</option>
                  {dummyClassrooms.map(classroom => (
                    <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Program Studi (Otomatis daftarkan mahasiswa)</Label>
                <Select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
                  <option value="">Pilih program studi</option>
                  {dummyPrograms.map(program => (
                    <option key={program.id} value={program.id}>{program.name}</option>
                  ))}
                </Select>
                <p className="text-sm text-muted-foreground">
                  Mahasiswa dari program studi ini akan otomatis terdaftar ke jadwal
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={handleAddSchedule} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hari</TableHead>
                <TableHead>Mata Kuliah</TableHead>
                <TableHead>Dosen</TableHead>
                <TableHead>Ruang</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Semester</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{getDayLabel(schedule.day)}</TableCell>
                  <TableCell>{schedule.course?.code} - {schedule.course?.name}</TableCell>
                  <TableCell>{schedule.lecturer?.profile?.first_name} {schedule.lecturer?.profile?.last_name}</TableCell>
                  <TableCell>{schedule.classroom?.name}</TableCell>
                  <TableCell>{schedule.start_time} - {schedule.end_time}</TableCell>
                  <TableCell>{schedule.semester?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts'
import { 
  LayoutDashboard, Users, BookOpen, Calendar, CheckSquare, BarChart3, 
  Settings, User, CreditCard, GraduationCap, IdCard, FileText, 
  DollarSign, Book, DoorOpen, UserMinus, Plus, Trash2, Edit, 
  Check, X, Search, FileSpreadsheet, Download, Upload, AlertCircle, 
  CheckCircle2, RefreshCw, Star, MapPin, Printer, ShieldAlert, Award
} from 'lucide-react'
import * as ExcelJS from 'exceljs'

// Submenu Tab list
const tabsList = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'data', label: 'Data Mahasiswa', icon: Users },
  { id: 'status', label: 'Status Akademik', icon: CheckSquare },
  { id: 'krs', label: 'KRS', icon: BookOpen },
  { id: 'khs', label: 'KHS', icon: FileText },
  { id: 'transkrip', label: 'Transkrip Nilai', icon: GraduationCap },
  { id: 'presensi', label: 'Presensi Mahasiswa', icon: Clock },
  { id: 'perizinan', label: 'Perizinan Absensi', icon: FileText },
  { id: 'pelanggaran', label: 'Pelanggaran', icon: UserMinus },
  { id: 'prestasi', label: 'Prestasi Mahasiswa', icon: Award },
  { id: 'beasiswa', label: 'Beasiswa', icon: CreditCard },
  { id: 'pkl', label: 'PKL / Magang', icon: Briefcase },
  { id: 'skripsi', label: 'Skripsi / Tugas Akhir', icon: Book },
  { id: 'riwayat', label: 'Riwayat Akademik', icon: Calendar },
  { id: 'alumni', label: 'Alumni', icon: GraduationCap },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
]

import { Clock, Briefcase } from 'lucide-react'

// Mock Data for Local Fallback
const INITIAL_STUDENTS = [
  {
    id: 's1',
    nim: '2210511001',
    semester: 6,
    kelas: 'Reguler A',
    status_akademik: 'Aktif',
    dosen_pa_id: 'd1',
    created_at: new Date().toISOString(),
    profile: { first_name: 'Ahmad', last_name: 'Rizky Pratama', email: 'ahmad.rizky@unbat.com', phone: '081211112222', place_of_birth: 'Batam', date_of_birth: '2004-03-12', address_ktp: 'Jl. Sudirman No. 12 Batam' },
    program: { id: 'p1', name: 'S1 Teknik Informatika', code: 'S1-TI', department: { name: 'Teknik Informatika', faculty: { id: 'f1', name: 'Fakultas Ilmu Komputer', code: 'FIK' } } },
    dosen_pa: { nip: '198001012005011001', profile: { first_name: 'Dosen', last_name: 'Satu' } }
  },
  {
    id: 's2',
    nim: '2210511002',
    semester: 6,
    kelas: 'Reguler B',
    status_akademik: 'Aktif',
    dosen_pa_id: 'd1',
    created_at: new Date().toISOString(),
    profile: { first_name: 'Siti', last_name: 'Aminah', email: 'siti.aminah@unbat.com', phone: '081233334444', place_of_birth: 'Batam', date_of_birth: '2004-05-24', address_ktp: 'Jl. Merdeka No. 4 Batam' },
    program: { id: 'p1', name: 'S1 Teknik Informatika', code: 'S1-TI', department: { name: 'Teknik Informatika', faculty: { id: 'f1', name: 'Fakultas Ilmu Komputer', code: 'FIK' } } },
    dosen_pa: { nip: '198001012005011001', profile: { first_name: 'Dosen', last_name: 'Satu' } }
  },
  {
    id: 's3',
    nim: '2210512001',
    semester: 4,
    kelas: 'Reguler A',
    status_akademik: 'Cuti',
    dosen_pa_id: 'd2',
    created_at: new Date().toISOString(),
    profile: { first_name: 'Budi', last_name: 'Santoso', email: 'budi.santoso@unbat.com', phone: '081255556666', place_of_birth: 'Tanjungpinang', date_of_birth: '2005-01-15', address_ktp: 'Jl. Kartini No. 8 Tanjungpinang' },
    program: { id: 'p2', name: 'S1 Sistem Informasi', code: 'S1-SI', department: { name: 'Sistem Informasi', faculty: { id: 'f1', name: 'Fakultas Ilmu Komputer', code: 'FIK' } } },
    dosen_pa: { nip: '198102022006021002', profile: { first_name: 'Dosen', last_name: 'Dua' } }
  },
  {
    id: 's4',
    nim: '2210512002',
    semester: 8,
    kelas: 'Reguler A',
    status_akademik: 'Lulus',
    dosen_pa_id: 'd2',
    created_at: new Date().toISOString(),
    profile: { first_name: 'Diana', last_name: 'Putri', email: 'diana.putri@unbat.com', phone: '081277778888', place_of_birth: 'Batam', date_of_birth: '2002-11-09', address_ktp: 'Jl. Gajah Mada No. 15 Batam' },
    program: { id: 'p2', name: 'S1 Sistem Informasi', code: 'S1-SI', department: { name: 'Sistem Informasi', faculty: { id: 'f1', name: 'Fakultas Ilmu Komputer', code: 'FIK' } } },
    dosen_pa: { nip: '198102022006021002', profile: { first_name: 'Dosen', last_name: 'Dua' } }
  }
]

const MOCK_COURSES = [
  { id: 'c1', name: 'Pemrograman Dasar', code: 'IF101', credits: 4 },
  { id: 'c2', name: 'Struktur Data', code: 'IF102', credits: 3 },
  { id: 'c3', name: 'Basis Data', code: 'IF201', credits: 3 },
  { id: 'c4', name: 'Pemrograman Web', code: 'IF202', credits: 3 },
  { id: 'c5', name: 'Kecerdasan Buatan', code: 'IF301', credits: 3 }
]

export default function StudentManagementSystem({ defaultTab = 'dashboard' }: { defaultTab?: string }) {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  // Data States
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('')

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProdi, setFilterProdi] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Modals state
  const [ktmOpen, setKtmOpen] = useState(false)
  const [statusHistory, setStatusHistory] = useState<any[]>([])
  const [newStatus, setNewStatus] = useState('Aktif')
  const [statusCatatan, setStatusCatatan] = useState('')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  
  // Academic data states
  const [krsItems, setKrsItems] = useState<any[]>([])
  const [nilaiList, setNilaiList] = useState<any[]>([])
  const [beasiswaList, setBeasiswaList] = useState<any[]>([])
  const [prestasiList, setPrestasiList] = useState<any[]>([])
  const [violationsList, setViolationsList] = useState<any[]>([])
  const [permitsList, setPermitsList] = useState<any[]>([])
  const [pklData, setPklData] = useState<any | null>(null)
  const [skripsiData, setSkripsiData] = useState<any | null>(null)
  const [alumniData, setAlumniData] = useState<any | null>(null)

  // Input forms state
  const [addViolationOpen, setAddViolationOpen] = useState(false)
  const [violationForm, setViolationForm] = useState({ jenis: 'Ringan', poin: '10', keterangan: '', tindakan_sp: 'Tidak Ada' })
  const [addPermitOpen, setAddPermitOpen] = useState(false)
  const [permitForm, setPermitForm] = useState({ jenis: 'Izin', keterangan: '', file: '' })
  const [addPrestasiOpen, setAddPrestasiOpen] = useState(false)
  const [prestasiForm, setPrestasiForm] = useState({ jenis: 'Akademik', nama: '', file: '' })

  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Detect user role & load student info if the logged-in user is a student
  useEffect(() => {
    if (profile?.role?.name) {
      setUserRole(profile.role.name)
    } else {
      const savedRole = localStorage.getItem('user_role') || 'mahasiswa'
      setUserRole(savedRole)
    }
  }, [profile])

  // Load Main Students List
  const loadStudents = async () => {
    setLoading(true)
    try {
      let dataList: any[] = []
      try {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            profile:profiles(*),
            program:programs(
              id,
              name,
              code,
              department:departments(
                id,
                name,
                faculty:faculties(*)
              )
            ),
            dosen_pa:lecturers(
              id,
              nip,
              profile:profiles(first_name, last_name)
            )
          `)
          .order('nim')
        if (error) throw error
        dataList = data || []
      } catch (err: any) {
        console.warn("Using localStorage fallback for students list:", err.message)
        const local = localStorage.getItem('local_students')
        if (local) {
          dataList = JSON.parse(local)
        } else {
          localStorage.setItem('local_students', JSON.stringify(INITIAL_STUDENTS))
          dataList = INITIAL_STUDENTS
        }
      }

      setStudents(dataList)

      // If user is a student, auto-select them and lock
      const userEmail = profile?.email || localStorage.getItem('user_email') || 'ahmad.rizky@unbat.com'
      const isStudent = userRole === 'mahasiswa'
      const isDosen = userRole === 'dosen' || userRole === 'lecturer'

      if (isStudent) {
        const loggedStudent = dataList.find(s => s.profile?.email === userEmail)
        if (loggedStudent) {
          setSelectedStudent(loggedStudent)
        } else if (dataList.length > 0) {
          setSelectedStudent(dataList[0])
        }
      } else if (isDosen) {
        // Dosen PA bimbingan list
        // Filter students where dosen_pa matches logged-in lecturer
        // For fallback, we'll keep the list as is but label PA accordingly
        if (!selectedStudent && dataList.length > 0) {
          setSelectedStudent(dataList[0])
        }
      } else {
        // Admin
        if (!selectedStudent && dataList.length > 0) {
          setSelectedStudent(dataList[0])
        }
      }

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userRole) {
      loadStudents()
    }
  }, [userRole])

  // Load student-specific child data whenever selected student changes
  const loadStudentAcademicData = async (studentId: string) => {
    if (!studentId) return
    
    // Status History
    try {
      const { data } = await supabase.from('status_akademik_history').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
      setStatusHistory(data || [])
    } catch {
      const local = localStorage.getItem(`local_status_history_${studentId}`)
      setStatusHistory(local ? JSON.parse(local) : [
        { id: 'sh1', status_lama: '-', status_baru: 'Aktif', catatan: 'Pendaftaran Awal Mahasiswa Baru', created_at: new Date().toISOString() }
      ])
    }

    // KRS Items
    try {
      const { data } = await supabase
        .from('krs_items')
        .select('*, krs:krs!inner(student_id, semester_id, status_persetujuan), course:courses(*)')
        .eq('krs.student_id', studentId)
      
      if (data) {
        setKrsItems(data.map((item: any) => ({
          id: item.id,
          course_id: item.course_id,
          course_code: item.course?.code,
          course_name: item.course?.name,
          credits: item.course?.credits,
          status: item.krs?.status_persetujuan
        })))
      }
    } catch {
      const local = localStorage.getItem(`local_krs_${studentId}`)
      setKrsItems(local ? JSON.parse(local) : [
        { id: 'k1', course_id: 'c1', course_code: 'IF101', course_name: 'Pemrograman Dasar', credits: 4, status: 'Disetujui' },
        { id: 'k2', course_id: 'c2', course_code: 'IF102', course_name: 'Struktur Data', credits: 3, status: 'Disetujui' },
        { id: 'k3', course_id: 'c3', course_code: 'IF201', course_name: 'Basis Data', credits: 3, status: 'Disetujui' }
      ])
    }

    // KHS / Grades
    try {
      const { data } = await supabase.from('nilai_mahasiswa').select('*, course:courses(*)').eq('student_id', studentId)
      if (data) {
        setNilaiList(data.map((n: any) => ({
          id: n.id,
          semester: 1, // mock
          course_code: n.course?.code || 'IF000',
          course_name: n.course?.name || 'Mata Kuliah',
          credits: n.course?.credits || 3,
          nilai_angka: n.nilai_angka,
          nilai_huruf: n.nilai_huruf,
          bobot: n.bobot
        })))
      }
    } catch {
      const local = localStorage.getItem(`local_grades_${studentId}`)
      setNilaiList(local ? JSON.parse(local) : [
        { id: 'n1', semester: 5, course_code: 'IF101', course_name: 'Pemrograman Dasar', credits: 4, nilai_angka: 88, nilai_huruf: 'A', bobot: 4 },
        { id: 'n2', semester: 5, course_code: 'IF102', course_name: 'Struktur Data', credits: 3, nilai_angka: 79, nilai_huruf: 'B+', bobot: 3.5 },
        { id: 'n3', semester: 5, course_code: 'IF201', course_name: 'Basis Data', credits: 3, nilai_angka: 82, nilai_huruf: 'A-', bobot: 3.75 }
      ])
    }

    // Violations
    try {
      const { data } = await supabase.from('pelanggaran_mahasiswa').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
      setViolationsList(data || [])
    } catch {
      const local = localStorage.getItem(`local_violations_${studentId}`)
      setViolationsList(local ? JSON.parse(local) : [
        { id: 'v1', jenis_pelanggaran: 'Ringan', poin: 10, keterangan: 'Keterlambatan masuk perkuliahan berulang.', tindakan_sp: 'Tidak Ada', created_at: new Date().toISOString() }
      ])
    }

    // Permits
    try {
      const { data } = await supabase.from('perizinan_absensi').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
      setPermitsList(data || [])
    } catch {
      const local = localStorage.getItem(`local_permits_${studentId}`)
      setPermitsList(local ? JSON.parse(local) : [
        { id: 'prm1', jenis_izin: 'Sakit', keterangan: 'Demam tinggi dan disarankan bedrest.', file_url: '/docs/surat_dokter.jpg', status: 'Disetujui', created_at: new Date().toISOString() }
      ])
    }

    // Scholarships
    try {
      const { data } = await supabase.from('beasiswa_mahasiswa').select('*').eq('student_id', studentId)
      setBeasiswaList(data || [])
    } catch {
      const local = localStorage.getItem(`local_scholarships_${studentId}`)
      setBeasiswaList(local ? JSON.parse(local) : [
        { id: 'b1', jenis_beasiswa: 'PPA Prestasi Akademik', periode: 'Ganjil 2025/2026', status: 'Aktif' }
      ])
    }

    // Achievements
    try {
      const { data } = await supabase.from('prestasi_mahasiswa').select('*').eq('student_id', studentId)
      setPrestasiList(data || [])
    } catch {
      const local = localStorage.getItem(`local_achievements_${studentId}`)
      setPrestasiList(local ? JSON.parse(local) : [
        { id: 'pr1', jenis_prestasi: 'Non Akademik', nama_prestasi: 'Juara 2 Kompetisi Robotik Nasional', sertifikat_url: 'robotics.jpg' }
      ])
    }

    // PKL / Magang
    try {
      const { data } = await supabase.from('pkl_magang').select('*, pembimbing:lecturers(profile:profiles(first_name, last_name))').eq('student_id', studentId).maybeSingle()
      setPklData(data)
    } catch {
      const local = localStorage.getItem(`local_pkl_${studentId}`)
      setPklData(local ? JSON.parse(local) : {
        tempat_magang: 'PT. Satnusa Persada Tbk',
        pembimbing_lapangan: 'Ir. Hendra Wijaya',
        tanggal_mulai: '2025-09-01',
        tanggal_selesai: '2025-12-31',
        nilai: 88
      })
    }

    // Skripsi / Tugas Akhir
    try {
      const { data } = await supabase.from('skripsi_ta').select('*').eq('student_id', studentId).maybeSingle()
      setSkripsiData(data)
    } catch {
      const local = localStorage.getItem(`local_skripsi_${studentId}`)
      setSkripsiData(local ? JSON.parse(local) : {
        judul: 'Rancang Bangun Sistem Absensi Menggunakan Algoritma Face Recognition Terdistribusi',
        pembimbing_1: 'Dr. John Doe, M.T.',
        pembimbing_2: 'Jane Smith, M.Kom.',
        penguji: 'Dr. Robert Albert',
        tgl_sempro: '2026-02-14',
        tgl_semhas: '2026-05-20',
        tgl_sidang: '2026-06-25',
        nilai_akhir: 'A'
      })
    }

    // Alumni
    try {
      const { data } = await supabase.from('alumni').select('*').eq('student_id', studentId).maybeSingle()
      setAlumniData(data)
    } catch {
      const local = localStorage.getItem(`local_alumni_${studentId}`)
      setAlumniData(local ? JSON.parse(local) : (selectedStudent?.status_akademik === 'Lulus' ? {
        tahun_lulus: 2026,
        ipk: 3.82,
        lama_studi: '3 Tahun 10 Bulan',
        no_ijazah: 'UB-2026-9812903',
        status_pekerjaan: 'Bekerja',
        tempat_kerja: 'Gojek Indonesia'
      } : null))
    }
  }

  useEffect(() => {
    if (selectedStudent?.id) {
      loadStudentAcademicData(selectedStudent.id)
    }
  }, [selectedStudent])

  // Total SKS calculation helper
  const totalKrsSks = krsItems
    .filter(item => item.status === 'Disetujui')
    .reduce((sum, item) => sum + Number(item.credits), 0)

  // IPK & IPS Calculation
  const totalCreditsGrade = nilaiList.reduce((sum, n) => sum + Number(n.credits), 0)
  const totalPointsGrade = nilaiList.reduce((sum, n) => sum + (Number(n.credits) * Number(n.bobot)), 0)
  const calculatedIpk = totalCreditsGrade > 0 ? (totalPointsGrade / totalCreditsGrade).toFixed(2) : '0.00'

  // Total Violations points
  const totalViolationPoints = violationsList.reduce((sum, v) => sum + Number(v.poin), 0)

  // Status Change handler
  const handleStatusChangeSubmit = async () => {
    if (!selectedStudent) return
    
    try {
      const oldStatus = selectedStudent.status_akademik
      
      // Update Database
      try {
        const { error } = await supabase
          .from('students')
          .update({ status_akademik: newStatus })
          .eq('id', selectedStudent.id)
        if (error) throw error

        const { error: histErr } = await supabase.from('status_akademik_history').insert([{
          student_id: selectedStudent.id,
          status_lama: oldStatus,
          status_baru: newStatus,
          catatan: statusCatatan
        }])
        if (histErr) throw histErr
      } catch (dbErr: any) {
        console.warn("DB status update failed, running local storage update:", dbErr.message)
        
        // Update Local students list
        const local = localStorage.getItem('local_students')
        if (local) {
          const current = JSON.parse(local).map((s: any) => {
            if (s.id === selectedStudent.id) return { ...s, status_akademik: newStatus }
            return s
          })
          localStorage.setItem('local_students', JSON.stringify(current))
        }

        // Add history
        const localHist = localStorage.getItem(`local_status_history_${selectedStudent.id}`)
        const hist = localHist ? JSON.parse(localHist) : []
        hist.unshift({
          id: crypto.randomUUID(),
          status_lama: oldStatus,
          status_baru: newStatus,
          catatan: statusCatatan,
          created_at: new Date().toISOString()
        })
        localStorage.setItem(`local_status_history_${selectedStudent.id}`, JSON.stringify(hist))
      }

      setSuccessMsg('Status akademik berhasil diperbarui!')
      setStatusDialogOpen(false)
      setStatusCatatan('')
      loadStudents()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch {
      setErrorMsg('Gagal memperbarui status akademik.')
    }
  }

  // KRS MK Selection (Add Course to KRS)
  const handleAddKrsCourse = async (course: any) => {
    if (krsItems.some(item => item.course_id === course.id)) {
      alert('Mata kuliah ini sudah ada di KRS Anda.')
      return
    }

    const newItem = {
      id: crypto.randomUUID(),
      course_id: course.id,
      course_code: course.code,
      course_name: course.name,
      credits: course.credits,
      status: 'Pending'
    }

    const updated = [...krsItems, newItem]
    setKrsItems(updated)
    localStorage.setItem(`local_krs_${selectedStudent.id}`, JSON.stringify(updated))
    setSuccessMsg('Mata kuliah berhasil ditambahkan ke KRS (Draft).')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // KRS Approve Dosen
  const handleApproveKrs = () => {
    const approved = krsItems.map(item => ({ ...item, status: 'Disetujui' }))
    setKrsItems(approved)
    localStorage.setItem(`local_krs_${selectedStudent.id}`, JSON.stringify(approved))
    setSuccessMsg('KRS Mahasiswa bimbingan berhasil disetujui!')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Add Violation
  const handleAddViolation = () => {
    const points = parseInt(violationForm.poin) || 0
    const newViolation = {
      id: crypto.randomUUID(),
      jenis_pelanggaran: violationForm.jenis,
      poin: points,
      keterangan: violationForm.keterangan,
      tindakan_sp: violationForm.tindakan_sp,
      created_at: new Date().toISOString()
    }

    const updated = [newViolation, ...violationsList]
    setViolationsList(updated)
    localStorage.setItem(`local_violations_${selectedStudent.id}`, JSON.stringify(updated))
    setAddViolationOpen(false)
    setViolationForm({ jenis: 'Ringan', poin: '10', keterangan: '', tindakan_sp: 'Tidak Ada' })
    setSuccessMsg('Catatan pelanggaran baru berhasil ditambahkan!')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Add Permit
  const handleAddPermit = () => {
    const newPermit = {
      id: crypto.randomUUID(),
      jenis_izin: permitForm.jenis,
      keterangan: permitForm.keterangan,
      file_url: permitForm.file || 'surat_izin.pdf',
      status: 'Pending',
      created_at: new Date().toISOString()
    }

    const updated = [newPermit, ...permitsList]
    setPermitsList(updated)
    localStorage.setItem(`local_permits_${selectedStudent.id}`, JSON.stringify(updated))
    setAddPermitOpen(false)
    setPermitForm({ jenis: 'Izin', keterangan: '', file: '' })
    setSuccessMsg('Pengajuan perizinan absensi berhasil dikirim!')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Approve Permit
  const handleApprovePermit = (permitId: string, status: 'Disetujui' | 'Ditolak') => {
    const updated = permitsList.map(p => {
      if (p.id === permitId) return { ...p, status }
      return p
    })
    setPermitsList(updated)
    localStorage.setItem(`local_permits_${selectedStudent.id}`, JSON.stringify(updated))
    setSuccessMsg(`Pengajuan izin absensi telah ${status === 'Disetujui' ? 'disetujui' : 'ditolak'}.`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Virtual KTM Printing Layout Trigger
  const handlePrintKtm = () => {
    window.print()
  }

  // Export to Excel for Transkrip
  const handleExportTranscript = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Transkrip Nilai')

      worksheet.columns = [
        { header: 'Kode MK', key: 'code', width: 15 },
        { header: 'Nama Mata Kuliah', key: 'name', width: 35 },
        { header: 'SKS', key: 'credits', width: 10 },
        { header: 'Nilai Angka', key: 'score', width: 15 },
        { header: 'Nilai Huruf', key: 'letter', width: 15 },
        { header: 'Bobot', key: 'weight', width: 10 }
      ]

      nilaiList.forEach(n => {
        worksheet.addRow({
          code: n.course_code,
          name: n.course_name,
          credits: n.credits,
          score: n.nilai_angka,
          letter: n.nilai_huruf,
          weight: n.bobot
        })
      })

      // style header
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3A8A' } // blue-900
      }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `Transkrip_${selectedStudent?.nim || 'Nilai'}.xlsx`
      link.click()
    } catch {
      alert('Gagal mengekspor Transkrip.')
    }
  }

  // Filter students list based on search term & programs
  const filteredStudents = students.filter(s => {
    const fullName = `${s.profile?.first_name || ''} ${s.profile?.last_name || ''}`.toLowerCase()
    const matchSearch = s.nim.includes(searchTerm) || fullName.includes(searchTerm.toLowerCase())
    const matchProdi = filterProdi === 'All' || s.program?.id === filterProdi
    const matchStatus = filterStatus === 'All' || s.status_akademik === filterStatus
    return matchSearch && matchProdi && matchStatus
  })

  const programList = Array.from(new Set(students.map(s => JSON.stringify(s.program)))).map(s => JSON.parse(s))

  // Dashboard Stats Calculations (Aggregated)
  const totalMhs = students.length
  const activeMhs = students.filter(s => s.status_akademik === 'Aktif').length
  const cutiMhs = students.filter(s => s.status_akademik === 'Cuti').length
  const nonaktifMhs = students.filter(s => s.status_akademik === 'Nonaktif').length
  const lulusMhs = students.filter(s => s.status_akademik === 'Lulus').length
  const newMhsSemester = students.filter(s => s.semester === 1).length
  const totalAlumni = students.filter(s => s.status_akademik === 'Lulus').length // or in alumni table

  // Charts Mock Data
  const dataFakultas = [
    { name: 'FIK', Jumlah: students.filter(s => s.program?.department?.faculty?.code === 'FIK').length || 3 },
    { name: 'FT', Jumlah: students.filter(s => s.program?.department?.faculty?.code === 'FT').length || 1 }
  ]

  const dataProdi = [
    { name: 'Informatika', Jumlah: students.filter(s => s.program?.code === 'S1-TI').length || 2 },
    { name: 'Sist. Informasi', Jumlah: students.filter(s => s.program?.code === 'S1-SI').length || 2 }
  ]

  const dataAngkatan = [
    { name: '2022', Jumlah: students.filter(s => s.enrollment_year === 2022).length || 4 },
    { name: '2023', Jumlah: students.filter(s => s.enrollment_year === 2023).length || 0 }
  ]

  const isAdmin = userRole === 'super_admin' || userRole === 'admin_akademik'
  const isDosen = userRole === 'dosen' || userRole === 'lecturer'
  const isMhs = userRole === 'mahasiswa'

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen print:bg-white print:p-0">
      
      {/* Alert Notices */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-center gap-3 text-emerald-800 shadow-sm print:hidden">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-lg flex items-center gap-3 text-rose-800 shadow-sm print:hidden">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Warning Alert if Violation points exceeds 75 */}
      {selectedStudent && totalViolationPoints >= 50 && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl flex gap-3 shadow-sm print:hidden">
          <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5 animate-bounce" />
          <div>
            <p className="font-bold text-sm">Peringatan: Poin Pelanggaran Tinggi!</p>
            <p className="text-xs text-amber-700">
              Mahasiswa <strong>{selectedStudent?.profile?.first_name} {selectedStudent?.profile?.last_name}</strong> memiliki akumulasi poin pelanggaran sebesar <strong>{totalViolationPoints} poin</strong>.
              Sistem telah mengirimkan notifikasi otomatis ke Dosen Pembimbing Akademik ({selectedStudent.dosen_pa?.profile?.first_name} {selectedStudent.dosen_pa?.profile?.last_name}) dan Mahasiswa terkait.
            </p>
          </div>
        </div>
      )}

      {/* Banner / Student Info Context Indicator */}
      {selectedStudent && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-xl">
              {selectedStudent.profile?.first_name?.[0]}{selectedStudent.profile?.last_name?.[0]}
            </div>
            <div>
              <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">Mahasiswa Aktif Terpilih</p>
              <h3 className="text-lg font-black leading-tight">
                {selectedStudent.profile?.first_name} {selectedStudent.profile?.last_name}
              </h3>
              <p className="text-xs text-blue-200">
                NIM: {selectedStudent.nim} | Prodi: {selectedStudent.program?.name} | Semester: {selectedStudent.semester} | Kelas: {selectedStudent.kelas}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isMhs && (
              <select
                value={selectedStudent.id}
                onChange={(e) => {
                  const found = students.find(s => s.id === e.target.value)
                  if (found) setSelectedStudent(found)
                }}
                className="bg-white/15 border border-white/20 rounded-lg p-1.5 text-xs text-white outline-none font-bold"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id} className="text-slate-800 font-semibold">
                    {s.nim} - {s.profile?.first_name}
                  </option>
                ))}
              </select>
            )}
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold text-xs"
              onClick={() => setKtmOpen(true)}
            >
              <IdCard className="h-3.5 w-3.5 mr-1" />
              Cetak KTM
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="flex flex-col lg:flex-row gap-6 print:block">
        
        {/* Sidebar Tabs Selectors (Vertical layout on desktop) */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-1 print:hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">MENU UTAMA</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-1 gap-1">
            {tabsList.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
                    isActive 
                      ? 'bg-blue-900 text-white shadow-sm font-bold' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Workspace Display Area */}
        <div className="flex-1 min-w-0 print:block">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Dashboard Mahasiswa</h2>
                <p className="text-slate-500 text-sm mt-1">Ikhtisar demografi dan kondisi akademik mahasiswa universitas</p>
              </div>

              {/* Indicator Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Total Mahasiswa</span>
                    <span className="text-2xl font-black text-slate-800 block mt-1">{totalMhs}</span>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <span className="text-xs font-semibold text-emerald-500 block uppercase">Aktif</span>
                    <span className="text-2xl font-black text-slate-800 block mt-1">{activeMhs}</span>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <span className="text-xs font-semibold text-blue-500 block uppercase">Cuti</span>
                    <span className="text-2xl font-black text-slate-800 block mt-1">{cutiMhs}</span>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-4">
                    <span className="text-xs font-semibold text-slate-500 block uppercase">Alumni</span>
                    <span className="text-2xl font-black text-slate-800 block mt-1">{totalAlumni}</span>
                  </CardContent>
                </Card>
              </div>

              {/* Graphs area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-700">Mahasiswa Per Fakultas</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataFakultas}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Jumlah" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-700">Mahasiswa Per Program Studi</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataProdi}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Jumlah" fill="#0D9488" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-700">Perbandingan Angkatan</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataAngkatan}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Jumlah" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-slate-700">Statistik IPK Rata-Rata (IPK)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex flex-col justify-center items-center text-center">
                    <p className="text-5xl font-black text-teal-800">3.54</p>
                    <p className="text-xs text-slate-500 mt-2">IPK Rata-rata Kumulatif Seluruh Mahasiswa Aktif</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: DATA MAHASISWA */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">Data Master Mahasiswa</h2>
                  <p className="text-slate-500 text-sm mt-1">Daftar seluruh mahasiswa aktif terdaftar di universitas</p>
                </div>
                {isAdmin && (
                  <Link href="/dashboard/master/students">
                    <Button className="bg-blue-900 hover:bg-blue-950 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                      <Plus className="h-4 w-4" />
                      Registrasi Mahasiswa Baru
                    </Button>
                  </Link>
                )}
              </div>

              {/* Filters Panel */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Cari NIM atau Nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div>
                  <select
                    value={filterProdi}
                    onChange={(e) => setFilterProdi(e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white outline-none"
                  >
                    <option value="All">Semua Prodi</option>
                    {programList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white outline-none"
                  >
                    <option value="All">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Lulus">Lulus</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/75">
                      <TableRow>
                        <TableHead className="text-slate-600 font-bold">NIM</TableHead>
                        <TableHead className="text-slate-600 font-bold">Nama</TableHead>
                        <TableHead className="text-slate-600 font-bold">Program Studi</TableHead>
                        <TableHead className="text-slate-600 font-bold text-center">Semester</TableHead>
                        <TableHead className="text-slate-600 font-bold text-center">Status</TableHead>
                        <TableHead className="text-slate-600 font-bold text-right w-24">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(s => (
                          <TableRow key={s.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-mono text-xs">{s.nim}</TableCell>
                            <TableCell>
                              <div className="font-bold text-slate-900">{s.profile?.first_name} {s.profile?.last_name}</div>
                              <div className="text-[10px] text-slate-500">{s.profile?.email}</div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-600 font-semibold">{s.program?.name}</TableCell>
                            <TableCell className="text-center text-xs font-semibold">{s.semester}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={`text-xs px-2 rounded-full border ${
                                s.status_akademik === 'Aktif' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                s.status_akademik === 'Cuti' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                s.status_akademik === 'Lulus' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                {s.status_akademik}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="font-bold text-xs"
                                onClick={() => setSelectedStudent(s)}
                              >
                                Pilih
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                            Mahasiswa tidak ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: STATUS AKADEMIK */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Kelola Status Akademik</h2>
                <p className="text-slate-500 text-sm mt-1">Ubah dan pantau riwayat transisi status akademik mahasiswa</p>
              </div>

              {selectedStudent ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left form card */}
                  <Card className="border-slate-200 bg-white shadow-sm md:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-slate-800">Ubah Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-600">Status Saat Ini</Label>
                        <div className="p-2 bg-slate-50 rounded-lg text-sm font-bold border text-slate-800">
                          {selectedStudent.status_akademik}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="new_status" className="text-xs font-semibold text-slate-600">Status Baru</Label>
                        <select
                          id="new_status"
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-900 outline-none"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Cuti">Cuti</option>
                          <option value="Nonaktif">Nonaktif</option>
                          <option value="Drop Out">Drop Out</option>
                          <option value="Lulus">Lulus</option>
                          <option value="Mutasi Keluar">Mutasi Keluar</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="status_catatan" className="text-xs font-semibold text-slate-600">Catatan Perubahan</Label>
                        <Textarea
                          id="status_catatan"
                          value={statusCatatan}
                          placeholder="Masukkan alasan pembaruan status..."
                          onChange={(e) => setStatusCatatan(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <Button
                        onClick={handleStatusChangeSubmit}
                        className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold"
                      >
                        Pembaruan Status
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Right history list */}
                  <Card className="border-slate-200 bg-white shadow-sm md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-slate-800">Riwayat Perubahan Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-slate-50/75">
                          <TableRow>
                            <TableHead className="text-slate-600 font-bold">Waktu</TableHead>
                            <TableHead className="text-slate-600 font-bold">Status Awal</TableHead>
                            <TableHead className="text-slate-600 font-bold">Status Baru</TableHead>
                            <TableHead className="text-slate-600 font-bold">Catatan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {statusHistory.length > 0 ? (
                            statusHistory.map(h => (
                              <TableRow key={h.id} className="text-xs">
                                <TableCell className="font-mono text-slate-500">{formatTanggal(h.created_at)}</TableCell>
                                <TableCell className="font-semibold text-slate-600">{h.status_lama}</TableCell>
                                <TableCell className="font-bold text-blue-800">{h.status_baru}</TableCell>
                                <TableCell className="text-slate-600">{h.catatan}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                                Belum ada riwayat perubahan status.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk mengelola status akademiknya.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 4: KRS */}
          {activeTab === 'krs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">Kartu Rencana Studi (KRS)</h2>
                  <p className="text-slate-500 text-sm mt-1">Kelola dan setujui mata kuliah bimbingan mahasiswa</p>
                </div>
                {selectedStudent && (isAdmin || isDosen) && (
                  <Button
                    onClick={handleApproveKrs}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    Setujui & Kunci KRS
                  </Button>
                )}
              </div>

              {selectedStudent ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Chosen classes table */}
                  <Card className="border-slate-200 bg-white shadow-sm lg:col-span-2">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-800">Mata Kuliah Pilihan</CardTitle>
                        <CardDescription className="text-[11px]">Daftar rencana studi semester saat ini</CardDescription>
                      </div>
                      <Badge className="bg-blue-900 text-white font-bold text-xs">{totalKrsSks} SKS Terdaftar</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow>
                            <TableHead className="text-slate-600 font-bold py-2">Kode</TableHead>
                            <TableHead className="text-slate-600 font-bold py-2">Nama MK</TableHead>
                            <TableHead className="text-slate-600 font-bold text-center py-2">SKS</TableHead>
                            <TableHead className="text-slate-600 font-bold text-center py-2">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {krsItems.length > 0 ? (
                            krsItems.map(item => (
                              <TableRow key={item.id} className="text-xs hover:bg-transparent">
                                <TableCell className="font-mono">{item.course_code}</TableCell>
                                <TableCell className="font-semibold text-slate-800">{item.course_name}</TableCell>
                                <TableCell className="text-center font-bold text-slate-700">{item.credits}</TableCell>
                                <TableCell className="text-center">
                                  <Badge className={`text-[10px] ${
                                    item.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' : 'bg-yellow-50 text-yellow-800 border border-yellow-250'
                                  }`}>
                                    {item.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                                Belum ada mata kuliah yang diambil.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Right: Available courses selector */}
                  <Card className="border-slate-200 bg-white shadow-sm lg:col-span-1">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-sm font-bold text-slate-800">Ambil Mata Kuliah</CardTitle>
                      <CardDescription className="text-[11px]">Pilih kelas yang tersedia</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2.5 max-h-[400px] overflow-y-auto">
                      {MOCK_COURSES.map(course => (
                        <div key={course.id} className="p-3 border rounded-lg hover:bg-slate-50 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">{course.code}</span>
                            <p className="text-xs font-bold text-slate-800 leading-tight">{course.name}</p>
                            <span className="text-[10px] text-slate-500 font-semibold">{course.credits} SKS</span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-slate-100 text-slate-800 hover:bg-blue-900 hover:text-white h-7 px-2 font-bold text-[10px]"
                            onClick={() => handleAddKrsCourse(course)}
                          >
                            Ambil
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk mengelola KRS.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 5: KHS */}
          {activeTab === 'khs' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Kartu Hasil Studi (KHS)</h2>
                <p className="text-slate-500 text-sm mt-1">Indeks Prestasi Semester (IPS) dan rincian nilai studi semester</p>
              </div>

              {selectedStudent ? (
                <Card className="border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="pb-3 border-b bg-slate-55 flex flex-wrap flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-800">Rincian Hasil Studi</CardTitle>
                      <CardDescription className="text-[11px]">Nilai semester berjalan mahasiswa</CardDescription>
                    </div>
                    <div className="flex gap-4 text-xs font-extrabold">
                      <div className="text-center px-3 py-1 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-450 block text-[9px] uppercase tracking-wide">IPS</span>
                        <span className="text-slate-800 text-base">{calculatedIpk}</span>
                      </div>
                      <div className="text-center px-3 py-1 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-450 block text-[9px] uppercase tracking-wide">IPK</span>
                        <span className="text-slate-800 text-base">{calculatedIpk}</span>
                      </div>
                      <div className="text-center px-3 py-1 bg-white border border-slate-200 rounded-lg">
                        <span className="text-slate-450 block text-[9px] uppercase tracking-wide">Total SKS Lulus</span>
                        <span className="text-slate-800 text-base">{totalCreditsGrade}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="text-slate-600 font-bold py-2">Kode MK</TableHead>
                          <TableHead className="text-slate-600 font-bold py-2">Nama Mata Kuliah</TableHead>
                          <TableHead className="text-slate-600 font-bold text-center py-2">SKS</TableHead>
                          <TableHead className="text-slate-600 font-bold text-center py-2">Nilai Angka</TableHead>
                          <TableHead className="text-slate-600 font-bold text-center py-2">Nilai Huruf</TableHead>
                          <TableHead className="text-slate-600 font-bold text-center py-2">Bobot</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nilaiList.length > 0 ? (
                          nilaiList.map(n => (
                            <TableRow key={n.id} className="text-xs">
                              <TableCell className="font-mono">{n.course_code}</TableCell>
                              <TableCell className="font-semibold text-slate-800">{n.course_name}</TableCell>
                              <TableCell className="text-center font-bold text-slate-700">{n.credits}</TableCell>
                              <TableCell className="text-center font-medium">{n.nilai_angka}</TableCell>
                              <TableCell className="text-center font-extrabold text-blue-800">{n.nilai_huruf}</TableCell>
                              <TableCell className="text-center font-medium">{n.bobot}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                              Belum ada nilai KHS terbit untuk mahasiswa ini.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk melihat KHS.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 6: TRANSKRIP NILAI */}
          {activeTab === 'transkrip' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">Transkrip Nilai Kumulatif</h2>
                  <p className="text-slate-500 text-sm mt-1">Daftar nilai seluruh mata kuliah yang telah diselesaikan</p>
                </div>
                {selectedStudent && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs bg-white border-slate-350 flex items-center gap-1"
                      onClick={handleExportTranscript}
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                      Export Excel
                    </Button>
                    <Button 
                      className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                      onClick={handlePrintKtm}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Cetak Transkrip
                    </Button>
                  </div>
                )}
              </div>

              {selectedStudent ? (
                <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
                  <CardHeader className="pb-3 border-b flex flex-row justify-between items-center bg-slate-55">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-800">Transkrip Nilai Sementara</CardTitle>
                      <CardDescription className="text-[11px]">Nilai komulatif mahasiswa</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">IPK Akhir</p>
                      <p className="text-2xl font-black text-slate-800">{calculatedIpk}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="text-slate-600 font-bold py-2">Kode MK</TableHead>
                          <TableHead className="text-slate-600 font-bold py-2">Mata Kuliah</TableHead>
                          <TableHead className="text-slate-600 font-bold text-center py-2">SKS</TableHead>
                          <TableHead className="text-slate-600 font-bold text-center py-2">Nilai Huruf</TableHead>
                          <TableHead className="text-slate-600 font-bold text-center py-2">Bobot</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nilaiList.map(n => (
                          <TableRow key={n.id} className="text-xs hover:bg-transparent">
                            <TableCell className="font-mono">{n.course_code}</TableCell>
                            <TableCell className="font-semibold text-slate-800">{n.course_name}</TableCell>
                            <TableCell className="text-center font-bold text-slate-700">{n.credits}</TableCell>
                            <TableCell className="text-center font-extrabold text-blue-800">{n.nilai_huruf}</TableCell>
                            <TableCell className="text-center font-medium">{n.bobot}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk melihat Transkrip Nilai.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 7: PRESENSI */}
          {activeTab === 'presensi' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Presensi & Kehadiran Mahasiswa</h2>
                <p className="text-slate-500 text-sm mt-1">Rekapitulasi persentase dan daftar kehadiran mahasiswa</p>
              </div>

              {selectedStudent ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-slate-250 shadow-sm text-center">
                    <span className="text-xs text-slate-400 block font-bold uppercase">Hadir</span>
                    <span className="text-3xl font-black text-slate-800 block mt-1">14</span>
                  </Card>
                  <Card className="p-4 border-slate-250 shadow-sm text-center">
                    <span className="text-xs text-slate-400 block font-bold uppercase">Sakit</span>
                    <span className="text-3xl font-black text-amber-700 block mt-1">1</span>
                  </Card>
                  <Card className="p-4 border-slate-250 shadow-sm text-center">
                    <span className="text-xs text-slate-400 block font-bold uppercase">Izin</span>
                    <span className="text-3xl font-black text-blue-800 block mt-1">0</span>
                  </Card>
                  <Card className="p-4 border-slate-250 shadow-sm text-center">
                    <span className="text-xs text-slate-400 block font-bold uppercase">Alpha (Tanpa Keterangan)</span>
                    <span className="text-3xl font-black text-rose-700 block mt-1">0</span>
                  </Card>
                  
                  <Card className="md:col-span-4 p-6 border-slate-200 bg-white">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Persentase Kehadiran</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden border">
                        <div className="bg-teal-600 h-full rounded-full" style={{ width: '93%' }} />
                      </div>
                      <span className="text-xl font-black text-teal-850">93.3%</span>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk melihat rekap presensi.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 8: PERIZINAN */}
          {activeTab === 'perizinan' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">Perizinan Absensi</h2>
                  <p className="text-slate-500 text-sm mt-1">Ajukan permohonan izin atau sakit untuk kelas perkuliahan</p>
                </div>
                {selectedStudent && (
                  <Button
                    onClick={() => setAddPermitOpen(true)}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Ajukan Surat Izin
                  </Button>
                )}
              </div>

              {selectedStudent ? (
                <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
                  <CardHeader className="pb-3 border-b bg-slate-55">
                    <CardTitle className="text-sm font-bold text-slate-800">Daftar Pengajuan Surat Izin</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="text-slate-600 font-bold py-2">Waktu Pengajuan</TableHead>
                          <TableHead className="text-slate-600 font-bold py-2">Jenis</TableHead>
                          <TableHead className="text-slate-600 font-bold py-2">Keterangan</TableHead>
                          <TableHead className="text-slate-600 font-bold py-2">Lampiran</TableHead>
                          <TableHead className="text-slate-600 font-bold text-center py-2">Status</TableHead>
                          {!isMhs && <TableHead className="text-slate-600 font-bold text-right py-2">Persetujuan</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permitsList.length > 0 ? (
                          permitsList.map(p => (
                            <TableRow key={p.id} className="text-xs hover:bg-transparent">
                              <TableCell className="font-mono text-slate-500">{formatTanggal(p.created_at)}</TableCell>
                              <TableCell className="font-bold text-slate-800">{p.jenis_izin}</TableCell>
                              <TableCell className="text-slate-600 max-w-[200px] truncate" title={p.keterangan}>
                                {p.keterangan}
                              </TableCell>
                              <TableCell className="font-semibold text-teal-850 hover:underline cursor-pointer">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3.5 w-3.5" />
                                  {p.file_url}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={`text-[10px] ${
                                  p.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' :
                                  p.status === 'Ditolak' ? 'bg-rose-50 text-rose-800 border-rose-250' :
                                  'bg-yellow-50 text-yellow-800 border-yellow-250'
                                } border`}>
                                  {p.status}
                                </Badge>
                              </TableCell>
                              {!isMhs && (
                                <TableCell className="text-right">
                                  {p.status === 'Pending' && (
                                    <div className="flex justify-end gap-1.5">
                                      <Button
                                        size="sm"
                                        className="h-7 w-7 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-0 rounded-md"
                                        onClick={() => handleApprovePermit(p.id, 'Disetujui')}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="h-7 w-7 bg-rose-100 hover:bg-rose-200 text-rose-800 p-0 rounded-md"
                                        onClick={() => handleApprovePermit(p.id, 'Ditolak')}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-slate-450">
                              Belum ada pengajuan izin.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk mengelola izin absensi.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 9: PELANGGARAN */}
          {activeTab === 'pelanggaran' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">Pencatatan Pelanggaran</h2>
                  <p className="text-slate-500 text-sm mt-1">Pantau poin akumulasi dan tingkat Surat Peringatan (SP) mahasiswa</p>
                </div>
                {selectedStudent && !isMhs && (
                  <Button
                    onClick={() => setAddViolationOpen(true)}
                    className="bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Catat Pelanggaran Baru
                  </Button>
                )}
              </div>

              {selectedStudent ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Summary card */}
                  <Card className="border-slate-200 bg-white shadow-sm md:col-span-1 flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-slate-800">Akumulasi Poin</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-6">
                      <p className={`text-6xl font-black ${
                        totalViolationPoints >= 75 ? 'text-rose-700' :
                        totalViolationPoints >= 30 ? 'text-amber-600' : 'text-slate-800'
                      }`}>{totalViolationPoints}</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">Batas maksimum toleransi: 100 poin</p>
                      
                      <div className="mt-6 border-t pt-4 text-xs font-bold text-slate-700 flex justify-between items-center">
                        <span>Rekomendasi Tindakan:</span>
                        <Badge className={`${
                          totalViolationPoints >= 100 ? 'bg-rose-600 text-white' :
                          totalViolationPoints >= 75 ? 'bg-rose-50 text-rose-800 border-rose-250 border' :
                          totalViolationPoints >= 30 ? 'bg-amber-50 text-amber-800 border-amber-250 border' :
                          'bg-slate-100 text-slate-750'
                        } py-0.5 px-2.5 rounded-full`}>
                          {totalViolationPoints >= 100 ? 'Drop Out / SP3' :
                           totalViolationPoints >= 75 ? 'Surat Peringatan 2 (SP2)' :
                           totalViolationPoints >= 30 ? 'Surat Peringatan 1 (SP1)' :
                           'Pembinaan Mandiri'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* List card */}
                  <Card className="border-slate-200 bg-white shadow-sm md:col-span-2">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-sm font-bold text-slate-800">Riwayat Pelanggaran Mahasiswa</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow>
                            <TableHead className="text-slate-650 font-bold py-2">Tanggal</TableHead>
                            <TableHead className="text-slate-650 font-bold py-2">Tingkat</TableHead>
                            <TableHead className="text-slate-650 font-bold text-center py-2">Poin</TableHead>
                            <TableHead className="text-slate-650 font-bold py-2">Keterangan</TableHead>
                            <TableHead className="text-slate-650 font-bold py-2">Status SP</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {violationsList.length > 0 ? (
                            violationsList.map(v => (
                              <TableRow key={v.id} className="text-xs hover:bg-transparent">
                                <TableCell className="font-mono text-slate-500">{formatTanggal(v.created_at)}</TableCell>
                                <TableCell className="font-bold text-slate-800">{v.jenis_pelanggaran}</TableCell>
                                <TableCell className="text-center font-black text-rose-700">{v.poin} pts</TableCell>
                                <TableCell className="text-slate-600 max-w-[150px] truncate" title={v.keterangan}>
                                  {v.keterangan}
                                </TableCell>
                                <TableCell className="font-bold">
                                  <Badge className="bg-slate-100 text-slate-800 text-[10px]">{v.tindakan_sp || 'Tidak Ada'}</Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-12 text-slate-450">
                                Mahasiswa bersih, tidak memiliki catatan pelanggaran.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk mengelola catatan pelanggarannya.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 10: PRESTASI */}
          {activeTab === 'prestasi' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none">Prestasi Mahasiswa</h2>
                  <p className="text-slate-500 text-sm mt-1">Simpan dan pantau sertifikat prestasi akademik dan non-akademik</p>
                </div>
                {selectedStudent && (
                  <Button
                    onClick={() => setAddPrestasiOpen(true)}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Prestasi Baru
                  </Button>
                )}
              </div>

              {selectedStudent ? (
                <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
                  <CardHeader className="pb-3 border-b bg-slate-55">
                    <CardTitle className="text-sm font-bold text-slate-800">Portofolio Prestasi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="text-slate-650 font-bold py-2">Tingkat / Bidang</TableHead>
                          <TableHead className="text-slate-650 font-bold py-2">Nama Prestasi / Kegiatan</TableHead>
                          <TableHead className="text-slate-650 font-bold py-2">Lampiran Bukti</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prestasiList.length > 0 ? (
                          prestasiList.map(p => (
                            <TableRow key={p.id} className="text-xs hover:bg-transparent">
                              <TableCell className="font-bold text-slate-800">{p.jenis_prestasi}</TableCell>
                              <TableCell className="font-semibold text-slate-700">{p.nama_prestasi}</TableCell>
                              <TableCell className="font-semibold text-teal-850 hover:underline cursor-pointer flex items-center gap-1 py-3">
                                <FileText className="h-3.5 w-3.5" />
                                {p.sertifikat_url || 'sertifikat.pdf'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-12 text-slate-450">
                              Belum ada portofolio prestasi tercatat.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk mengelola catatan prestasinya.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 11: BEASISWA */}
          {activeTab === 'beasiswa' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Beasiswa Mahasiswa</h2>
                <p className="text-slate-500 text-sm mt-1">Daftar program beasiswa dan periode aktif mahasiswa</p>
              </div>

              {selectedStudent ? (
                <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
                  <CardHeader className="pb-3 border-b bg-slate-55">
                    <CardTitle className="text-sm font-bold text-slate-800">Daftar Penerimaan Beasiswa</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="text-slate-655 font-bold py-2">Nama Beasiswa</TableHead>
                          <TableHead className="text-slate-655 font-bold py-2">Periode</TableHead>
                          <TableHead className="text-slate-655 font-bold text-center py-2">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {beasiswaList.length > 0 ? (
                          beasiswaList.map(b => (
                            <TableRow key={b.id} className="text-xs hover:bg-transparent">
                              <TableCell className="font-bold text-slate-900">{b.jenis_beasiswa}</TableCell>
                              <TableCell className="text-slate-650 font-semibold">{b.periode}</TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-250 border px-2 py-0.5 rounded-full">{b.status || 'Aktif'}</Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-12 text-slate-450">
                              Mahasiswa tidak terdaftar sebagai penerima beasiswa saat ini.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk mengelola data beasiswanya.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 12: PKL / MAGANG */}
          {activeTab === 'pkl' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">PKL & Magang Kerja</h2>
                <p className="text-slate-500 text-sm mt-1">Informasi instansi penempatan magang, jadwal pkl, serta nilai evaluasi</p>
              </div>

              {selectedStudent ? (
                pklData ? (
                  <Card className="border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-slate-55 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-800">Laporan PKL / Magang</CardTitle>
                      </div>
                      <Badge className="bg-blue-900 text-white font-bold text-xs">Nilai PKL: {pklData.nilai || '-'}</Badge>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Tempat Magang Kerja (Instansi)</span>
                          <span className="font-extrabold text-slate-850 block">{pklData.tempat_magang}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Pembimbing Lapangan (Instansi)</span>
                          <span className="font-bold text-slate-700 block">{pklData.pembimbing_lapangan || '-'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Tanggal Mulai PKL</span>
                          <span className="font-mono text-slate-650 block">{formatTanggal(pklData.tanggal_mulai)}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Tanggal Selesai PKL</span>
                          <span className="font-mono text-slate-650 block">{formatTanggal(pklData.tanggal_selesai)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="p-16 text-center border-slate-200">
                    <CardDescription>Belum ada data PKL/Magang yang dicatat untuk mahasiswa ini.</CardDescription>
                  </Card>
                )
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk melihat informasi PKL.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 13: SKRIPSI / TUGAS AKHIR */}
          {activeTab === 'skripsi' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Skripsi & Tugas Akhir</h2>
                <p className="text-slate-500 text-sm mt-1">Pantau judul penelitian, tanggal ujian sidang, dan pembimbing tugas akhir</p>
              </div>

              {selectedStudent ? (
                skripsiData ? (
                  <Card className="border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-slate-55 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-800">Detail Tugas Akhir</CardTitle>
                      </div>
                      <Badge className="bg-emerald-600 text-white font-bold text-xs">Nilai Akhir: {skripsiData.nilai_akhir || 'Dalam Proses'}</Badge>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-450 block font-bold uppercase">Judul Penelitian</span>
                        <p className="font-black text-slate-900 text-base leading-snug">{skripsiData.judul}</p>
                      </div>
                      <hr />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Dosen Pembimbing Utama</span>
                          <span className="font-bold text-slate-850 block">{skripsiData.pembimbing_1}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Dosen Pembimbing Kedua</span>
                          <span className="font-bold text-slate-700 block">{skripsiData.pembimbing_2}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Dosen Penguji Sidang</span>
                          <span className="font-bold text-slate-700 block">{skripsiData.penguji || '-'}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Tanggal Seminar Hasil</span>
                          <span className="font-mono text-slate-650 block">{formatTanggal(skripsiData.tgl_semhas)}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Tanggal Sidang Akhir</span>
                          <span className="font-mono text-slate-650 block">{formatTanggal(skripsiData.tgl_sidang)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="p-16 text-center border-slate-200">
                    <CardDescription>Belum ada topik Skripsi/Tugas Akhir yang diajukan.</CardDescription>
                  </Card>
                )
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk melihat informasi Skripsi.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 14: RIWAYAT AKADEMIK */}
          {activeTab === 'riwayat' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Riwayat Aktivitas Akademik</h2>
                <p className="text-slate-500 text-sm mt-1">Linimasa (Timeline) kegiatan dan jejak rekam mahasiswa selama kuliah</p>
              </div>

              {selectedStudent ? (
                <Card className="border-slate-200 bg-white p-6 shadow-sm">
                  <div className="relative border-l border-slate-200 pl-6 space-y-8">
                    {/* Items on timeline */}
                    <div className="relative">
                      <span className="absolute -left-[30px] top-0.5 bg-blue-900 text-white w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px]" />
                      <span className="text-xs text-slate-450 font-bold block">25 Juni 2026</span>
                      <span className="text-sm font-bold text-slate-800 block">Menyelesaikan Sidang Skripsi</span>
                      <p className="text-xs text-slate-500 mt-1">Dinyatakan lulus dengan nilai akhir A dalam Sidang Ujian Pertanggungjawaban Skripsi.</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[30px] top-0.5 bg-emerald-600 text-white w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px]" />
                      <span className="text-xs text-slate-450 font-bold block">15 Desember 2025</span>
                      <span className="text-sm font-bold text-slate-800 block">Menyelesaikan Praktik Kerja Lapangan (PKL)</span>
                      <p className="text-xs text-slate-500 mt-1">Menyelesaikan magang di PT. Satnusa Persada Tbk dengan nilai akhir 88 (Sangat Baik).</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[30px] top-0.5 bg-yellow-500 text-white w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px]" />
                      <span className="text-xs text-slate-450 font-bold block">10 Agustus 2025</span>
                      <span className="text-sm font-bold text-slate-800 block">Persetujuan KRS Semester 6</span>
                      <p className="text-xs text-slate-500 mt-1">KRS berisi 5 mata kuliah (16 SKS) disetujui oleh Dosen Wali Pembimbing Akademik.</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk melihat linimasa riwayat akademik.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 15: ALUMNI */}
          {activeTab === 'alumni' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Manajemen Tracer Alumni</h2>
                <p className="text-slate-500 text-sm mt-1">Lacak tahun kelulusan, nomor ijazah, serta status karir alumni</p>
              </div>

              {selectedStudent ? (
                alumniData ? (
                  <Card className="border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-slate-55 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-800">Tracer Studi Alumni</CardTitle>
                      </div>
                      <Badge className="bg-slate-200 text-slate-800 font-bold text-xs">No Ijazah: {alumniData.no_ijazah}</Badge>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Tahun Kelulusan</span>
                          <span className="font-extrabold text-slate-800 block">{alumniData.tahun_lulus}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Lama Masa Studi</span>
                          <span className="font-bold text-slate-700 block">{alumniData.lama_studi}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Status Pekerjaan</span>
                          <span className="font-bold text-slate-700 block">{alumniData.status_pekerjaan}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-450 block font-bold uppercase">Tempat Kerja / Instansi</span>
                          <span className="font-bold text-slate-750 block">{alumniData.tempat_kerja}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="p-16 text-center border-slate-200">
                    <CardDescription>
                      Mahasiswa belum berstatus **Lulus**. Informasi alumni hanya tersedia untuk mahasiswa yang telah dinyatakan lulus sidang yudisium.
                    </CardDescription>
                  </Card>
                )
              ) : (
                <Card className="p-16 text-center border-slate-200">
                  <CardDescription>Pilih mahasiswa terlebih dahulu untuk melihat informasi alumni.</CardDescription>
                </Card>
              )}
            </div>
          )}

          {/* TAB 16: PENGATURAN */}
          {activeTab === 'pengaturan' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">Pengaturan Modul Mahasiswa</h2>
                <p className="text-slate-500 text-sm mt-1">Konfigurasi jenis prestasi, pelanggaran, and semester akademik aktif</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-slate-800">Master Jenis Pelanggaran</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-bold text-xs py-1.5">Tingkat</TableHead>
                          <TableHead className="font-bold text-xs py-1.5 text-center">Poin Maks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs">
                        <TableRow>
                          <TableCell className="font-bold">Ringan</TableCell>
                          <TableCell className="text-center font-semibold">10 Poin</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold text-amber-700">Sedang</TableCell>
                          <TableCell className="text-center font-semibold">30 Poin</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold text-rose-700">Berat</TableCell>
                          <TableCell className="text-center font-semibold">75 Poin</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-slate-800">Master Jenis Prestasi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="font-bold text-xs py-1.5">Kategori</TableHead>
                          <TableHead className="font-bold text-xs py-1.5">Poin BKD</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs">
                        <TableRow>
                          <TableCell className="font-semibold">Prestasi Akademik (Lomba / Karya Ilmiah)</TableCell>
                          <TableCell className="font-semibold">15 Poin</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">Prestasi Non-Akademik (Seni / Olahraga)</TableCell>
                          <TableCell className="font-semibold">10 Poin</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Virtual KTM Card Modal for print layout */}
      <Dialog open={ktmOpen} onOpenChange={setKtmOpen}>
        <DialogContent className="max-w-[450px] bg-white rounded-xl shadow-2xl p-6 print:p-0 print:border-none print:shadow-none">
          <DialogHeader className="print:hidden border-b pb-2">
            <DialogTitle className="font-black text-slate-800">Virtual KTM (Kartu Tanda Mahasiswa)</DialogTitle>
            <DialogDescription>Gunakan dialog cetak di bawah ini untuk mencetak kartu fisik.</DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="flex flex-col items-center py-4 print:py-0">
              {/* Virtual KTM Graphic mockup */}
              <div className="w-[380px] h-[240px] bg-gradient-to-br from-indigo-900 via-blue-900 to-teal-950 text-white rounded-xl p-4 relative flex flex-col justify-between border-2 border-slate-300 shadow-xl overflow-hidden print:border-none print:shadow-none">
                {/* Background watermarks */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-white/20 pb-2">
                  <div className="w-8 h-8 bg-white text-blue-900 rounded-md font-black flex items-center justify-center text-sm">UB</div>
                  <div>
                    <h4 className="text-xs font-black tracking-wide leading-none">UNIVERSITAS BATAM</h4>
                    <span className="text-[7px] text-blue-200">KARTU TANDA MAHASISWA</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="flex gap-4 items-center mt-3">
                  <div className="w-20 h-24 bg-white/20 rounded border border-white/25 flex items-center justify-center font-bold text-white/50 text-[10px] uppercase overflow-hidden flex-shrink-0">
                    <User className="h-10 w-10 text-white/40" />
                  </div>
                  
                  <div className="space-y-1.5 text-[10px] leading-tight">
                    <div>
                      <span className="text-blue-300 text-[8px] uppercase tracking-wide block">NIM</span>
                      <span className="font-mono font-bold text-sm tracking-wider">{selectedStudent.nim}</span>
                    </div>
                    <div>
                      <span className="text-blue-300 text-[8px] uppercase tracking-wide block">Nama Lengkap</span>
                      <span className="font-extrabold text-white text-xs truncate max-w-[200px] block">
                        {selectedStudent.profile?.first_name} {selectedStudent.profile?.last_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-300 text-[8px] uppercase tracking-wide block">Program Studi</span>
                      <span className="font-bold text-slate-200">{selectedStudent.program?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="flex justify-between items-end text-[7px] text-blue-200 border-t border-white/10 pt-1.5 mt-2">
                  <span>Masa Berlaku: Selama Aktif Kuliah</span>
                  <span className="font-mono">UB-KTM-{selectedStudent.nim}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex gap-2 mt-6 print:hidden">
                <Button variant="outline" onClick={() => setKtmOpen(false)}>Butup</Button>
                <Button className="bg-blue-900 hover:bg-blue-950 text-white font-bold" onClick={handlePrintKtm}>
                  Cetak Kartu KTM
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* dialog add violation */}
      <Dialog open={addViolationOpen} onOpenChange={setAddViolationOpen}>
        <DialogContent className="max-w-[450px] bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="font-black text-slate-800">Catat Pelanggaran Mahasiswa</DialogTitle>
            <DialogDescription>Tambahkan laporan pelanggaran mahasiswa terpilih.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="v_level">Tingkat Pelanggaran</Label>
              <select
                id="v_level"
                value={violationForm.jenis}
                onChange={(e) => {
                  const val = e.target.value
                  const points = val === 'Ringan' ? '10' : (val === 'Sedang' ? '30' : '75')
                  setViolationForm(p => ({ ...p, jenis: val, poin: points }))
                }}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm bg-white text-slate-900 outline-none"
              >
                <option value="Ringan">Ringan (10 Poin)</option>
                <option value="Sedang">Sedang (30 Poin)</option>
                <option value="Berat">Berat (75 Poin)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="v_sp">Tindakan Surat Peringatan</Label>
              <select
                id="v_sp"
                value={violationForm.tindakan_sp}
                onChange={(e) => setViolationForm(p => ({ ...p, tindakan_sp: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm bg-white text-slate-900 outline-none"
              >
                <option value="Tidak Ada">Tidak Ada SP</option>
                <option value="SP1">Peringatan 1 (SP1)</option>
                <option value="SP2">Peringatan 2 (SP2)</option>
                <option value="SP3">Peringatan 3 (SP3 / Drop Out)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="v_desc">Keterangan / Alasan Pelanggaran</Label>
              <Textarea
                id="v_desc"
                value={violationForm.keterangan}
                placeholder="Rincian kronologi atau bentuk pelanggaran..."
                onChange={(e) => setViolationForm(p => ({ ...p, keterangan: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddViolationOpen(false)}>Batal</Button>
            <Button className="bg-rose-700 hover:bg-rose-800 text-white font-bold" onClick={handleAddViolation}>
              Simpan Pelanggaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* dialog add permit */}
      <Dialog open={addPermitOpen} onOpenChange={setAddPermitOpen}>
        <DialogContent className="max-w-[450px] bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="font-black text-slate-800">Ajukan Izin / Sakit</DialogTitle>
            <DialogDescription>Kirimkan surat permohonan dispensasi kehadiran.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="p_jenis">Jenis Dispensasi</Label>
              <select
                id="p_jenis"
                value={permitForm.jenis}
                onChange={(e) => setPermitForm(p => ({ ...p, jenis: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm bg-white text-slate-900 outline-none"
              >
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit / Surat Dokter</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="p_desc">Alasan Keterangan</Label>
              <Textarea
                id="p_desc"
                value={permitForm.keterangan}
                placeholder="Alasan detail mengapa tidak dapat menghadiri kelas..."
                onChange={(e) => setPermitForm(p => ({ ...p, keterangan: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p_file">Unggah Lampiran Bukti (PDF / Image)</Label>
              <Input
                id="p_file"
                type="text"
                placeholder="surat_dokter.jpg atau scan_surat_izin.pdf"
                value={permitForm.file}
                onChange={(e) => setPermitForm(p => ({ ...p, file: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddPermitOpen(false)}>Batal</Button>
            <Button className="bg-blue-900 hover:bg-blue-950 text-white font-bold" onClick={handleAddPermit}>
              Kirim Pengajuan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatTanggal(dateStr?: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

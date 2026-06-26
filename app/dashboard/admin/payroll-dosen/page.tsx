'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  WalletCards, PlusCircle, CheckCircle2, AlertCircle, FileText, 
  Trash2, Lock, Filter, RefreshCw, Layers, Users, BookOpen, 
  X, Check, Printer, FileSpreadsheet, Eye 
} from 'lucide-react'
import Link from 'next/link'
import * as ExcelJS from 'exceljs'

// Date Lists
const bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const tahunList = ['2024', '2025', '2026', '2027']

const DEFAULT_LUR_TARIFF = 100000
const DEFAULT_DAR_TARIFF = 75000

type Faculty = { id: string; name: string; code: string }
type Program = { id: string; name: string; code: string; department_id: string }
type Profile = { first_name: string; last_name: string; email: string }
type Lecturer = { 
  id: string; 
  nip: string; 
  profile: Profile; 
  department?: { id: string; name: string; faculty: Faculty } 
}

type PayrollDosenDetail = {
  id: string
  payroll_id: string
  session_id: string
  jadwal_id: string
  pertemuan: number
  mode: 'daring' | 'luring'
  sks: number
  tarif: number
  jumlah: number
}

type PayrollDosen = {
  id: string
  periode: string
  dosen_id: string
  gaji_pokok: number
  insentif_daring: number
  insentif_luring: number
  tunjangan: number
  potongan: number
  total_gaji: number
  status: 'Draft' | 'Locked' | 'Cancelled'
  created_at: string
  dosen?: Lecturer
}

// Fallback Mock Data for Development
const MOCK_FACULTIES: Faculty[] = [
  { id: 'f1', name: 'Fakultas Ilmu Komputer', code: 'FIK' },
  { id: 'f2', name: 'Fakultas Teknik', code: 'FT' }
]

const MOCK_PROGRAMS: Program[] = [
  { id: 'p1', name: 'S1 Teknik Informatika', code: 'S1-TI', department_id: 'dept1' },
  { id: 'p2', name: 'S1 Sistem Informasi', code: 'S1-SI', department_id: 'dept2' }
]

export default function PayrollDosenPage() {
  const [payrolls, setPayrolls] = useState<PayrollDosen[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [filterBulan, setFilterBulan] = useState('Juni')
  const [filterTahun, setFilterTahun] = useState('2026')
  const [filterFaculty, setFilterFaculty] = useState('All')
  const [filterProgram, setFilterProgram] = useState('All')
  const [filterLecturer, setFilterLecturer] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // UI Message state
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Generate Payroll Dialog State
  const [genDialogOpen, setGenDialogOpen] = useState(false)
  const [genStep, setGenStep] = useState<'setup' | 'preview'>('setup')
  const [genBulan, setGenBulan] = useState('Juni')
  const [genTahun, setGenTahun] = useState('2026')
  const [scanning, setScanning] = useState(false)
  const [previewList, setPreviewList] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)

  // Load Metadata
  const loadMetadata = async () => {
    try {
      // Fetch Faculties
      const { data: dbFaculties } = await supabase.from('faculties').select('*').order('name')
      setFaculties(dbFaculties && dbFaculties.length > 0 ? dbFaculties : MOCK_FACULTIES)

      // Fetch Programs
      const { data: dbPrograms } = await supabase.from('programs').select('*').order('name')
      setPrograms(dbPrograms && dbPrograms.length > 0 ? dbPrograms : MOCK_PROGRAMS)

      // Fetch Lecturers
      const { data: dbLecturers } = await supabase
        .from('lecturers')
        .select('id, nip, profile:profiles(first_name, last_name, email), department:departments(id, name, faculty:faculties(*))')
        .order('id')
      
      if (dbLecturers) {
        const formatted: Lecturer[] = dbLecturers.map((l: any) => {
          const profile = Array.isArray(l.profile) ? l.profile[0] : l.profile
          const department = Array.isArray(l.department) ? l.department[0] : l.department
          const faculty = department ? (Array.isArray(department.faculty) ? department.faculty[0] : department.faculty) : null
          return {
            id: l.id,
            nip: l.nip,
            profile: profile || { first_name: '', last_name: '', email: '' },
            department: department ? {
              id: department.id,
              name: department.name,
              faculty: faculty
            } : undefined
          }
        })
        setLecturers(formatted)
      } else {
        setLecturers([
          { id: 'd1', nip: '198001012005011001', profile: { first_name: 'Dosen', last_name: 'Satu', email: 'dosen1@unbat.com' } },
          { id: 'd2', nip: '198102022006021002', profile: { first_name: 'Dosen', last_name: 'Dua', email: 'dosen2@unbat.com' } },
          { id: 'd3', nip: '198203032007031003', profile: { first_name: 'Dosen', last_name: 'Tiga', email: 'dosen3@unbat.com' } }
        ])
      }
    } catch (err) {
      console.error('Error loading metadata:', err)
      setFaculties(MOCK_FACULTIES)
      setPrograms(MOCK_PROGRAMS)
    }
  }

  // Load Payroll Records
  const loadPayrolls = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase
        .from('payroll_dosen')
        .select(`
          *,
          dosen:lecturers(
            id,
            nip,
            department:departments(
              id,
              name,
              faculty:faculties(*)
            ),
            profile:profiles(first_name, last_name, email)
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (data) {
        const formatted: PayrollDosen[] = data.map((item: any) => {
          const rawDosen = Array.isArray(item.dosen) ? item.dosen[0] : item.dosen
          if (rawDosen) {
            const profile = Array.isArray(rawDosen.profile) ? rawDosen.profile[0] : rawDosen.profile
            const department = Array.isArray(rawDosen.department) ? rawDosen.department[0] : rawDosen.department
            const faculty = department ? (Array.isArray(department.faculty) ? department.faculty[0] : department.faculty) : null
            return {
              ...item,
              dosen: {
                ...rawDosen,
                profile: profile || { first_name: '', last_name: '', email: '' },
                department: department ? {
                  id: department.id,
                  name: department.name,
                  faculty: faculty
                } : undefined
              }
            }
          }
          return item
        })
        setPayrolls(formatted)
      } else {
        setPayrolls([])
      }
    } catch (err: any) {
      console.warn("DB payroll fetch failed, using localStorage fallback:", err.message)
      const local = localStorage.getItem('local_payroll_dosen')
      if (local) {
        setPayrolls(JSON.parse(local))
      } else {
        setPayrolls([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetadata()
    loadPayrolls()
  }, [])

  // Filter Logic
  const filteredPayrolls = payrolls.filter(item => {
    const periodStr = `${filterBulan} ${filterTahun}`
    const matchPeriod = item.periode === periodStr
    const matchStatus = filterStatus === 'All' || item.status === filterStatus
    const matchLecturer = filterLecturer === 'All' || item.dosen_id === filterLecturer
    
    // Faculty & Program Filter (via department)
    let matchFaculty = true
    let matchProgram = true

    if (filterFaculty !== 'All' && item.dosen?.department?.faculty?.id) {
      matchFaculty = item.dosen.department.faculty.id === filterFaculty
    }
    
    // Program studi filter is mapped by checking lecturer's department id
    if (filterProgram !== 'All' && item.dosen?.department?.id) {
      // In mock, programs map to department. We do a loose check: if lecturer matches
      // Or if the program belongs to the lecturer's department
      const programObj = programs.find(p => p.id === filterProgram)
      if (programObj) {
        matchProgram = item.dosen.department.id === programObj.department_id
      }
    }

    return matchPeriod && matchStatus && matchLecturer && matchFaculty && matchProgram
  })

  // Calculations for Summary Cards
  const totalGajiBulanIni = filteredPayrolls
    .filter(p => p.status !== 'Cancelled')
    .reduce((sum, p) => sum + Number(p.total_gaji), 0)

  const totalDosenDibayar = filteredPayrolls
    .filter(p => p.status !== 'Cancelled').length

  // Lock Payroll
  const handleLockPayroll = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin mengunci payroll ini? Setelah dikunci, data tidak dapat diubah.')) return

    try {
      try {
        const { error } = await supabase
          .from('payroll_dosen')
          .update({ status: 'Locked' })
          .eq('id', id)
        if (error) throw error
        setSuccessMsg('Status payroll berhasil dikunci!')
      } catch (dbErr: any) {
        console.warn("DB lock payroll failed, using local fallback:", dbErr.message)
        const local = localStorage.getItem('local_payroll_dosen')
        if (local) {
          const current = JSON.parse(local).map((p: PayrollDosen) => {
            if (p.id === id) return { ...p, status: 'Locked' as const }
            return p
          })
          localStorage.setItem('local_payroll_dosen', JSON.stringify(current))
          setSuccessMsg('Status payroll berhasil dikunci (Local)!')
        }
      }
      loadPayrolls()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setErrorMsg('Gagal mengunci payroll.')
    }
  }

  // Cancel Payroll
  const handleCancelPayroll = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan payroll ini? Seluruh pertemuan dosen terkait akan dibebaskan kembali.')) return

    try {
      try {
        const { error } = await supabase
          .from('payroll_dosen')
          .update({ status: 'Cancelled' })
          .eq('id', id)
        if (error) throw error
        setSuccessMsg('Payroll berhasil dibatalkan!')
      } catch (dbErr: any) {
        console.warn("DB cancel payroll failed, using local fallback:", dbErr.message)
        // Local fallback: update status in local_payroll_dosen and remove associated sessions from local_paid_sessions
        const local = localStorage.getItem('local_payroll_dosen')
        if (local) {
          const currentPayrolls = JSON.parse(local).map((p: PayrollDosen) => {
            if (p.id === id) return { ...p, status: 'Cancelled' as const }
            return p
          })
          localStorage.setItem('local_payroll_dosen', JSON.stringify(currentPayrolls))
        }

        // Clean local_paid_sessions (remove sessions related to this payroll)
        const localDetails = localStorage.getItem('local_payroll_dosen_detail')
        if (localDetails) {
          const details: PayrollDosenDetail[] = JSON.parse(localDetails)
          const payrollDetails = details.filter(d => d.payroll_id === id)
          const paidSessionIds = payrollDetails.map(d => d.session_id)

          const localPaidSessions = localStorage.getItem('local_paid_sessions')
          if (localPaidSessions) {
            let sessionList: string[] = JSON.parse(localPaidSessions)
            sessionList = sessionList.filter(sid => !paidSessionIds.includes(sid))
            localStorage.setItem('local_paid_sessions', JSON.stringify(sessionList))
          }
        }

        setSuccessMsg('Payroll berhasil dibatalkan (Local)!')
      }
      loadPayrolls()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setErrorMsg('Gagal membatalkan payroll.')
    }
  }

  // STEP 1: Scan Unpaid Sessions for generating
  const handleScanSessions = async () => {
    setScanning(true)
    setErrorMsg('')
    try {
      const targetPeriodStr = `${genBulan} ${genTahun}`

      // Fetch active tariffs
      let activeTariffs: any[] = []
      try {
        const { data } = await supabase.from('tarif_dosen').select('*').eq('is_active', true)
        activeTariffs = data || []
      } catch {
        const local = localStorage.getItem('local_tarif_dosen')
        activeTariffs = local ? JSON.parse(local).filter((t: any) => t.is_active) : []
      }

      // Fetch ALL attendance sessions that are Selesai, closed, and not yet paid
      let allSessions: any[] = []
      try {
        const { data, error } = await supabase
          .from('attendance_sessions')
          .select(`
            *,
            schedule:schedules(
              id,
              course:courses(id, name, code, credits),
              lecturer_id
            )
          `)
          .eq('status', 'Selesai')
          .eq('is_open', false)
        if (error) throw error
        allSessions = data || []
      } catch {
        // Local Fallback for attendance sessions
        // We'll generate some dummy unpaid sessions if local storage is empty
        const localSess = localStorage.getItem('local_attendance_sessions')
        if (localSess) {
          allSessions = JSON.parse(localSess)
        } else {
          // Let's create dummy sessions on-the-fly for testing
          // Lecturer 1: NIP 198001012005011001 (dosen1@unbat.com) has id d1
          // Lecturer 2: NIP 198102022006021002 (dosen2@unbat.com) has id d2
          const now = new Date()
          const dummy = [
            {
              id: 's_dummy_1',
              schedule_id: 'sch1',
              lecturer_id: 'd1',
              opened_at: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
              closed_at: new Date(now.getFullYear(), now.getMonth(), 5, 10).toISOString(),
              is_open: false,
              token: 'XYZ1',
              berita_acara: 'Pemrograman Dasar - Pertemuan 1',
              status: 'Selesai',
              mode: 'luring',
              pertemuan: 1,
              schedule: {
                id: 'sch1',
                course: { id: 'c1', name: 'Pemrograman Dasar', code: 'IF101', credits: 4 },
                lecturer_id: 'd1'
              }
            },
            {
              id: 's_dummy_2',
              schedule_id: 'sch1',
              lecturer_id: 'd1',
              opened_at: new Date(now.getFullYear(), now.getMonth(), 12).toISOString(),
              closed_at: new Date(now.getFullYear(), now.getMonth(), 12, 10).toISOString(),
              is_open: false,
              token: 'XYZ2',
              berita_acara: 'Pemrograman Dasar - Pertemuan 2',
              status: 'Selesai',
              mode: 'daring',
              pertemuan: 2,
              schedule: {
                id: 'sch1',
                course: { id: 'c1', name: 'Pemrograman Dasar', code: 'IF101', credits: 4 },
                lecturer_id: 'd1'
              }
            },
            {
              id: 's_dummy_3',
              schedule_id: 'sch2',
              lecturer_id: 'd2',
              opened_at: new Date(now.getFullYear(), now.getMonth(), 6).toISOString(),
              closed_at: new Date(now.getFullYear(), now.getMonth(), 6, 12).toISOString(),
              is_open: false,
              token: 'ABC9',
              berita_acara: 'Struktur Data - Pertemuan 1',
              status: 'Selesai',
              mode: 'luring',
              pertemuan: 1,
              schedule: {
                id: 'sch2',
                course: { id: 'c2', name: 'Struktur Data', code: 'IF102', credits: 3 },
                lecturer_id: 'd2'
              }
            }
          ]
          localStorage.setItem('local_attendance_sessions', JSON.stringify(dummy))
          allSessions = dummy
        }
      }

      // Check which sessions have student attendance records (we require at least one student present)
      // For local fallback, we'll assume all dummy sessions have students checked-in
      // If Supabase, we'll verify if attendance_records exist for the session
      let validSessions: any[] = []
      for (const s of allSessions) {
        // 1. Must check opened_at matching Bulan and Tahun
        const sessDate = new Date(s.opened_at)
        const sessBulanStr = bulanList[sessDate.getMonth()]
        const sessTahunStr = sessDate.getFullYear().toString()

        if (sessBulanStr !== genBulan || sessTahunStr !== genTahun) {
          continue
        }

        // 2. Daring validation: must have token
        if (s.mode === 'daring' && (!s.token || s.token.trim() === '')) {
          continue
        }

        // 3. Must have berita_acara
        if (!s.berita_acara || s.berita_acara.trim() === '') {
          continue
        }

        // 4. Must check if session has records in attendance_records table
        let hasRecords = true
        try {
          const { count, error } = await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', s.id)
          if (!error && count !== null) {
            hasRecords = count > 0
          }
        } catch {
          hasRecords = true // Local storage dummy fallback
        }

        if (!hasRecords) continue

        // 5. Must check if session is already paid
        let isAlreadyPaid = false
        try {
          const { data } = await supabase
            .from('payroll_dosen_detail')
            .select('*, payroll:payroll_dosen(*)')
            .eq('session_id', s.id)
          
          if (data && data.length > 0) {
            // Check if parent payroll is not cancelled
            isAlreadyPaid = data.some((d: any) => d.payroll?.status !== 'Cancelled')
          }
        } catch {
          // Local fallback
          const localPaid = localStorage.getItem('local_paid_sessions')
          if (localPaid) {
            const list: string[] = JSON.parse(localPaid)
            isAlreadyPaid = list.includes(s.id)
          }
        }

        if (isAlreadyPaid) continue

        validSessions.push(s)
      }

      if (validSessions.length === 0) {
        setErrorMsg(`Tidak ada pertemuan valid/belum dibayar untuk periode ${targetPeriodStr}.`)
        setScanning(false)
        return
      }

      // Group by lecturer
      const grouped: Record<string, { sessions: any[]; lecturer: Lecturer }> = {}
      for (const s of validSessions) {
        const lecId = s.lecturer_id || s.schedule?.lecturer_id
        if (!lecId) continue

        if (!grouped[lecId]) {
          const associatedLec = lecturers.find(l => l.id === lecId)
          if (!associatedLec) continue
          grouped[lecId] = {
            sessions: [],
            lecturer: associatedLec
          }
        }
        grouped[lecId].sessions.push(s)
      }

      // Calculate totals and generate previews
      const previews = Object.keys(grouped).map(lecId => {
        const { sessions, lecturer } = grouped[lecId]
        
        // Find tariff config
        const tariff = activeTariffs.find(t => t.dosen_id === lecId) || {
          status_dosen: 'Luar Biasa',
          tarif_daring: DEFAULT_DAR_TARIFF,
          tarif_luring: DEFAULT_LUR_TARIFF,
          gaji_pokok: 0,
          tunjangan: 0
        }

        let insentifDaring = 0
        let insentifLuring = 0
        const details: any[] = []

        for (const s of sessions) {
          const sks = s.schedule?.course?.credits || 2
          const isDaring = s.mode === 'daring'
          const rate = isDaring ? Number(tariff.tarif_daring) : Number(tariff.tarif_luring)
          const amount = sks * rate

          if (isDaring) {
            insentifDaring += amount
          } else {
            insentifLuring += amount
          }

          details.push({
            session_id: s.id,
            jadwal_id: s.schedule_id || s.schedule?.id,
            pertemuan: s.pertemuan,
            mode: s.mode,
            sks: sks,
            tarif: rate,
            jumlah: amount
          })
        }

        const gajiPokok = Number(tariff.gaji_pokok)
        const tunjangan = Number(tariff.tunjangan)
        const potongan = 0 // Default to 0, user can edit in table
        const totalGaji = gajiPokok + insentifDaring + insentifLuring + tunjangan - potongan

        return {
          dosen_id: lecId,
          nip: lecturer.nip,
          nama: `${lecturer.profile.first_name} ${lecturer.profile.last_name}`,
          status_dosen: tariff.status_dosen,
          gaji_pokok: gajiPokok,
          insentif_daring: insentifDaring,
          insentif_luring: insentifLuring,
          tunjangan: tunjangan,
          potongan: potongan,
          total_gaji: totalGaji,
          sessions_count: sessions.length,
          details: details
        }
      })

      setPreviewList(previews)
      setGenStep('preview')
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Gagal memindai jadwal mengajar dosen.')
    } finally {
      setScanning(false)
    }
  }

  // Update Potongan in Preview
  const handleUpdatePotongan = (index: number, val: string) => {
    const updated = [...previewList]
    const pVal = parseFloat(val) || 0
    updated[index].potongan = pVal
    updated[index].total_gaji = 
      updated[index].gaji_pokok + 
      updated[index].insentif_daring + 
      updated[index].insentif_luring + 
      updated[index].tunjangan - 
      pVal
    setPreviewList(updated)
  }

  // STEP 2: Save generated payrolls
  const handleConfirmGenerate = async () => {
    setGenerating(true)
    setErrorMsg('')
    try {
      const targetPeriodStr = `${genBulan} ${genTahun}`

      for (const item of previewList) {
        try {
          // RPC database transaction
          const { data: newPayrollId, error } = await supabase.rpc('create_payroll_with_details', {
            p_periode: targetPeriodStr,
            p_dosen_id: item.dosen_id,
            p_gaji_pokok: item.gaji_pokok,
            p_insentif_daring: item.insentif_daring,
            p_insentif_luring: item.insentif_luring,
            p_tunjangan: item.tunjangan,
            p_potongan: item.potongan,
            p_total_gaji: item.total_gaji,
            p_details: item.details
          })

          if (error) throw error
        } catch (dbErr: any) {
          console.warn("DB transaction via RPC failed, running local storage insert:", dbErr.message)
          
          // LocalStorage fallback transaction
          const localPayrolls = localStorage.getItem('local_payroll_dosen')
          const payrollsList: PayrollDosen[] = localPayrolls ? JSON.parse(localPayrolls) : []

          // Delete existing draft payroll for this period & lecturer
          const filteredList = payrollsList.filter(
            p => !(p.periode === targetPeriodStr && p.dosen_id === item.dosen_id && p.status === 'Draft')
          )

          const payrollId = crypto.randomUUID()
          const associatedDosen = lecturers.find(l => l.id === item.dosen_id)

          const newPayroll: PayrollDosen = {
            id: payrollId,
            periode: targetPeriodStr,
            dosen_id: item.dosen_id,
            gaji_pokok: item.gaji_pokok,
            insentif_daring: item.insentif_daring,
            insentif_luring: item.insentif_luring,
            tunjangan: item.tunjangan,
            potongan: item.potongan,
            total_gaji: item.total_gaji,
            status: 'Draft',
            created_at: new Date().toISOString(),
            dosen: associatedDosen
          }
          filteredList.push(newPayroll)
          localStorage.setItem('local_payroll_dosen', JSON.stringify(filteredList))

          // Save details
          const localDetails = localStorage.getItem('local_payroll_dosen_detail')
          let detailsList: PayrollDosenDetail[] = localDetails ? JSON.parse(localDetails) : []

          // Remove old draft details
          const oldDraftDetails = detailsList.filter(d => d.payroll_id !== payrollId)
          
          const newDetails = item.details.map((d: any) => ({
            id: crypto.randomUUID(),
            payroll_id: payrollId,
            ...d
          }))

          detailsList = [...oldDraftDetails, ...newDetails]
          localStorage.setItem('local_payroll_dosen_detail', JSON.stringify(detailsList))

          // Mark sessions as paid (locally)
          const localPaidSessions = localStorage.getItem('local_paid_sessions')
          const paidList: string[] = localPaidSessions ? JSON.parse(localPaidSessions) : []
          item.details.forEach((d: any) => {
            if (!paidList.includes(d.session_id)) {
              paidList.push(d.session_id)
            }
          })
          localStorage.setItem('local_paid_sessions', JSON.stringify(paidList))
        }
      }

      setSuccessMsg(`Berhasil men-generate payroll untuk ${previewList.length} dosen!`)
      setGenDialogOpen(false)
      loadPayrolls()
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Gagal menyimpan data payroll.')
    } finally {
      setGenerating(false)
    }
  }

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Payroll Dosen')

      worksheet.columns = [
        { header: 'NIP', key: 'nip', width: 25 },
        { header: 'Nama Dosen', key: 'nama', width: 30 },
        { header: 'Periode', key: 'periode', width: 15 },
        { header: 'Status Ikatan', key: 'status_dosen', width: 15 },
        { header: 'Gaji Pokok', key: 'gaji_pokok', width: 18 },
        { header: 'Insentif Daring', key: 'insentif_daring', width: 18 },
        { header: 'Insentif Luring', key: 'insentif_luring', width: 18 },
        { header: 'Tunjangan', key: 'tunjangan', width: 18 },
        { header: 'Potongan', key: 'potongan', width: 15 },
        { header: 'Total Diterima', key: 'total_gaji', width: 18 },
        { header: 'Status', key: 'status', width: 15 }
      ]

      filteredPayrolls.forEach(item => {
        worksheet.addRow({
          nip: item.dosen?.nip || '-',
          nama: item.dosen?.profile ? `${item.dosen.profile.first_name} ${item.dosen.profile.last_name}` : 'Unknown',
          periode: item.periode,
          status_dosen: item.dosen?.department?.name || 'LB', // fallback status
          gaji_pokok: item.gaji_pokok,
          insentif_daring: item.insentif_daring,
          insentif_luring: item.insentif_luring,
          tunjangan: item.tunjangan,
          potongan: item.potongan,
          total_gaji: item.total_gaji,
          status: item.status
        })
      })

      // style header
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F766E' } // teal-700
      }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `Payroll_Dosen_${filterBulan}_${filterTahun}.xlsx`
      link.click()
    } catch (err) {
      console.error(err)
      alert('Gagal mengekspor ke Excel.')
    }
  }

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Payroll Dosen
          </h1>
          <p className="text-slate-500">
            Kelola gaji pokok, tunjangan, insentif mengajar, dan slip gaji dosen
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white shadow-md font-semibold flex items-center gap-2"
          onClick={() => {
            setGenStep('setup')
            setGenDialogOpen(true)
          }}
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Generate Payroll Baru
        </Button>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-center gap-3 text-emerald-800 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-lg flex items-center gap-3 text-rose-800 shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-teal-100 text-xs font-bold uppercase tracking-wider">
              Total Pengeluaran Gaji Periode Ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{formatIDR(totalGajiBulanIni)}</p>
            <p className="text-xs text-teal-100 mt-1">
              Periode: {filterBulan} {filterTahun}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Dosen Dibayar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{totalDosenDibayar}</span>
            <span className="text-slate-400 text-xs">dosen terproses</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Status Periode Saat Ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {filteredPayrolls.length === 0 ? (
                <Badge className="bg-slate-200 text-slate-700 text-xs py-1 px-3">Belum Terproses</Badge>
              ) : filteredPayrolls.some(p => p.status === 'Draft') ? (
                <Badge className="bg-yellow-500 text-white text-xs py-1 px-3">Ada Draft</Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white text-xs py-1 px-3">Semua Selesai (Locked)</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and History Section */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-teal-600" />
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Riwayat Payroll Dosen</CardTitle>
                <CardDescription className="text-xs text-slate-400">Filter dan cari payroll berdasarkan fakultas/program studi/dosen</CardDescription>
              </div>
            </div>
            
            {/* Filter selectors */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <div>
                <select
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white outline-none"
                >
                  {bulanList.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <select
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white outline-none"
                >
                  {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs flex items-center gap-1.5"
                onClick={handleExportExcel}
                disabled={filteredPayrolls.length === 0}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                Export Excel
              </Button>
            </div>
          </div>

          {/* Detailed Filters (Faculty, Program, Lecturer, Status) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 mt-3">
            <div>
              <Label className="text-xs font-bold text-slate-600">Fakultas</Label>
              <select
                value={filterFaculty}
                onChange={(e) => setFilterFaculty(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 outline-none"
              >
                <option value="All">Semua Fakultas</option>
                {faculties.map(f => <option key={f.id} value={f.id}>{f.code} - {f.name}</option>)}
              </select>
            </div>
            
            <div>
              <Label className="text-xs font-bold text-slate-600">Program Studi</Label>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 outline-none"
              >
                <option value="All">Semua Program Studi</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-600">Dosen</Label>
              <select
                value={filterLecturer}
                onChange={(e) => setFilterLecturer(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 outline-none"
              >
                <option value="All">Semua Dosen</option>
                {lecturers.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nip} - {l.profile.first_name} {l.profile.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-600">Status Payroll</Label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 outline-none"
              >
                <option value="All">Semua Status</option>
                <option value="Draft">Draft</option>
                <option value="Locked">Final (Locked)</option>
                <option value="Cancelled">Batal (Cancelled)</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow className="border-slate-150">
                  <TableHead className="text-slate-600 font-bold">Dosen</TableHead>
                  <TableHead className="text-slate-600 font-bold">Fakultas / Prodi</TableHead>
                  <TableHead className="text-slate-600 font-bold text-right">Gaji Pokok</TableHead>
                  <TableHead className="text-slate-600 font-bold text-right">Insentif Mengajar</TableHead>
                  <TableHead className="text-slate-600 font-bold text-right">Tunjangan</TableHead>
                  <TableHead className="text-slate-600 font-bold text-right">Potongan</TableHead>
                  <TableHead className="text-slate-600 font-bold text-right">Total Bersih</TableHead>
                  <TableHead className="text-slate-600 font-bold text-center">Status</TableHead>
                  <TableHead className="text-slate-600 font-bold text-right w-36">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-16 text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        <span>Memuat riwayat payroll...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPayrolls.length > 0 ? (
                  filteredPayrolls.map((item) => (
                    <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-slate-900">
                          {item.dosen?.profile ? `${item.dosen.profile.first_name} ${item.dosen.profile.last_name}` : 'Dosen Tidak Ditemukan'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">NIP: {item.dosen?.nip || '-'}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs font-semibold">
                        {item.dosen?.department?.faculty?.code || '-' } / {item.dosen?.department?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-800">
                        {formatIDR(item.gaji_pokok)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-800">
                        {formatIDR(Number(item.insentif_daring) + Number(item.insentif_luring))}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-800">
                        {formatIDR(item.tunjangan)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-rose-700">
                        {formatIDR(item.potongan)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        {formatIDR(item.total_gaji)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-xs py-0.5 px-2.5 rounded-full border font-bold ${
                          item.status === 'Draft' ? 'bg-yellow-50 text-yellow-800 border-yellow-250' :
                          item.status === 'Locked' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' :
                          'bg-rose-50 text-rose-800 border-rose-250'
                        }`}>
                          {item.status === 'Locked' ? 'Locked' : item.status === 'Draft' ? 'Draft' : 'Batal'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/dashboard/admin/slip-gaji-dosen?id=${item.id}`}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                              title="Lihat Slip Gaji"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {item.status === 'Draft' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              onClick={() => handleLockPayroll(item.id)}
                              title="Kunci & Setujui Payroll"
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                          {item.status !== 'Cancelled' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              onClick={() => handleCancelPayroll(item.id)}
                              title="Batalkan Payroll"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-16 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Layers className="h-10 w-10 text-slate-350" />
                        <span className="font-semibold text-slate-700">Tidak ada riwayat payroll</span>
                        <p className="text-xs text-slate-450">
                          Tidak ada data payroll dosen untuk periode {filterBulan} {filterTahun}.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Generate Payroll Dialog */}
      <Dialog open={genDialogOpen} onOpenChange={setGenDialogOpen}>
        <DialogContent className={`bg-white rounded-xl shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto ${
          genStep === 'preview' ? 'sm:max-w-[800px]' : 'sm:max-w-[450px]'
        }`}>
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <WalletCards className="h-5 w-5 text-teal-600" />
              Generate Payroll Dosen
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Proses perhitungan gaji dosen otomatis berdasarkan kehadiran mengajar.
            </DialogDescription>
          </DialogHeader>

          {genStep === 'setup' ? (
            <div className="py-6 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="text-xs font-bold text-slate-500 block uppercase">Pilih Periode Penggajian</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Bulan</Label>
                    <select
                      value={genBulan}
                      onChange={(e) => setGenBulan(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-900 outline-none"
                    >
                      {bulanList.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Tahun</Label>
                    <select
                      value={genTahun}
                      onChange={(e) => setGenTahun(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-sm bg-white text-slate-900 outline-none"
                    >
                      {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setGenDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  type="button" 
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1.5"
                  onClick={handleScanSessions}
                  disabled={scanning}
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Memindai...
                    </>
                  ) : (
                    <>
                      <span>Mulai Pindai</span>
                      <Check className="h-4.5 w-4.5" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-6 space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs font-medium">
                Hasil Pemindaian: Ditemukan {previewList.length} Dosen dengan aktivitas mengajar yang belum dibayarkan pada periode <strong className="font-bold text-blue-900">{genBulan} {genTahun}</strong>.
              </div>

              <div className="overflow-x-auto max-h-[350px] border border-slate-200 rounded-lg">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-slate-700 text-xs font-bold">Dosen</TableHead>
                      <TableHead className="text-slate-700 text-xs font-bold text-center">Status</TableHead>
                      <TableHead className="text-slate-700 text-xs font-bold text-center">Pertemuan</TableHead>
                      <TableHead className="text-slate-700 text-xs font-bold text-right">Gaji Pokok</TableHead>
                      <TableHead className="text-slate-700 text-xs font-bold text-right">Insentif</TableHead>
                      <TableHead className="text-slate-700 text-xs font-bold text-right w-24">Potongan</TableHead>
                      <TableHead className="text-slate-700 text-xs font-bold text-right">Total Bersih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewList.map((item, idx) => (
                      <TableRow key={item.dosen_id} className="text-xs">
                        <TableCell>
                          <div className="font-semibold text-slate-800">{item.nama}</div>
                          <div className="text-slate-500 font-mono text-[10px]">{item.nip}</div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-slate-650">{item.status_dosen}</TableCell>
                        <TableCell className="text-center font-semibold text-slate-650">{item.sessions_count}x</TableCell>
                        <TableCell className="text-right font-medium">{formatIDR(item.gaji_pokok)}</TableCell>
                        <TableCell className="text-right font-medium">{formatIDR(item.insentif_daring + item.insentif_luring)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.potongan === 0 ? '' : item.potongan}
                            placeholder="0"
                            onChange={(e) => handleUpdatePotongan(idx, e.target.value)}
                            className="h-7 text-xs px-2 text-right font-bold text-slate-900 border-slate-300"
                          />
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900">{formatIDR(item.total_gaji)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setGenStep('setup')}
                >
                  Kembali
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setGenDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-md"
                    onClick={handleConfirmGenerate}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4.5 w-4.5" />
                        <span>Konfirmasi & Simpan</span>
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

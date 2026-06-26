'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Printer, ArrowLeft, Download, ShieldCheck, Wallet, RefreshCw, FileText } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

type Faculty = { id: string; name: string; code: string }
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
  course_name?: string
  course_code?: string
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

// Terbilang function helper for premium Indonesian style slip
function terbilang(nilai: number): string {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ]
  
  const hitung = (n: number): string => {
    if (n < 12) return bilangan[n]
    if (n < 20) return bilangan[n - 10] + ' Belas'
    if (n < 100) return bilangan[Math.floor(n / 10)] + ' Puluh ' + bilangan[n % 10]
    if (n < 200) return 'Seratus ' + hitung(n - 100)
    if (n < 1000) return bilangan[Math.floor(n / 100)] + ' Ratus ' + hitung(n % 100)
    if (n < 2000) return 'Seribu ' + hitung(n - 1000)
    if (n < 1000000) return hitung(Math.floor(n / 1000)) + ' Ribu ' + hitung(n % 1000)
    if (n < 1000000000) return hitung(Math.floor(n / 1000000)) + ' Juta ' + hitung(n % 1000000)
    return n.toString()
  }

  if (nilai === 0) return 'Nol Rupiah'
  return (hitung(Math.floor(nilai)) + ' Rupiah').replace(/\s+/g, ' ').trim()
}

export default function SlipGajiDosenPage() {
  const searchParams = useSearchParams()
  const payrollIdParam = searchParams.get('id')
  const { profile } = useAuth()
  
  const [currentPayroll, setCurrentPayroll] = useState<PayrollDosen | null>(null)
  const [details, setDetails] = useState<PayrollDosenDetail[]>([])
  const [loading, setLoading] = useState(true)
  
  // For lecturers viewing their list
  const [myPayrolls, setMyPayrolls] = useState<PayrollDosen[]>([])
  const [selectedPayrollId, setSelectedPayrollId] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    // Helper to get role name with type narrowing
    const getRoleName = (): string | undefined => {
      if (typeof profile?.role === 'string') return profile.role
      if (profile?.role && 'name' in profile.role) return profile.role.name
      return undefined
    }
    const roleName = getRoleName()
    if (roleName) {
      setUserRole(roleName)
    } else {
      // Fallback check from localStorage role
      const storedRole = localStorage.getItem('user_role')
      if (storedRole) setUserRole(storedRole)
    }
  }, [profile])

  // Load slip details
  const fetchSlipData = async (id: string) => {
    setLoading(true)
    try {
      // 1. Fetch Payroll Dosen
      let payrollData: PayrollDosen | null = null
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
          .eq('id', id)
          .single()
        
        if (error) throw error
        
        if (data) {
          const rawDosen = Array.isArray(data.dosen) ? data.dosen[0] : data.dosen
          if (rawDosen) {
            const profile = Array.isArray(rawDosen.profile) ? rawDosen.profile[0] : rawDosen.profile
            const department = Array.isArray(rawDosen.department) ? rawDosen.department[0] : rawDosen.department
            const faculty = department ? (Array.isArray(department.faculty) ? department.faculty[0] : department.faculty) : null
            payrollData = {
              ...data,
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
          } else {
            payrollData = data as any
          }
        }
      } catch (dbErr: any) {
        console.warn("DB payroll single fetch failed, using local storage fallback:", dbErr.message)
        const local = localStorage.getItem('local_payroll_dosen')
        if (local) {
          const list: PayrollDosen[] = JSON.parse(local)
          payrollData = list.find(p => p.id === id) || null
        }
      }

      setCurrentPayroll(payrollData)

      if (!payrollData) {
        setDetails([])
        setLoading(false)
        return
      }

      // 2. Fetch Details
      let detailsData: PayrollDosenDetail[] = []
      try {
        const { data, error } = await supabase
          .from('payroll_dosen_detail')
          .select(`
            *,
            schedule:schedules(
              id,
              course:courses(name, code)
            )
          `)
          .eq('payroll_id', id)
        
        if (error) throw error
        
        // Map database schedules relation to clean fields
        detailsData = (data || []).map((d: any) => ({
          ...d,
          course_name: d.schedule?.course?.name || 'Mata Kuliah',
          course_code: d.schedule?.course?.code || 'IF000'
        }))
      } catch (dbErr: any) {
        console.warn("DB payroll details fetch failed, using local storage fallback:", dbErr.message)
        const localDetails = localStorage.getItem('local_payroll_dosen_detail')
        if (localDetails) {
          const list: PayrollDosenDetail[] = JSON.parse(localDetails)
          detailsData = list
            .filter(d => d.payroll_id === id)
            .map(d => ({
              ...d,
              course_name: d.course_name || (d.mode === 'daring' ? 'Pemrograman Web (Online)' : 'Basis Data (Offline)'),
              course_code: d.course_code || 'IF102'
            }))
        }
      }

      setDetails(detailsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Load all payrolls of currently logged in Dosen
  const fetchMyPayrolls = async () => {
    setLoading(true)
    try {
      // Find my lecturer ID
      let myLecturerId = ''
      const userEmail = profile?.email || localStorage.getItem('user_email') || 'dosen1@unbat.com'
      
      try {
        // Query profile then lecturer
        const { data: dbProf } = await supabase.from('profiles').select('id').eq('email', userEmail).single()
        if (dbProf) {
          const { data: dbLec } = await supabase.from('lecturers').select('id').eq('profile_id', dbProf.id).single()
          if (dbLec) myLecturerId = dbLec.id
        }
      } catch {
        myLecturerId = 'd1' // Default seed ID
      }

      let allPayrolls: PayrollDosen[] = []
      try {
        const { data } = await supabase
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
          .eq('dosen_id', myLecturerId)
          .neq('status', 'Cancelled')
          .order('created_at', { ascending: false })
        
        if (data) {
          allPayrolls = data.map((item: any) => {
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
        } else {
          allPayrolls = []
        }
      } catch {
        const local = localStorage.getItem('local_payroll_dosen')
        if (local) {
          const list: PayrollDosen[] = JSON.parse(local)
          allPayrolls = list.filter(p => p.dosen_id === myLecturerId && p.status !== 'Cancelled')
        }
      }

      setMyPayrolls(allPayrolls)
      
      if (allPayrolls.length > 0) {
        setSelectedPayrollId(allPayrolls[0].id)
        fetchSlipData(allPayrolls[0].id)
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    const isDosen = userRole === 'dosen' || userRole === 'lecturer'
    
    if (isDosen) {
      fetchMyPayrolls()
    } else if (payrollIdParam) {
      fetchSlipData(payrollIdParam)
    } else {
      // If Admin opens page without ID parameter, let's load first payroll in DB or show message
      const loadFirstPayroll = async () => {
        try {
          let list: any[] = []
          try {
            const { data } = await supabase.from('payroll_dosen').select('id').limit(1)
            list = data || []
          } catch {
            const local = localStorage.getItem('local_payroll_dosen')
            list = local ? JSON.parse(local) : []
          }
          
          if (list.length > 0) {
            fetchSlipData(list[0].id)
          } else {
            setLoading(false)
          }
        } catch {
          setLoading(false)
        }
      }
      loadFirstPayroll()
    }
  }, [payrollIdParam, userRole, profile])

  const handlePeriodChange = (val: string) => {
    setSelectedPayrollId(val)
    fetchSlipData(val)
  }

  const handlePrint = () => {
    window.print()
  }

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num)
  }

  const formatTanggal = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const isDosenRole = userRole === 'dosen' || userRole === 'lecturer'
  const insentifDaring = currentPayroll ? Number(currentPayroll.insentif_daring) : 0
  const insentifLuring = currentPayroll ? Number(currentPayroll.insentif_luring) : 0
  const gajiPokok = currentPayroll ? Number(currentPayroll.gaji_pokok) : 0
  const tunjangan = currentPayroll ? Number(currentPayroll.tunjangan) : 0
  const potongan = currentPayroll ? Number(currentPayroll.potongan) : 0
  const totalGaji = currentPayroll ? Number(currentPayroll.total_gaji) : 0

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-slate-50 min-h-screen print:p-0 print:bg-white">
      {/* Action Buttons Toolbar - Hidden during printing */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          {!isDosenRole && (
            <Link href="/dashboard/admin/payroll-dosen">
              <Button variant="outline" size="sm" className="flex items-center gap-1 bg-white hover:bg-slate-100 border-slate-350">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Riwayat
              </Button>
            </Link>
          )}
          {isDosenRole && myPayrolls.length > 1 && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold text-slate-700">Pilih Periode Slip:</Label>
              <select
                value={selectedPayrollId}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 text-sm bg-white text-slate-800 outline-none"
              >
                {myPayrolls.map(p => (
                  <option key={p.id} value={p.id}>{p.periode} - {p.status}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {currentPayroll && (
            <Button
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-2 shadow-sm"
            >
              <Printer className="h-4.5 w-4.5" />
              Cetak Slip / Simpan PDF
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px] print:hidden">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-10 w-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            <span className="text-slate-500 font-semibold">Memuat rincian slip gaji...</span>
          </div>
        </div>
      ) : !currentPayroll ? (
        <Card className="border-slate-200 bg-white text-center py-16 print:hidden shadow-sm">
          <CardContent className="flex flex-col items-center gap-3">
            <FileText className="h-12 w-12 text-slate-350" />
            <span className="font-bold text-lg text-slate-800">Slip Gaji Tidak Ditemukan</span>
            <p className="text-slate-500 text-sm max-w-sm">
              Data payroll tidak tersedia atau periode slip gaji yang Anda pilih belum diproses.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Printable Slip Layout */
        <Card className="bg-white border border-slate-300 rounded-xl shadow-lg print:border-none print:shadow-none print:rounded-none overflow-hidden">
          {/* Slip Header */}
          <div className="p-8 border-b-2 border-slate-300 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:bg-white print:p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-800 rounded-lg flex items-center justify-center text-white text-2xl font-black shadow-md border-2 border-white print:shadow-none">
                UB
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-none">UNIVERSITAS BATAM</h2>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                  Gedung Rektorat Lt. 1, Jl. Abulyatama, Kota Batam
                </p>
                <p className="text-[10px] text-slate-400">Telp: (0778) 465-111 | Fax: (0778) 465-222</p>
              </div>
            </div>
            <div className="text-left md:text-right flex flex-col items-start md:items-end">
              <span className="px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 rounded-full text-xs font-bold print:hidden">
                SLIP GAJI DOSEN
              </span>
              <span className="text-xs text-slate-500 mt-1.5 font-bold">PERIODE: {currentPayroll.periode}</span>
              <span className="text-[10px] text-slate-400 font-mono">Dibuat: {formatTanggal(currentPayroll.created_at)}</span>
            </div>
          </div>

          {/* Lecturer Identity */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 bg-slate-50/25 print:p-4">
            <div className="space-y-1">
              <div className="flex text-xs">
                <span className="w-32 text-slate-500 font-medium">NIP / NIDN</span>
                <span className="w-4 text-slate-400">:</span>
                <span className="font-bold text-slate-800">{currentPayroll.dosen?.nip || '-'}</span>
              </div>
              <div className="flex text-xs">
                <span className="w-32 text-slate-500 font-medium">Nama Lengkap</span>
                <span className="w-4 text-slate-400">:</span>
                <span className="font-extrabold text-slate-900">
                  {currentPayroll.dosen?.profile 
                    ? `${currentPayroll.dosen.profile.first_name} ${currentPayroll.dosen.profile.last_name}` 
                    : '-'}
                </span>
              </div>
              <div className="flex text-xs">
                <span className="w-32 text-slate-500 font-medium">Email Institusi</span>
                <span className="w-4 text-slate-400">:</span>
                <span className="text-slate-700">{currentPayroll.dosen?.profile?.email || '-'}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex text-xs">
                <span className="w-32 text-slate-500 font-medium">Fakultas</span>
                <span className="w-4 text-slate-400">:</span>
                <span className="font-bold text-slate-800">{currentPayroll.dosen?.department?.faculty?.name || '-'}</span>
              </div>
              <div className="flex text-xs">
                <span className="w-32 text-slate-500 font-medium">Program Studi</span>
                <span className="w-4 text-slate-400">:</span>
                <span className="font-bold text-slate-800">{currentPayroll.dosen?.department?.name || '-'}</span>
              </div>
              <div className="flex text-xs">
                <span className="w-32 text-slate-500 font-medium">Status Payroll</span>
                <span className="w-4 text-slate-400">:</span>
                <span className="font-bold">
                  {currentPayroll.status === 'Locked' ? (
                    <span className="text-emerald-700">TERBAYAR (LOCKED)</span>
                  ) : (
                    <span className="text-yellow-600">PROSES (DRAFT)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="p-8 space-y-6 print:p-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">
              Rincian Pendapatan & Mengajar
            </h3>

            {/* Teaching Details Tables */}
            <div className="space-y-4">
              {/* Online / Daring */}
              {details.some(d => d.mode === 'daring') && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Insentif Mengajar Daring (Online)
                  </span>
                  <Table className="border border-slate-100 rounded-lg">
                    <TableHeader className="bg-slate-55">
                      <TableRow className="h-9">
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5">Kode MK</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5">Mata Kuliah</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5 text-center">Pertemuan</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5 text-center">SKS</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5 text-right">Tarif / SKS</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5 text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details
                        .filter(d => d.mode === 'daring')
                        .map(d => (
                          <TableRow key={d.id} className="h-8 hover:bg-transparent">
                            <TableCell className="font-mono text-xs py-1">{d.course_code}</TableCell>
                            <TableCell className="text-xs py-1">{d.course_name}</TableCell>
                            <TableCell className="text-center text-xs py-1">Ke-{d.pertemuan}</TableCell>
                            <TableCell className="text-center text-xs py-1 font-semibold">{d.sks}</TableCell>
                            <TableCell className="text-right text-xs py-1">{formatIDR(d.tarif)}</TableCell>
                            <TableCell className="text-right text-xs py-1 font-semibold text-slate-800">{formatIDR(d.jumlah)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Offline / Luring */}
              {details.some(d => d.mode === 'luring') && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Insentif Mengajar Luring (Offline)
                  </span>
                  <Table className="border border-slate-100 rounded-lg">
                    <TableHeader className="bg-slate-55">
                      <TableRow className="h-9">
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5">Kode MK</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5">Mata Kuliah</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5 text-center">Pertemuan</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5 text-center">SKS</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5 text-right">Tarif / SKS</TableHead>
                        <TableHead className="text-slate-700 font-semibold text-xs py-1.5 text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details
                        .filter(d => d.mode === 'luring')
                        .map(d => (
                          <TableRow key={d.id} className="h-8 hover:bg-transparent">
                            <TableCell className="font-mono text-xs py-1">{d.course_code}</TableCell>
                            <TableCell className="text-xs py-1">{d.course_name}</TableCell>
                            <TableCell className="text-center text-xs py-1">Ke-{d.pertemuan}</TableCell>
                            <TableCell className="text-center text-xs py-1 font-semibold">{d.sks}</TableCell>
                            <TableCell className="text-right text-xs py-1">{formatIDR(d.tarif)}</TableCell>
                            <TableCell className="text-right text-xs py-1 font-semibold text-slate-800">{formatIDR(d.jumlah)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Financial Overview grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Kredit Penerimaan</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gaji Pokok Dosen</span>
                    <span className="font-semibold text-slate-800">{formatIDR(gajiPokok)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tunjangan Ikatan</span>
                    <span className="font-semibold text-slate-800">{formatIDR(tunjangan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Insentif Kelas Daring</span>
                    <span className="font-semibold text-slate-800">{formatIDR(insentifDaring)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Insentif Kelas Luring</span>
                    <span className="font-semibold text-slate-800">{formatIDR(insentifLuring)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 text-slate-900 font-extrabold">
                    <span>Total Pendapatan Kotor</span>
                    <span>{formatIDR(gajiPokok + tunjangan + insentifDaring + insentifLuring)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Debit Potongan</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-rose-700">
                    <span>Potongan Administratif / Absensi</span>
                    <span className="font-bold">{formatIDR(potongan)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 text-rose-800 font-extrabold">
                    <span>Total Potongan</span>
                    <span>{formatIDR(potongan)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Received Area */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 print:bg-white print:border-slate-350">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Gaji Bersih Diterima (Take Home Pay)</span>
                <p className="text-xs italic text-slate-600 font-medium">
                  Terbilang: <span className="font-bold text-teal-800 uppercase not-italic">{terbilang(totalGaji)}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-900 leading-none">{formatIDR(totalGaji)}</p>
              </div>
            </div>

            {/* Signatures Area */}
            <div className="grid grid-cols-2 gap-12 pt-12 mt-12 text-center text-xs text-slate-800 print:mt-6">
              <div className="flex flex-col items-center justify-between h-28">
                <span>Dosen Penerima,</span>
                <div className="h-10 w-32 border-b border-slate-300 font-mono italic text-[10px] text-slate-400 flex items-end justify-center">
                  Tanda Tangan Dosen
                </div>
                <span className="font-bold uppercase">
                  {currentPayroll.dosen?.profile 
                    ? `${currentPayroll.dosen.profile.first_name} ${currentPayroll.dosen.profile.last_name}` 
                    : '-'}
                </span>
              </div>
              
              <div className="flex flex-col items-center justify-between h-28">
                <span>Kepala Bagian Keuangan,</span>
                <div className="h-10 w-32 border-b border-slate-300 font-mono italic text-[10px] text-teal-700 flex items-end justify-center font-bold">
                  VERIFIED BY SYSTEM
                </div>
                <span className="font-bold uppercase">Biro Keuangan Universitas</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

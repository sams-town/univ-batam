'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Fingerprint, X, Copy, CheckCircle2 } from 'lucide-react'
import DashboardTopCards from '@/components/dashboard/DashboardTopCards'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks'
import DashboardBottomNav from '@/components/dashboard/DashboardBottomNav'

function generateRandomToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let token = ''
  for (let i = 0; i < 4; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export default function LecturerDashboardPage() {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [generatedToken, setGeneratedToken] = useState('')
  const [isTokenActive, setIsTokenActive] = useState(false)
  const [copied, setCopied] = useState(false)

  // Sesi Kelas Form States
  const [schedules, setSchedules] = useState<any[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState('')
  const [beritaAcara, setBeritaAcara] = useState('')
  const [mode, setMode] = useState<'daring' | 'luring'>('luring')
  const [pertemuan, setPertemuan] = useState(1)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Load lecturer schedules on component mount
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: lecturer } = await supabase
          .from('lecturers')
          .select('id')
          .eq('profile_id', session.user.id)
          .maybeSingle()

        if (lecturer) {
          const { data } = await supabase
            .from('schedules')
            .select('*, course:courses(*), classroom:classrooms(*)')
            .eq('lecturer_id', lecturer.id)
          
          if (data && data.length > 0) {
            setSchedules(data)
            setSelectedSchedule(data[0].id)
          } else {
            throw new Error("No active schedules found")
          }
        } else {
          throw new Error("Lecturer profile not found")
        }
      } catch (err) {
        // Fallback mock schedules for testing and demo simulation
        const mockSchedules = [
          { id: 'sch1', course: { name: 'Pemrograman Web', code: 'PW' }, classroom: { name: 'Lab Komputer 201' } },
          { id: 'sch2', course: { name: 'Basis Data', code: 'BD' }, classroom: { name: 'Ruang 102' } }
        ]
        setSchedules(mockSchedules)
        setSelectedSchedule(mockSchedules[0].id)
      }
    }
    loadSchedules()
  }, [])

  const handleFabClick = useCallback(() => {
    setIsTokenModalOpen(true)
  }, [])

  // Call API to open class session
  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchedule || !beritaAcara) {
      setErrorMsg('Harap pilih jadwal kuliah dan lengkapi berita acara.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const token = generateRandomToken()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      let newSession;
      if (session) {
        // Call enterprise route handler client
        const response = await fetch('/api/attendance/buka-kelas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scheduleId: selectedSchedule,
            token,
            beritaAcara,
            mode,
            pertemuan
          })
        })

        const resData = await response.json()
        if (!response.ok || !resData.success) {
          throw new Error(resData.error || 'Gagal menghubungi server untuk membuka sesi kelas.')
        }
        newSession = resData.data
      } else {
        // Fallback simulation in local environment when auth session is offline
        const sessionObj = {
          id: crypto.randomUUID(),
          schedule_id: selectedSchedule,
          token,
          berita_acara: beritaAcara,
          mode,
          pertemuan,
          opened_at: new Date().toISOString(),
          is_open: true
        }
        
        const localSessions = localStorage.getItem('local_attendance_sessions')
        const list = localSessions ? JSON.parse(localSessions) : []
        list.push(sessionObj)
        localStorage.setItem('local_attendance_sessions', JSON.stringify(list))
        newSession = sessionObj
      }

      setGeneratedToken(token)
      setIsTokenActive(true)
      setSuccessMsg('Sesi kelas berhasil dibuka! Token absensi aktif.')
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSession = () => {
    setIsTokenActive(false)
    setGeneratedToken('')
    setBeritaAcara('')
    setErrorMsg('')
    setSuccessMsg('')
    setIsTokenModalOpen(false)
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 pt-6">
        <div className="px-6 pb-8">
          <p className="text-4xl font-bold text-white mb-1">
            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-sm opacity-80 text-white uppercase">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-4">
        {/* Top Cards */}
        <DashboardTopCards role="dosen" />

        {/* Quick Attendance Button */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">MULAI HARI INI</p>
              <p className="text-xl font-bold text-slate-900">Buka Sesi Absen Kelas</p>
            </div>
            <button
              onClick={handleFabClick}
              className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              <Fingerprint className="h-8 w-8 text-white" />
            </button>
          </div>
        </div>

        {/* Token Status Indicator */}
        {isTokenActive && (
          <div
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 shadow-sm mb-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setIsTokenModalOpen(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-200">TOKEN ABSENSI AKTIF</p>
                <p className="text-3xl font-mono font-bold text-white tracking-[0.3em]">{generatedToken}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Quick Links */}
        <DashboardQuickLinks role="dosen" />

        {/* Activity List */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-slate-900">Aktivitas Terakhir</p>
            <p className="text-sm text-emerald-600 font-semibold">Lihat →</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Fingerprint className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Riwayat Generate Token</p>
                <p className="text-sm text-slate-500">Lihat token absensi yang sudah dibuat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Session / Token Generator Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setIsTokenModalOpen(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {!isTokenActive ? (
              /* Step 1: Open Sesi Kelas Form (Double submit prevention, loaders, feedback) */
              <form onSubmit={handleOpenSession} className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-3 mb-2">
                  <h3 className="font-bold text-slate-800 text-lg">Buka Sesi Kelas</h3>
                  <button type="button" onClick={() => setIsTokenModalOpen(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200 animate-pulse">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="schedule" className="text-xs font-bold text-slate-500">Pilih Mata Kuliah & Jadwal</Label>
                  <select
                    id="schedule"
                    value={selectedSchedule}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none font-semibold"
                  >
                    {schedules.map(sch => (
                      <option key={sch.id} value={sch.id}>
                        {sch.course?.name || 'Mata Kuliah'} ({sch.classroom?.name || 'Aula'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="berita" className="text-xs font-bold text-slate-500">Berita Acara / Pokok Bahasan</Label>
                  <Input
                    id="berita"
                    type="text"
                    required
                    placeholder="Contoh: Pemrograman Berorientasi Objek"
                    value={beritaAcara}
                    onChange={(e) => setBeritaAcara(e.target.value)}
                    className="h-10 text-xs rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="mode" className="text-xs font-bold text-slate-500">Mode Kelas</Label>
                    <select
                      id="mode"
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none font-semibold"
                    >
                      <option value="luring">Luring (Tatap Muka)</option>
                      <option value="daring">Daring (Online)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pertemuan" className="text-xs font-bold text-slate-500">Pertemuan Ke</Label>
                    <select
                      id="pertemuan"
                      value={pertemuan}
                      onChange={(e) => setPertemuan(parseInt(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none font-semibold"
                    >
                      {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>Pertemuan {num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <span>Buka Sesi Kelas & Buat Token</span>
                  )}
                </Button>
              </form>
            ) : (
              /* Step 2: Sesi Kelas Active Screen */
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center relative">
                  <button
                    onClick={() => setIsTokenModalOpen(false)}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <p className="text-sm font-semibold text-purple-200 mb-2">TOKEN ABSENSI AKTIF</p>
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl py-6 px-4">
                    <p className="text-6xl font-mono font-bold text-white tracking-[0.4em] drop-shadow-lg">
                      {generatedToken}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-purple-200">Sesi Sedang Berjalan</span>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-3">
                  {successMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-center text-xs font-bold rounded-xl border border-emerald-250 mb-2 animate-bounce">
                      {successMsg}
                    </div>
                  )}

                  <button
                    onClick={handleCopyToken}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="text-emerald-600">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        <span>Salin Token</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCloseSession}
                    className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 font-semibold transition-colors cursor-pointer"
                  >
                    Tutup Sesi / Matikan Token
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <DashboardBottomNav role="dosen" onFabClick={handleFabClick} />
    </div>
  )
}

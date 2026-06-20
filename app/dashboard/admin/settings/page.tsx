'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Settings, 
  Building2, 
  Clock, 
  ScanFace, 
  QrCode, 
  MapPin, 
  Bell, 
  Server, 
  Database, 
  RefreshCw, 
  Save, 
  Check, 
  Activity, 
  Key, 
  Trash2,
  AlertTriangle
} from 'lucide-react'

// Define default settings structure
interface SystemSettings {
  campusName: string
  campusCode: string
  academicYear: string
  semester: string
  lateTolerance: number
  minAttendanceRate: number
  
  enableFaceRecognition: boolean
  enableDynamicQR: boolean
  enableGPSGeofence: boolean
  geofenceRadius: number
  campusLatitude: string
  campusLongitude: string
  
  notifyStudentAbsence: boolean
  notifyParentAbsence: boolean
  enableWhatsappGateway: boolean
  whatsappToken: string
  enableTelegramBot: boolean
  telegramBotToken: string
  
  maintenanceMode: boolean
}

const DEFAULT_SETTINGS: SystemSettings = {
  campusName: 'Universitas Batam',
  campusCode: 'UNBAT',
  academicYear: '2024/2025',
  semester: 'ganjil',
  lateTolerance: 15,
  minAttendanceRate: 75,
  
  enableFaceRecognition: true,
  enableDynamicQR: true,
  enableGPSGeofence: true,
  geofenceRadius: 150,
  campusLatitude: '-6.200000',
  campusLongitude: '106.816666',
  
  notifyStudentAbsence: true,
  notifyParentAbsence: false,
  enableWhatsappGateway: false,
  whatsappToken: '',
  enableTelegramBot: false,
  telegramBotToken: '',
  
  maintenanceMode: false
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS)
  const [isSaved, setIsSaved] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [backupLogs, setBackupLogs] = useState<string[]>([])
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('unbat_system_settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to parse settings:', err)
      }
    }
    setLoading(false)
  }, [])

  // Save helper
  const handleSave = () => {
    localStorage.setItem('unbat_system_settings', JSON.stringify(settings))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  // Handle value modifications
  const handleTextChange = (key: keyof SystemSettings, val: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: val
    }))
  }

  const toggleSwitch = (key: keyof SystemSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Backup simulation logic
  const triggerBackup = () => {
    if (isBackingUp) return
    setIsBackingUp(true)
    setBackupProgress(0)
    setBackupLogs([])
    
    const logs = [
      'Menghubungkan ke server PostgreSQL Remote...',
      'Membaca tabel skema publik...',
      'Menyalin skema database (DDL)...',
      'Mengekspor data tabel: roles, profiles, faculties...',
      'Mengekspor data tabel: departments, programs, academic_years, semesters...',
      'Mengekspor data tabel: classrooms, lecturers, students, courses...',
      'Mengekspor data tabel: schedules, attendance_sessions, attendance_records...',
      'Mengompresi data cadangan (SQL dump format)...',
      'Memvalidasi integritas file cadangan...',
      'Backup database berhasil diselesaikan! 🚀'
    ]

    let currentLogIndex = 0
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setBackupLogs(prev => [...prev, logs[currentLogIndex]])
        setBackupProgress(Math.min(((currentLogIndex + 1) / logs.length) * 100, 100))
        currentLogIndex++
      } else {
        clearInterval(logInterval)
        setIsBackingUp(false)
      }
    }, 800)
  }

  // Reset simulation
  const handleResetSystem = () => {
    setShowResetConfirm(false)
    setResetSuccess(true)
    setTimeout(() => setResetSuccess(false), 4000)
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 bg-slate-50 min-h-screen relative">
      {/* Toast Notification */}
      {isSaved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl animate-bounce border border-emerald-500">
          <Check className="h-5 w-5" />
          <span className="font-semibold text-sm">Pengaturan Sistem Berhasil Disimpan!</span>
        </div>
      )}

      {resetSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl animate-bounce border border-red-500">
          <Check className="h-5 w-5" />
          <span className="font-semibold text-sm">Log Absensi Berhasil Di-reset!</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="h-8 w-8 text-teal-600" />
            Pengaturan Sistem
          </h1>
          <p className="text-slate-500 mt-1">Konfigurasi kebijakan akademik, metode kehadiran, notifikasi, dan pemeliharaan basis data.</p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Simpan Pengaturan
        </Button>
      </div>

      <Tabs defaultValue="umum" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1.5 rounded-2xl w-full flex overflow-x-auto justify-start md:justify-center md:max-w-2xl mx-auto shadow-sm">
          <TabsTrigger value="umum" className="rounded-xl flex items-center gap-2 py-2.5 px-4 font-semibold data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            <Building2 className="h-4 w-4" />
            Akademik & Umum
          </TabsTrigger>
          <TabsTrigger value="metode" className="rounded-xl flex items-center gap-2 py-2.5 px-4 font-semibold data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            <ScanFace className="h-4 w-4" />
            Kebijakan Absensi
          </TabsTrigger>
          <TabsTrigger value="notif" className="rounded-xl flex items-center gap-2 py-2.5 px-4 font-semibold data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            <Bell className="h-4 w-4" />
            Notifikasi & Gateway
          </TabsTrigger>
          <TabsTrigger value="maint" className="rounded-xl flex items-center gap-2 py-2.5 px-4 font-semibold data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            <Database className="h-4 w-4" />
            Pemeliharaan DB
          </TabsTrigger>
        </TabsList>

        {/* ================= TABS: UMUM ================= */}
        <TabsContent value="umum" className="space-y-6 focus:outline-none">
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Building2 className="h-5 w-5 text-teal-600" />
                Identitas Lembaga & Semester
              </CardTitle>
              <CardDescription>Nama instansi dan penentuan tahun ajaran yang sedang aktif di sistem.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="campusName" className="text-slate-700 font-semibold">Nama Universitas</Label>
                  <Input 
                    id="campusName"
                    value={settings.campusName}
                    onChange={(e) => handleTextChange('campusName', e.target.value)}
                    placeholder="Masukkan nama universitas"
                    className="border-slate-200 focus-visible:border-teal-500 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campusCode" className="text-slate-700 font-semibold">Singkatan / Kode Kampus</Label>
                  <Input 
                    id="campusCode"
                    value={settings.campusCode}
                    onChange={(e) => handleTextChange('campusCode', e.target.value)}
                    placeholder="Contoh: UNBAT"
                    className="border-slate-200 focus-visible:border-teal-500 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear" className="text-slate-700 font-semibold">Tahun Akademik Aktif</Label>
                  <Select 
                    id="academicYear"
                    value={settings.academicYear}
                    onChange={(e) => handleTextChange('academicYear', e.target.value)}
                    className="rounded-xl border-slate-200"
                  >
                    <option value="2023/2024">2023/2024</option>
                    <option value="2024/2025">2024/2025</option>
                    <option value="2025/2026">2025/2026</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester" className="text-slate-700 font-semibold">Semester Aktif</Label>
                  <Select 
                    id="semester"
                    value={settings.semester}
                    onChange={(e) => handleTextChange('semester', e.target.value)}
                    className="rounded-xl border-slate-200"
                  >
                    <option value="ganjil">Ganjil</option>
                    <option value="genap">Genap</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Clock className="h-5 w-5 text-teal-600" />
                Parameter Kehadiran
              </CardTitle>
              <CardDescription>Atur kelonggaran waktu absensi dan aturan kelayakan akademik mahasiswa.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lateTolerance" className="text-slate-700 font-semibold flex items-center gap-1.5">
                    Toleransi Keterlambatan
                    <span className="text-xs text-slate-400 font-normal">(Menit)</span>
                  </Label>
                  <Input 
                    id="lateTolerance"
                    type="number"
                    value={settings.lateTolerance}
                    onChange={(e) => handleTextChange('lateTolerance', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus-visible:border-teal-500 rounded-xl"
                  />
                  <p className="text-xs text-slate-400">Batas toleransi mahasiswa dihitung masuk tepat waktu sebelum status berubah menjadi &quot;Terlambat&quot;.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minAttendanceRate" className="text-slate-700 font-semibold flex items-center gap-1.5">
                    Kehadiran Minimum Ujian
                    <span className="text-xs text-slate-400 font-normal">(%)</span>
                  </Label>
                  <Input 
                    id="minAttendanceRate"
                    type="number"
                    value={settings.minAttendanceRate}
                    onChange={(e) => handleTextChange('minAttendanceRate', parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                    className="border-slate-200 focus-visible:border-teal-500 rounded-xl"
                  />
                  <p className="text-xs text-slate-400">Minimum persentase kehadiran sebagai syarat utama untuk mengikuti Ujian Tengah/Akhir Semester.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TABS: METODE ================= */}
        <TabsContent value="metode" className="space-y-6 focus:outline-none">
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <ScanFace className="h-5 w-5 text-teal-600" />
                Pengaturan Metode Presensi Aktif
              </CardTitle>
              <CardDescription>Pilih metode verifikasi kehadiran mahasiswa yang diperbolehkan di lingkungan kampus.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-6">
                {/* Method 1 */}
                <div className="flex items-start justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <ScanFace className="h-4 w-4 text-emerald-500" />
                      Face Recognition (Pengenalan Wajah AI)
                    </span>
                    <p className="text-sm text-slate-500">Mahasiswa melakukan swafoto untuk dicocokkan dengan dataset biometric yang terdaftar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSwitch('enableFaceRecognition')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                      settings.enableFaceRecognition ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.enableFaceRecognition ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Method 2 */}
                <div className="flex items-start justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-emerald-500" />
                      Kode QR Dinamis
                    </span>
                    <p className="text-sm text-slate-500">Dosen memproyeksikan Kode QR dinamis di depan kelas yang berganti setiap 10 detik.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSwitch('enableDynamicQR')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                      settings.enableDynamicQR ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.enableDynamicQR ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Method 3 */}
                <div className="flex items-start justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      Lokasi GPS & Geofencing
                    </span>
                    <p className="text-sm text-slate-500">Membatasi absen mahasiswa hanya jika koordinat GPS berada dalam radius gerbang kampus.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSwitch('enableGPSGeofence')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                      settings.enableGPSGeofence ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.enableGPSGeofence ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Geofence Parameters (Conditionally stylized as enabled) */}
                {settings.enableGPSGeofence && (
                  <div className="p-6 border border-slate-200 bg-slate-50/50 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                    <div className="space-y-2">
                      <Label htmlFor="geofenceRadius" className="text-slate-700 font-semibold">Radius Geofence (Meter)</Label>
                      <Input 
                        id="geofenceRadius"
                        type="number"
                        value={settings.geofenceRadius}
                        onChange={(e) => handleTextChange('geofenceRadius', parseInt(e.target.value) || 0)}
                        className="bg-white border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campusLatitude" className="text-slate-700 font-semibold">Latitude Pusat Kampus</Label>
                      <Input 
                        id="campusLatitude"
                        value={settings.campusLatitude}
                        onChange={(e) => handleTextChange('campusLatitude', e.target.value)}
                        className="bg-white border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campusLongitude" className="text-slate-700 font-semibold">Longitude Pusat Kampus</Label>
                      <Input 
                        id="campusLongitude"
                        value={settings.campusLongitude}
                        onChange={(e) => handleTextChange('campusLongitude', e.target.value)}
                        className="bg-white border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TABS: NOTIFIKASI ================= */}
        <TabsContent value="notif" className="space-y-6 focus:outline-none">
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Bell className="h-5 w-5 text-teal-600" />
                Konfigurasi Pemicu & Notifikasi
              </CardTitle>
              <CardDescription>Pengiriman peringatan status kehadiran ke mahasiswa dan dosen wali secara berkala.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-6">
                <div className="flex items-start justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      Notifikasi Peringatan Mahasiswa
                    </span>
                    <p className="text-sm text-slate-500">Mengirimkan notifikasi langsung ke portal web mahasiswa ketika terabsen &quot;Alpa&quot;.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSwitch('notifyStudentAbsence')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                      settings.notifyStudentAbsence ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.notifyStudentAbsence ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-start justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      Laporan Otomatis Dosen Wali
                    </span>
                    <p className="text-sm text-slate-500">Secara berkala mengirim ringkasan tingkat absensi mahasiswa bimbingan yang terancam tidak ikut ujian.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSwitch('notifyParentAbsence')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                      settings.notifyParentAbsence ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.notifyParentAbsence ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Key className="h-5 w-5 text-teal-600" />
                Integrasi Gateway API Pihak Ketiga
              </CardTitle>
              <CardDescription>Hubungkan sistem absensi dengan WhatsApp dan Telegram untuk komunikasi seluler.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-6">
                {/* WhatsApp Gateway Integration */}
                <div className="p-4 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 pr-4">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        WhatsApp Gateway (Fonnte / Wablas)
                      </span>
                      <p className="text-sm text-slate-500">Kirim slip gaji staff dan peringatan kehadiran langsung via WhatsApp.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSwitch('enableWhatsappGateway')}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                        settings.enableWhatsappGateway ? 'bg-teal-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.enableWhatsappGateway ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {settings.enableWhatsappGateway && (
                    <div className="space-y-2 pt-2 animate-fadeIn">
                      <Label htmlFor="whatsappToken" className="text-slate-700 font-semibold">API Token WhatsApp Gateway</Label>
                      <Input 
                        id="whatsappToken"
                        type="password"
                        value={settings.whatsappToken}
                        onChange={(e) => handleTextChange('whatsappToken', e.target.value)}
                        placeholder="Masukkan token otorisasi API Fonnte/Wablas"
                        className="border-slate-200 rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* Telegram Bot Notification */}
                <div className="p-4 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 pr-4">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        Telegram Bot Notification
                      </span>
                      <p className="text-sm text-slate-500">Mungkinkan sinkronisasi grup koordinasi akademik via Telegram Bot.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSwitch('enableTelegramBot')}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
                        settings.enableTelegramBot ? 'bg-teal-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.enableTelegramBot ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {settings.enableTelegramBot && (
                    <div className="space-y-2 pt-2 animate-fadeIn">
                      <Label htmlFor="telegramBotToken" className="text-slate-700 font-semibold">API Bot Token Telegram</Label>
                      <Input 
                        id="telegramBotToken"
                        type="password"
                        value={settings.telegramBotToken}
                        onChange={(e) => handleTextChange('telegramBotToken', e.target.value)}
                        placeholder="Contoh: 123456:ABC-DEF1234ghIkl-zyx"
                        className="border-slate-200 rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TABS: DATABASE & MAINTENANCE ================= */}
        <TabsContent value="maint" className="space-y-6 focus:outline-none">
          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Server className="h-5 w-5 text-teal-600" />
                Mode Pemeliharaan
              </CardTitle>
              <CardDescription>Nonaktifkan sementara akses portal mahasiswa dan dosen untuk perbaikan database backend.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between p-4 border border-rose-100 bg-rose-50/20 rounded-2xl hover:bg-rose-50/40 transition-colors">
                <div className="space-y-1 pr-4">
                  <span className="font-bold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-600 animate-pulse" />
                    Aktifkan Maintenance Mode (Mode Perbaikan)
                  </span>
                  <p className="text-sm text-slate-500">Mahasiswa dan Dosen akan diarahkan ke halaman &quot;Under Maintenance&quot; dan tidak bisa presensi.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSwitch('maintenanceMode')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${
                    settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Database className="h-5 w-5 text-teal-600" />
                Utilitas Basis Data (Database Backups)
              </CardTitle>
              <CardDescription>Ekspor cadangan basis data lengkap atau atur ulang histori kehadiran.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Backup triggers */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-600" />
                    Cadangkan Data Universitas
                  </h3>
                  <p className="text-sm text-slate-500">Mencakup pencadangan menyeluruh untuk program studi, mata kuliah, biodata profil mahasiswa, log perizinan, dan rekaman kehadiran (attendance_records).</p>
                  
                  <div className="pt-2 flex gap-3">
                    <Button 
                      onClick={triggerBackup}
                      disabled={isBackingUp}
                      className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-xl shadow flex items-center gap-2"
                    >
                      {isBackingUp ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Memproses Cadangan...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4" />
                          Mulai Backup Sekarang
                        </>
                      )}
                    </Button>
                  </div>

                  {isBackingUp && (
                    <div className="space-y-2 animate-fadeIn pt-4">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Progres Backup</span>
                        <span>{Math.round(backupProgress)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${backupProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Interactive console logger */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 min-h-[180px] max-h-[250px] overflow-y-auto flex flex-col justify-start space-y-1.5 shadow-inner">
                  <div className="text-slate-500 pb-1 border-b border-slate-800 flex justify-between">
                    <span>Logs Console DB Backup</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  {backupLogs.length === 0 ? (
                    <p className="text-slate-600 italic">Konsol kosong. Tekan tombol cadangkan untuk merekam proses ekspor data.</p>
                  ) : (
                    backupLogs.map((log, idx) => (
                      <p 
                        key={idx} 
                        className={log.includes('berhasil') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}
                      >
                        [{new Date().toLocaleTimeString()}] {log}
                      </p>
                    ))
                  )}
                </div>
              </div>

              {/* Danger Zone: Action to Clear logs */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="font-bold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Zona Berbahaya (Danger Zone)
                </h3>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-red-100 bg-red-50/10 rounded-2xl">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Atur Ulang / Reset Log Absensi Kampus</p>
                    <p className="text-xs text-slate-500">Tindakan ini akan membersihkan semua data di tabel <code>attendance_records</code> secara permanen.</p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset Data Absensi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="p-6 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Riwayat Absensi</h3>
                <p className="text-sm text-slate-500">
                  Apakah Anda yakin ingin menghapus seluruh log kehadiran mahasiswa dan dosen? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex flex-col md:flex-row justify-end gap-3 border-t border-slate-100">
              <Button 
                variant="ghost" 
                onClick={() => setShowResetConfirm(false)}
                className="w-full md:w-auto"
              >
                Batalkan
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleResetSystem}
                className="w-full md:w-auto"
              >
                Ya, Hapus Permanen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
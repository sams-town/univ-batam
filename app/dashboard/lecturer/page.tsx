'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Camera,
  X,
  CheckCircle2,
  Clock,
  User,
  LogIn,
  LogOut,
  CreditCard,
  FileText,
  Calendar,
  Settings,
  GraduationCap,
  MapPin
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

// Quick access menu items
const quickMenuItems = [
  {
    id: 'slip-gaji',
    label: 'Slip Gaji',
    icon: CreditCard,
    color: 'from-blue-500 to-blue-600',
    link: '/dashboard/payroll'
  },
  {
    id: 'pengajuan-cuti',
    label: 'Pengajuan Cuti',
    icon: Calendar,
    color: 'from-emerald-500 to-emerald-600',
    link: '/dashboard/attendance'
  },
  {
    id: 'laporan-kehadiran',
    label: 'Laporan Kehadiran',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    link: '/dashboard/reports'
  },
  {
    id: 'profil-akademik',
    label: 'Profil Akademik',
    icon: GraduationCap,
    color: 'from-amber-500 to-amber-600',
    link: '/dashboard/profile'
  },
  {
    id: 'pengaturan-akun',
    label: 'Pengaturan Akun',
    icon: Settings,
    color: 'from-slate-500 to-slate-600',
    link: '/dashboard/profile'
  }
]

export default function LecturerDashboardPage() {
  const { profile, user } = useAuth()

  // Camera state
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Attendance state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [attendanceResult, setAttendanceResult] = useState<{
    type: 'in' | 'out'
    time: string
    isLate: boolean
    lateMinutes: number
  } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Live time
  const [currentTime, setCurrentTime] = useState('00:00:00')
  const [currentDate, setCurrentDate] = useState('')

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta'
        }).replace(/\./g, ':')
      )
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  // Start camera function
  const startCamera = async () => {
    if (cameraActive || cameraLoading) return
    setCameraLoading(true)
    setCameraError(null)
    setCapturedPhoto(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        },
        audio: false
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
      }

      setCameraActive(true)
    } catch (err: any) {
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError') {
        setCameraError('Izin kamera ditolak. Silakan izinkan akses kamera.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('Kamera tidak ditemukan di perangkat Anda.')
      } else {
        setCameraError('Gagal mengakses kamera. Silakan coba lagi.')
      }
    } finally {
      setCameraLoading(false)
    }
  }

  // Capture photo function
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const photoUrl = canvasRef.current.toDataURL('image/png')
        setCapturedPhoto(photoUrl)
        stopCamera()
      }
    }
  }

  // Handle attendance
  const handleAttendance = async (type: 'in' | 'out') => {
    if (!capturedPhoto) {
      if (!cameraActive) {
        startCamera()
      } else {
        capturePhoto()
      }
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/attendance/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          type,
          photoUrl: capturedPhoto,
          location: null
        })
      })

      const data = await response.json()

      if (data.success) {
        setAttendanceResult({
          type,
          time: data.formattedTime,
          isLate: data.isLate,
          lateMinutes: data.lateMinutes
        })
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Error submitting attendance:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset after success
  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    setCapturedPhoto(null)
    setAttendanceResult(null)
  }

  const userFullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Dosen'
  const initials = `${profile?.first_name?.charAt(0) || ''}${profile?.last_name?.charAt(0) || ''}` || 'DS'
  const roleLabel = 'Dosen'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Blur Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15" />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-white shadow-lg">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-slate-500 font-medium">Selamat Datang,</p>
              <h1 className="text-2xl font-bold text-slate-900">{userFullName}</h1>
              <p className="text-sm text-blue-600 font-semibold">{roleLabel}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-slate-800">{currentTime}</p>
            <p className="text-sm text-slate-500">{currentDate}</p>
          </div>
        </div>

        {/* Main Attendance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Camera Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Camera className="h-6 w-6 text-blue-600" />
              Kamera Absensi
            </h2>

            {/* Camera Viewfinder */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden aspect-video mb-4">
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${cameraActive && !capturedPhoto ? 'block' : 'hidden'}`}
              />

              {/* Captured Photo */}
              {capturedPhoto && (
                <div className="absolute inset-0">
                  <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    Foto Diambil
                  </div>
                </div>
              )}

              {/* Placeholder */}
              {!cameraActive && !capturedPhoto && !cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
                    <Camera className="h-12 w-12 text-white/70" />
                  </div>
                  <p className="text-lg font-medium text-white/80">Kamera tidak aktif</p>
                  <p className="text-sm text-white/60 mt-1">Klik tombol di bawah untuk memulai</p>
                </div>
              )}

              {/* Loading */}
              {cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                  <div className="h-12 w-12 border-4 border-slate-600 border-t-blue-400 rounded-full animate-spin mb-4" />
                  <span className="text-lg">Membuka kamera...</span>
                </div>
              )}

              {/* Error */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-6 text-center">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <X className="h-10 w-10 text-red-500" />
                  </div>
                  <p className="text-red-300 font-semibold text-lg max-w-xs">{cameraError}</p>
                </div>
              )}

              {/* Camera Guide Overlay */}
              {cameraActive && !capturedPhoto && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-72 border-3 border-dashed border-blue-400/60 rounded-[50%]" />
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera Controls */}
            <div className="flex gap-3">
              {!cameraActive && !capturedPhoto && (
                <Button
                  onClick={startCamera}
                  disabled={cameraLoading}
                  className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg rounded-2xl"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  {cameraLoading ? 'Membuka...' : 'Buka Kamera'}
                </Button>
              )}

              {cameraActive && !capturedPhoto && (
                <>
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg rounded-2xl"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Ambil Foto
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={stopCamera}
                    className="h-14 text-base font-semibold rounded-2xl border border-slate-200"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Tutup
                  </Button>
                </>
              )}

              {capturedPhoto && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCapturedPhoto(null)
                    startCamera()
                  }}
                  className="flex-1 h-14 text-base font-semibold rounded-2xl border border-slate-200"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Ulangi Foto
                </Button>
              )}
            </div>
          </div>

          {/* Right: Attendance Buttons */}
          <div className="space-y-6">
            {/* Attendance Buttons */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Absensi Hari Ini</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleAttendance('in')}
                  disabled={isSubmitting}
                  className="h-24 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-2"
                >
                  <LogIn className="h-8 w-8" />
                  <span>Absen Masuk</span>
                </Button>
                <Button
                  onClick={() => handleAttendance('out')}
                  disabled={isSubmitting}
                  className="h-24 text-xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-2"
                >
                  <LogOut className="h-8 w-8" />
                  <span>Absen Keluar</span>
                </Button>
              </div>
              {isSubmitting && (
                <div className="text-center mt-4 text-slate-600 flex items-center justify-center gap-2">
                  <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Memproses absensi...
                </div>
              )}
            </div>

            {/* Quick Menu */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Akses Cepat Menu Dosen</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {quickMenuItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <a
                      key={item.id}
                      href={item.link}
                      className="group flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
                    >
                      <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform mb-3`}>
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 text-center">
                        {item.label}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && attendanceResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="absolute inset-0" onClick={handleSuccessClose} />
          <div className="relative w-full max-w-md mx-4 bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-2xl overflow-hidden">
            {/* Decorative Top */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3" />
            <div className="p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="h-16 w-16 text-emerald-600" />
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-3xl font-extrabold text-slate-900 mb-2">
                  Terima Kasih!
                </h3>
                <p className="text-slate-600 text-xl">
                  Sudah {attendanceResult.type === 'in' ? 'absen masuk' : 'absen keluar'}
                </p>
                <p className="text-slate-800 font-bold text-2xl mt-3">
                  Jam {attendanceResult.time} WIB
                </p>
              </div>

              {/* Late Warning */}
              {attendanceResult.type === 'in' && attendanceResult.isLate && (
                <div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <Clock className="h-9 w-9 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-800 font-semibold text-lg">
                        Dengan keterlambatan {attendanceResult.lateMinutes} menit
                      </p>
                      <p className="text-yellow-600 text-base mt-1">
                        (sesuai waktu yang di-set admin)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSuccessClose}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-2xl shadow-lg"
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

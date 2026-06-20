'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Fingerprint, Camera, X, CheckCircle2, RotateCcw, Bell, Upload, Clock, DollarSign, Wallet, WalletCards, Calendar, Send, Zap, Lock, Grid, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks'
import DashboardBottomNav from '@/components/dashboard/DashboardBottomNav'
import AttendanceSuccessModal from '@/components/dashboard/AttendanceSuccessModal'
import { validateAttendanceLocation } from '@/lib/geolocation'

export default function EmployeeDashboardPage() {
  const { profile } = useAuth()
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false)
  const [faceCameraActive, setFaceCameraActive] = useState(false)
  const [faceCameraLoading, setFaceCameraLoading] = useState(false)
  const [capturedFace, setCapturedFace] = useState<string | null>(null)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const faceVideoRef = useRef<HTMLVideoElement>(null)
  const faceStreamRef = useRef<MediaStream | null>(null)
  const startingRef = useRef(false)

  const stopFaceCamera = useCallback(() => {
    if (faceStreamRef.current) {
      faceStreamRef.current.getTracks().forEach(t => t.stop())
      faceStreamRef.current = null
    }
    if (faceVideoRef.current) {
      faceVideoRef.current.srcObject = null
    }
    setFaceCameraActive(false)
  }, [])

  const startFaceCamera = useCallback(async () => {
    if (startingRef.current || faceCameraActive) return
    startingRef.current = true
    setFaceCameraLoading(true)
    setCameraError(null)

    try {
      // Validate location first
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          })
        });
        
        const validation = validateAttendanceLocation(position);
        if (!validation.isValid) {
          setCameraError(validation.error || 'Lokasi tidak valid.');
          setFaceCameraLoading(false);
          startingRef.current = false;
          return;
        }
      } else {
        setCameraError('Browser Anda tidak mendukung geolokasi!');
        setFaceCameraLoading(false);
        startingRef.current = false;
        return;
      }

      // Stop any existing stream first
      if (faceStreamRef.current) {
        faceStreamRef.current.getTracks().forEach(t => t.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640, max: 1920 }, height: { ideal: 480, max: 1080 }, facingMode: 'user' },
        audio: false,
      })

      faceStreamRef.current = stream

      if (faceVideoRef.current) {
        faceVideoRef.current.srcObject = stream
        await new Promise<void>((resolve) => {
          if (faceVideoRef.current) {
            faceVideoRef.current.onloadedmetadata = () => {
              faceVideoRef.current?.play()
              resolve()
            }
          } else {
            resolve()
          }
        })
      }

      setFaceCameraActive(true)
    } catch (err: any) {
      console.error('Face camera error:', err)
      if (err.name === 'NotAllowedError') {
        setCameraError('Izin kamera ditolak. Silakan izinkan akses kamera.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('Kamera tidak ditemukan di perangkat Anda.')
      } else {
        setCameraError('Gagal mengakses kamera. Silakan coba lagi.')
      }
    } finally {
      setFaceCameraLoading(false)
      startingRef.current = false
    }
  }, [faceCameraActive])

  const captureFacePhoto = useCallback(() => {
    if (faceVideoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = faceVideoRef.current.videoWidth
      canvas.height = faceVideoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(faceVideoRef.current, 0, 0)
        setCapturedFace(canvas.toDataURL('image/png'))
      }
    }
    stopFaceCamera()
  }, [stopFaceCamera])

  const handleFabClick = useCallback(() => {
    setCapturedFace(null)
    setSubmitStatus('idle')
    setCameraError(null)
    setIsFaceModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    stopFaceCamera()
    setIsFaceModalOpen(false)
    setCapturedFace(null)
    setSubmitStatus('idle')
    setCameraError(null)
  }, [stopFaceCamera])

  const handleSubmitFace = () => {
    setSubmitStatus('success')
    // Save to localStorage so it syncs up logically for mock
    const userRole = localStorage.getItem('user_role') || 'employee'
    localStorage.setItem(`lastAttendancePhoto_${userRole}`, capturedFace || '')
    
    setTimeout(() => {
      handleCloseModal()
      setIsSuccessModalOpen(true)
    }, 500)
  }

  // Auto-start camera when modal opens
  useEffect(() => {
    if (isFaceModalOpen && !capturedFace) {
      startFaceCamera()
    }
    return () => {
      if (!isFaceModalOpen) {
        stopFaceCamera()
      }
    }
  }, [isFaceModalOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Pegawai'
  const initials = `${profile?.first_name?.charAt(0) || ''}${profile?.last_name?.charAt(0) || ''}` || 'PG'

  const [time, setTime] = useState('00:00:00')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'))
      setDateStr(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase())
    }
    updateTime()
    const int = setInterval(updateTime, 1000)
    return () => clearInterval(int)
  }, [])

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      {/* Purple Header & Top Card */}
      <div className="bg-gradient-to-b from-[#6b34ff] to-[#804dfa] rounded-b-[40px] px-6 pt-12 pb-24 relative text-white">
        {/* Top Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-indigo-900 text-white font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Selamat Malam</p>
              <p className="text-sm font-extrabold">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-white/10">
              <Upload className="h-4 w-4 text-white" />
            </button>
            <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-white/10 relative">
              <Bell className="h-4 w-4 text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#804dfa]"></span>
            </button>
          </div>
        </div>

        {/* Time */}
        <div className="text-center mb-4">
          <p className="text-5xl font-extrabold tracking-widest drop-shadow-sm">{time}</p>
          <p className="text-[10px] font-bold opacity-80 mt-2 tracking-widest uppercase">{dateStr}</p>
        </div>

        {/* Floating White Card */}
        <div className="absolute left-6 right-6 -bottom-16 bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/50 text-slate-800">
          <div className="grid grid-cols-3 gap-2 border-b border-slate-100 pb-4 mb-4">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-[9px] font-extrabold text-slate-400 mb-1">JAM KERJA</p>
              <p className="text-xs font-bold text-slate-700">00:00 - 00:00</p>
              <p className="text-[9px] font-bold text-slate-400 mt-0.5">Off</p>
            </div>
            <div className="text-center border-l border-r border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2">
                <Fingerprint className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[9px] font-extrabold text-slate-400 mb-1">JAM MASUK</p>
              <p className="text-xs font-bold text-slate-400">Belum</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2">
                <RotateCcw className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[9px] font-extrabold text-slate-400 mb-1">JAM PULANG</p>
              <p className="text-xs font-bold text-slate-400">Belum</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center py-3 px-1 rounded-2xl border border-slate-100 bg-slate-50/50">
              <DollarSign className="h-5 w-5 text-indigo-300 mx-auto mb-2" />
              <p className="text-[9px] font-extrabold text-slate-400 uppercase">Payroll</p>
            </div>
            <div className="text-center py-3 px-1 rounded-2xl border border-slate-100 bg-slate-50/50">
              <Wallet className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-[9px] font-extrabold text-slate-400 uppercase mb-1">Reimburse</p>
              <p className="text-xs font-bold text-slate-700">Rp 0</p>
            </div>
            <div className="text-center py-3 px-1 rounded-2xl border border-slate-100 bg-slate-50/50">
              <WalletCards className="h-5 w-5 text-amber-500 mx-auto mb-2" />
              <p className="text-[9px] font-extrabold text-slate-400 uppercase mb-1">Kasbon</p>
              <p className="text-xs font-bold text-slate-700">Rp 0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-24">
        {/* Quick Attendance Button */}
        <div className="bg-gradient-to-r from-[#7139ff] to-[#9b6cff] rounded-[24px] p-5 shadow-xl shadow-purple-500/20 mb-8 flex items-center justify-between">
          <div className="text-white pl-2">
            <p className="text-[9px] font-extrabold opacity-80 uppercase tracking-widest mb-1">Mulai Hari Ini</p>
            <p className="text-[17px] font-extrabold tracking-tight">Rekam Kehadiran</p>
          </div>
          <button
            onClick={handleFabClick}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <Fingerprint className="h-7 w-7 text-[#7139ff]" />
          </button>
        </div>

        {/* Quick Links / Layanan Cepat */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800">Layanan Cepat</h3>
            <Link href="/dashboard/employee/menu" className="flex items-center text-[10px] text-indigo-600 font-bold uppercase tracking-widest">
              SEMUA <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Link href="/dashboard/attendance" className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-[20px] bg-[#6b34ff] flex items-center justify-center shadow-lg shadow-indigo-200">
                <Fingerprint className="h-7 w-7 text-white" />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">ABSENSI</span>
            </Link>
            <Link href="/dashboard/employee" className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-[20px] bg-[#00a8ff] flex items-center justify-center shadow-lg shadow-blue-200">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">CUTI & IZIN</span>
            </Link>
            <Link href="/dashboard/employee" className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-[20px] bg-[#f39c12] flex items-center justify-center shadow-lg shadow-orange-200">
                <Send className="h-7 w-7 text-white" />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">DINAS LUAR</span>
            </Link>
            <Link href="/dashboard/employee" className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-[20px] bg-[#ffa502] flex items-center justify-center shadow-lg shadow-yellow-200">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">LEMBUR</span>
            </Link>
            
            <Link href="/dashboard/profile" className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-[20px] bg-[#34495e] flex items-center justify-center shadow-lg shadow-slate-200">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">PASSWORD</span>
            </Link>
            <Link href="/dashboard/employee/menu" className="flex flex-col items-center gap-2">
              <div className="w-full aspect-square rounded-[20px] bg-[#a55eea] flex items-center justify-center shadow-lg shadow-purple-200">
                <Grid className="h-7 w-7 text-white" />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">LAINNYA</span>
            </Link>
          </div>
        </div>

        {/* Activity List */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-slate-900">Aktivitas Terakhir</p>
            <p className="text-sm text-indigo-600 font-semibold">Lihat →</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Fingerprint className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Riwayat Absensi</p>
                <p className="text-sm text-slate-500">Lihat log masuk & pulang</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Face Recognition Modal */}
      {isFaceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-center relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="text-lg font-bold text-white">Face Recognition Registration</p>
              <p className="text-sm text-indigo-200 mt-1">Pastikan wajah terlihat jelas</p>
            </div>

            {/* Camera View */}
            <div className="p-5 space-y-4">
              <div className="w-full aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center relative">
                <video
                  ref={faceVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!faceCameraActive && !capturedFace ? 'hidden' : ''}`}
                />

                {capturedFace ? (
                  <img src={capturedFace} alt="Captured face" className="absolute inset-0 w-full h-full object-cover" />
                ) : faceCameraLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
                    <div className="h-10 w-10 border-4 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
                    <span className="text-sm">Membuka kamera...</span>
                  </div>
                ) : cameraError ? (
                  <div className="flex flex-col items-center justify-center gap-2 bg-slate-900 w-full h-full p-4 text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                      <X className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-red-400 font-semibold text-sm max-w-[250px] leading-relaxed">
                      {cameraError}
                    </p>
                    <button
                      onClick={() => {
                        setCameraError(null)
                        startFaceCamera()
                      }}
                      className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Coba Ulang Lokasi
                    </button>
                  </div>
                ) : !faceCameraActive ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Camera className="h-12 w-12 opacity-50" />
                    <span className="text-sm">Kamera tidak aktif</span>
                  </div>
                ) : null}

                {/* Face guide overlay */}
                {faceCameraActive && !capturedFace && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-60 border-2 border-dashed border-white/40 rounded-[50%]" />
                  </div>
                )}
              </div>

              {/* Instruction */}
              <p className="text-center text-xs text-slate-500">Pastikan Wajah di Tengah Kotak</p>

              {/* Success Feedback */}
              {submitStatus === 'success' && (
                <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-3 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Absensi Berhasil!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {capturedFace ? (
                  <>
                    <button
                      onClick={() => {
                        setCapturedFace(null)
                        startFaceCamera()
                      }}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Ulangi
                    </button>
                    <button
                      onClick={handleSubmitFace}
                      disabled={submitStatus === 'success'}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-all"
                    >
                      Kirim
                    </button>
                  </>
                ) : faceCameraActive ? (
                  <button
                    onClick={captureFacePhoto}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Ambil Foto
                  </button>
                ) : (
                  <button
                    onClick={startFaceCamera}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Mulai Kamera
                  </button>
                )}
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full py-3 text-slate-500 hover:text-slate-700 font-semibold transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <DashboardBottomNav role="employee" onFabClick={handleFabClick} />

      {/* Success Modal */}
      <AttendanceSuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
        type="masuk" 
      />
    </div>
  )
}

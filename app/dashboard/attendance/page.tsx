'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Camera, MapPin, CheckCircle, XCircle, Clock, LogOut, LogIn, User, GraduationCap } from 'lucide-react'

export default function AttendancePage() {
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [attendanceType, setAttendanceType] = useState<'in' | 'out'>('in')
  const [currentTime, setCurrentTime] = useState<string>('08:15')
  const [userName] = useState<string>('Dr. Budi Santoso')
  const [userRole] = useState<string>('Dosen')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Update current time
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      })
      setCurrentTime(timeStr)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    // Cleanup
    return () => {
      clearInterval(interval)
      stopAllTracks()
    }
  }, [])

  const stopAllTracks = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    try {
      stopAllTracks()
      
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
          videoRef.current?.play().catch(err => console.error('Play error:', err))
        }
      }

      setCameraActive(true)
    } catch (error: any) {
      console.error('Error accessing camera:', error)
      alert('Gagal mengakses kamera! Pastikan izin kamera diberikan.')
    }
  }

  const stopCamera = () => {
    stopAllTracks()
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

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

  const getLocation = () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationLoading(false)
        },
        () => {
          setLocationLoading(false)
          setLocation({ lat: -6.2088, lng: 106.8456 }) // Mock Jakarta location
        }
      )
    } else {
      setLocationLoading(false)
      alert('Browser tidak mendukung geolokasi!')
    }
  }

  const handleAttendance = (type: 'in' | 'out') => {
    setAttendanceType(type)
    
    // Auto start camera if not active and no photo
    if (!cameraActive && !capturedPhoto) {
      startCamera()
      return
    }

    // If photo is captured, show success modal
    if (capturedPhoto) {
      setShowSuccessModal(true)
    }
  }

  const confirmAttendance = () => {
    setShowSuccessModal(false)
    setCapturedPhoto(null)
    setLocation(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Blur Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15" />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
            Sistem Absensi Cerdas
          </h1>
          <p className="text-slate-500 text-lg">Universitas Batam - Pegawai & Dosen</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8 bg-white/80 backdrop-blur-xl border-white/50 shadow-2xl rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800">{userName}</h3>
                <p className="text-slate-500 font-medium">{userRole}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-blue-600">{currentTime}</p>
                <p className="text-slate-400 font-medium">WIB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Attendance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Camera */}
          <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {/* Camera Viewfinder */}
              <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                {/* Camera Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                
                {/* Captured Photo */}
                {capturedPhoto && (
                  <div className="absolute inset-0">
                    <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-lg">
                      <CheckCircle className="w-5 h-5" />
                      Foto Diambil
                    </div>
                  </div>
                )}
                
                {/* Placeholder */}
                {!cameraActive && !capturedPhoto && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/20">
                      <Camera className="w-12 h-12 text-white/70" />
                    </div>
                    <p className="text-white/70 font-medium text-lg">Kamera tidak aktif</p>
                    <p className="text-white/50 text-sm mt-1">Tekan "Buka Kamera" untuk memulai</p>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Camera Border Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
                </div>
              </div>

              {/* Camera Controls */}
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                  {!cameraActive && !capturedPhoto && (
                    <Button 
                      onClick={startCamera} 
                      className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg rounded-2xl"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Buka Kamera
                    </Button>
                  )}
                  
                  {cameraActive && (
                    <Button 
                      onClick={capturePhoto} 
                      className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg rounded-2xl"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Ambil Foto
                    </Button>
                  )}
                  
                  {cameraActive && (
                    <Button 
                      variant="secondary" 
                      onClick={stopCamera} 
                      className="h-14 text-lg font-semibold shadow-lg rounded-2xl border-2 border-slate-200"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Tutup
                    </Button>
                  )}
                  
                  {capturedPhoto && !cameraActive && (
                    <Button 
                      variant="secondary" 
                      onClick={() => { 
                        setCapturedPhoto(null)
                        startCamera()
                      }} 
                      className="flex-1 h-14 text-lg font-semibold shadow-lg rounded-2xl border-2 border-slate-200"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Ulangi Foto
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Controls */}
          <div className="space-y-6">
            {/* Location Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-2xl rounded-3xl">
              <CardContent className="p-6">
                <Label className="font-semibold text-slate-700 text-lg mb-3 block">Lokasi</Label>
                <Button 
                  variant="secondary" 
                  onClick={getLocation} 
                  className="w-full justify-start h-16 text-base font-medium bg-blue-50 hover:bg-blue-100 text-slate-700 border-2 border-blue-200 rounded-2xl"
                >
                  <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                  {locationLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Mendapatkan lokasi...
                    </span>
                  ) : location ? (
                    <span className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      Lokasi Terdeteksi
                    </span>
                  ) : (
                    'Dapatkan Lokasi'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Attendance Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleAttendance('in')} 
                className="h-24 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-2"
              >
                <LogIn className="w-8 h-8" />
                <span>Absen Masuk</span>
              </Button>
              
              <Button 
                onClick={() => handleAttendance('out')} 
                className="h-24 text-xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-2"
              >
                <LogOut className="w-8 h-8" />
                <span>Absen Keluar</span>
              </Button>
            </div>

            {/* Status Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-2xl rounded-3xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-700 text-lg mb-4">Status Absensi</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-slate-600">Kamera</span>
                    <span className={`font-medium px-3 py-1 rounded-full text-sm ${capturedPhoto || cameraActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {capturedPhoto ? 'Foto Diambil' : cameraActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-slate-600">Lokasi</span>
                    <span className={`font-medium px-3 py-1 rounded-full text-sm ${location ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {location ? 'Terdeteksi' : 'Tidak Terdeteksi'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setShowSuccessModal(false)} />
          <Card className="relative w-full max-w-md mx-4 bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-2xl overflow-hidden">
            {/* Decorative Top */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3" />
            
            <CardContent className="p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-16 h-16 text-emerald-600" />
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-3xl font-extrabold text-slate-800 mb-2">
                  Terimakasih!
                </h3>
                <p className="text-slate-600 text-xl">
                  Sudah {attendanceType === 'in' ? 'absen masuk' : 'absen keluar'}
                </p>
                <p className="text-slate-800 font-bold text-2xl mt-3">
                  Jam {currentTime} WIB
                </p>
              </div>

              {/* Warning Banner */}
              {attendanceType === 'in' && (
                <div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <Clock className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-800 font-semibold text-lg">
                        Dengan keterlambatan 15 menit
                      </p>
                      <p className="text-yellow-600 text-base mt-1">
                        (sesuai jam admin)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={confirmAttendance}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-2xl shadow-lg"
              >
                Selesai
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

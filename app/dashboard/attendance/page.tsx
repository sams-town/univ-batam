'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Camera, MapPin, CheckCircle, XCircle, Clock, LogOut, LogIn } from 'lucide-react'

export default function ModernAttendancePage() {
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [attendanceType, setAttendanceType] = useState<'in' | 'out'>('in')
  const [currentTime, setCurrentTime] = useState<string>('08:15')
  
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
      alert('Gagal mengakses kamera!')
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
          setLocation({ lat: 0, lng: 0 }) // Mock location for demo
        }
      )
    }
  }

  const handleAttendance = (type: 'in' | 'out') => {
    setAttendanceType(type)
    
    // Auto start camera if not active
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Sistem Absensi Cerdas
          </h1>
          <p className="text-slate-500">Absensi Otomatis dengan Face Recognition</p>
        </div>

        {/* Responsive Device Mockups */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Smartphone Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[3rem] blur-2xl opacity-30 scale-105" />
            <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-7 w-32 bg-slate-900 rounded-b-2xl z-20" />
              
              {/* Phone Screen */}
              <div className="bg-white rounded-[2.5rem] overflow-hidden w-[320px] md:w-[360px] h-[640px] md:h-[720px]">
                <AttendanceScreen 
                  cameraActive={cameraActive}
                  capturedPhoto={capturedPhoto}
                  location={location}
                  locationLoading={locationLoading}
                  currentTime={currentTime}
                  onStartCamera={startCamera}
                  onCapturePhoto={capturePhoto}
                  onStopCamera={stopCamera}
                  onGetLocation={getLocation}
                  onAttendance={handleAttendance}
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                />
              </div>
            </div>
          </div>

          {/* Tablet Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur-2xl opacity-30 scale-105" />
            <div className="relative bg-slate-900 rounded-[2rem] p-4 shadow-2xl">
              {/* Tablet Screen */}
              <div className="bg-white rounded-[1.5rem] overflow-hidden w-[520px] md:w-[600px] h-[380px] md:h-[440px]">
                <AttendanceScreen 
                  cameraActive={cameraActive}
                  capturedPhoto={capturedPhoto}
                  location={location}
                  locationLoading={locationLoading}
                  currentTime={currentTime}
                  onStartCamera={startCamera}
                  onCapturePhoto={capturePhoto}
                  onStopCamera={stopCamera}
                  onGetLocation={getLocation}
                  onAttendance={handleAttendance}
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  isTablet={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowSuccessModal(false)} />
          <Card className="relative w-full max-w-md mx-4 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2" />
            
            <CardContent className="p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-14 h-14 text-emerald-600" />
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Terimakasih!
                </h3>
                <p className="text-slate-600 text-lg">
                  Sudah {attendanceType === 'in' ? 'absen masuk' : 'absen keluar'}
                </p>
                <p className="text-slate-700 font-semibold text-xl mt-2">
                  Jam {currentTime} WIB
                </p>
              </div>

              {/* Warning Banner */}
              {attendanceType === 'in' && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="text-yellow-800 font-medium">
                        Dengan keterlambatan 15 menit
                      </p>
                      <p className="text-yellow-600 text-sm">
                        (sesuai jam admin)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={confirmAttendance}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-2xl"
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

// Reusable Attendance Screen Component
interface AttendanceScreenProps {
  cameraActive: boolean
  capturedPhoto: string | null
  location: { lat: number; lng: number } | null
  locationLoading: boolean
  currentTime: string
  onStartCamera: () => void
  onCapturePhoto: () => void
  onStopCamera: () => void
  onGetLocation: () => void
  onAttendance: (type: 'in' | 'out') => void
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  isTablet?: boolean
}

function AttendanceScreen({ 
  cameraActive, 
  capturedPhoto, 
  location, 
  locationLoading, 
  currentTime,
  onStartCamera, 
  onCapturePhoto, 
  onStopCamera, 
  onGetLocation, 
  onAttendance, 
  videoRef, 
  canvasRef,
  isTablet = false
}: AttendanceScreenProps) {
  const containerClass = isTablet ? 'h-full' : 'h-full flex flex-col'
  
  return (
    <div className={`${containerClass} bg-gradient-to-b from-blue-50 to-white`}>
      {/* Header */}
      <div className="p-4 bg-white/70 backdrop-blur-md border-b border-white/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Universitas Batam</h2>
            <p className="text-xs text-slate-500">Pegawai & Dosen</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-700">{currentTime}</p>
            <p className="text-xs text-slate-500">WIB</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        {/* Camera Viewfinder */}
        <div className="bg-slate-100 rounded-3xl overflow-hidden aspect-video relative mb-4 shadow-xl border-4 border-white">
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
            <img src={capturedPhoto} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
          )}
          
          {/* Placeholder */}
          {!cameraActive && !capturedPhoto && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                <Camera className="w-10 h-10 text-blue-500" />
              </div>
              <p className="text-slate-600 font-medium">Kamera tidak aktif</p>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Location */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
            <Label className="font-medium text-slate-700 mb-2 block">Lokasi</Label>
            <Button 
              variant="secondary" 
              onClick={onGetLocation} 
              className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-slate-700 border border-blue-200"
            >
              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
              {locationLoading ? 'Mendapatkan lokasi...' : location ? 'Lokasi Terdeteksi' : 'Dapatkan Lokasi'}
            </Button>
          </div>

          {/* Camera Controls */}
          <div className="flex flex-wrap gap-2">
            {!cameraActive && !capturedPhoto && (
              <Button 
                onClick={onStartCamera} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Buka Kamera
              </Button>
            )}
            
            {cameraActive && (
              <Button 
                onClick={onCapturePhoto} 
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              >
                <Camera className="h-4 w-4 mr-2" />
                Ambil Foto
              </Button>
            )}
            
            {cameraActive && (
              <Button variant="secondary" onClick={onStopCamera} className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Tutup
              </Button>
            )}
            
            {capturedPhoto && !cameraActive && (
              <Button 
                variant="secondary" 
                onClick={() => { onStartCamera() }} 
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Ulangi Foto
              </Button>
            )}
          </div>

          {/* Main Attendance Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              onClick={() => onAttendance('in')} 
              className="h-16 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Absen Masuk
            </Button>
            <Button 
              onClick={() => onAttendance('out')} 
              className="h-16 text-lg font-semibold bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-2xl shadow-lg"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Absen Keluar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

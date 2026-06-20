'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Plus, Calendar, CheckCircle, Clock, Camera, MapPin, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type AttendanceSession = {
  id: string
  date: string
  is_open: boolean
  schedule: {
    course: { name: string; code: string }
    classroom: { name: string }
  }
}

type AttendanceRecord = {
  id: string
  studentName: string
  nim: string
  status: 'hadir' | 'terlambat' | 'sakit' | 'alpha'
  checkInTime: string
  photo?: string
}

// Dummy data
const dummySessions: AttendanceSession[] = [
  {
    id: '1',
    date: '2026-06-19',
    is_open: true,
    schedule: {
      course: { code: 'TI101', name: 'Pemrograman Web' },
      classroom: { name: 'Ruang 101' },
    },
  },
  {
    id: '2',
    date: '2026-06-18',
    is_open: false,
    schedule: {
      course: { code: 'TI102', name: 'Basis Data' },
      classroom: { name: 'Ruang 102' },
    },
  },
  {
    id: '3',
    date: '2026-06-17',
    is_open: false,
    schedule: {
      course: { code: 'TI103', name: 'Struktur Data' },
      classroom: { name: 'Lab Komputer' },
    },
  },
]

const dummyAttendanceHistory: Record<string, AttendanceRecord[]> = {
  '1': [
    { id: '101', studentName: 'Ahmad Rizki Pratama', nim: '1234567890', status: 'hadir', checkInTime: '07:55', photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Ahmad' },
    { id: '102', studentName: 'Siti Nurhaliza', nim: '1234567891', status: 'terlambat', checkInTime: '08:10', photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Siti' },
    { id: '103', studentName: 'Budi Santoso', nim: '1234567892', status: 'hadir', checkInTime: '07:58', photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Budi' },
  ],
  '2': [
    { id: '201', studentName: 'Ahmad Rizki Pratama', nim: '1234567890', status: 'hadir', checkInTime: '10:25', photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Ahmad' },
    { id: '202', studentName: 'Siti Nurhaliza', nim: '1234567891', status: 'alpha', checkInTime: '-' },
    { id: '203', studentName: 'Budi Santoso', nim: '1234567892', status: 'sakit', checkInTime: '-' },
  ],
  '3': [
    { id: '301', studentName: 'Ahmad Rizki Pratama', nim: '1234567890', status: 'hadir', checkInTime: '08:00', photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Ahmad' },
    { id: '302', studentName: 'Siti Nurhaliza', nim: '1234567891', status: 'hadir', checkInTime: '07:59', photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Siti' },
    { id: '303', studentName: 'Budi Santoso', nim: '1234567892', status: 'terlambat', checkInTime: '08:15', photo: 'https://api.dicebear.com/7.x/initials/svg?seed=Budi' },
  ],
}

export default function AttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [lastPhoto, setLastPhoto] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [attendanceSuccess, setAttendanceSuccess] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Simulate loading from Supabase then use dummy if empty
    const loadData = async () => {
      const { data } = await supabase
        .from('attendance_sessions')
        .select(`
          *,
          schedule:schedules(
            course:courses(name, code),
            classroom:classrooms(name)
          )
        `)
        .order('date', { ascending: false })
      
      // Use dummy data if Supabase has no data
      setSessions(data && data.length > 0 ? data : dummySessions)
      setLoading(false)
    }
    loadData()
    
    // Load last photo from localStorage scoped by role
    const userRole = localStorage.getItem('user_role') || 'default'
    const savedLastPhoto = localStorage.getItem(`lastAttendancePhoto_${userRole}`)
    if (savedLastPhoto) {
      setLastPhoto(savedLastPhoto)
    }

    // Cleanup on unmount
    return () => {
      stopAllTracks()
    }
  }, [])

  const startingCameraRef = useRef(false)

  // Helper to stop all tracks
  const stopAllTracks = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    if (startingCameraRef.current) return
    startingCameraRef.current = true

    try {
      stopAllTracks()

      let stream: MediaStream | null = null

      // Try ideal resolution first
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, max: 1920 },
            height: { ideal: 480, max: 1080 },
            facingMode: 'user'
          },
          audio: false
        })
      } catch (err) {
        console.warn('Failed with ideal resolution, trying basic video:', err)
        // Fallback to basic video
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
      }

      if (!stream) throw new Error('Failed to get camera stream')

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
      
      let errorMsg = 'Gagal mengakses kamera'
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.'
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'Kamera tidak ditemukan di perangkat Anda.'
      } else if (error.name === 'NotReadableError') {
        errorMsg = 'Kamera sedang digunakan oleh aplikasi lain.'
      } else if (error.name === 'AbortError' || error.message?.includes('Timeout')) {
        errorMsg = 'Waktu habis saat membuka kamera. Silakan coba lagi.'
      }

      alert(errorMsg)
    } finally {
      startingCameraRef.current = false
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
        (error) => {
          console.error('Error getting location:', error)
          alert('Gagal mendapatkan lokasi! Pastikan izin lokasi diberikan.')
          setLocationLoading(false)
        }
      )
    } else {
      alert('Browser Anda tidak mendukung geolokasi!')
      setLocationLoading(false)
    }
  }

  const handleCheckIn = () => {
    if (!capturedPhoto) {
      alert('Silakan ambil foto terlebih dahulu!')
      return
    }
    if (!location) {
      alert('Silakan dapatkan lokasi terlebih dahulu!')
      return
    }
    
    // Save last photo scoped by role
    const userRole = localStorage.getItem('user_role') || 'default'
    setLastPhoto(capturedPhoto)
    localStorage.setItem(`lastAttendancePhoto_${userRole}`, capturedPhoto)
    
    // Simulate attendance
    setAttendanceSuccess(true)
    
    // Reset after 2 seconds
    setTimeout(() => {
      setAttendanceSuccess(false)
      setCapturedPhoto(null)
      setLocation(null)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="p-8">Loading...</div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hadir':
        return <Badge className="bg-emerald-500">Hadir</Badge>
      case 'terlambat':
        return <Badge className="bg-yellow-500">Terlambat</Badge>
      case 'sakit':
        return <Badge className="bg-blue-500">Sakit</Badge>
      case 'alpha':
        return <Badge className="bg-red-500">Alpha</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Absensi</h1>
          <p className="text-muted-foreground">Kelola sesi absensi dan data kehadiran</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Buka Sesi Absensi
        </Button>
      </div>

      {/* Attendance Panel */}
      <Card className="border-slate-200 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Camera className="h-6 w-6 text-indigo-600" />
            Absen Masuk
          </CardTitle>
          <CardDescription>
            Pastikan wajah terlihat dan lokasi terdeteksi sebelum absen!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera & Photo Preview */}
          <div className="space-y-4">
            <div className="bg-slate-100 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative">
              {/* Video always in DOM so ref is available when stream is assigned */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? '' : 'hidden'}`}
              />
              {capturedPhoto ? (
                <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
              ) : !cameraActive && lastPhoto ? (
                <img src={lastPhoto} alt="Last Photo" className="w-full h-full object-cover opacity-70" />
              ) : !cameraActive ? (
                <div className="text-center p-8">
                  <ImageIcon className="h-24 w-24 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">Kamera tidak aktif</p>
                </div>
              ) : null}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              {!cameraActive && !capturedPhoto && (
                <Button onClick={startCamera} className="bg-indigo-600 hover:bg-indigo-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Buka Kamera
                </Button>
              )}
              
              {cameraActive && (
                <>
                  <Button onClick={capturePhoto} className="bg-green-600 hover:bg-green-700">
                    <Camera className="h-4 w-4 mr-2" />
                    Ambil Foto
                  </Button>
                  <Button variant="secondary" onClick={stopCamera}>
                    Tutup Kamera
                  </Button>
                </>
              )}
              
              {capturedPhoto && !cameraActive && (
                <Button variant="secondary" onClick={() => setCapturedPhoto(null)}>
                  Ulangi Foto
                </Button>
              )}
            </div>
          </div>

          {/* Location & Check In */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-slate-700">Lokasi</Label>
                {locationLoading && <span className="text-sm text-indigo-600">Mendapatkan lokasi...</span>}
                {location && <span className="text-sm text-emerald-600">Lokasi terdeteksi!</span>}
              </div>
              <Button variant="secondary" onClick={getLocation} className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Dapatkan Lokasi'}
              </Button>
            </div>

            <div className="space-y-3">
              {lastPhoto && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <Label className="font-medium text-slate-700 mb-2 block">Foto Terakhir</Label>
                  <img src={lastPhoto} alt="Last Photo" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>

            <Button 
              onClick={handleCheckIn} 
              className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            >
              {attendanceSuccess ? (
                <>
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Absen Berhasil!
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Absen Masuk
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {sessions.map((session) => (
          <Card key={session.id} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {session.schedule?.course?.code} - {session.schedule?.course?.name}
                </CardTitle>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(session.date).toLocaleDateString('id-ID')}
                  </span>
                  <span>{session.schedule?.classroom?.name}</span>
                </div>
              </div>
              <Badge variant={session.is_open ? 'default' : 'secondary'}>
                {session.is_open ? 'Buka' : 'Tutup'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Lihat Kehadiran
                </Button>
                <Button variant="ghost">
                  <Clock className="h-4 w-4 mr-2" />
                  Riwayat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal for Attendance History */}
      {selectedSessionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Data Kehadiran</CardTitle>
                <CardDescription>
                  {dummySessions.find(s => s.id === selectedSessionId)?.schedule?.course?.name} - {new Date(dummySessions.find(s => s.id === selectedSessionId)?.date || '').toLocaleDateString('id-ID')}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedSessionId(null)}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Mahasiswa</TableHead>
                    <TableHead>NIM</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu Check-in</TableHead>
                    <TableHead>Foto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyAttendanceHistory[selectedSessionId]?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.studentName}</TableCell>
                      <TableCell>{record.nim}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.checkInTime}</TableCell>
                      <TableCell>
                        {record.photo && (
                          <img src={record.photo} alt="Attendance" className="w-12 h-12 object-cover rounded-full" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

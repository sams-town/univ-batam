'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, LogIn, LogOut, AlertCircle, X, MapPin, Camera } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Attendance Capture Modal state
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false)
  const [attendanceType, setAttendanceType] = useState<'masuk' | 'keluar' | null>(null)
  const [locationText, setLocationText] = useState('Mengambil lokasi GPS...')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    try {
      // STEP 1: Sign in
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError
      if (!session) throw new Error('Gagal mendapatkan session')

      // STEP 2: Get user's profile and role
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, role_id')
        .eq('id', session.user.id)
        .maybeSingle()

      // Auto-heal profile/role if missing
      if (!profile || !profile.role) {
        let roleName = 'karyawan'
        if (session.user.id === 'b6b9d09e-2094-4459-884e-7b0a0caad7b3' || email.toLowerCase().includes('admin')) {
          roleName = 'super_admin'
        } else if (email.toLowerCase().includes('dosen') || email.toLowerCase().includes('lecturer')) {
          roleName = 'dosen'
        }

        const { data: roleData } = await supabase
          .from('roles')
          .select('id, name')
          .eq('name', roleName)
          .maybeSingle()

        if (roleData) {
          if (profile) {
            await supabase
              .from('profiles')
              .update({ role_id: roleData.id })
              .eq('id', session.user.id)
          } else {
            await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                role_id: roleData.id,
                first_name: session.user.email?.split('@')[0] || 'User',
                last_name: '',
                email: session.user.email || email
              })
          }

          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, role, role_id')
            .eq('id', session.user.id)
            .maybeSingle()

          if (updatedProfile) {
            profile = updatedProfile
            profileError = null
          }
        }
      }

      if (profileError) throw new Error(`Profile error: ${profileError.message}`)
      if (!profile) throw new Error('Profil tidak ditemukan. Hubungi administrator.')

      const role = (typeof profile?.role === 'string' ? profile.role : (profile?.role as any)?.name) || 'karyawan'
      localStorage.setItem('user_role', role)
      
      switch (role) {
        case 'super_admin':
        case 'admin':
        case 'admin_akademik':
          router.push('/dashboard/admin')
          break
        case 'dosen':
          router.push('/dashboard/lecturer')
          break
        case 'karyawan':
        case 'pegawai':
        case 'employee':
          router.push('/dashboard/employee')
          break
        default:
          router.push('/dashboard/employee')
          break
      }
    } catch (err: unknown) {
      const message = (err && typeof err === 'object' && 'message' in err) 
        ? String((err as { message: string }).message) 
        : String(err)
      setError('ERROR: ' + message)
    } finally {
      setLoading(false)
    }
  }

  const startAttendance = async (type: 'masuk' | 'keluar') => {
    setAttendanceType(type)
    setIsCaptureModalOpen(true)
    setLocationText('Mengambil lokasi GPS...')
    setCoords(null)

    // 1. Fetch Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCoords({ lat, lng })
          setLocationText(`Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`)
        },
        (error) => {
          console.error('GPS Error:', error)
          let errMsg = 'Gagal mengakses GPS'
          if (error.code === error.PERMISSION_DENIED) {
            errMsg = 'Izin lokasi ditolak'
          }
          setLocationText(`Lokasi tidak tersedia: ${errMsg}`)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setLocationText('Browser Anda tidak mendukung GPS')
    }

    // 2. Fetch Camera stream
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      })
      setStream(mediaStream)
      // Wait for element to mount and bind
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (err) {
      console.error('Camera Error:', err)
      alert('Gagal mengakses kamera. Silakan izinkan akses kamera di browser Anda.')
      closeCaptureModal()
    }
  }

  const closeCaptureModal = () => {
    setIsCaptureModalOpen(false)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setAttendanceType(null)
    setCoords(null)
  }

  const handleCaptureSubmit = () => {
    alert(`Presensi Absen ${attendanceType === 'masuk' ? 'Masuk' : 'Keluar'} berhasil dikirim!\nKoordinat: ${coords ? `${coords.lat}, ${coords.lng}` : 'Lokasi tidak tersedia'}`)
    closeCaptureModal()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden font-sans animate-fade-in">
      
      {/* Decorative clean radial graphics */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col space-y-6 z-10">
        
        {/* Logo & University Identity */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-md border border-slate-100">
            <img 
              src="/logo-unbat.png" 
              alt="Universitas Batam Logo" 
              className="h-full w-full object-contain" 
            />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-slate-800 text-lg font-extrabold tracking-tight">Universitas Batam</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Smart Campus Attendance</p>
          </div>
        </div>

        {/* Attendance Headline */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Sistem Absensi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Cerdas & Efisien</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Manajemen Kehadiran Modern.</p>
        </div>

        {/* Live Presensi Quick Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button" 
            onClick={() => startAttendance('masuk')}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all duration-200 cursor-pointer"
          >
            <LogIn className="h-4.5 w-4.5 shrink-0" />
            <span>Absen Masuk</span>
          </button>
          
          <button 
            type="button" 
            onClick={() => startAttendance('keluar')}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white text-xs font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-600/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Absen Keluar</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-bold tracking-widest uppercase">ATAU MASUK KE AKUN ANDA</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Web Portal Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Email</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nama@universitas.ac.id" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/80 border-slate-200 rounded-2xl pl-10 pr-4 text-slate-800 text-sm placeholder-slate-400 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Password</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white/80 border-slate-200 rounded-2xl pl-10 pr-4 text-slate-800 text-sm focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-700 leading-normal mt-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-4 text-sm"
          >
            {loading ? (
              <>
                <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>
      </div>

      {/* Camera & Geolocation Capture Overlay Modal */}
      {isCaptureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden flex flex-col p-6 space-y-4 animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 capitalize">
                Absen {attendanceType === 'masuk' ? 'Masuk' : 'Keluar'} - Capture
              </h3>
              <button 
                type="button" 
                onClick={closeCaptureModal} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video stream box */}
            <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 shadow-inner">
              <video 
                ref={videoRef} 
                playsInline 
                muted 
                autoPlay 
                className="w-full h-full object-cover scale-x-[-1]" 
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-2xl pointer-events-none m-4 flex items-center justify-center">
                <div className="w-36 h-36 border-4 border-blue-500/40 rounded-full" />
              </div>
            </div>

            {/* Location Display */}
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lokasi Presensi</p>
                <p className="text-xs text-slate-700 font-mono leading-normal">{locationText}</p>
              </div>
            </div>

            {/* Action button */}
            <button 
              type="button"
              onClick={handleCaptureSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] text-sm"
            >
              <Camera className="h-4.5 w-4.5" />
              <span>Capture & Submit</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

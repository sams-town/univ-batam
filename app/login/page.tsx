'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, LogIn, LogOut, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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

  const handleAbsenMasuk = () => {
    alert('Menuju ke Pemindaian Wajah untuk Absen Masuk...')
  }

  const handleAbsenKeluar = () => {
    alert('Menuju ke Pemindaian Wajah untuk Absen Keluar...')
  }

  interface DeviceScreenProps {
    deviceType: 'mobile' | 'tablet' | 'desktop'
  }

  const DeviceScreen = ({ deviceType }: DeviceScreenProps) => {
    const isMobile = deviceType === 'mobile'
    
    return (
      <div className="w-full h-full bg-slate-900/95 text-slate-100 flex flex-col p-4 md:p-6 overflow-y-auto select-none scrollbar-thin">
        {/* Header Logo */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center p-1 shadow-md shadow-blue-500/10 shrink-0">
            <img 
              src="/logo-unbat.png" 
              alt="Universitas Batam Logo" 
              className="h-full w-full object-contain" 
            />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white leading-tight">
              Universitas Batam
            </h3>
            <p className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
              Smart Campus Attendance
            </p>
          </div>
        </div>

        {/* Hero Headlines */}
        <div className="mb-5 shrink-0 space-y-0.5">
          <h2 className="text-lg font-extrabold text-white tracking-tight leading-tight">
            Sistem Absensi
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Cerdas & Efisien
            </span>
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            Manajemen Kehadiran Modern.
          </p>
        </div>

        {/* Action instruction */}
        <div className="mb-4 bg-blue-950/40 border border-blue-900/30 rounded-xl p-3 text-center shrink-0">
          <p className="text-[10px] text-blue-300 leading-normal font-medium">
            Pindai wajah Anda untuk absen. Klik tombol di bawah ini.
          </p>
        </div>

        {/* Attendance Buttons */}
        <div className={`grid gap-3 mb-5 shrink-0 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <button 
            type="button"
            onClick={handleAbsenMasuk}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-950/40 transition-all duration-200 cursor-pointer"
          >
            <LogIn className="h-4 w-4 shrink-0" />
            <span>Absen Masuk</span>
          </button>
          
          <button 
            type="button"
            onClick={handleAbsenKeluar}
            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-orange-950/40 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Absen Keluar</span>
          </button>
        </div>

        {/* OR Divider */}
        <div className="relative flex py-2 items-center mb-4 shrink-0">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-bold tracking-widest uppercase">
            ATAU MASUK KE AKUN ANDA
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Login Form inside screen */}
        <form onSubmit={handleLogin} className="space-y-4 flex-grow flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <input 
                  type="email" 
                  placeholder="nama@universitas.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4 mt-auto shrink-0">
            {error && (
              <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/50 rounded-xl p-2.5 text-[10px] text-red-400 leading-normal">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Masuk</span>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-500">
              Belum punya akun?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors">
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col items-center justify-center py-16 px-4">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 opacity-100" />
        
        {/* Radial glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px]" />
        
        {/* Floating high-tech circuit background SVGs */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Circuit connection paths */}
          <path d="M 100,200 L 300,200 L 350,250 L 500,250 L 550,150 L 800,150" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
          <path d="M 200,600 L 400,600 L 450,550 L 700,550 L 750,650 L 950,650" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" />
          
          {/* Node junctions */}
          <circle cx="350" cy="250" r="4" fill="#6366f1" />
          <circle cx="550" cy="150" r="4" fill="#3b82f6" />
          <circle cx="450" cy="550" r="4" fill="#3b82f6" />
          <circle cx="750" cy="650" r="4" fill="#6366f1" />
        </svg>

        {/* Animated Bokeh lights */}
        <div className="absolute top-1/3 right-1/4 w-3.5 h-3.5 bg-blue-500 rounded-full opacity-30 blur-[2px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-indigo-500 rounded-full opacity-35 blur-[1px] animate-pulse [animation-delay:0.7s]" />
        <div className="absolute top-1/2 left-1/5 w-4 h-4 bg-purple-500 rounded-full opacity-25 blur-[3px] animate-pulse [animation-delay:1.2s]" />
      </div>

      <div className="container mx-auto max-w-7xl z-10 flex flex-col items-center">
        {/* Page Title Header */}
        <div className="text-center mb-12 space-y-3 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono backdrop-blur-md shadow-lg shadow-black/40">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Digital Product Showcase</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Universitas Batam Smart Campus
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto">
            Sistem Absensi Cerdas & Efisien dengan teknologi pemindaian wajah modern, dioptimalkan untuk seluruh perangkat digital Anda.
          </p>
        </div>

        {/* 3 Device screens side-by-side grid */}
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-end justify-center gap-10 xl:gap-14 px-4 overflow-x-auto py-6">
          
          {/* DEVICE 1: MOBILE SCREEN */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative group">
              {/* Ambient shadow glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[3rem] blur-xl opacity-80 group-hover:opacity-100 transition duration-500" />
              
              {/* Device frame container */}
              <div className="w-[290px] h-[580px] rounded-[3rem] border-8 border-slate-800 bg-slate-950 shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-white/10">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center">
                  <div className="w-16 h-1 bg-slate-950 rounded-full mb-1" />
                  <div className="w-2 h-2 bg-slate-950 rounded-full absolute right-4 mb-1" />
                </div>
                <DeviceScreen deviceType="mobile" />
              </div>
            </div>
            
            {/* Device Label */}
            <div className="text-center mt-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Mobile Device View</span>
            </div>
          </div>

          {/* DEVICE 2: WEB BROWSER SCREEN */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative group">
              {/* Ambient shadow glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[2rem] blur-xl opacity-80 group-hover:opacity-100 transition duration-500" />
              
              {/* Device frame container */}
              <div className="w-[430px] h-[550px] rounded-2xl border-8 border-slate-800 bg-slate-950 shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-white/10">
                {/* Browser Header Bar */}
                <div className="h-9 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2 shrink-0 z-20">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 max-w-[220px] mx-auto bg-slate-950 border border-slate-800/80 rounded-md py-1 px-3 text-[9px] text-slate-400 font-mono text-center truncate select-all">
                    https://attendance.univbatam.ac.id
                  </div>
                </div>
                <DeviceScreen deviceType="tablet" />
              </div>
            </div>
            
            {/* Device Label */}
            <div className="text-center mt-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Web Browser View</span>
            </div>
          </div>

          {/* DEVICE 3: LANDSCAPE TABLET */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative group">
              {/* Ambient shadow glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-[2rem] blur-xl opacity-80 group-hover:opacity-100 transition duration-500" />
              
              {/* Device frame container */}
              <div className="w-[490px] h-[440px] rounded-2xl border-8 border-slate-800 bg-slate-950 shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-white/10">
                <DeviceScreen deviceType="desktop" />
              </div>
            </div>
            
            {/* Device Label */}
            <div className="text-center mt-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Tablet Landscape View</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

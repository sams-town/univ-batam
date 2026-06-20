'use client'

import { Fingerprint, Zap, Activity, ClipboardList, LogOut, CreditCard, Lock, ActivitySquare, MonitorPlay, Wifi, Clock, FileText, Stethoscope, Briefcase, CalendarClock, Send, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EmployeeMenuPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("user_role")
    window.location.href = "/login"
  }

  const menuItems = [
    { id: 'absensi', title: 'ABSENSI', icon: Fingerprint, color: 'text-blue-500', href: '/dashboard/attendance' },
    { id: 'kartu-pegawai', title: 'KARTU PEGAWAI', icon: CreditCard, color: 'text-slate-500', href: '/dashboard/employee' },
    { id: 'cuti-izin', title: 'CUTI & IZIN', icon: Wifi, color: 'text-blue-500', href: '/dashboard/employee' },
    { id: 'dinas-luar', title: 'DINAS LUAR', icon: Briefcase, color: 'text-orange-500', href: '/dashboard/employee' },
    { id: 'lembur', title: 'LEMBUR', icon: Zap, color: 'text-yellow-500', href: '/dashboard/employee' },
    { id: 'change-password', title: 'CHANGE PASSWORD', icon: Lock, color: 'text-blue-500', href: '/dashboard/profile' },
    { id: 'history-absen', title: 'HISTORY ABSEN', icon: Clock, color: 'text-purple-500', href: '/dashboard/employee' },
    { id: 'history-dinas', title: 'HISTORY DINAS', icon: CalendarClock, color: 'text-red-400', href: '/dashboard/employee' },
    { id: 'history-lembur', title: 'HISTORY LEMBUR', icon: Activity, color: 'text-orange-500', href: '/dashboard/employee' },
    { id: 'e-kinerja', title: 'E-KINERJA', icon: ActivitySquare, color: 'text-emerald-500', href: '/dashboard/employee' },
    { id: 'pengajuan-absensi', title: 'PENGAJUAN ABSENSI', icon: FileText, color: 'text-blue-500', href: '/dashboard/employee' },
    { id: 'kunjungan', title: 'KUNJUNGAN', icon: Send, color: 'text-yellow-500', href: '/dashboard/employee' },
    { id: 'penugasan', title: 'PENUGASAN', icon: ClipboardList, color: 'text-purple-500', href: '/dashboard/employee' },
    { id: 'rapat-kerja', title: 'RAPAT KERJA', icon: MonitorPlay, color: 'text-red-500', href: '/dashboard/employee' },
    { id: 'visit-dokter', title: 'VISIT DOKTER', icon: Stethoscope, color: 'text-blue-500', href: '/dashboard/employee' },
    { id: 'profile', title: 'PROFILE', icon: User, color: 'text-pink-500', href: '/dashboard/profile' },
    { id: 'logout', title: 'LOGOUT', icon: LogOut, color: 'text-red-600', onClick: handleLogout },
  ]

  return (
    <div className="bg-[#f5f7fe] min-h-screen font-sans pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6b34ff] to-[#804dfa] px-6 py-6 text-white shadow-md">
        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Navigasi</p>
        <p className="text-xl font-extrabold tracking-tight">Semua Menu</p>
      </div>

      {/* Grid Menu */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            
            const content = (
              <>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-slate-100">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="text-[8px] font-extrabold text-slate-500 text-center uppercase tracking-wide leading-tight">
                  {item.title}
                </p>
              </>
            )

            if (item.onClick) {
              return (
                <button 
                  key={item.id} 
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-start group hover:scale-105 transition-transform"
                >
                  {content}
                </button>
              )
            }

            return (
              <Link 
                key={item.id} 
                href={item.href || '#'} 
                className="flex flex-col items-center justify-start group hover:scale-105 transition-transform"
              >
                {content}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Fingerprint, CalendarDays, FileText, Clock, Users, BookOpen, PlusCircle, Wallet, Car, MapPin } from 'lucide-react'

type Role = 'mahasiswa' | 'dosen' | 'employee' | 'karyawan'

interface QuickLink {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  href: string
}

interface DashboardQuickLinksProps {
  role: Role
}

export default function DashboardQuickLinks({ role }: DashboardQuickLinksProps) {
  const mahasiswaLinks: QuickLink[] = [
    { id: 'attendance', title: 'Absensi (Token)', icon: Fingerprint, color: 'from-indigo-500 to-indigo-600', href: '/dashboard/attendance' },
    { id: 'krs', title: 'Rencana Studi', icon: BookOpen, color: 'from-cyan-500 to-cyan-600', href: '/dashboard/student' },
    { id: 'khs', title: 'KHS/Nilai', icon: FileText, color: 'from-emerald-500 to-emerald-600', href: '/dashboard/reports' },
    { id: 'leave', title: 'Pengajuan Cuti', icon: CalendarDays, color: 'from-amber-500 to-amber-600', href: '/dashboard/student' },
  ]

  const dosenLinks: QuickLink[] = [
    { id: 'open-attendance', title: 'Buka Absen (Token)', icon: Fingerprint, color: 'from-purple-500 to-purple-600', href: '/dashboard/attendance' },
    { id: 'krs-approval', title: 'Perwalian KRS', icon: Users, color: 'from-blue-500 to-blue-600', href: '/dashboard/lecturer' },
    { id: 'input-grade', title: 'Input Nilai', icon: FileText, color: 'from-emerald-500 to-emerald-600', href: '/dashboard/lecturer' },
    { id: 'leave-dinas', title: 'Pengajuan Cuti/Dinas', icon: CalendarDays, color: 'from-orange-500 to-orange-600', href: '/dashboard/lecturer' },
  ]

  const employeeLinks: QuickLink[] = [
    { id: 'attendance-face', title: 'Absensi (Wajah)', icon: Fingerprint, color: 'from-indigo-500 to-indigo-600', href: '/dashboard/attendance' },
    { id: 'dinas', title: 'Dinas Luar', icon: Car, color: 'from-cyan-500 to-cyan-600', href: '/dashboard/employee' },
    { id: 'lembur', title: 'Lembur', icon: Clock, color: 'from-amber-500 to-amber-600', href: '/dashboard/employee' },
    { id: 'payroll', title: 'Payroll', icon: Wallet, color: 'from-emerald-500 to-emerald-600', href: '/dashboard/employee' },
    { id: 'kasbon', title: 'Kasbon', icon: MapPin, color: 'from-pink-500 to-pink-600', href: '/dashboard/employee' },
  ]

  const links = role === 'mahasiswa' ? mahasiswaLinks : role === 'dosen' ? dosenLinks : employeeLinks

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Layanan Cepat</h3>
        <button className="text-sm text-indigo-600 font-semibold">Semua →</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <a
              key={link.id}
              href={link.href}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center">{link.title}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

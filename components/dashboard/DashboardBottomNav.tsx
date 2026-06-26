'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, User, Fingerprint, BookOpen } from 'lucide-react'

type Role = 'mahasiswa' | 'dosen' | 'employee' | 'karyawan'

interface DashboardBottomNavProps {
  role: Role
  onFabClick?: () => void
}

const navConfig: Record<string, { icon: typeof Home; label: string; href: string }[]> = {
  dosen: [
    { icon: Home, label: 'Home', href: '/dashboard/lecturer' },
    { icon: BookOpen, label: 'Akademik', href: '/dashboard/attendance' },
    { icon: User, label: 'Profil', href: '/dashboard/profile' },
  ],
  mahasiswa: [
    { icon: Home, label: 'Home', href: '/dashboard/student' },
    { icon: BookOpen, label: 'Akademik', href: '/dashboard/attendance' },
    { icon: User, label: 'Profil', href: '/dashboard/profile' },
  ],
  employee: [
    { icon: Home, label: 'Home', href: '/dashboard/employee' },
    { icon: BookOpen, label: 'Akademik', href: '/dashboard/attendance' },
    { icon: User, label: 'Profil', href: '/dashboard/profile' },
  ],
  karyawan: [
    { icon: Home, label: 'Home', href: '/dashboard/employee' },
    { icon: BookOpen, label: 'Akademik', href: '/dashboard/attendance' },
    { icon: User, label: 'Profil', href: '/dashboard/profile' },
  ],
}

export default function DashboardBottomNav({ role, onFabClick }: DashboardBottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const items = navConfig[role] || navConfig['employee']

  const handleNav = (href: string) => {
    router.push(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
      <div className="relative grid grid-cols-5 h-20 max-w-lg mx-auto items-center justify-items-center">
        {/* Slot 1: Home */}
        <button
          onClick={() => handleNav(items[0].href)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            pathname === items[0].href ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-[10px] font-semibold">{items[0].label}</span>
        </button>

        {/* Slot 2: Akademik */}
        <button
          onClick={() => handleNav(items[1].href)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            pathname === items[1].href ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="h-6 w-6" />
          <span className="text-[10px] font-semibold">{items[1].label}</span>
        </button>

        {/* Slot 3: Spacer for Floating FAB */}
        <div className="w-16 h-10" />

        {/* Slot 4: Symmetric Empty Spacer */}
        <div className="w-10 h-10" />

        {/* Slot 5: Profil */}
        <button
          onClick={() => handleNav(items[2].href)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            pathname === items[2].href ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-[10px] font-semibold">{items[2].label}</span>
        </button>

        {/* Center Floating FAB */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <button
            onClick={() => {
              if (onFabClick) {
                onFabClick()
              } else {
                router.push(`/dashboard/${role === 'karyawan' ? 'employee' : role === 'dosen' ? 'lecturer' : 'student'}`)
              }
            }}
            className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white active:scale-95 transition-transform"
          >
            <Fingerprint className="h-8 w-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

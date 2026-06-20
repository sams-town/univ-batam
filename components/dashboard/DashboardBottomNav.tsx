'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Clock, User, Fingerprint, Briefcase, BookOpen, LogOut } from 'lucide-react'

type Role = 'mahasiswa' | 'dosen' | 'employee' | 'karyawan'

interface DashboardBottomNavProps {
  role: Role
  onFabClick?: () => void
}

const navConfig: Record<string, { icon: typeof Home; label: string; href: string }[]> = {
  dosen: [
    { icon: Home, label: 'Home', href: '/dashboard/lecturer' },
    { icon: BookOpen, label: 'Akademik', href: '/dashboard/attendance' },
    // FAB center placeholder
    { icon: User, label: 'Profil', href: '/dashboard/profile' },
    { icon: LogOut, label: 'Log out', href: '/auth/login' },
  ],
  mahasiswa: [
    { icon: Home, label: 'Home', href: '/dashboard/student' },
    { icon: BookOpen, label: 'Akademik', href: '/dashboard/attendance' },
    // FAB center placeholder
    { icon: User, label: 'Profil', href: '/dashboard/profile' },
    { icon: LogOut, label: 'Log out', href: '/auth/login' },
  ],
  employee: [
    { icon: Home, label: 'Home', href: '/dashboard/employee' },
    { icon: BookOpen, label: 'Akademik', href: '/dashboard/attendance' },
    // FAB center placeholder
    { icon: User, label: 'Profil', href: '/dashboard/profile' },
    { icon: LogOut, label: 'Log out', href: '/auth/login' },
  ],
  karyawan: [
    { icon: Home, label: 'Home', href: '/dashboard/employee' },
    { icon: BookOpen, label: 'Akademik', href: '/dashboard/attendance' },
    // FAB center placeholder
    { icon: User, label: 'Profil', href: '/dashboard/profile' },
    { icon: LogOut, label: 'Log out', href: '/auth/login' },
  ],
}

export default function DashboardBottomNav({ role, onFabClick }: DashboardBottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const items = navConfig[role] || navConfig['employee']

  // Split into left 2 and right 2 items around the FAB
  const leftItems = items.slice(0, 2)
  const rightItems = items.slice(2, 4)

  const handleNav = (href: string) => {
    if (href === '/auth/login') {
      const userRole = localStorage.getItem('user_role') || 'default'
      localStorage.removeItem(`lastAttendancePhoto_${userRole}`)
      localStorage.removeItem('user_role')
    }
    router.push(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
      <div className="relative flex items-center justify-around h-20 max-w-lg mx-auto">
        {/* Left nav items */}
        {leftItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          )
        })}

        {/* Center FAB */}
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

        {/* Spacer for FAB */}
        <div className="w-16" />

        {/* Right nav items */}
        {rightItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

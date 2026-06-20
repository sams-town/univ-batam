'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import DashboardBottomNav from '@/components/dashboard/DashboardBottomNav'
import Sidebar from '@/components/layout/Sidebar'

export default function AttendanceLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setUserRole(localStorage.getItem('user_role'))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Loading system...</p>
        </div>
      </div>
    )
  }

  const isMobileRole = userRole && ['mahasiswa', 'dosen', 'employee', 'karyawan'].includes(userRole)

  return (
    <main className="bg-slate-50 min-h-screen pb-24">
      {children}
      {isMobileRole && <DashboardBottomNav role={userRole as any} />}
    </main>
  )
}

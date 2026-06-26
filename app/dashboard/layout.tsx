'use client'

import { useEffect, useState } from 'react'
import DashboardBottomNav from '@/components/dashboard/DashboardBottomNav'

// Root dashboard layout - no role-specific UI here!
// Only global context providers and basic structure
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    setUserRole(localStorage.getItem('user_role'))
  }, [])

  const isMobileRole = userRole && ['mahasiswa', 'dosen', 'employee', 'karyawan', 'pegawai'].includes(userRole)

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`flex-1 ${isMobileRole ? 'pb-24 md:pb-0' : ''}`}>
        {children}
      </div>
      {isMobileRole && <DashboardBottomNav role={userRole as any} />}
    </div>
  )
}

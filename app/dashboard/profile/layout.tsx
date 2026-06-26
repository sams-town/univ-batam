'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/layout/Sidebar'

export default function ProfileLayout({
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
          <p className="text-slate-600 text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  const isMobileRole = userRole && ['mahasiswa', 'dosen', 'employee', 'karyawan', 'pegawai'].includes(userRole)

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {!isMobileRole && <Sidebar />}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}

'use client'

import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/layout/Sidebar'

export default function SchedulesLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Loading schedules...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      {children}
    </main>
  )
}

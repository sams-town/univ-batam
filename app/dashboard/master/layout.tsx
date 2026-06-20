'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/layout/Sidebar'

const masterMenuItems = [
  { title: 'Fakultas', href: '/dashboard/master/faculties' },
  { title: 'Jurusan', href: '/dashboard/master/departments' },
  { title: 'Program Studi', href: '/dashboard/master/programs' },
  { title: 'Tahun Ajaran', href: '/dashboard/master/academic-years' },
  { title: 'Semester', href: '/dashboard/master/semesters' },
  { title: 'Ruang Kelas', href: '/dashboard/master/classrooms' },
  { title: 'Mata Kuliah', href: '/dashboard/master/courses' },
  { title: 'Dosen', href: '/dashboard/master/lecturers' },
  { title: 'Mahasiswa', href: '/dashboard/master/students' }
]

export default function MasterLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { loading } = useAuth()
  
  const activeTab = masterMenuItems.find(item => pathname.startsWith(item.href))?.href || masterMenuItems[0].href

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Loading master data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-slate-50 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Master Data</h1>
            <Tabs defaultValue={activeTab} className="w-full">
              <TabsList className="w-full flex overflow-x-auto">
                {masterMenuItems.map((item) => (
                  <Link key={item.href} href={item.href} className="shrink-0">
                    <TabsTrigger value={item.href}>{item.title}</TabsTrigger>
                  </Link>
                ))}
              </TabsList>
            </Tabs>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

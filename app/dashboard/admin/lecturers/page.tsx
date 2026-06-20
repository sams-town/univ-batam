'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Users } from 'lucide-react'

type Lecturer = {
  id: string
  nip: string
  department: { name: string; code: string }
  profile: { 
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

export default function AdminLecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loading, setLoading] = useState(true)

  async function loadLecturers() {
    const { data } = await supabase
      .from('lecturers')
      .select('*, department:departments(name, code), profile:profiles(first_name, last_name, email, phone)')
      .order('id')
    
    setLecturers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadLecturers()
  }, [])

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Kelola Dosen</h1>
          <p className="text-slate-500 mt-1">Kelola data dosen, tambah, edit, dan hapus akun</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Dosen Baru
        </Button>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Users className="h-5 w-5 text-purple-500" />
            Daftar Dosen
          </CardTitle>
          <CardDescription className="text-slate-500">Data seluruh dosen terdaftar di sistem</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">NIP</TableHead>
                <TableHead className="text-slate-600 font-medium">Nama</TableHead>
                <TableHead className="text-slate-600 font-medium">Departemen</TableHead>
                <TableHead className="text-slate-600 font-medium">Email</TableHead>
                <TableHead className="text-slate-600 font-medium">Telepon</TableHead>
                <TableHead className="text-slate-600 font-medium w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lecturers.length > 0 ? (
                lecturers.map((lecturer) => (
                  <TableRow key={lecturer.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium">{lecturer.nip}</TableCell>
                    <TableCell>
                      {lecturer.profile?.first_name} {lecturer.profile?.last_name}
                    </TableCell>
                    <TableCell>
                      {lecturer.department?.code} - {lecturer.department?.name}
                    </TableCell>
                    <TableCell>{lecturer.profile?.email}</TableCell>
                    <TableCell>{lecturer.profile?.phone || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    Belum ada data dosen
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
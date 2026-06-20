'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Users } from 'lucide-react'

type Student = {
  id: string
  nim: string
  semester?: number
  enrollment_year?: number
  program: { name: string; code: string }
  profile: { 
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

const dummyStudentsData: Student[] = [
  {
    id: '1',
    nim: '2210511001',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Teknik Informatika', code: 'TI-S1' },
    profile: { first_name: 'Ahmad', last_name: 'Rizky Pratama', email: 'ahmad.rizky@unbat.com', phone: '081211112222' },
  },
  {
    id: '2',
    nim: '2210511002',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Teknik Informatika', code: 'TI-S1' },
    profile: { first_name: 'Siti', last_name: 'Aminah', email: 'siti.aminah@unbat.com', phone: '081233334444' },
  },
  {
    id: '3',
    nim: '2210512001',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Pendidikan Dokter', code: 'PD-S1' },
    profile: { first_name: 'Budi', last_name: 'Santoso', email: 'budi.santoso@unbat.com', phone: '081255556666' },
  },
  {
    id: '4',
    nim: '2210512002',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Pendidikan Dokter', code: 'PD-S1' },
    profile: { first_name: 'Diana', last_name: 'Putri', email: 'diana.putri@unbat.com', phone: '081277778888' },
  },
  {
    id: '5',
    nim: '2210513001',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Ilmu Hukum', code: 'IH-S1' },
    profile: { first_name: 'Endi', last_name: 'Suhendra', email: 'endi.suhendra@unbat.com', phone: '081299990000' },
  },
  {
    id: '6',
    nim: '2210513002',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Ilmu Hukum', code: 'IH-S1' },
    profile: { first_name: 'Fitri', last_name: 'Handayani', email: 'fitri.handayani@unbat.com', phone: '085611112222' },
  },
  {
    id: '7',
    nim: '2210514001',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Manajemen', code: 'MAN-S1' },
    profile: { first_name: 'Heru', last_name: 'Budiman', email: 'heru.budiman@unbat.com', phone: '085633334444' },
  },
  {
    id: '8',
    nim: '2210514002',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Manajemen', code: 'MAN-S1' },
    profile: { first_name: 'Markonah', last_name: 'Sari', email: 'markonah.sari@unbat.com', phone: '081222223333' },
  },
  {
    id: '9',
    nim: '2210515001',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Kesehatan Masyarakat', code: 'KM-S1' },
    profile: { first_name: 'Natsir', last_name: 'Udin', email: 'natsir.udin@unbat.com', phone: '081244445555' },
  },
  {
    id: '10',
    nim: '2210515002',
    semester: 6,
    enrollment_year: 2022,
    program: { name: 'S1 Kesehatan Masyarakat', code: 'KM-S1' },
    profile: { first_name: 'Rio', last_name: 'Dewanto', email: 'rio.dewanto@unbat.com', phone: '081266667777' },
  }
]

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  async function loadStudents() {
    const { data } = await supabase
      .from('students')
      .select('*, program:programs(name, code), profile:profiles(first_name, last_name, email, phone)')
      .order('id')
    
    // Use dummy data if no students found in database
    setStudents(data && data.length > 0 ? data : dummyStudentsData)
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()
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
          <h1 className="text-3xl font-extrabold text-slate-900">Kelola Mahasiswa</h1>
          <p className="text-slate-500 mt-1">Kelola data mahasiswa, tambah, edit, dan hapus akun</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Mahasiswa Baru
        </Button>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Users className="h-5 w-5 text-blue-500" />
            Daftar Mahasiswa
          </CardTitle>
          <CardDescription className="text-slate-500">Data seluruh mahasiswa terdaftar di sistem</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">NIM</TableHead>
                <TableHead className="text-slate-600 font-medium">Nama</TableHead>
                <TableHead className="text-slate-600 font-medium">Program Studi</TableHead>
                <TableHead className="text-slate-600 font-medium">Semester</TableHead>
                <TableHead className="text-slate-600 font-medium">Email</TableHead>
                <TableHead className="text-slate-600 font-medium">Telepon</TableHead>
                <TableHead className="text-slate-600 font-medium w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium">{student.nim}</TableCell>
                    <TableCell>
                      {student.profile?.first_name} {student.profile?.last_name}
                    </TableCell>
                    <TableCell>
                      {student.program?.code} - {student.program?.name}
                    </TableCell>
                    <TableCell>{student.semester || '-'}</TableCell>
                    <TableCell>{student.profile?.email}</TableCell>
                    <TableCell>{student.profile?.phone || '-'}</TableCell>
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
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                    Belum ada data mahasiswa
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
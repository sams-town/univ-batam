'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, User } from 'lucide-react'

type KinerjaPegawai = {
  id: string
  nama: string
  nip: string
  jabatan: string
  periode: string
  nilai: number
  status: string
}

const dummyKinerjaPegawai: KinerjaPegawai[] = [
  {
    id: '1',
    nama: 'Siti Aminah',
    nip: '198501012010012001',
    jabatan: 'Staff Administrasi',
    periode: 'Semester 1 2024',
    nilai: 90,
    status: 'Baik'
  },
  {
    id: '2',
    nama: 'Budi Santoso',
    nip: '198005052005051002',
    jabatan: 'Staff Keuangan',
    periode: 'Semester 1 2024',
    nilai: 85,
    status: 'Baik'
  }
]

export default function KinerjaPegawaiPage() {
  const [data, setData] = useState<KinerjaPegawai[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(dummyKinerjaPegawai)
    setLoading(false)
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
          <h1 className="text-3xl font-extrabold text-slate-900">Kinerja Pegawai</h1>
          <p className="text-slate-500 mt-1">Kelola dan lihat kinerja pegawai</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Penilaian Kinerja
        </Button>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <User className="h-5 w-5 text-blue-500" />
            Daftar Kinerja Pegawai
          </CardTitle>
          <CardDescription className="text-slate-500">Lihat dan kelola kinerja pegawai</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Nama</TableHead>
                <TableHead className="text-slate-600 font-medium">NIP</TableHead>
                <TableHead className="text-slate-600 font-medium">Jabatan</TableHead>
                <TableHead className="text-slate-600 font-medium">Periode</TableHead>
                <TableHead className="text-slate-600 font-medium">Nilai</TableHead>
                <TableHead className="text-slate-600 font-medium">Status</TableHead>
                <TableHead className="text-slate-600 font-medium w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.nip}</TableCell>
                    <TableCell>{item.jabatan}</TableCell>
                    <TableCell>{item.periode}</TableCell>
                    <TableCell>{item.nilai}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Sangat Baik' ? 'bg-green-100 text-green-700' : item.status === 'Baik' ? 'bg-blue-100 text-blue-700' : item.status === 'Cukup' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {item.status}
                      </span>
                    </TableCell>
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
                    Belum ada data
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

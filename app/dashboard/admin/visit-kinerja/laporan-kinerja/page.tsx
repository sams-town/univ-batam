'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, BarChart3 } from 'lucide-react'

type LaporanKinerja = {
  id: string
  nama: string
  jabatan: string
  jenis_kinerja: string
  periode: string
  nilai: number
  status: string
}

const dummyLaporanKinerja: LaporanKinerja[] = [
  {
    id: '1',
    nama: 'Dr. Budi Santoso',
    jabatan: 'Dosen',
    jenis_kinerja: 'Kinerja Akademik',
    periode: 'Semester 1 2024',
    nilai: 85,
    status: 'Disetujui'
  },
  {
    id: '2',
    nama: 'Siti Aminah',
    jabatan: 'Pegawai',
    jenis_kinerja: 'Kinerja Administratif',
    periode: 'Semester 1 2024',
    nilai: 90,
    status: 'Disetujui'
  }
]

export default function LaporanKinerjaPage() {
  const [data, setData] = useState<LaporanKinerja[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(dummyLaporanKinerja)
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
          <h1 className="text-3xl font-extrabold text-slate-900">Laporan Kinerja</h1>
          <p className="text-slate-500 mt-1">Kelola laporan kinerja pegawai dan dosen</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Laporan Kinerja
        </Button>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Daftar Laporan Kinerja
          </CardTitle>
          <CardDescription className="text-slate-500">Lihat dan kelola laporan kinerja</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Nama</TableHead>
                <TableHead className="text-slate-600 font-medium">Jabatan</TableHead>
                <TableHead className="text-slate-600 font-medium">Jenis Kinerja</TableHead>
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
                    <TableCell>{item.jabatan}</TableCell>
                    <TableCell>{item.jenis_kinerja}</TableCell>
                    <TableCell>{item.periode}</TableCell>
                    <TableCell>{item.nilai}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Disetujui' ? 'bg-green-100 text-green-700' : item.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
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

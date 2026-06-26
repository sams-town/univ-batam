'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, FileText } from 'lucide-react'

type LaporanKerja = {
  id: string
  nama: string
  jabatan: string
  judul: string
  tanggal: string
  status: string
}

const dummyLaporanKerja: LaporanKerja[] = [
  {
    id: '1',
    nama: 'Dr. Budi Santoso',
    jabatan: 'Dosen',
    judul: 'Laporan Kegiatan Mingguan',
    tanggal: '2024-01-22',
    status: 'Disetujui'
  },
  {
    id: '2',
    nama: 'Siti Aminah',
    jabatan: 'Pegawai',
    judul: 'Laporan Keuangan Bulanan',
    tanggal: '2024-01-25',
    status: 'Menunggu'
  }
]

export default function LaporanKerjaPage() {
  const [data, setData] = useState<LaporanKerja[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(dummyLaporanKerja)
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
          <h1 className="text-3xl font-extrabold text-slate-900">Laporan Kerja</h1>
          <p className="text-slate-500 mt-1">Kelola dan lihat laporan kerja pegawai dan dosen</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Laporan Kerja
        </Button>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="h-5 w-5 text-blue-500" />
            Daftar Laporan Kerja
          </CardTitle>
          <CardDescription className="text-slate-500">Lihat dan kelola laporan kerja</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Nama</TableHead>
                <TableHead className="text-slate-600 font-medium">Jabatan</TableHead>
                <TableHead className="text-slate-600 font-medium">Judul</TableHead>
                <TableHead className="text-slate-600 font-medium">Tanggal</TableHead>
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
                    <TableCell>{item.judul}</TableCell>
                    <TableCell>{item.tanggal}</TableCell>
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
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
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

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Shield } from 'lucide-react'

type Patroli = {
  id: string
  petugas: string
  lokasi: string
  waktu_mulai: string
  waktu_selesai: string
  status: string
  keterangan?: string
}

const dummyPatroli: Patroli[] = [
  {
    id: '1',
    petugas: 'John Doe',
    lokasi: 'Gedung A',
    waktu_mulai: '2024-01-01 08:00',
    waktu_selesai: '2024-01-01 10:00',
    status: 'Selesai',
    keterangan: 'Patroli normal'
  },
  {
    id: '2',
    petugas: 'Jane Smith',
    lokasi: 'Gedung B',
    waktu_mulai: '2024-01-01 10:00',
    waktu_selesai: '2024-01-01 12:00',
    status: 'Selesai',
    keterangan: 'Patroli normal'
  },
  {
    id: '3',
    petugas: 'Bob Johnson',
    lokasi: 'Lapangan Olahraga',
    waktu_mulai: '2024-01-02 08:00',
    waktu_selesai: '2024-01-02 10:00',
    status: 'Selesai',
    keterangan: 'Temukan barang hilang'
  }
]

export default function PatroliSecurityPage() {
  const [data, setData] = useState<Patroli[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(dummyPatroli)
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
          <h1 className="text-3xl font-extrabold text-slate-900">Patroli Petugas Security</h1>
          <p className="text-slate-500 mt-1">Kelola laporan patroli security</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Laporan Patroli
        </Button>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Shield className="h-5 w-5 text-blue-500" />
            Daftar Patroli
          </CardTitle>
          <CardDescription className="text-slate-500">Lihat dan kelola laporan patroli security</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Petugas</TableHead>
                <TableHead className="text-slate-600 font-medium">Lokasi</TableHead>
                <TableHead className="text-slate-600 font-medium">Waktu Mulai</TableHead>
                <TableHead className="text-slate-600 font-medium">Waktu Selesai</TableHead>
                <TableHead className="text-slate-600 font-medium">Status</TableHead>
                <TableHead className="text-slate-600 font-medium">Keterangan</TableHead>
                <TableHead className="text-slate-600 font-medium w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium">{item.petugas}</TableCell>
                    <TableCell>{item.lokasi}</TableCell>
                    <TableCell>{item.waktu_mulai}</TableCell>
                    <TableCell>{item.waktu_selesai}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>{item.keterangan || '-'}</TableCell>
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

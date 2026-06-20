'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, ShieldAlert, Search, Trash2, CheckCircle } from 'lucide-react'

type ViolationRecord = {
  id: string
  nim: string
  studentName: string
  program: string
  violationType: string
  category: 'Minor' | 'Moderate' | 'Major'
  date: string
  status: 'Open' | 'Resolved'
}

const mockViolations: ViolationRecord[] = [
  { id: '1', nim: '2210511001', studentName: 'Diana Putri', program: 'S1 Teknik Informatika', violationType: 'Ketidakhadiran berturut-turut tanpa izin > 3x', category: 'Moderate', date: '2026-06-19', status: 'Open' },
  { id: '2', nim: '2210511002', studentName: 'Endi Suhendra', program: 'S1 Teknik Informatika', violationType: 'Terlambat masuk kelas > 5 kali semester ini', category: 'Minor', date: '2026-06-20', status: 'Open' },
  { id: '3', nim: '2210512001', studentName: 'Natsir Udin', program: 'S1 Sistem Informasi', violationType: 'Manipulasi data kehadiran (titip absen/token)', category: 'Major', date: '2026-06-18', status: 'Open' },
  { id: '4', nim: '2210512002', studentName: 'Rio Dewanto', program: 'S1 Sistem Informasi', violationType: 'Keterlambatan kuliah berulang', category: 'Minor', date: '2026-06-15', status: 'Resolved' },
  { id: '5', nim: '2210511005', studentName: 'Markonah', program: 'S1 Teknik Informatika', violationType: 'Ketidakhadiran tanpa keterangan > 5x', category: 'Moderate', date: '2026-06-14', status: 'Resolved' }
]

export default function ViolationsPage() {
  const [violations, setViolations] = useState<ViolationRecord[]>(mockViolations)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'Minor' | 'Moderate' | 'Major'>('all')

  const handleResolve = (id: string) => {
    setViolations(prev => 
      prev.map(v => v.id === id ? { ...v, status: 'Resolved' } : v)
    )
  }

  const handleDelete = (id: string) => {
    setViolations(prev => prev.filter(v => v.id !== id))
  }

  const filteredViolations = violations.filter(v => {
    const matchesSearch = v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.nim.includes(searchQuery) ||
                          v.violationType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || v.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: violations.length,
    open: violations.filter(v => v.status === 'Open').length,
    resolved: violations.filter(v => v.status === 'Resolved').length,
    major: violations.filter(v => v.category === 'Major').length
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Pelanggaran Akademik</h1>
          <p className="text-slate-500 mt-1">Pantau dan kelola pelanggaran disiplin kehadiran mahasiswa</p>
        </div>
        <Button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold">
          <Plus className="h-4 w-4" />
          Catat Pelanggaran Baru
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Pelanggaran</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Belum Selesai (Open)</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.open}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Terselesaikan</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.resolved}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Pelanggaran Berat</p>
              <p className="text-3xl font-extrabold text-rose-600 mt-1">{stats.major}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main card */}
      <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            Daftar Kasus Pelanggaran Kehadiran
          </CardTitle>
          <CardDescription>Pencatatan sanksi dan tindakan disiplin kehadiran</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama mahasiswa, NIM, atau sanksi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'Minor', 'Moderate', 'Major'] as const).map(category => (
                <Button
                  key={category}
                  variant={filterCategory === category ? 'default' : 'outline'}
                  onClick={() => setFilterCategory(category)}
                  className="font-semibold"
                >
                  {category === 'all' ? 'Semua Tingkat' : category}
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold text-slate-600">NIM</TableHead>
                  <TableHead className="font-semibold text-slate-600">Nama</TableHead>
                  <TableHead className="font-semibold text-slate-600">Program Studi</TableHead>
                  <TableHead className="font-semibold text-slate-600">Deskripsi Pelanggaran</TableHead>
                  <TableHead className="font-semibold text-slate-600">Kategori</TableHead>
                  <TableHead className="font-semibold text-slate-600">Tanggal Catat</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 w-32 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.length > 0 ? (
                  filteredViolations.map((v) => (
                    <TableRow key={v.id} className="border-slate-200 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{v.nim}</TableCell>
                      <TableCell className="font-bold text-slate-900">{v.studentName}</TableCell>
                      <TableCell className="text-slate-500 font-medium">{v.program}</TableCell>
                      <TableCell className="text-slate-700 text-sm max-w-xs">{v.violationType}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`font-bold ${
                            v.category === 'Major' ? 'bg-rose-500 text-white' :
                            v.category === 'Moderate' ? 'bg-orange-500 text-white' :
                            'bg-amber-400 text-slate-900'
                          }`}
                        >
                          {v.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 font-medium">{v.date}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`font-bold ${
                            v.status === 'Resolved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {v.status === 'Resolved' ? 'Selesai' : 'Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {v.status === 'Open' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve(v.id)}
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-8 px-2.5 font-bold"
                            >
                              Selesaikan
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(v.id)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                      Tidak ada catatan pelanggaran yang sesuai filter
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

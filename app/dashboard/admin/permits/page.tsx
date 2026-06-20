'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, CheckCircle2, XCircle, Clock, Search, ShieldCheck } from 'lucide-react'

type PermitRequest = {
  id: string
  name: string
  role: 'Mahasiswa' | 'Dosen'
  type: string
  date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

const mockPermits: PermitRequest[] = [
  { id: '1', name: 'Ahmad Rizky Pratama', role: 'Mahasiswa', type: 'Sakit', date: '2026-06-20', reason: 'Mengalami demam tinggi dan flu berat', status: 'pending' },
  { id: '2', name: 'Siti Nurhaliza', role: 'Mahasiswa', type: 'Izin Keluarga', date: '2026-06-20', reason: 'Menghadiri pernikahan kakak kandung', status: 'pending' },
  { id: '3', name: 'Dr. Budi Santoso', role: 'Dosen', type: 'Dinas Luar', date: '2026-06-21', reason: 'Menghadiri konferensi riset nasional', status: 'pending' },
  { id: '4', name: 'Rian Hidayat', role: 'Mahasiswa', type: 'Sakit', date: '2026-06-18', reason: 'Pemulihan pasca operasi gigi', status: 'approved' },
  { id: '5', name: 'Dr. Sri Wahyuni', role: 'Dosen', type: 'Izin Sakit', date: '2026-06-19', reason: 'Sakit tenggorokan dan kehilangan suara', status: 'approved' },
  { id: '6', name: 'Eka Saputra', role: 'Mahasiswa', type: 'Tanpa Keterangan', date: '2026-06-17', reason: 'Tidak menyerahkan surat dokter', status: 'rejected' }
]

export default function PermitsPage() {
  const [permits, setPermits] = useState<PermitRequest[]>(mockPermits)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setPermits(prev => 
      prev.map(p => p.id === id ? { ...p, status: action } : p)
    )
  }

  const filteredPermits = permits.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: permits.length,
    pending: permits.filter(p => p.status === 'pending').length,
    approved: permits.filter(p => p.status === 'approved').length,
    rejected: permits.filter(p => p.status === 'rejected').length
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Perizinan Absensi</h1>
          <p className="text-slate-500 mt-1">Review dan kelola persetujuan izin ketidakhadiran dosen dan mahasiswa</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Pengajuan</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Menunggu Approval</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Disetujui</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.approved}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Ditolak</p>
              <p className="text-3xl font-extrabold text-rose-600 mt-1">{stats.rejected}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control panel */}
      <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            Daftar Pengajuan Izin & Sakit
          </CardTitle>
          <CardDescription>Review surat izin ketidakhadiran civitas akademika</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama atau keterangan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className="capitalize font-semibold"
                >
                  {status === 'all' ? 'Semua' : status === 'pending' ? 'Pending' : status === 'approved' ? 'Disetujui' : 'Ditolak'}
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold text-slate-600">Nama</TableHead>
                  <TableHead className="font-semibold text-slate-600">Peran</TableHead>
                  <TableHead className="font-semibold text-slate-600">Kategori</TableHead>
                  <TableHead className="font-semibold text-slate-600">Tanggal Pengajuan</TableHead>
                  <TableHead className="font-semibold text-slate-600">Alasan & Dokumen</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 w-48 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermits.length > 0 ? (
                  filteredPermits.map((req) => (
                    <TableRow key={req.id} className="border-slate-200 hover:bg-slate-50/50">
                      <TableCell className="font-bold text-slate-900">{req.name}</TableCell>
                      <TableCell>
                        <Badge variant={req.role === 'Dosen' ? 'default' : 'secondary'} className="font-semibold">
                          {req.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{req.type}</TableCell>
                      <TableCell className="text-slate-500 font-medium">{req.date}</TableCell>
                      <TableCell className="text-slate-600 text-sm max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`font-bold ${
                            req.status === 'approved' ? 'bg-emerald-500 text-white' :
                            req.status === 'rejected' ? 'bg-rose-500 text-white' :
                            'bg-amber-500 text-white'
                          }`}
                        >
                          {req.status === 'approved' ? 'Disetujui' : req.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === 'pending' ? (
                          <div className="flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              onClick={() => handleAction(req.id, 'approved')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                            >
                              Setujui
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleAction(req.id, 'rejected')}
                              className="font-bold"
                            >
                              Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Tindakan Selesai</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                      Tidak ada pengajuan izin yang sesuai filter
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

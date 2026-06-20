'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DollarSign, Search, CreditCard, CheckCircle, FileText } from 'lucide-react'

type UktBill = {
  id: string
  nim: string
  studentName: string
  program: string
  semester: number
  totalAmount: number
  paidAmount: number
  status: 'Lunas' | 'Belum Lunas' | 'Cicilan'
}

const mockUktBills: UktBill[] = [
  { id: '1', nim: '2210511001', studentName: 'Diana Putri', program: 'S1 Teknik Informatika', semester: 6, totalAmount: 7500000, paidAmount: 7500000, status: 'Lunas' },
  { id: '2', nim: '2210511002', studentName: 'Endi Suhendra', program: 'S1 Teknik Informatika', semester: 6, totalAmount: 7500000, paidAmount: 0, status: 'Belum Lunas' },
  { id: '3', nim: '2210511003', studentName: 'Fitri Handayani', program: 'S1 Teknik Informatika', semester: 6, totalAmount: 7500000, paidAmount: 3750000, status: 'Cicilan' },
  { id: '4', nim: '2210512001', studentName: 'Natsir Udin', program: 'S1 Sistem Informasi', semester: 6, totalAmount: 8000000, paidAmount: 8000000, status: 'Lunas' },
  { id: '5', nim: '2210512002', studentName: 'Rio Dewanto', program: 'S1 Sistem Informasi', semester: 6, totalAmount: 8000000, paidAmount: 4000000, status: 'Cicilan' },
  { id: '6', nim: '2210511004', studentName: 'Heru Budiman', program: 'S1 Teknik Informatika', semester: 6, totalAmount: 7500000, paidAmount: 0, status: 'Belum Lunas' }
]

export default function UktBillingPage() {
  const [bills, setBills] = useState<UktBill[]>(mockUktBills)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'Lunas' | 'Belum Lunas' | 'Cicilan'>('all')

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
  }

  const handlePayFull = (id: string) => {
    setBills(prev => 
      prev.map(b => b.id === id ? { ...b, paidAmount: b.totalAmount, status: 'Lunas' } : b)
    )
  }

  const filteredBills = bills.filter(b => {
    const matchesSearch = b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || b.nim.includes(searchQuery)
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    target: bills.reduce((acc, curr) => acc + curr.totalAmount, 0),
    collected: bills.reduce((acc, curr) => acc + curr.paidAmount, 0),
    arrears: bills.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0),
    unpaidCount: bills.filter(b => b.status === 'Belum Lunas').length
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tagihan UKT Mahasiswa</h1>
          <p className="text-slate-500 mt-1">Kelola tagihan, sirkulasi pembayaran UKT, dan daftar tunggakan mahasiswa</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Target Dana UKT</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(stats.target)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Dana Terkumpul</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(stats.collected)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Tunggakan</p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{formatCurrency(stats.arrears)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-rose-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Belum Membayar</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.unpaidCount} Mahasiswa</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-teal-600" />
            Rekapitulasi Tagihan UKT Semester Ini
          </CardTitle>
          <CardDescription>Manajemen pembayaran UKT dan pencatatan cicilan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama mahasiswa atau NIM..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'Lunas', 'Belum Lunas', 'Cicilan'] as const).map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className="font-semibold"
                >
                  {status === 'all' ? 'Semua Status' : status}
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
                  <TableHead className="font-semibold text-slate-600">Semester</TableHead>
                  <TableHead className="font-semibold text-slate-600">Jumlah Tagihan</TableHead>
                  <TableHead className="font-semibold text-slate-600">Jumlah Dibayar</TableHead>
                  <TableHead className="font-semibold text-slate-600">Sisa Tagihan</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 w-32 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.length > 0 ? (
                  filteredBills.map((b) => (
                    <TableRow key={b.id} className="border-slate-200 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{b.nim}</TableCell>
                      <TableCell className="font-bold text-slate-900">{b.studentName}</TableCell>
                      <TableCell className="text-slate-500 font-medium">{b.program}</TableCell>
                      <TableCell className="font-semibold">{b.semester}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(b.totalAmount)}</TableCell>
                      <TableCell className="font-medium text-emerald-600">{formatCurrency(b.paidAmount)}</TableCell>
                      <TableCell className="font-medium text-rose-600">{formatCurrency(b.totalAmount - b.paidAmount)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`font-bold ${
                            b.status === 'Lunas' ? 'bg-emerald-500 text-white' :
                            b.status === 'Belum Lunas' ? 'bg-rose-500 text-white' :
                            'bg-amber-500 text-white'
                          }`}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {b.status !== 'Lunas' ? (
                          <Button 
                            size="sm"
                            onClick={() => handlePayFull(b.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 text-xs"
                          >
                            Set Setujui Lunas
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold italic">Pembayaran Selesai</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                      Tidak ada catatan tagihan yang sesuai filter
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

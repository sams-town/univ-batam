'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, FileSpreadsheet, FileText, Lock } from 'lucide-react'

// Mock Payroll Data
const bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const tahunList = ['2024', '2025', '2026']

const mockPayroll = [
  {
    id: 1, nip: '198501012010015002', nama: 'Siti Aminah', divisi: 'Keuangan', 
    hadir: 20, lambat: 2, alpa: 0, gajiPokok: 5000000, tunjangan: 1500000, potongan: 500000, gajiBersih: 6000000
  },
  {
    id: 2, nip: '199002022015015003', nama: 'Rizky Pratama', divisi: 'IT', 
    hadir: 21, lambat: 1, alpa: 0, gajiPokok: 6000000, tunjangan: 2000000, potongan: 250000, gajiBersih: 7750000
  },
  {
    id: 3, nip: '198803032012015004', nama: 'Dewi Lestari', divisi: 'HRD', 
    hadir: 19, lambat: 3, alpa: 0, gajiPokok: 5500000, tunjangan: 1750000, potongan: 750000, gajiBersih: 6500000
  }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export default function PayrollProcessingPage() {
  const [selectedBulan, setSelectedBulan] = useState('Juni')
  const [selectedTahun, setSelectedTahun] = useState('2026')
  const [payrollStatus, setPayrollStatus] = useState<'Draft' | 'Approved' | 'Disbursed'>('Draft')

  const totalPengeluaran = mockPayroll.reduce((sum, item) => sum + item.gajiBersih, 0)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengelolaan Payroll
        </h1>
        <p className="text-slate-500">
          Proses gaji bulanan karyawan Universitas Batam
        </p>
      </div>

      {/* Payroll Header */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <label className="text-sm font-medium text-slate-700 mr-2">Bulan</label>
          <select
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="p-2 rounded-lg border border-slate-300"
          >
            {bulanList.map(bulan => (
              <option key={bulan} value={bulan}>{bulan}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mr-2">Tahun</label>
          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            className="p-2 rounded-lg border border-slate-300"
          >
            {tahunList.map(tahun => (
              <option key={tahun} value={tahun}>{tahun}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex gap-3">
          <Button 
            variant="secondary" 
            className="bg-slate-100 hover:bg-slate-200 flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
          <Button 
            variant="secondary" 
            className="bg-slate-100 hover:bg-slate-200 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          {payrollStatus === 'Draft' && (
            <Button 
              className="bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 flex items-center gap-2"
              onClick={() => setPayrollStatus('Approved')}
            >
              <Lock className="h-4 w-4" />
              Generate & Lock Payroll
            </Button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <DollarSign className="h-6 w-6" />
              Total Pengeluaran Gaji Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-extrabold">{formatCurrency(totalPengeluaran)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-700">
              Status Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`text-lg px-4 py-2 ${
              payrollStatus === 'Draft' ? 'bg-yellow-500' :
              payrollStatus === 'Approved' ? 'bg-blue-500' : 'bg-emerald-500'
            } text-white`}>
              {payrollStatus}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">NIP</TableHead>
                <TableHead className="text-slate-600 font-medium">Nama Karyawan</TableHead>
                <TableHead className="text-slate-600 font-medium">Divisi</TableHead>
                <TableHead className="text-slate-600 font-medium text-center" colSpan={3}>Kehadiran</TableHead>
                <TableHead className="text-slate-600 font-medium">Gaji Pokok</TableHead>
                <TableHead className="text-slate-600 font-medium">Tunjangan</TableHead>
                <TableHead className="text-slate-600 font-medium">Potongan</TableHead>
                <TableHead className="text-slate-600 font-medium">Gaji Bersih</TableHead>
              </TableRow>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-400 font-normal" colSpan={3}></TableHead>
                <TableHead className="text-slate-400 font-normal text-center">Hadir</TableHead>
                <TableHead className="text-slate-400 font-normal text-center">Lambat</TableHead>
                <TableHead className="text-slate-400 font-normal text-center">Alpa</TableHead>
                <TableHead className="text-slate-400 font-normal" colSpan={4}></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayroll.map(item => (
                <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="font-medium">{item.nip}</TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.divisi}</TableCell>
                  <TableCell className="text-center">{item.hadir}</TableCell>
                  <TableCell className="text-center">{item.lambat}</TableCell>
                  <TableCell className="text-center">{item.alpa}</TableCell>
                  <TableCell>{formatCurrency(item.gajiPokok)}</TableCell>
                  <TableCell>{formatCurrency(item.tunjangan)}</TableCell>
                  <TableCell>{formatCurrency(item.potongan)}</TableCell>
                  <TableCell className="font-bold text-slate-900">{formatCurrency(item.gajiBersih)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

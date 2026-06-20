'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Check, X, Download } from 'lucide-react'

// Mock pending payments
const pendingPayments = [
  {
    id: 1,
    studentName: 'Ahmad Rizky Pratama',
    nim: '2210114001',
    amount: 2500000,
    semester: 'Semester Ganjil 2024/2025',
    date: '2024-06-15',
    status: 'pending'
  },
  {
    id: 2,
    studentName: 'Siti Nurhaliza',
    nim: '2210114002',
    amount: 2500000,
    semester: 'Semester Ganjil 2024/2025',
    date: '2024-06-16',
    status: 'pending'
  },
  {
    id: 3,
    studentName: 'Budi Santoso',
    nim: '2210114003',
    amount: 2500000,
    semester: 'Semester Ganjil 2024/2025',
    date: '2024-06-17',
    status: 'pending'
  }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState(pendingPayments)

  const handleApprove = (id: number) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, status: 'approved' } : p
    ))
  }

  const handleReject = (id: number) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, status: 'rejected' } : p
    ))
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Verifikasi Keuangan</h1>
        <p className="text-slate-500 mt-1">Verifikasi pembayaran SKS mahasiswa</p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <DollarSign className="h-5 w-5 text-blue-500" />
                Daftar Pembayaran Menunggu Verifikasi
              </CardTitle>
              <CardDescription className="text-slate-500">Verifikasi pembayaran yang belum diproses</CardDescription>
            </div>
            <Button variant="secondary" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200">
              <Download className="h-4 w-4" />
              Export Laporan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Nama Mahasiswa</TableHead>
                <TableHead className="text-slate-600 font-medium">NIM</TableHead>
                <TableHead className="text-slate-600 font-medium">Semester</TableHead>
                <TableHead className="text-slate-600 font-medium">Tanggal</TableHead>
                <TableHead className="text-slate-600 font-medium">Jumlah</TableHead>
                <TableHead className="text-slate-600 font-medium">Status</TableHead>
                <TableHead className="text-slate-600 font-medium">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="font-medium">{payment.studentName}</TableCell>
                  <TableCell>{payment.nim}</TableCell>
                  <TableCell>{payment.semester}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell className="text-emerald-600 font-bold">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    {payment.status === 'pending' && <Badge className="bg-orange-500 text-white">Pending</Badge>}
                    {payment.status === 'approved' && <Badge className="bg-emerald-500 text-white">Disetujui</Badge>}
                    {payment.status === 'rejected' && <Badge className="bg-red-500 text-white">Ditolak</Badge>}
                  </TableCell>
                  <TableCell>
                    {payment.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600 text-white" 
                          onClick={() => handleApprove(payment.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Setujui
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleReject(payment.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

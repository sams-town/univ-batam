'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SKSPayment, PaymentItem } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { CreditCard, CheckCircle2, Calendar, Receipt, Download } from 'lucide-react'

// Dummy data pembayaran SKS
const dummyPayments: SKSPayment[] = [
  {
    id: '1',
    student_id: 'dummy-student-id',
    semester_id: '1',
    total_credits: 20,
    credit_price: 350000,
    total_amount: 7000000,
    status: 'paid',
    payment_date: new Date('2026-02-15'),
    payment_method: 'Transfer Bank',
    transaction_id: 'TRX-2026-02-15-001',
    due_date: new Date('2026-03-01'),
    created_at: new Date('2026-01-10'),
    updated_at: new Date('2026-02-15'),
    semester: {
      id: '1',
      academic_year_id: '1',
      name: 'Semester Genap 2025/2026',
      term: 'genap',
      start_date: new Date('2026-02-01'),
      end_date: new Date('2026-07-31'),
      is_active: true,
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01')
    }
  },
  {
    id: '2',
    student_id: 'dummy-student-id',
    semester_id: '2',
    total_credits: 22,
    credit_price: 350000,
    total_amount: 7700000,
    status: 'paid',
    payment_date: new Date('2025-08-20'),
    payment_method: 'Virtual Account',
    transaction_id: 'TRX-2025-08-20-005',
    due_date: new Date('2025-09-05'),
    created_at: new Date('2025-07-25'),
    updated_at: new Date('2025-08-20'),
    semester: {
      id: '2',
      academic_year_id: '1',
      name: 'Semester Ganjil 2025/2026',
      term: 'ganjil',
      start_date: new Date('2025-08-01'),
      end_date: new Date('2026-01-31'),
      is_active: false,
      created_at: new Date('2025-07-01'),
      updated_at: new Date('2025-07-01')
    }
  },
  {
    id: '3',
    student_id: 'dummy-student-id',
    semester_id: '3',
    total_credits: 18,
    credit_price: 350000,
    total_amount: 6300000,
    status: 'paid',
    payment_date: new Date('2025-02-10'),
    payment_method: 'E-Wallet',
    transaction_id: 'TRX-2025-02-10-012',
    due_date: new Date('2025-02-28'),
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-02-10'),
    semester: {
      id: '3',
      academic_year_id: '2',
      name: 'Semester Genap 2024/2025',
      term: 'genap',
      start_date: new Date('2025-02-01'),
      end_date: new Date('2025-07-31'),
      is_active: false,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01')
    }
  }
]

const dummyPaymentItems: Record<string, PaymentItem[]> = {
  '1': [
    { id: '1-1', payment_id: '1', course_id: '1', course_name: 'Pemrograman Web', credits: 4, price: 1400000, created_at: new Date('2026-01-10') },
    { id: '1-2', payment_id: '1', course_id: '2', course_name: 'Basis Data', credits: 3, price: 1050000, created_at: new Date('2026-01-10') },
    { id: '1-3', payment_id: '1', course_id: '3', course_name: 'Sistem Informasi', credits: 4, price: 1400000, created_at: new Date('2026-01-10') },
    { id: '1-4', payment_id: '1', course_id: '4', course_name: 'Jaringan Komputer', credits: 3, price: 1050000, created_at: new Date('2026-01-10') },
    { id: '1-5', payment_id: '1', course_id: '5', course_name: 'Bahasa Inggris', credits: 2, price: 700000, created_at: new Date('2026-01-10') },
    { id: '1-6', payment_id: '1', course_id: '6', course_name: 'Pendidikan Kewarganegaraan', credits: 2, price: 700000, created_at: new Date('2026-01-10') },
    { id: '1-7', payment_id: '1', course_id: '7', course_name: 'Statistika', credits: 2, price: 700000, created_at: new Date('2026-01-10') }
  ],
  '2': [
    { id: '2-1', payment_id: '2', course_id: '8', course_name: 'Algoritma dan Struktur Data', credits: 4, price: 1400000, created_at: new Date('2025-07-25') },
    { id: '2-2', payment_id: '2', course_id: '9', course_name: 'Pemrograman Berorientasi Objek', credits: 4, price: 1400000, created_at: new Date('2025-07-25') },
    { id: '2-3', payment_id: '2', course_id: '10', course_name: 'Sistem Operasi', credits: 3, price: 1050000, created_at: new Date('2025-07-25') },
    { id: '2-4', payment_id: '2', course_id: '11', course_name: 'Matematika Diskrit', credits: 3, price: 1050000, created_at: new Date('2025-07-25') },
    { id: '2-5', payment_id: '2', course_id: '12', course_name: 'Bahasa Indonesia', credits: 2, price: 700000, created_at: new Date('2025-07-25') },
    { id: '2-6', payment_id: '2', course_id: '13', course_name: 'Agama', credits: 2, price: 700000, created_at: new Date('2025-07-25') },
    { id: '2-7', payment_id: '2', course_id: '14', course_name: 'Kewirausahaan', credits: 2, price: 700000, created_at: new Date('2025-07-25') },
    { id: '2-8', payment_id: '2', course_id: '15', course_name: 'Praktikum Basis Data', credits: 2, price: 700000, created_at: new Date('2025-07-25') }
  ],
  '3': [
    { id: '3-1', payment_id: '3', course_id: '16', course_name: 'Pengantar Teknologi Informasi', credits: 3, price: 1050000, created_at: new Date('2025-01-15') },
    { id: '3-2', payment_id: '3', course_id: '17', course_name: 'Dasar Pemrograman', credits: 4, price: 1400000, created_at: new Date('2025-01-15') },
    { id: '3-3', payment_id: '3', course_id: '18', course_name: 'Logika dan Algoritma', credits: 3, price: 1050000, created_at: new Date('2025-01-15') },
    { id: '3-4', payment_id: '3', course_id: '19', course_name: 'Matematika Dasar', credits: 3, price: 1050000, created_at: new Date('2025-01-15') },
    { id: '3-5', payment_id: '3', course_id: '20', course_name: 'Bahasa Inggris Dasar', credits: 2, price: 700000, created_at: new Date('2025-01-15') },
    { id: '3-6', payment_id: '3', course_id: '21', course_name: 'Pendidikan Pancasila', credits: 2, price: 700000, created_at: new Date('2025-01-15') },
    { id: '3-7', payment_id: '3', course_id: '22', course_name: 'Praktikum Dasar Pemrograman', credits: 1, price: 350000, created_at: new Date('2025-01-15') }
  ]
}

const formatCurrency = (amount?: number) => {
  if (amount === undefined) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount)
}

const formatDate = (date?: Date | string) => {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

export default function PaymentsPage() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<SKSPayment[]>(dummyPayments)
  const [selectedPayment, setSelectedPayment] = useState<SKSPayment | null>(dummyPayments[0] || null)
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>(dummyPayments[0] ? (dummyPaymentItems[dummyPayments[0].id] || []) : [])

  const handleSelectPayment = (payment: SKSPayment) => {
    setSelectedPayment(payment)
    setPaymentItems(dummyPaymentItems[payment.id] || [])
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Pembayaran SKS</h1>
          <p className="text-slate-600 mt-1">Riwayat dan status pembayaran SKS Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: List of payments */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Riwayat Pembayaran</h3>
          {payments.map((payment) => (
            <Card
              key={payment.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPayment?.id === payment.id ? 'ring-2 ring-blue-500 shadow-md' : ''
              }`}
              onClick={() => handleSelectPayment(payment)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900">{payment.semester?.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          payment.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                            : payment.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }
                      >
                        {payment.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {payment.status === 'paid' ? 'Lunas' : payment.status === 'pending' ? 'Menunggu' : 'Jatuh Tempo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(payment.total_amount)}</p>
                  <p className="text-sm text-slate-500">{payment.total_credits} SKS @ {formatCurrency(payment.credit_price)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right: Payment detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPayment && (
            <>
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedPayment.semester?.name}</CardTitle>
                      <p className="text-slate-500">Detail Pembayaran</p>
                    </div>
                    <Badge
                      className={
                        selectedPayment.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-sm py-1 px-3'
                          : selectedPayment.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 text-sm py-1 px-3'
                          : 'bg-red-100 text-red-800 hover:bg-red-100 text-sm py-1 px-3'
                      }
                    >
                      {selectedPayment.status === 'paid' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                      {selectedPayment.status === 'paid' ? 'LUNAS' : selectedPayment.status === 'pending' ? 'MENUNGGU' : 'JATUH TEMPO'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Info Pembayaran */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span>Tanggal Jatuh Tempo</span>
                      </div>
                      <p className="font-semibold">{formatDate(selectedPayment.due_date)}</p>

                      {selectedPayment.payment_date && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-4">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Tanggal Pembayaran</span>
                          </div>
                          <p className="font-semibold">{formatDate(selectedPayment.payment_date)}</p>
                        </>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CreditCard className="h-4 w-4" />
                        <span>Metode Pembayaran</span>
                      </div>
                      <p className="font-semibold">{selectedPayment.payment_method || '-'}</p>

                      {selectedPayment.transaction_id && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-4">
                            <Receipt className="h-4 w-4" />
                            <span>ID Transaksi</span>
                          </div>
                          <p className="font-semibold font-mono">{selectedPayment.transaction_id}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rincian Biaya */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="font-semibold text-slate-900 mb-4">Rincian Biaya</h4>
                    <div className="space-y-3">
                      {paymentItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-900">{item.course_name}</p>
                            <p className="text-sm text-slate-500">{item.credits} SKS</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(item.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total Pembayaran</span>
                      <span className="text-2xl font-bold text-slate-900">{formatCurrency(selectedPayment.total_amount)}</span>
                    </div>
                  </div>

                  {selectedPayment.status === 'paid' && (
                    <div className="pt-4">
                      <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Download className="h-4 w-4" />
                        Unduh Bukti Pembayaran
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

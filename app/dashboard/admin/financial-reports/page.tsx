'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, TrendingUp, DollarSign, PieChart as PieIcon, Download } from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie
} from 'recharts'

const monthlyFlowData = [
  { month: 'Jan', pemasukan: 120000000, pengeluaran: 80000000 },
  { month: 'Feb', pemasukan: 150000000, pengeluaran: 85000000 },
  { month: 'Mar', pemasukan: 210000000, pengeluaran: 90000000 },
  { month: 'Apr', pemasukan: 180000000, pengeluaran: 95000000 },
  { month: 'Mei', pemasukan: 240000000, pengeluaran: 100000000 },
  { month: 'Jun', pemasukan: 310000000, pengeluaran: 110000000 }
]

const allocationData = [
  { name: 'Gaji Dosen & Staff', value: 450000000, color: '#3b82f6' },
  { name: 'Operasional Gedung', value: 200000000, color: '#10b981' },
  { name: 'Sarana & Lab Teknik', value: 150000000, color: '#f59e0b' },
  { name: 'Riset & Beasiswa', value: 120000000, color: '#8b5cf6' },
  { name: 'Pengembangan Kampus', value: 80000000, color: '#ec4899' }
]

const transactionLogs = [
  { id: '1', date: '2026-06-20', desc: 'Pembayaran UKT Diana Putri', type: 'Pemasukan', amount: 7500000 },
  { id: '2', date: '2026-06-20', desc: 'Pembelian lisensi software komputer lab', type: 'Pengeluaran', amount: 15000000 },
  { id: '3', date: '2026-06-19', desc: 'Pembayaran UKT Natsir Udin', type: 'Pemasukan', amount: 8000000 },
  { id: '4', date: '2026-06-18', desc: 'Perbaikan AC Ruang Aula Hukum', type: 'Pengeluaran', amount: 4500000 },
  { id: '5', date: '2026-06-18', desc: 'Dana Hibah Riset Internal Dosen', type: 'Pengeluaran', amount: 25000000 }
]

export default function FinancialReportsPage() {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Laporan Keuangan Kampus</h1>
          <p className="text-slate-500 mt-1">Laporan arus kas, anggaran departemen, dan log sirkulasi keuangan terpusat</p>
        </div>
        <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
          <Download className="h-4 w-4" />
          Ekspor Laporan (PDF)
        </Button>
      </div>

      {/* Row 1: Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Saldo Kas Kampus</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{formatCurrency(1450000000)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Kas Masuk (Semester Ini)</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{formatCurrency(1210000000)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Alokasi Anggaran Terpakai</p>
              <p className="text-3xl font-extrabold text-indigo-600 mt-1">{formatCurrency(1000000000)}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <PieIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash flow trend */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Tren Pemasukan vs Pengeluaran (6 Bulan)
            </CardTitle>
            <CardDescription>Grafik komparasi bulanan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyFlowData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="pemasukan" stroke="#10b981" fillOpacity={1} fill="url(#colorPemasukan)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pengeluaran" stroke="#ef4444" fillOpacity={1} fill="url(#colorPengeluaran)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget distribution */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-teal-500" />
              Alokasi Anggaran Kampus
            </CardTitle>
            <CardDescription>Pembagian pengeluaran semester berjalan</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {allocationData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Transaction logs */}
      <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-700" />
            Log Transaksi Terakhir
          </CardTitle>
          <CardDescription>Aliran dana masuk dan keluar riil-time</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold text-slate-600">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-600">Keterangan Transaksi</TableHead>
                <TableHead className="font-semibold text-slate-600">Tipe</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionLogs.map((log) => (
                <TableRow key={log.id} className="border-slate-200 hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-500">{log.date}</TableCell>
                  <TableCell className="font-bold text-slate-900">{log.desc}</TableCell>
                  <TableCell>
                    <span 
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        log.type === 'Pemasukan' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.type}
                    </span>
                  </TableCell>
                  <TableCell 
                    className={`font-extrabold text-right ${
                      log.type === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {log.type === 'Pemasukan' ? '+' : '-'} {formatCurrency(log.amount)}
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

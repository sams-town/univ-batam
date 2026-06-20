'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Filter, BarChart3 } from 'lucide-react'
import { useState } from 'react'

export default function AdminReportsPage() {
  const [filterProgram, setFilterProgram] = useState('')
  const [filterSemester, setFilterSemester] = useState('')

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Laporan Global</h1>
          <p className="text-slate-500 mt-1">Rekapitulasi absensi seluruh kampus</p>
        </div>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Filter className="h-5 w-5 text-blue-500" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="filter-program">Program Studi</Label>
              <Select id="filter-program" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
                <option value="">Semua Program</option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-semester">Semester</Label>
              <Select id="filter-semester" value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
                <option value="">Semua Semester</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                  <option key={sem} value={String(sem)}>{sem}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1 bg-slate-100 hover:bg-slate-200">Reset</Button>
                <Button className="flex-1">Terapkan</Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Button variant="secondary" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200">
              <Download className="h-4 w-4" />
              Export Ke Excel
            </Button>
            <Button variant="secondary" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200">
              <Download className="h-4 w-4" />
              Export Ke PDF
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">NIM</TableHead>
                <TableHead className="text-slate-600 font-medium">Nama</TableHead>
                <TableHead className="text-slate-600 font-medium">Program Studi</TableHead>
                <TableHead className="text-slate-600 font-medium">Semester</TableHead>
                <TableHead className="text-slate-600 font-medium">Total Hadir</TableHead>
                <TableHead className="text-slate-600 font-medium">Total Terlambat</TableHead>
                <TableHead className="text-slate-600 font-medium">Total Alpha</TableHead>
                <TableHead className="text-slate-600 font-medium">Persentase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-slate-200">
                <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                  Data laporan akan ditampilkan di sini
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
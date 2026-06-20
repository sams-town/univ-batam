'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Clock } from 'lucide-react'

export default function AdminSchedulePlottingPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Plotting Jadwal</h1>
          <p className="text-slate-500 mt-1">Atur jadwal mata kuliah, dosen pengampu, dan ruang kelas</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Jadwal Baru
        </Button>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Clock className="h-5 w-5 text-blue-500" />
            Plot Jadwal Kuliah
          </CardTitle>
          <CardDescription className="text-slate-500">Atur jadwal untuk semester aktif</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">Fitur akan segera hadir</p>
        </CardContent>
      </Card>
    </div>
  )
}
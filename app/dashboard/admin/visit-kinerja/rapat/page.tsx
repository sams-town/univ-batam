'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function RapatPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Rapat</h1>
        <p className="text-slate-500 mt-1">Kelola jadwal dan laporan rapat</p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                Daftar Rapat
              </CardTitle>
              <CardDescription className="text-slate-500">Lihat dan kelola rapat</CardDescription>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Rapat
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">Fitur akan segera hadir</p>
        </CardContent>
      </Card>
    </div>
  )
}

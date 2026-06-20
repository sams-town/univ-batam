'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Clock } from 'lucide-react'

type Shift = {
  id: number
  name: string
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
}

const initialShifts: Shift[] = [
  { id: 1, name: 'Pagi', startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
  { id: 2, name: 'Siang', startTime: '13:00', endTime: '22:00', breakStart: '17:00', breakEnd: '18:00' },
  { id: 3, name: 'Malam', startTime: '22:00', endTime: '07:00', breakStart: '01:00', breakEnd: '02:00' }
]

export default function ShiftManagementPage() {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [formData, setFormData] = useState<Partial<Shift>>({
    name: '',
    startTime: '',
    endTime: '',
    breakStart: '',
    breakEnd: ''
  })

  const handleOpenModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift)
      setFormData(shift)
    } else {
      setEditingShift(null)
      setFormData({
        name: '',
        startTime: '',
        endTime: '',
        breakStart: '',
        breakEnd: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (editingShift) {
      setShifts(shifts.map(s => s.id === editingShift.id ? { ...s, ...formData } as Shift : s))
    } else {
      setShifts([...shifts, { ...formData, id: Date.now() } as Shift])
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: number) => {
    setShifts(shifts.filter(s => s.id !== id))
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Shift</h1>
          <p className="text-slate-500">Kelola shift kerja dan jam istirahat pegawai</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Shift
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map(shift => (
          <Card key={shift.id} className="hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                {shift.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">Masuk:</span>
                <span className="text-slate-600">{shift.startTime}</span>
                <span className="text-slate-300">—</span>
                <span className="font-medium">Keluar:</span>
                <span className="text-slate-600">{shift.endTime}</span>
              </div>
              {shift.breakStart && shift.breakEnd && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-medium">Istirahat:</span>
                  <span className="text-slate-600">{shift.breakStart}</span>
                  <span className="text-slate-300">—</span>
                  <span className="text-slate-600">{shift.breakEnd}</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => handleOpenModal(shift)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(shift.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Shift Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingShift ? 'Edit Shift' : 'Tambah Shift'}
            </DialogTitle>
            <DialogDescription>
              {editingShift ? 'Ubah detail shift kerja' : 'Buat shift kerja baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs uppercase text-slate-500">Nama Shift *</Label>
              <Input
                id="name"
                placeholder="Contoh: Pagi, Siang, Malam..."
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-xs uppercase text-slate-500">Jam Masuk *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-xs uppercase text-slate-500">Jam Keluar *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-slate-50"
                />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm text-slate-500 mb-3">Istirahat (opsional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breakStart" className="text-xs uppercase text-slate-500">Mulai Istirahat</Label>
                  <Input
                    id="breakStart"
                    type="time"
                    value={formData.breakStart || ''}
                    onChange={(e) => setFormData({ ...formData, breakStart: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakEnd" className="text-xs uppercase text-slate-500">Selesai Istirahat</Label>
                  <Input
                    id="breakEnd"
                    type="time"
                    value={formData.breakEnd || ''}
                    onChange={(e) => setFormData({ ...formData, breakEnd: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              {editingShift ? 'Simpan Perubahan' : 'Tambah Shift'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

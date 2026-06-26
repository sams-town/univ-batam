'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

type Rapat = {
  id: string
  judul: string
  ketua: string
  lokasi: string
  tanggal: string
  waktu: string
  status: string
}

const dummyRapat: Rapat[] = [
  { id: '1', judul: 'Rapat Koordinasi Akademik', ketua: 'Dr. Budi Santoso', lokasi: 'Ruang Rapat A', tanggal: '2024-01-20', waktu: '10:00 - 12:00', status: 'Selesai' },
  { id: '2', judul: 'Rapat Evaluasi Kinerja', ketua: 'Siti Aminah', lokasi: 'Ruang Rapat B', tanggal: '2024-01-25', waktu: '14:00 - 16:00', status: 'Akan Datang' }
]

const dummyPegawai = [
  { id: '1', nama: 'Dr. Budi Santoso' },
  { id: '2', nama: 'Siti Aminah' },
  { id: '3', nama: 'Budi Santoso' },
  { id: '4', nama: 'Dewi Lestari' },
  { id: '5', nama: 'Agus Pratama' }
]

const dummyStatus = ['Selesai', 'Akan Datang', 'Dibatalkan']

export default function RapatPage() {
  const [data, setData] = useState<Rapat[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Rapat | null>(null)
  const [formData, setFormData] = useState({ judul: '', ketua: '', lokasi: '', tanggal: '', waktu: '', status: '' })

  useEffect(() => {
    setData(dummyRapat)
    setLoading(false)
  }, [])

  const handleAdd = () => {
    const newItem: Rapat = { id: Date.now().toString(), ...formData }
    setData([...data, newItem])
    setIsModalOpen(false)
    resetForm()
  }

  const handleEdit = (item: Rapat) => {
    setSelectedItem(item)
    setFormData(item)
    setIsModalOpen(true)
  }

  const handleUpdate = () => {
    if (!selectedItem) return
    const updatedData = data.map(item => item.id === selectedItem.id ? { ...item, ...formData } : item)
    setData(updatedData)
    setIsModalOpen(false)
    setSelectedItem(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) setData(data.filter(item => item.id !== id))
  }

  const resetForm = () => {
    setFormData({ judul: '', ketua: '', lokasi: '', tanggal: '', waktu: '', status: '' })
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Rapat</h1>
          <p className="text-slate-500 mt-1">Kelola jadwal dan laporan rapat</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => { setSelectedItem(null); resetForm() }}>
              <Plus className="h-4 w-4" /> Tambah Rapat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedItem ? 'Edit Rapat' : 'Tambah Rapat'}</DialogTitle>
              <DialogDescription className="text-slate-500">SISTEM MANAJEMEN RAPAT</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="judul" className="text-slate-500 font-medium">JUDUL RAPAT</Label>
                <Input id="judul" placeholder="Judul rapat" className="w-full bg-slate-50 border-slate-200" value={formData.judul} onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ketua" className="text-slate-500 font-medium">KETUA RAPAT</Label>
                <Select id="ketua" value={formData.ketua} onChange={(e) => setFormData(prev => ({ ...prev, ketua: e.target.value }))} className="w-full bg-slate-50 border-slate-200">
                  <option value="">-- Pilih Ketua --</option>
                  {dummyPegawai.map(pegawai => <option key={pegawai.id} value={pegawai.nama}>{pegawai.nama}</option>)}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lokasi" className="text-slate-500 font-medium">LOKASI</Label>
                  <Input id="lokasi" placeholder="Lokasi rapat" className="w-full bg-slate-50 border-slate-200" value={formData.lokasi} onChange={(e) => setFormData(prev => ({ ...prev, lokasi: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal" className="text-slate-500 font-medium">TANGGAL</Label>
                  <Input id="tanggal" type="date" className="w-full bg-slate-50 border-slate-200" value={formData.tanggal} onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waktu" className="text-slate-500 font-medium">WAKTU</Label>
                  <Input id="waktu" placeholder="10:00 - 12:00" className="w-full bg-slate-50 border-slate-200" value={formData.waktu} onChange={(e) => setFormData(prev => ({ ...prev, waktu: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-500 font-medium">STATUS</Label>
                  <Select id="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-slate-50 border-slate-200">
                    <option value="">-- Pilih Status --</option>
                    {dummyStatus.map(status => <option key={status} value={status}>{status}</option>)}
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="grid grid-cols-2 gap-4 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>BATAL</Button>
              <Button onClick={selectedItem ? handleUpdate : handleAdd}>{selectedItem ? 'UPDATE' : 'SIMPAN'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Calendar className="h-5 w-5 text-blue-500" /> Daftar Rapat
          </CardTitle>
          <CardDescription className="text-slate-500">Lihat dan kelola rapat</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Judul</TableHead>
                <TableHead className="text-slate-600 font-medium">Ketua</TableHead>
                <TableHead className="text-slate-600 font-medium">Lokasi</TableHead>
                <TableHead className="text-slate-600 font-medium">Tanggal</TableHead>
                <TableHead className="text-slate-600 font-medium">Waktu</TableHead>
                <TableHead className="text-slate-600 font-medium">Status</TableHead>
                <TableHead className="text-slate-600 font-medium w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? data.map(item => (
                <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="font-medium">{item.judul}</TableCell>
                  <TableCell>{item.ketua}</TableCell>
                  <TableCell>{item.lokasi}</TableCell>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.waktu}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Selesai' ? 'bg-green-100 text-green-700' : item.status === 'Akan Datang' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-8">Belum ada data</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

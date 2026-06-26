'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, ShieldCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type PatroliSecurity = {
  id: string
  petugas: string
  lokasi: string
  tanggal: string
  waktu: string
  laporan: string
  status: string
}

const dummyPatroliSecurity: PatroliSecurity[] = [
  { id: '1', petugas: 'Agus Pratama', lokasi: 'Gedung A', tanggal: '2024-01-20', waktu: '08:00 - 10:00', laporan: 'Semua normal', status: 'Selesai' },
  { id: '2', petugas: 'Budi Santoso', lokasi: 'Gedung B', tanggal: '2024-01-20', waktu: '10:00 - 12:00', laporan: 'Temuan pintu terkunci di lantai 3', status: 'Dalam Penanganan' }
]

const dummyPetugas = [
  { id: '1', nama: 'Agus Pratama' },
  { id: '2', nama: 'Budi Santoso' },
  { id: '3', nama: 'Siti Aminah' },
  { id: '4', nama: 'Dewi Lestari' }
]

const dummyStatus = ['Selesai', 'Dalam Penanganan', 'Dijadwalkan']

export default function PatroliSecurityPage() {
  const [data, setData] = useState<PatroliSecurity[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PatroliSecurity | null>(null)
  const [formData, setFormData] = useState({ petugas: '', lokasi: '', tanggal: '', waktu: '', laporan: '', status: '' })

  useEffect(() => {
    setData(dummyPatroliSecurity)
    setLoading(false)
  }, [])

  const handleAdd = () => {
    const newItem: PatroliSecurity = { id: Date.now().toString(), ...formData }
    setData([...data, newItem])
    setIsModalOpen(false)
    resetForm()
  }

  const handleEdit = (item: PatroliSecurity) => {
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
    setFormData({ petugas: '', lokasi: '', tanggal: '', waktu: '', laporan: '', status: '' })
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
          <h1 className="text-3xl font-extrabold text-slate-900">Patroli Security</h1>
          <p className="text-slate-500 mt-1">Kelola jadwal dan laporan patroli security</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => { setSelectedItem(null); resetForm() }}>
              <Plus className="h-4 w-4" /> Tambah Patroli
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedItem ? 'Edit Patroli' : 'Tambah Patroli'}</DialogTitle>
              <DialogDescription className="text-slate-500">SISTEM MANAJEMEN PATROLI SECURITY</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petugas" className="text-slate-500 font-medium">PETUGAS</Label>
                  <Select id="petugas" value={formData.petugas} onChange={(e) => setFormData(prev => ({ ...prev, petugas: e.target.value }))} className="w-full bg-slate-50 border-slate-200">
                    <option value="">-- Pilih Petugas --</option>
                    {dummyPetugas.map(petugas => <option key={petugas.id} value={petugas.nama}>{petugas.nama}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lokasi" className="text-slate-500 font-medium">LOKASI</Label>
                  <Input id="lokasi" placeholder="Gedung A" className="w-full bg-slate-50 border-slate-200" value={formData.lokasi} onChange={(e) => setFormData(prev => ({ ...prev, lokasi: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggal" className="text-slate-500 font-medium">TANGGAL</Label>
                  <Input id="tanggal" type="date" className="w-full bg-slate-50 border-slate-200" value={formData.tanggal} onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waktu" className="text-slate-500 font-medium">WAKTU</Label>
                  <Input id="waktu" placeholder="08:00 - 10:00" className="w-full bg-slate-50 border-slate-200" value={formData.waktu} onChange={(e) => setFormData(prev => ({ ...prev, waktu: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-500 font-medium">STATUS</Label>
                  <Select id="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-slate-50 border-slate-200">
                    <option value="">-- Pilih Status --</option>
                    {dummyStatus.map(status => <option key={status} value={status}>{status}</option>)}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="laporan" className="text-slate-500 font-medium">LAPORAN</Label>
                <Textarea id="laporan" placeholder="Laporan patroli" className="w-full bg-slate-50 border-slate-200" value={formData.laporan} onChange={(e) => setFormData(prev => ({ ...prev, laporan: e.target.value }))} rows={3} />
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
            <ShieldCheck className="h-5 w-5 text-blue-500" /> Daftar Patroli Security
          </CardTitle>
          <CardDescription className="text-slate-500">Lihat dan kelola patroli security</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Petugas</TableHead>
                <TableHead className="text-slate-600 font-medium">Lokasi</TableHead>
                <TableHead className="text-slate-600 font-medium">Tanggal</TableHead>
                <TableHead className="text-slate-600 font-medium">Waktu</TableHead>
                <TableHead className="text-slate-600 font-medium">Laporan</TableHead>
                <TableHead className="text-slate-600 font-medium">Status</TableHead>
                <TableHead className="text-slate-600 font-medium w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? data.map(item => (
                <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="font-medium">{item.petugas}</TableCell>
                  <TableCell>{item.lokasi}</TableCell>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.waktu}</TableCell>
                  <TableCell>{item.laporan}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'Selesai' ? 'bg-green-100 text-green-700' : item.status === 'Dalam Penanganan' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{item.status}</span>
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

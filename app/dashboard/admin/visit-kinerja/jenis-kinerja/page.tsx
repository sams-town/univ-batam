'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Settings } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type JenisKinerja = {
  id: string
  nama: string
  keterangan?: string
}

const dummyJenisKinerja: JenisKinerja[] = [
  { id: '1', nama: 'Kinerja Akademik', keterangan: 'Kinerja terkait kegiatan akademik' },
  { id: '2', nama: 'Kinerja Administratif', keterangan: 'Kinerja terkait kegiatan administrasi' },
  { id: '3', nama: 'Kinerja Penelitian', keterangan: 'Kinerja terkait kegiatan penelitian' }
]

export default function JenisKinerjaPage() {
  const [data, setData] = useState<JenisKinerja[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<JenisKinerja | null>(null)
  const [formData, setFormData] = useState({ nama: '', keterangan: '' })

  useEffect(() => {
    setData(dummyJenisKinerja)
    setLoading(false)
  }, [])

  const handleAdd = () => {
    const newItem: JenisKinerja = { id: Date.now().toString(), nama: formData.nama, keterangan: formData.keterangan }
    setData([...data, newItem])
    setIsModalOpen(false)
    resetForm()
  }

  const handleEdit = (item: JenisKinerja) => {
    setSelectedItem(item)
    setFormData({ nama: item.nama, keterangan: item.keterangan || '' })
    setIsModalOpen(true)
  }

  const handleUpdate = () => {
    if (!selectedItem) return
    const updatedData = data.map(item => item.id === selectedItem.id ? { ...item, nama: formData.nama, keterangan: formData.keterangan } : item)
    setData(updatedData)
    setIsModalOpen(false)
    setSelectedItem(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) setData(data.filter(item => item.id !== id))
  }

  const resetForm = () => {
    setFormData({ nama: '', keterangan: '' })
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
          <h1 className="text-3xl font-extrabold text-slate-900">Jenis Kinerja</h1>
          <p className="text-slate-500 mt-1">Kelola jenis kinerja pegawai dan dosen</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => { setSelectedItem(null); resetForm() }}>
              <Plus className="h-4 w-4" /> Tambah Jenis Kinerja
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedItem ? 'Edit Jenis Kinerja' : 'Tambah Jenis Kinerja'}</DialogTitle>
              <DialogDescription className="text-slate-500">SISTEM MANAJEMEN KINERJA</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-slate-500 font-medium">NAMA JENIS KINERJA</Label>
                <Input id="nama" placeholder="Nama jenis kinerja" className="w-full bg-slate-50 border-slate-200" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan" className="text-slate-500 font-medium">KETERANGAN</Label>
                <Textarea id="keterangan" placeholder="Keterangan (opsional)" className="w-full bg-slate-50 border-slate-200" value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} rows={4} />
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
            <Settings className="h-5 w-5 text-blue-500" /> Daftar Jenis Kinerja
          </CardTitle>
          <CardDescription className="text-slate-500">Lihat dan kelola jenis kinerja</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Nama</TableHead>
                <TableHead className="text-slate-600 font-medium">Keterangan</TableHead>
                <TableHead className="text-slate-600 font-medium w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? data.map(item => (
                <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.keterangan || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={3} className="text-center text-slate-500 py-8">Belum ada data</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

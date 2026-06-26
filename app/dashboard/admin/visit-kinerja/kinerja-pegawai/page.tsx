'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, User } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

type KinerjaPegawai = {
  id: string
  nama: string
  jabatan: string
  periode: string
  nilai: string
  status: string
}

const dummyKinerjaPegawai: KinerjaPegawai[] = [
  {
    id: '1',
    nama: 'Dr. Budi Santoso',
    jabatan: 'Dosen',
    periode: 'Januari 2024',
    nilai: '95',
    status: 'Sangat Baik'
  },
  {
    id: '2',
    nama: 'Siti Aminah',
    jabatan: 'Staff Administrasi',
    periode: 'Januari 2024',
    nilai: '88',
    status: 'Baik'
  }
]

const dummyPegawai = [
  { id: '1', nama: 'Dr. Budi Santoso', jabatan: 'Dosen' },
  { id: '2', nama: 'Siti Aminah', jabatan: 'Staff Administrasi' },
  { id: '3', nama: 'Budi Santoso', jabatan: 'Staff Keuangan' },
  { id: '4', nama: 'Dewi Lestari', jabatan: 'Staff HR' },
  { id: '5', nama: 'Agus Pratama', jabatan: 'Staff IT' }
]

const dummyStatus = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang']

export default function KinerjaPegawaiPage() {
  const [data, setData] = useState<KinerjaPegawai[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<KinerjaPegawai | null>(null)
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    periode: '',
    nilai: '',
    status: ''
  })

  useEffect(() => {
    setData(dummyKinerjaPegawai)
    setLoading(false)
  }, [])

  const handleAdd = () => {
    const newItem: KinerjaPegawai = {
      id: Date.now().toString(),
      nama: formData.nama,
      jabatan: formData.jabatan,
      periode: formData.periode,
      nilai: formData.nilai,
      status: formData.status
    }
    setData([...data, newItem])
    setIsModalOpen(false)
    resetForm()
  }

  const handleEdit = (item: KinerjaPegawai) => {
    setSelectedItem(item)
    setFormData({
      nama: item.nama,
      jabatan: item.jabatan,
      periode: item.periode,
      nilai: item.nilai,
      status: item.status
    })
    setIsModalOpen(true)
  }

  const handleUpdate = () => {
    if (!selectedItem) return
    const updatedData = data.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          nama: formData.nama,
          jabatan: formData.jabatan,
          periode: formData.periode,
          nilai: formData.nilai,
          status: formData.status
        }
      }
      return item
    })
    setData(updatedData)
    setIsModalOpen(false)
    setSelectedItem(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setData(data.filter(item => item.id !== id))
    }
  }

  const handlePegawaiChange = (nama: string) => {
    const pegawai = dummyPegawai.find(p => p.nama === nama)
    if (pegawai) {
      setFormData({ ...formData, nama: pegawai.nama, jabatan: pegawai.jabatan })
    } else {
      setFormData({ ...formData, nama, jabatan: '' })
    }
  }

  const resetForm = () => {
    setFormData({
      nama: '',
      jabatan: '',
      periode: '',
      nilai: '',
      status: ''
    })
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
          <h1 className="text-3xl font-extrabold text-slate-900">Kinerja Pegawai</h1>
          <p className="text-slate-500 mt-1">Kelola kinerja pegawai dan dosen</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => {
              setSelectedItem(null)
              resetForm()
            }}>
              <Plus className="h-4 w-4" />
              Tambah Kinerja Pegawai
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedItem ? 'Edit Kinerja Pegawai' : 'Tambah Kinerja Pegawai'}</DialogTitle>
              <DialogDescription className="text-slate-500">SISTEM MANAJEMEN KINERJA</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-slate-500 font-medium">NAMA PEGAWAI</Label>
                <Select
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handlePegawaiChange(e.target.value)}
                  className="w-full bg-slate-50 border-slate-200"
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {dummyPegawai.map(pegawai => (
                    <option key={pegawai.id} value={pegawai.nama}>
                      {pegawai.nama}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan" className="text-slate-500 font-medium">JABATAN</Label>
                <Input
                  id="jabatan"
                  placeholder="Jabatan"
                  className="w-full bg-slate-50 border-slate-200"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periode" className="text-slate-500 font-medium">PERIODE</Label>
                  <Input
                    id="periode"
                    placeholder="Januari 2024"
                    className="w-full bg-slate-50 border-slate-200"
                    value={formData.periode}
                    onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nilai" className="text-slate-500 font-medium">NILAI</Label>
                  <Input
                    id="nilai"
                    type="number"
                    placeholder="95"
                    className="w-full bg-slate-50 border-slate-200"
                    value={formData.nilai}
                    onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-500 font-medium">STATUS KINERJA</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-50 border-slate-200"
                >
                  <option value="">-- Pilih Status --</option>
                  {dummyStatus.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
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
            <User className="h-5 w-5 text-blue-500" />
            Daftar Kinerja Pegawai
          </CardTitle>
          <CardDescription className="text-slate-500">Lihat dan kelola kinerja pegawai</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Nama</TableHead>
                <TableHead className="text-slate-600 font-medium">Jabatan</TableHead>
                <TableHead className="text-slate-600 font-medium">Periode</TableHead>
                <TableHead className="text-slate-600 font-medium">Nilai</TableHead>
                <TableHead className="text-slate-600 font-medium">Status</TableHead>
                <TableHead className="text-slate-600 font-medium w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map(item => (
                  <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>{item.jabatan}</TableCell>
                    <TableCell>{item.periode}</TableCell>
                    <TableCell>{item.nilai}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'Sangat Baik' ? 'bg-green-100 text-green-700' :
                        item.status === 'Baik' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'Cukup' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{item.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">Belum ada data</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

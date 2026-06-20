'use client'

import { useState } from 'react'
import { Calendar, User, Clock, CheckCircle2, X, Plus, Edit, Trash2, FileText, Download, ArrowLeft, ArrowRight, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

// Mock data
const mockKaryawan = [
  { id: '1', nip: '2201001', nama: 'Ahmad Rizky', jabatan: 'Staff IT' },
  { id: '2', nip: '2201002', nama: 'Siti Aminah', jabatan: 'Staff Keuangan' },
  { id: '3', nip: '2201003', nama: 'Budi Santoso', jabatan: 'Supervisor' },
]

const mockCuti = [
  {
    id: '1',
    karyawanId: '1',
    nip: '2201001',
    nama: 'Ahmad Rizky',
    jenis: 'Cuti Tahunan',
    tanggalMulai: '2024-06-24',
    tanggalSelesai: '2024-06-26',
    alasan: 'Liburan keluarga',
    status: 'Menunggu Persetujuan',
  },
  {
    id: '2',
    karyawanId: '2',
    nip: '2201002',
    nama: 'Siti Aminah',
    jenis: 'Cuti Sakit',
    tanggalMulai: '2024-06-20',
    tanggalSelesai: '2024-06-20',
    alasan: 'Demam',
    status: 'Disetujui',
  },
]

const jenisCuti = ['Cuti Tahunan', 'Cuti Sakit', 'Cuti Melahirkan', 'Cuti Besar', 'Izin', 'Lainnya']
const statusCuti = ['Menunggu Persetujuan', 'Disetujui', 'Ditolak']

const initialFormData = {
  karyawanId: '',
  jenis: '',
  tanggalMulai: '',
  tanggalSelesai: '',
  alasan: '',
  keterangan: '',
}

export default function CutiPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('pengajuan')
  const [formData, setFormData] = useState(initialFormData)

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentTab('pengajuan')
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Data Cuti Karyawan</h1>
          <p className="text-slate-500 mt-2">Review and manage employee leave requests and medical certificates.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsModalOpen(open)
        }}>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pengajuan Cuti
          </Button>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto w-[98vw] h-[95vh] sm:max-w-[98vw] p-6">
            <DialogHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <DialogTitle className="text-2xl font-bold">Pengajuan Cuti Baru</DialogTitle>
                    <DialogDescription className="text-sm">Isi form untuk mengajukan cuti karyawan</DialogDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                  <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Simpan
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="w-full overflow-x-auto flex flex-nowrap bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="pengajuan" className="flex-1 min-w-fit data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <FileText className="h-4 w-4 mr-2" />
                  Data Pengajuan
                </TabsTrigger>
                <TabsTrigger value="dokumen" className="flex-1 min-w-fit data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                  <FileText className="h-4 w-4 mr-2" />
                  Lampiran Dokumen
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pengajuan" className="space-y-6 mt-0">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                      Data Karyawan & Cuti
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-1">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Pilih Karyawan</Label>
                      <Select
                        value={formData.karyawanId}
                        onChange={(e) => setFormData({ ...formData, karyawanId: e.target.value })}
                      >
                        <option value="">Pilih Karyawan</option>
                        {mockKaryawan.map((k) => (
                          <option key={k.id} value={k.id}>{k.nip} - {k.nama}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Jenis Cuti</Label>
                      <Select
                        value={formData.jenis}
                        onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                      >
                        <option value="">Pilih Jenis Cuti</option>
                        {jenisCuti.map((j) => <option key={j} value={j}>{j}</option>)}
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tanggal Mulai</Label>
                      <Input
                        type="date"
                        value={formData.tanggalMulai}
                        onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tanggal Selesai</Label>
                      <Input
                        type="date"
                        value={formData.tanggalSelesai}
                        onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Alasan</Label>
                      <Textarea
                        value={formData.alasan}
                        onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                        placeholder="Jelaskan alasan cuti"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Keterangan Tambahan (Opsional)</Label>
                      <Textarea
                        value={formData.keterangan}
                        onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                        placeholder="Keterangan tambahan"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dokumen" className="space-y-6 mt-0">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-amber-600" />
                      </div>
                      Lampiran Dokumen Pendukung
                    </CardTitle>
                    <CardDescription className="text-sm">Upload dokumen seperti surat keterangan dokter (opsional)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Dokumen Pendukung</Label>
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                        />
                      </div>
                      <div className="text-sm text-slate-500">
                        <p>Format yang didukung: PDF, PNG, JPG (max 5MB per file)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                {currentTab !== 'pengajuan' ? (
                  <Button type="button" variant="secondary" onClick={() => setCurrentTab('pengajuan')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Sebelumnya
                  </Button>
                ) : <div />}
                {currentTab !== 'dokumen' ? (
                  <Button type="button" variant="secondary" onClick={() => setCurrentTab('dokumen')}>
                    Selanjutnya
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : <div />}
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-slate-700">Karyawan</Label>
              <Select defaultValue="">
                <option value="">Semua Karyawan</option>
                {mockKaryawan.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-slate-700">Tanggal Mulai</Label>
              <Input type="date" />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-medium text-slate-700">Tanggal Akhir</Label>
              <Input type="date" />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead>NIP</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis Cuti</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCuti.map((cuti) => (
                <TableRow key={cuti.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono">{cuti.nip}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${cuti.nama}`} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700">
                          {cuti.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-800">{cuti.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell>{cuti.jenis}</TableCell>
                  <TableCell>{cuti.tanggalMulai} - {cuti.tanggalSelesai}</TableCell>
                  <TableCell>
                    <Badge className={
                      cuti.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' :
                      cuti.status === 'Ditolak' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }>
                      {cuti.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><FileText className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
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

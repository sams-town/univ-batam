'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Upload, Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type Dokumen = {
  id: string
  namaFile: string
  kategori: string
  ukuran: string
  pemilik: string
  tanggalUpload: string
}

const dummyDokumen: Dokumen[] = [
  {
    id: '1',
    namaFile: 'Surat Kontrak Kerja - Siti Aminah.pdf',
    kategori: 'Kontrak Kerja',
    ukuran: '2.5 MB',
    pemilik: 'Siti Aminah',
    tanggalUpload: '2024-01-10'
  },
  {
    id: '2',
    namaFile: 'Sertifikat Pelatihan - Dr. Budi Santoso.docx',
    kategori: 'Sertifikat',
    ukuran: '1.2 MB',
    pemilik: 'Dr. Budi Santoso',
    tanggalUpload: '2024-01-15'
  },
  {
    id: '3',
    namaFile: 'KTP - Budi Santoso.jpg',
    kategori: 'Identitas',
    ukuran: '800 KB',
    pemilik: 'Budi Santoso',
    tanggalUpload: '2024-01-20'
  }
]

const dummyPegawai = [
  { id: '1', nama: 'Dr. Budi Santoso' },
  { id: '2', nama: 'Siti Aminah' },
  { id: '3', nama: 'Budi Santoso' },
  { id: '4', nama: 'Dewi Lestari' },
  { id: '5', nama: 'Agus Pratama' }
]

const dummyKategori = [
  'Kontrak Kerja',
  'Sertifikat',
  'Identitas',
  'Laporan',
  'Surat'
]

export default function DokumenPegawaiPage() {
  const [data, setData] = useState<Dokumen[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('SEMUA FILE')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setData(dummyDokumen)
    setLoading(false)
  }, [])

  const filteredData = data.filter(item => {
    const matchesSearch = item.namaFile.toLowerCase().includes(search.toLowerCase()) || item.pemilik.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'SEMUA FILE' || item.kategori === filter
    return matchesSearch && matchesFilter
  })

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
          <h1 className="text-3xl font-extrabold text-slate-900">Dokumen Pegawai</h1>
          <p className="text-slate-500 mt-1">Penyimpanan dokumen digital terpusat</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              <Plus className="h-4 w-4" />
              UPLOAD DOKUMEN
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Tambah Data Dokumen</DialogTitle>
              <DialogDescription className="text-slate-500">SISTEM PENGARSIPAN DIGITAL</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pegawai" className="text-slate-500 font-medium">NAMA PEGAWAI</Label>
                <Input id="pegawai" placeholder="-- Pilih Pegawai --" className="w-full bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama-dokumen" className="text-slate-500 font-medium">NAMA DOKUMEN</Label>
                <Input id="nama-dokumen" placeholder="Contoh: Ijazah S1, Sertifikat Pelatihan" className="w-full bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal-upload" className="text-slate-500 font-medium">TANGGAL UPLOAD</Label>
                <Input id="tanggal-upload" type="date" className="w-full bg-slate-50 border-slate-200" defaultValue="2026-06-26" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500 font-medium">DOKUMEN</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 p-10 text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
                    <Upload className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Pilih File atau Drag & Drop</h3>
                  <p className="text-slate-400 text-sm mt-1">Tidak ada file yang dipilih</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-500 font-bold text-xs">i</span>
                    </div>
                    <p className="text-amber-700 text-sm font-medium">
                      FILE YANG DIPERBOLEHKAN: DOC, DOCX, PDF, XLS, XLSX, PPT, PPTX DAN MAX SIZE 10 MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="grid grid-cols-2 gap-4 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="w-full">BATAL</Button>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                SIMPAN DOKUMEN
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 bg-white rounded-[32px] shadow-lg">
        <CardHeader className="pb-4 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-2/5">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Cari nama dokumen atau pemilik..."
                className="pl-10 bg-slate-50 border-slate-200 rounded-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-400" />
              <div className="flex gap-1">
                {['SEMUA FILE', ...dummyKategori].map(kategori => (
                  <Button 
                    key={kategori} 
                    variant={filter === kategori ? 'default' : 'ghost'} 
                    onClick={() => setFilter(kategori)}
                    className="text-xs"
                  >
                    {kategori}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-400 font-semibold">NAMA FILE</TableHead>
                <TableHead className="text-slate-400 font-semibold">KATEGORI</TableHead>
                <TableHead className="text-slate-400 font-semibold">UKURAN</TableHead>
                <TableHead className="text-slate-400 font-semibold">PEMILIK</TableHead>
                <TableHead className="text-slate-400 font-semibold">TANGGAL UPLOAD</TableHead>
                <TableHead className="text-slate-400 font-semibold text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-700">{item.namaFile}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{item.kategori}</span>
                    </TableCell>
                    <TableCell className="text-slate-600">{item.ukuran}</TableCell>
                    <TableCell className="text-slate-600">{item.pemilik}</TableCell>
                    <TableCell className="text-slate-600">{item.tanggalUpload}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400 py-16 text-lg font-medium">
                    Tidak ada dokumen ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

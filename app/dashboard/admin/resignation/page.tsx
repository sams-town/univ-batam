'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Eye, UserMinus, Clock, CheckCircle2, FileText, Search } from 'lucide-react'

type Resignation = {
  id: number
  employeeName: string
  employeeInitials: string
  startDate: string
  endDate?: string
  type: 'PHK' | 'Pemutusan Hubungan Kerja (PHK)' | 'Mengundurkan Diri' | 'Meninggal Dunia' | 'Pensiun'
  reason: string
  file?: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

const initialResignations: Resignation[] = [
  {
    id: 1,
    employeeName: 'Admin Personalia',
    employeeInitials: 'AP',
    startDate: '2026-06-15',
    endDate: '2026-06-30',
    type: 'Pemutusan Hubungan Kerja (PHK)',
    reason: 'Dihapus oleh admin...',
    status: 'Approved'
  }
]

export default function ResignationManagementPage() {
  const [resignations, setResignations] = useState<Resignation[]>(initialResignations)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResignation, setEditingResignation] = useState<Resignation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState<Partial<Resignation>>({
    employeeName: '',
    startDate: '',
    endDate: '',
    type: undefined,
    reason: '',
    status: 'Pending'
  })

  const handleOpenModal = (resignation?: Resignation) => {
    if (resignation) {
      setEditingResignation(resignation)
      setFormData(resignation)
    } else {
      setEditingResignation(null)
      setFormData({
        employeeName: '',
        startDate: '',
        endDate: '',
        type: undefined,
        reason: '',
        status: 'Pending'
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (editingResignation) {
      setResignations(resignations.map(r => r.id === editingResignation.id ? { ...r, ...formData } as Resignation : r))
    } else {
      const newResignation: Resignation = {
        ...formData,
        id: Date.now(),
        employeeInitials: formData.employeeName ? formData.employeeName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'XX'
      } as Resignation
      setResignations([...resignations, newResignation])
    }
    setIsModalOpen(false)
  }

  const filteredResignations = resignations.filter(r =>
    r.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-amber-100 text-amber-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Pegawai Keluar</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage employee resignations and offboarding processes.</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-full py-6 px-8 shadow-lg shadow-indigo-500/30"
        >
          <Plus className="h-6 w-6 mr-2" />
          Tambah
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 bg-white hover:shadow-lg transition-all rounded-3xl p-6">
          <CardContent className="p-0 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <UserMinus className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Total Resignations</p>
              <p className="text-4xl font-extrabold text-slate-900">{resignations.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white hover:shadow-lg transition-all rounded-3xl p-6">
          <CardContent className="p-0 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Pending Approval</p>
              <p className="text-4xl font-extrabold text-slate-900">{resignations.filter(r => r.status === 'Pending').length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white hover:shadow-lg transition-all rounded-3xl p-6">
          <CardContent className="p-0 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Approved</p>
              <p className="text-4xl font-extrabold text-slate-900">{resignations.filter(r => r.status === 'Approved').length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white hover:shadow-lg transition-all rounded-3xl p-6">
          <CardContent className="p-0 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-purple-50 flex items-center justify-center">
              <div className="h-8 w-8 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L16 8L12 12" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12L8 16L12 20" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8L4 12L8 16" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 8L20 12L16 16" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Turnover Rate</p>
              <p className="text-4xl font-extrabold text-slate-900">0.4%</p>
              <p className="text-xs text-slate-500 mt-1">Bulan ini (2 keluar / 480 rata-rata)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-slate-200 bg-white rounded-3xl p-6">
        <CardContent className="p-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-xs uppercase text-slate-400 font-semibold">Nama Pegawai</Label>
              <div className="relative">
                <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-slate-50 border-slate-200 rounded-full py-6 text-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs uppercase text-slate-400 font-semibold">Tanggal Mulai</Label>
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <path d="M8 2V5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 2V5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3.5 9.09H20.5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 4 8 4H16C19.5 4 21 5.5 21 8.5Z" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <Input
                  id="startDate"
                  type="date"
                  className="pl-12 bg-slate-50 border-slate-200 rounded-full py-6 text-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs uppercase text-slate-400 font-semibold">Tanggal Akhir</Label>
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <path d="M8 2V5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 2V5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3.5 9.09H20.5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 4 8 4H16C19.5 4 21 5.5 21 8.5Z" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <Input
                  id="endDate"
                  type="date"
                  className="pl-12 bg-slate-50 border-slate-200 rounded-full py-6 text-lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 bg-white rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs">No.</TableHead>
                <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Nama Pegawai</TableHead>
                <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Tanggal</TableHead>
                <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Jenis</TableHead>
                <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Alasan</TableHead>
                <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs">File</TableHead>
                <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Status</TableHead>
                <TableHead className="text-slate-400 font-semibold uppercase tracking-wider text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResignations.map((resignation, index) => (
                <TableRow key={resignation.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                  <TableCell className="font-semibold text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg font-extrabold text-indigo-700 shadow-md">
                        {resignation.employeeInitials}
                      </div>
                      <span className="font-semibold text-slate-900">{resignation.employeeName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 text-lg font-medium">
                      {new Date(resignation.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 text-lg font-medium">{resignation.type}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 font-medium">{resignation.reason}</span>
                  </TableCell>
                  <TableCell>
                    {resignation.file ? (
                      <Button variant="secondary" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Lihat
                      </Button>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(resignation.status)} rounded-full px-4 py-1.5 font-semibold uppercase text-xs`}>
                      {resignation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600">
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600"
                      onClick={() => handleOpenModal(resignation)}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl overflow-hidden">
          <DialogHeader className="pb-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-extrabold">
                {editingResignation ? 'Edit Pegawai Keluar' : 'Tambah Pegawai Keluar'}
              </DialogTitle>
              <DialogDescription className="text-lg text-slate-500 mt-1">
                {editingResignation ? 'Ubah data pegawai keluar' : 'Isi form berikut untuk menambahkan data'}
              </DialogDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full h-14 w-14 bg-slate-100 hover:bg-slate-200">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName" className="text-sm font-semibold uppercase text-slate-400">Pegawai *</Label>
              <Select
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                className="bg-slate-50 border-slate-200 rounded-full py-6 text-lg"
              >
                <option value="">Pilih pegawai...</option>
                <option value="Siti Aminah">Siti Aminah</option>
                <option value="Rizky Pratama">Rizky Pratama</option>
                <option value="Dewi Lestari">Dewi Lestari</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold uppercase text-slate-400">Jenis Keberhentian *</Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="bg-slate-50 border-slate-200 rounded-full py-6 text-lg"
              >
                <option value="">-- Pilih Jenis Keberhentian --</option>
                <option value="Pemutusan Hubungan Kerja (PHK)">PHK</option>
                <option value="Mengundurkan Diri">Mengundurkan Diri</option>
                <option value="Meninggal Dunia">Meninggal Dunia</option>
                <option value="Pensiun">Pensiun</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold uppercase text-slate-400">Alasan *</Label>
              <Input
                id="reason"
                placeholder="Masukkan alasan..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="bg-slate-50 border-slate-200 rounded-full py-6 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold uppercase text-slate-400">Tanggal</Label>
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <path d="M8 2V5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 2V5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3.5 9.09H20.5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 4 8 4H16C19.5 4 21 5.5 21 8.5Z" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <Input
                  id="date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="pl-12 bg-slate-50 border-slate-200 rounded-full py-6 text-lg"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <Button variant="ghost" className="flex-1 rounded-full py-7 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xl font-semibold" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button className="flex-1 rounded-full py-7 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-xl font-semibold shadow-lg shadow-indigo-500/40" onClick={handleSave}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M17 3H21V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 17V21H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 21H3V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 7V3H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

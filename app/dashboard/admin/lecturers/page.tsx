'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Users, X, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

type Lecturer = {
  id: string
  nip: string
  department: { name: string; code: string }
  profile: { 
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

type Department = {
  id: string
  name: string
  code: string
}

export default function AdminLecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    nip: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    department_id: '',
  })

  async function loadLecturers() {
    const { data } = await supabase
      .from('lecturers')
      .select('*, department:departments(name, code), profile:profiles(first_name, last_name, email, phone)')
      .order('id')
    
    setLecturers(data || [])
    setLoading(false)
  }

  async function loadDepartments() {
    const { data } = await supabase.from('departments').select('id, name, code').order('name')
    setDepartments(data || [])
  }

  useEffect(() => {
    loadLecturers()
    loadDepartments()
  }, [])

  const handleSubmit = async () => {
    try {
      if (!formData.first_name || !formData.email || !formData.password) {
        alert('Nama Depan, Email, dan Password wajib diisi!')
        return
      }

      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.first_name,
          lastName: formData.last_name,
          phone: formData.phone,
          roleName: 'dosen',
          details: {
            nip: formData.nip || Math.floor(Math.random() * 100000000).toString(),
            department_id: formData.department_id || null
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Gagal membuat akun dosen')
        return
      }

      alert('Dosen berhasil ditambahkan!')
      setIsModalOpen(false)
      setFormData({ nip: '', first_name: '', last_name: '', email: '', password: '', phone: '', department_id: '' })
      loadLecturers()
    } catch (err) {
      console.error('Error adding lecturer:', err)
      alert('Terjadi kesalahan!')
    }
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
          <h1 className="text-3xl font-extrabold text-slate-900">Kelola Dosen</h1>
          <p className="text-slate-500 mt-1">Kelola data dosen, tambah, edit, dan hapus akun</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Dosen Baru
        </Button>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Users className="h-5 w-5 text-purple-500" />
            Daftar Dosen
          </CardTitle>
          <CardDescription className="text-slate-500">Data seluruh dosen terdaftar di sistem</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">NIP</TableHead>
                <TableHead className="text-slate-600 font-medium">Nama</TableHead>
                <TableHead className="text-slate-600 font-medium">Departemen</TableHead>
                <TableHead className="text-slate-600 font-medium">Email</TableHead>
                <TableHead className="text-slate-600 font-medium">Telepon</TableHead>
                <TableHead className="text-slate-600 font-medium w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lecturers.length > 0 ? (
                lecturers.map((lecturer) => (
                  <TableRow key={lecturer.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium">{lecturer.nip}</TableCell>
                    <TableCell>
                      {lecturer.profile?.first_name} {lecturer.profile?.last_name}
                    </TableCell>
                    <TableCell>
                      {lecturer.department?.code} - {lecturer.department?.name}
                    </TableCell>
                    <TableCell>{lecturer.profile?.email}</TableCell>
                    <TableCell>{lecturer.profile?.phone || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
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
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    Belum ada data dosen
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dosen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Tambah Dosen Baru</DialogTitle>
            <DialogDescription>Masukkan data dosen baru</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label>NIP</Label>
              <Input 
                placeholder="Nomor Induk Pegawai"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label>Nama Depan</Label>
                <Input 
                  placeholder="Nama depan"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label>Nama Belakang</Label>
                <Input 
                  placeholder="Nama belakang"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label>Email</Label>
              <Input 
                type="email"
                placeholder="email@universitas.ac.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label>Password</Label>
              <Input 
                type="password"
                placeholder="Password minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label>Nomor Telepon</Label>
              <Input 
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label>Departemen</Label>
              <Select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                <option value="">Pilih Departemen</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSubmit}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

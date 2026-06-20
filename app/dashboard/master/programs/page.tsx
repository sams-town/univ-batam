'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2 } from 'lucide-react'

type Program = {
  id: string
  name: string
  code: string
  degree: string
  description: string
  program_id: string
  department: { name: string }
}

type Department = {
  id: string
  name: string
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    program_id: '',
    degree: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  async function loadPrograms() {
    const { data } = await supabase
      .from('programs')
      .select('*, department:departments(name)')
      .order('name')
    
    setPrograms(data || [])
    setLoading(false)
  }

  async function loadDepartments() {
    const { data } = await supabase
      .from('departments')
      .select('id, name')
      .order('name')
    
    setDepartments(data || [])
  }

  useEffect(() => {
    loadPrograms()
    loadDepartments()
  }, [])

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('programs')
        .insert([{
          code: formData.code,
          name: formData.name,
          program_id: formData.program_id,
          degree: formData.degree,
          description: formData.description
        }])
      
      if (!error) {
        await loadPrograms()
        resetForm()
        setAddDialogOpen(false)
      }
    } catch (error) {
      console.error('Error adding program:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleEditClick(prog: Program) {
    setFormData({
      id: prog.id,
      code: prog.code,
      name: prog.name,
      program_id: prog.program_id,
      degree: prog.degree,
      description: prog.description
    })
    setEditDialogOpen(true)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('programs')
        .update({
          code: formData.code,
          name: formData.name,
          program_id: formData.program_id,
          degree: formData.degree,
          description: formData.description
        })
        .eq('id', formData.id)
      
      if (!error) {
        await loadPrograms()
        resetForm()
        setEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Error updating program:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDeleteClick(prog: Program) {
    setFormData({
      id: prog.id,
      code: prog.code,
      name: prog.name,
      program_id: prog.program_id,
      degree: prog.degree,
      description: prog.description
    })
    setDeleteDialogOpen(true)
  }

  async function handleDeleteSubmit() {
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', formData.id)
      
      if (!error) {
        await loadPrograms()
        resetForm()
        setDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error('Error deleting program:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setFormData({ id: '', code: '', name: '', program_id: '', degree: '', description: '' })
  }

  if (loading) {
    return (
      <div className="p-8">Loading...</div>
    )
  }

  return (
    <div className="flex justify-between items-center mb-6 flex-col gap-6">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-xl font-semibold">Data Program Studi</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Program Studi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Program Studi</DialogTitle>
              <DialogDescription>
                Masukkan detail program studi baru di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-code">Kode Program</Label>
                  <Input
                    id="add-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: TI-S1"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Nama Program Studi</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Teknik Informatika"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-department">Jurusan</Label>
                  <Select
                    id="add-department"
                    value={formData.program_id}
                    onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih jurusan</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-degree">Jenjang</Label>
                  <Select
                    id="add-degree"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    required
                  >
                    <option value="">Pilih jenjang</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-description">Deskripsi</Label>
                  <Textarea
                    id="add-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi program studi..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => { setAddDialogOpen(false); resetForm(); }} disabled={submitting}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Program Studi</TableHead>
                <TableHead>Jurusan</TableHead>
                <TableHead>Jenjang</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((prog) => (
                <TableRow key={prog.id}>
                  <TableCell>{prog.code}</TableCell>
                  <TableCell>{prog.name}</TableCell>
                  <TableCell>{prog.department?.name}</TableCell>
                  <TableCell>{prog.degree}</TableCell>
                  <TableCell>{prog.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(prog)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(prog)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Program Studi</DialogTitle>
            <DialogDescription>
              Ubah detail program studi di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Kode Program</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: TI-S1"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Program Studi</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Teknik Informatika"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Jurusan</Label>
                <Select
                  id="edit-department"
                  value={formData.program_id}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                  required
                >
                  <option value="">Pilih jurusan</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-degree">Jenjang</Label>
                <Select
                  id="edit-degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  required
                >
                  <option value="">Pilih jenjang</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi program studi..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => { setEditDialogOpen(false); resetForm(); }} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Program Studi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus program studi <strong>{formData.name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => { setDeleteDialogOpen(false); resetForm(); }} disabled={submitting}>
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteSubmit} disabled={submitting}>
              {submitting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

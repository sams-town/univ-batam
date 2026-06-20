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
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Semester = {
  id: string
  name: string
  is_active: boolean
  academic_year_id: string
  academic_year: { name: string }
}

type AcademicYear = {
  id: string
  name: string
}

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    academic_year_id: '',
    is_active: false
  })
  const [submitting, setSubmitting] = useState(false)

  async function loadSemesters() {
    const { data } = await supabase
      .from('semesters')
      .select('*, academic_year:academic_years(name)')
      .order('academic_year_id', { ascending: false })
    
    setSemesters(data || [])
    setLoading(false)
  }

  async function loadAcademicYears() {
    const { data } = await supabase
      .from('academic_years')
      .select('id, name')
      .order('name', { ascending: false })
    
    setAcademicYears(data || [])
  }

  useEffect(() => {
    loadSemesters()
    loadAcademicYears()
  }, [])

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // If setting as active, first set all others to inactive
      if (formData.is_active) {
        await supabase
          .from('semesters')
          .update({ is_active: false })
          .is('is_active', true)
      }

      const { error } = await supabase
        .from('semesters')
        .insert([{
          name: formData.name,
          academic_year_id: formData.academic_year_id,
          is_active: formData.is_active
        }])
      
      if (!error) {
        await loadSemesters()
        resetForm()
        setAddDialogOpen(false)
      }
    } catch (error) {
      console.error('Error adding semester:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleEditClick(semester: Semester) {
    setFormData({
      id: semester.id,
      name: semester.name,
      academic_year_id: semester.academic_year_id,
      is_active: semester.is_active
    })
    setEditDialogOpen(true)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // If setting as active, first set all others to inactive
      if (formData.is_active) {
        await supabase
          .from('semesters')
          .update({ is_active: false })
          .is('is_active', true)
          .neq('id', formData.id)
      }

      const { error } = await supabase
        .from('semesters')
        .update({
          name: formData.name,
          academic_year_id: formData.academic_year_id,
          is_active: formData.is_active
        })
        .eq('id', formData.id)
      
      if (!error) {
        await loadSemesters()
        resetForm()
        setEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Error updating semester:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDeleteClick(semester: Semester) {
    setFormData({
      id: semester.id,
      name: semester.name,
      academic_year_id: semester.academic_year_id,
      is_active: semester.is_active
    })
    setDeleteDialogOpen(true)
  }

  async function handleDeleteSubmit() {
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('id', formData.id)
      
      if (!error) {
        await loadSemesters()
        resetForm()
        setDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error('Error deleting semester:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setFormData({ id: '', name: '', academic_year_id: '', is_active: false })
  }

  if (loading) {
    return (
      <div className="p-8">Loading...</div>
    )
  }

  return (
    <div className="flex justify-between items-center mb-6 flex-col gap-6">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-xl font-semibold">Data Semester</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Semester
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Semester</DialogTitle>
              <DialogDescription>
                Masukkan detail semester baru di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-academic_year_id">Tahun Ajaran</Label>
                  <Select
                    id="add-academic_year_id"
                    value={formData.academic_year_id}
                    onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih tahun ajaran</option>
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Nama Semester</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Ganjil 2023/2024"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="add-is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <Label htmlFor="add-is_active">Set sebagai semester aktif</Label>
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
                <TableHead>Tahun Ajaran</TableHead>
                <TableHead>Nama Semester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesters.map((semester) => (
                <TableRow key={semester.id}>
                  <TableCell>{semester.academic_year?.name}</TableCell>
                  <TableCell>{semester.name}</TableCell>
                  <TableCell>
                    <Badge variant={semester.is_active ? 'default' : 'secondary'}>
                      {semester.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(semester)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(semester)}>
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
            <DialogTitle>Edit Semester</DialogTitle>
            <DialogDescription>
              Ubah detail semester di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-academic_year_id">Tahun Ajaran</Label>
                <Select
                  id="edit-academic_year_id"
                  value={formData.academic_year_id}
                  onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                  required
                >
                  <option value="">Pilih tahun ajaran</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Semester</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ganjil 2023/2024"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="edit-is_active">Set sebagai semester aktif</Label>
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
            <DialogTitle>Hapus Semester</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus semester <strong>{formData.name}</strong>?
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


'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2 } from 'lucide-react'

type Course = {
  id: string
  name: string
  code: string
  credits: number
  description: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    credits: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  async function loadCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('name')
    
    setCourses(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadCourses()
  }, [])

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('courses')
        .insert([{
          code: formData.code,
          name: formData.name,
          credits: formData.credits ? parseInt(formData.credits) : null,
          description: formData.description
        }])
      
      if (!error) {
        await loadCourses()
        resetForm()
        setAddDialogOpen(false)
      }
    } catch (error) {
      console.error('Error adding course:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleEditClick(course: Course) {
    setFormData({
      id: course.id,
      code: course.code,
      name: course.name,
      credits: course.credits?.toString() || '',
      description: course.description
    })
    setEditDialogOpen(true)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          code: formData.code,
          name: formData.name,
          credits: formData.credits ? parseInt(formData.credits) : null,
          description: formData.description
        })
        .eq('id', formData.id)
      
      if (!error) {
        await loadCourses()
        resetForm()
        setEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Error updating course:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDeleteClick(course: Course) {
    setFormData({
      id: course.id,
      code: course.code,
      name: course.name,
      credits: course.credits?.toString() || '',
      description: course.description
    })
    setDeleteDialogOpen(true)
  }

  async function handleDeleteSubmit() {
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', formData.id)
      
      if (!error) {
        await loadCourses()
        resetForm()
        setDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setFormData({ id: '', code: '', name: '', credits: '', description: '' })
  }

  if (loading) {
    return (
      <div className="p-8">Loading...</div>
    )
  }

  return (
    <div className="flex justify-between items-center mb-6 flex-col gap-6">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-xl font-semibold">Data Mata Kuliah</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Mata Kuliah
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Mata Kuliah</DialogTitle>
              <DialogDescription>
                Masukkan detail mata kuliah baru di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-code">Kode Mata Kuliah</Label>
                  <Input
                    id="add-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: TI101"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Nama Mata Kuliah</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Dasar Pemrograman"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-credits">SKS</Label>
                  <Input
                    id="add-credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    placeholder="Contoh: 3"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-description">Deskripsi</Label>
                  <Textarea
                    id="add-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi mata kuliah..."
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
                <TableHead>Nama Mata Kuliah</TableHead>
                <TableHead>SKS</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(course)}>
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
            <DialogTitle>Edit Mata Kuliah</DialogTitle>
            <DialogDescription>
              Ubah detail mata kuliah di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Kode Mata Kuliah</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: TI101"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Mata Kuliah</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Dasar Pemrograman"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-credits">SKS</Label>
                <Input
                  id="edit-credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  placeholder="Contoh: 3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi mata kuliah..."
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
            <DialogTitle>Hapus Mata Kuliah</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus mata kuliah <strong>{formData.name}</strong>?
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

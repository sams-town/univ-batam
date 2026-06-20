'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type AcademicYear = {
  id: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
}

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    start_date: '',
    end_date: '',
    is_active: false
  })
  const [submitting, setSubmitting] = useState(false)

  async function loadYears() {
    const { data } = await supabase
      .from('academic_years')
      .select('*')
      .order('name', { ascending: false })
    
    setYears(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadYears()
  }, [])

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // If setting as active, first set all others to inactive
      if (formData.is_active) {
        await supabase
          .from('academic_years')
          .update({ is_active: false })
          .is('is_active', true)
      }

      const { error } = await supabase
        .from('academic_years')
        .insert([{
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_active: formData.is_active
        }])
      
      if (!error) {
        await loadYears()
        resetForm()
        setAddDialogOpen(false)
      }
    } catch (error) {
      console.error('Error adding academic year:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleEditClick(year: AcademicYear) {
    setFormData({
      id: year.id,
      name: year.name,
      start_date: year.start_date.split('T')[0],
      end_date: year.end_date.split('T')[0],
      is_active: year.is_active
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
          .from('academic_years')
          .update({ is_active: false })
          .is('is_active', true)
          .neq('id', formData.id)
      }

      const { error } = await supabase
        .from('academic_years')
        .update({
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_active: formData.is_active
        })
        .eq('id', formData.id)
      
      if (!error) {
        await loadYears()
        resetForm()
        setEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Error updating academic year:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDeleteClick(year: AcademicYear) {
    setFormData({
      id: year.id,
      name: year.name,
      start_date: year.start_date,
      end_date: year.end_date,
      is_active: year.is_active
    })
    setDeleteDialogOpen(true)
  }

  async function handleDeleteSubmit() {
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', formData.id)
      
      if (!error) {
        await loadYears()
        resetForm()
        setDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error('Error deleting academic year:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setFormData({ id: '', name: '', start_date: '', end_date: '', is_active: false })
  }

  if (loading) {
    return (
      <div className="p-8">Loading...</div>
    )
  }

  return (
    <div className="flex justify-between items-center mb-6 flex-col gap-6">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-xl font-semibold">Data Tahun Ajaran</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tahun Ajaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Tahun Ajaran</DialogTitle>
              <DialogDescription>
                Masukkan detail tahun ajaran baru di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Tahun Ajaran</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: 2023/2024"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-start_date">Tanggal Mulai</Label>
                  <Input
                    id="add-start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-end_date">Tanggal Selesai</Label>
                  <Input
                    id="add-end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="add-is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <Label htmlFor="add-is_active">Set sebagai tahun ajaran aktif</Label>
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
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {years.map((year) => (
                <TableRow key={year.id}>
                  <TableCell>{year.name}</TableCell>
                  <TableCell>{new Date(year.start_date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{new Date(year.end_date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge variant={year.is_active ? 'default' : 'secondary'}>
                      {year.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(year)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(year)}>
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
            <DialogTitle>Edit Tahun Ajaran</DialogTitle>
            <DialogDescription>
              Ubah detail tahun ajaran di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tahun Ajaran</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: 2023/2024"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-start_date">Tanggal Mulai</Label>
                <Input
                  id="edit-start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-end_date">Tanggal Selesai</Label>
                <Input
                  id="edit-end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="edit-is_active">Set sebagai tahun ajaran aktif</Label>
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
            <DialogTitle>Hapus Tahun Ajaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tahun ajaran <strong>{formData.name}</strong>?
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


'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2 } from 'lucide-react'

type Classroom = {
  id: string
  name: string
  code: string
  capacity: number | null
  location: string
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    capacity: '',
    location: ''
  })
  const [submitting, setSubmitting] = useState(false)

  async function loadClassrooms() {
    const { data } = await supabase
      .from('classrooms')
      .select('*')
      .order('name')
    
    setClassrooms(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadClassrooms()
  }, [])

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('classrooms')
        .insert([{
          code: formData.code,
          name: formData.name,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          location: formData.location
        }])
      
      if (!error) {
        await loadClassrooms()
        resetForm()
        setAddDialogOpen(false)
      }
    } catch (error) {
      console.error('Error adding classroom:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleEditClick(room: Classroom) {
    setFormData({
      id: room.id,
      code: room.code,
      name: room.name,
      capacity: room.capacity?.toString() || '',
      location: room.location
    })
    setEditDialogOpen(true)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('classrooms')
        .update({
          code: formData.code,
          name: formData.name,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          location: formData.location
        })
        .eq('id', formData.id)
      
      if (!error) {
        await loadClassrooms()
        resetForm()
        setEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Error updating classroom:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDeleteClick(room: Classroom) {
    setFormData({
      id: room.id,
      code: room.code,
      name: room.name,
      capacity: room.capacity?.toString() || '',
      location: room.location
    })
    setDeleteDialogOpen(true)
  }

  async function handleDeleteSubmit() {
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', formData.id)
      
      if (!error) {
        await loadClassrooms()
        resetForm()
        setDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error('Error deleting classroom:', error)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setFormData({ id: '', code: '', name: '', capacity: '', location: '' })
  }

  if (loading) {
    return (
      <div className="p-8">Loading...</div>
    )
  }

  return (
    <div className="flex justify-between items-center mb-6 flex-col gap-6">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-xl font-semibold">Data Ruang Kelas</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Ruang Kelas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Ruang Kelas</DialogTitle>
              <DialogDescription>
                Masukkan detail ruang kelas baru di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-code">Kode Ruang</Label>
                  <Input
                    id="add-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: RK-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Nama Ruang</Label>
                  <Input
                    id="add-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Ruang Kuliah 101"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-capacity">Kapasitas</Label>
                  <Input
                    id="add-capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Contoh: 40"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-location">Lokasi</Label>
                  <Input
                    id="add-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Gedung A Lt. 2"
                    required
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
                <TableHead>Nama Ruang</TableHead>
                <TableHead>Kapasitas</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.code}</TableCell>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{room.location}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(room)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(room)}>
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
            <DialogTitle>Edit Ruang Kelas</DialogTitle>
            <DialogDescription>
              Ubah detail ruang kelas di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Kode Ruang</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: RK-001"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Ruang</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ruang Kuliah 101"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-capacity">Kapasitas</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="Contoh: 40"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Lokasi</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Gedung A Lt. 2"
                  required
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
            <DialogTitle>Hapus Ruang Kelas</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus ruang kelas <strong>{formData.name}</strong>?
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

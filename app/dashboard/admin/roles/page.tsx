'use client'

import { useState } from 'react'
import { Shield, Users, User, GraduationCap, UserPlus, Edit, Trash2, Plus, CheckCircle2, X, Save, ArrowLeft, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Mock data
const mockRoles = [
  {
    id: '1',
    name: 'super_admin',
    displayName: 'Super Admin',
    description: 'Full access to all features',
    permissions: ['all'],
  },
  {
    id: '2',
    name: 'admin_akademik',
    displayName: 'Admin Akademik',
    description: 'Manage academic and SDM operations',
    permissions: ['dashboard', 'akademik-kbm', 'manajemen-sdm', 'manajemen-mahasiswa', 'keuangan-kampus', 'laporan-rekap'],
  },
  {
    id: '3',
    name: 'dosen',
    displayName: 'Dosen',
    description: 'Lecturer with teaching-related access',
    permissions: ['dashboard', 'absensi', 'profil'],
  },
  {
    id: '4',
    name: 'mahasiswa',
    displayName: 'Mahasiswa',
    description: 'Student with academic access',
    permissions: ['dashboard', 'absensi', 'profil', 'pembayaran-sks-mahasiswa'],
  },
  {
    id: '5',
    name: 'employee',
    displayName: 'Karyawan',
    description: 'Employee with HR access',
    permissions: ['dashboard', 'profil'],
  },
]

// Mock permission groups
const permissionGroups = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    permissions: [
      { id: 'dashboard.view', name: 'Lihat Dashboard' },
    ],
  },
  {
    id: 'akademik-kbm',
    name: 'Akademik & KBM',
    permissions: [
      { id: 'jadwal-kuliah.view', name: 'Lihat Jadwal Kuliah' },
      { id: 'jadwal-kuliah.edit', name: 'Edit Jadwal Kuliah' },
      { id: 'ruang-kelas.view', name: 'Lihat Ruang & Kelas' },
      { id: 'ruang-kelas.edit', name: 'Edit Ruang & Kelas' },
      { id: 'kurikulum-mk.view', name: 'Lihat Kurikulum' },
      { id: 'kurikulum-mk.edit', name: 'Edit Kurikulum' },
    ],
  },
  {
    id: 'manajemen-sdm',
    name: 'Manajemen SDM',
    permissions: [
      { id: 'data-dosen.view', name: 'Lihat Data Dosen' },
      { id: 'data-dosen.edit', name: 'Edit Data Dosen' },
      { id: 'data-karyawan.view', name: 'Lihat Data Karyawan' },
      { id: 'data-karyawan.edit', name: 'Edit Data Karyawan' },
      { id: 'shift.view', name: 'Lihat Shift' },
      { id: 'shift.edit', name: 'Edit Shift' },
      { id: 'cuti.view', name: 'Lihat Cuti' },
      { id: 'cuti.edit', name: 'Edit Cuti' },
      { id: 'cuti.approve', name: 'Setujui Cuti' },
      { id: 'pegawai-keluar.view', name: 'Lihat Pegawai Keluar' },
      { id: 'pegawai-keluar.edit', name: 'Edit Pegawai Keluar' },
      { id: 'payroll.view', name: 'Lihat Payroll' },
      { id: 'payroll.edit', name: 'Edit Payroll' },
    ],
  },
  {
    id: 'manajemen-mahasiswa',
    name: 'Manajemen Mahasiswa',
    permissions: [
      { id: 'data-mahasiswa.view', name: 'Lihat Data Mahasiswa' },
      { id: 'data-mahasiswa.edit', name: 'Edit Data Mahasiswa' },
      { id: 'perizinan-absensi.view', name: 'Lihat Perizinan' },
      { id: 'perizinan-absensi.edit', name: 'Edit Perizinan' },
      { id: 'pelanggaran.view', name: 'Lihat Pelanggaran' },
      { id: 'pelanggaran.edit', name: 'Edit Pelanggaran' },
    ],
  },
  {
    id: 'keuangan-kampus',
    name: 'Keuangan Kampus',
    permissions: [
      { id: 'tagihan-ukt.view', name: 'Lihat Tagihan UKT' },
      { id: 'tagihan-ukt.edit', name: 'Edit Tagihan UKT' },
      { id: 'pembayaran-sks-admin.view', name: 'Lihat Pembayaran' },
      { id: 'pembayaran-sks-admin.edit', name: 'Edit Pembayaran' },
      { id: 'laporan-keuangan.view', name: 'Lihat Laporan' },
    ],
  },
  {
    id: 'laporan-rekap',
    name: 'Laporan & Rekap',
    permissions: [
      { id: 'rekap-absensi-dosen.view', name: 'Lihat Rekap Absensi Dosen' },
      { id: 'rekap-absensi-mahasiswa.view', name: 'Lihat Rekap Absensi Mahasiswa' },
      { id: 'laporan-keuangan.view', name: 'Lihat Laporan Keuangan' },
    ],
  },
  {
    id: 'absensi',
    name: 'Absensi',
    permissions: [
      { id: 'absensi.view', name: 'Lihat Absensi' },
      { id: 'absensi.create', name: 'Isi Absensi' },
      { id: 'absensi.edit', name: 'Edit Absensi' },
      { id: 'absen.delete', name: 'Hapus Absensi' },
    ],
  },
  {
    id: 'profil',
    name: 'Profil',
    permissions: [
      { id: 'profil.view', name: 'Lihat Profil' },
      { id: 'profil.edit', name: 'Edit Profil' },
    ],
  },
  {
    id: 'pembayaran-sks-mahasiswa',
    name: 'Pembayaran SKS',
    permissions: [
      { id: 'pembayaran-sks.view', name: 'Lihat Pembayaran' },
      { id: 'pembayaran-sks.create', name: 'Buat Pembayaran' },
    ],
  },
  {
    id: 'settings',
    name: 'Pengaturan',
    permissions: [
      { id: 'settings.view', name: 'Lihat Pengaturan' },
      { id: 'settings.edit', name: 'Edit Pengaturan' },
    ],
  },
]

export default function RolesPage() {
  const [roles, setRoles] = useState(mockRoles)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('info')
  const [editingRole, setEditingRole] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
  })

  const handleAddRole = () => {
    setEditingRole(null)
    setFormData({ name: '', displayName: '', description: '', permissions: [] })
    setCurrentTab('info')
    setIsModalOpen(true)
  }

  const handleEditRole = (role: any) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: Array.isArray(role.permissions) && role.permissions.includes('all') 
        ? permissionGroups.flatMap(g => g.permissions.map(p => p.id)) 
        : Array.isArray(role.permissions) ? [...role.permissions] : [],
    })
    setCurrentTab('info')
    setIsModalOpen(true)
  }

  const togglePermission = (permissionId: string) => {
    setFormData(prev => {
      const isAll = prev.permissions.length === permissionGroups.flatMap(g => g.permissions.map(p => p.id)).length
      if (permissionId === 'all') {
        return {
          ...prev,
          permissions: isAll 
            ? [] 
            : permissionGroups.flatMap(g => g.permissions.map(p => p.id)),
        }
      }
      return {
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(p => p !== permissionId)
          : [...prev.permissions, permissionId],
      }
    })
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Roles & Permissions</h1>
          <p className="text-slate-500 mt-2">Kelola hak akses untuk setiap role pengguna</p>
        </div>
        <Button onClick={handleAddRole} className="bg-gradient-to-r from-indigo-600 to-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Role
        </Button>
      </div>

      {/* Roles Table */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead>Nama Role</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-indigo-700" />
                      </div>
                      <span className="font-semibold text-slate-800">{role.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.includes('all') ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">All Permissions</Badge>
                      ) : (
                        role.permissions.slice(0, 3).map((perm: string) => (
                          <Badge key={perm} className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                            {perm}
                          </Badge>
                        ))
                      )}
                      {role.permissions.length > 3 && !role.permissions.includes('all') && (
                        <span className="text-xs text-slate-500">+{role.permissions.length - 3} lainnya</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
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

      {/* Role Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto w-[98vw] h-[95vh] sm:max-w-[98vw] p-6">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {editingRole ? 'Perbarui informasi dan hak akses role' : 'Isi form berikut untuk menambah role baru'}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                  <Save className="h-4 w-4 mr-2" />
                  {editingRole ? 'Simpan Perubahan' : 'Simpan Role'}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="w-full overflow-x-auto flex flex-nowrap bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="info" className="flex-1 min-w-fit data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                <UserPlus className="h-4 w-4 mr-2" />
                Info Role
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex-1 min-w-fit data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                <Shield className="h-4 w-4 mr-2" />
                Hak Akses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-indigo-700" />
                    </div>
                    Informasi Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">
                      Nama Role (System)
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="contoh: super_admin"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">
                      Nama Role (Display)
                    </Label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="contoh: Super Admin"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">
                      Deskripsi Role
                    </Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                      placeholder="Jelaskan tentang role ini dan hak aksesnya"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6 mt-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-purple-700" />
                    </div>
                    Hak Akses Permission
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Pilih pengaturan akses (permission) yang dapat digunakan oleh role ini.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Select All */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={formData.permissions.length === permissionGroups.flatMap(g => g.permissions.map(p => p.id)).length}
                      onChange={() => togglePermission('all')}
                      className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="select-all" className="font-semibold text-slate-800">
                      Berikan Semua Hak Akses
                    </Label>
                  </div>

                  {/* Permission Groups */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissionGroups.map((group) => {
                      const hasAllGroupPermissions = group.permissions.every(p => formData.permissions.includes(p.id))
                      return (
                        <div key={group.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                          <div className="flex items-center gap-2 mb-3">
                            <input
                              type="checkbox"
                              id={`group-${group.id}`}
                              checked={hasAllGroupPermissions}
                              onChange={() => {
                                if (hasAllGroupPermissions) {
                                  // Remove all group permissions
                                  setFormData(prev => ({
                                    ...prev,
                                    permissions: prev.permissions.filter(p => !group.permissions.some(gp => gp.id === p)),
                                  }))
                                } else {
                                  // Add all group permissions
                                  setFormData(prev => ({
                                    ...prev,
                                    permissions: Array.from(new Set([...prev.permissions, ...group.permissions.map(p => p.id)])),
                                  }))
                                }
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <Label htmlFor={`group-${group.id}`} className="font-semibold text-slate-700">
                              {group.name}
                            </Label>
                          </div>
                          <div className="space-y-2 pl-6">
                            {group.permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={permission.id}
                                  checked={formData.permissions.includes(permission.id)}
                                  onChange={() => togglePermission(permission.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <Label htmlFor={permission.id} className="text-sm text-slate-600">
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              {currentTab !== 'info' ? (
                <Button type="button" variant="secondary" onClick={() => setCurrentTab('info')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Button>
              ) : <div />}
              {currentTab !== 'permissions' ? (
                <Button type="button" variant="secondary" onClick={() => setCurrentTab('permissions')}>
                  Selanjutnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : <div />}
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

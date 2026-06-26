'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Settings, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type LecturerProfile = {
  first_name: string
  last_name: string
  email: string
}

type Lecturer = {
  id: string
  nip: string
  profile: LecturerProfile
}

type TarifDosen = {
  id: string
  dosen_id: string
  status_dosen: string
  tarif_daring: number
  tarif_luring: number
  gaji_pokok: number
  tunjangan: number
  is_active: boolean
  dosen?: Lecturer
}

const DEFAULT_LUR_TARIFF = 100000
const DEFAULT_DAR_TARIFF = 75000

export default function MasterTarifMengajarPage() {
  const [tariffs, setTariffs] = useState<TarifDosen[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedTarifId, setSelectedTarifId] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    dosen_id: '',
    status_dosen: 'Luar Biasa',
    tarif_daring: DEFAULT_DAR_TARIFF.toString(),
    tarif_luring: DEFAULT_LUR_TARIFF.toString(),
    gaji_pokok: '0',
    tunjangan: '0',
    is_active: true
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Load Data
  const loadData = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      // Load Lecturers
      let fetchedLecturers: Lecturer[] = []
      try {
        const { data: dbLec, error: dbLecErr } = await supabase
          .from('lecturers')
          .select('id, nip, profile:profiles(first_name, last_name, email)')
          .order('nip')
        if (dbLecErr) throw dbLecErr
        
        fetchedLecturers = (dbLec || []).map((l: any) => {
          const profile = Array.isArray(l.profile) ? l.profile[0] : l.profile
          return {
            id: l.id,
            nip: l.nip,
            profile: profile || { first_name: '', last_name: '', email: '' }
          }
        })
      } catch (err: any) {
        console.warn("DB lecturers fetch failed, using fallback:", err.message)
        fetchedLecturers = [
          { id: 'd1', nip: '198001012005011001', profile: { first_name: 'Dosen', last_name: 'Satu', email: 'dosen1@unbat.com' } },
          { id: 'd2', nip: '198102022006021002', profile: { first_name: 'Dosen', last_name: 'Dua', email: 'dosen2@unbat.com' } },
          { id: 'd3', nip: '198203032007031003', profile: { first_name: 'Dosen', last_name: 'Tiga', email: 'dosen3@unbat.com' } }
        ]
      }
      setLecturers(fetchedLecturers)

      // Load Tariffs
      let fetchedTariffs: TarifDosen[] = []
      try {
        const { data: dbTariffs, error: dbTariffsErr } = await supabase
          .from('tarif_dosen')
          .select('*, dosen:lecturers(id, nip, profile:profiles(first_name, last_name, email))')
          .order('created_at', { ascending: false })
        if (dbTariffsErr) throw dbTariffsErr
        
        fetchedTariffs = (dbTariffs || []).map((t: any) => {
          const rawDosen = Array.isArray(t.dosen) ? t.dosen[0] : t.dosen
          const profile = rawDosen ? (Array.isArray(rawDosen.profile) ? rawDosen.profile[0] : rawDosen.profile) : null
          return {
            ...t,
            dosen: rawDosen ? {
              id: rawDosen.id,
              nip: rawDosen.nip,
              profile: profile || { first_name: '', last_name: '', email: '' }
            } : undefined
          }
        })
      } catch (err: any) {
        console.warn("DB tarif_dosen fetch failed, using localStorage fallback:", err.message)
        const local = localStorage.getItem('local_tarif_dosen')
        if (local) {
          fetchedTariffs = JSON.parse(local)
        } else {
          // Default Seeding in LocalStorage to match database dummy lecturers
          const seed = [
            {
              id: 't1',
              dosen_id: fetchedLecturers[0]?.id || 'd1',
              status_dosen: 'Tetap',
              tarif_daring: 75000,
              tarif_luring: 100000,
              gaji_pokok: 5000000,
              tunjangan: 1500000,
              is_active: true,
              dosen: fetchedLecturers[0]
            },
            {
              id: 't2',
              dosen_id: fetchedLecturers[1]?.id || 'd2',
              status_dosen: 'Luar Biasa',
              tarif_daring: 75000,
              tarif_luring: 100000,
              gaji_pokok: 0,
              tunjangan: 0,
              is_active: true,
              dosen: fetchedLecturers[1]
            }
          ]
          localStorage.setItem('local_tarif_dosen', JSON.stringify(seed))
          fetchedTariffs = seed
        }
      }
      setTariffs(fetchedTariffs)
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Gagal memuat data tarif dosen.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setFormData({
      dosen_id: '',
      status_dosen: 'Luar Biasa',
      tarif_daring: DEFAULT_DAR_TARIFF.toString(),
      tarif_luring: DEFAULT_LUR_TARIFF.toString(),
      gaji_pokok: '0',
      tunjangan: '0',
      is_active: true
    })
    setErrorMsg('')
  }

  const handleOpenAdd = () => {
    resetForm()
    setDialogMode('add')
    // Auto-select first lecturer who doesn't have tariff set up
    const configuredDosenIds = tariffs.map(t => t.dosen_id)
    const availableLecturer = lecturers.find(l => !configuredDosenIds.includes(l.id))
    if (availableLecturer) {
      setFormData(prev => ({ ...prev, dosen_id: availableLecturer.id }))
    }
    setDialogOpen(true)
  }

  const handleOpenEdit = (tarif: TarifDosen) => {
    setSelectedTarifId(tarif.id)
    setFormData({
      dosen_id: tarif.dosen_id,
      status_dosen: tarif.status_dosen,
      tarif_daring: tarif.tarif_daring.toString(),
      tarif_luring: tarif.tarif_luring.toString(),
      gaji_pokok: tarif.gaji_pokok.toString(),
      tunjangan: tarif.tunjangan.toString(),
      is_active: tarif.is_active
    })
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    const parsedData = {
      dosen_id: formData.dosen_id,
      status_dosen: formData.status_dosen,
      tarif_daring: parseFloat(formData.tarif_daring) || 0,
      tarif_luring: parseFloat(formData.tarif_luring) || 0,
      gaji_pokok: parseFloat(formData.gaji_pokok) || 0,
      tunjangan: parseFloat(formData.tunjangan) || 0,
      is_active: formData.is_active
    }

    if (!parsedData.dosen_id) {
      setErrorMsg('Pilih dosen terlebih dahulu.')
      setIsSubmitting(false)
      return
    }

    try {
      if (dialogMode === 'add') {
        // DB Operation
        try {
          const { error } = await supabase
            .from('tarif_dosen')
            .insert([parsedData])
          if (error) throw error
          setSuccessMsg('Tarif dosen berhasil ditambahkan!')
        } catch (dbErr: any) {
          console.warn("DB insert failed, running local fallback:", dbErr.message)
          // LocalStorage fallback
          const local = localStorage.getItem('local_tarif_dosen')
          const current = local ? JSON.parse(local) : []
          
          if (current.some((t: TarifDosen) => t.dosen_id === parsedData.dosen_id)) {
            throw new Error('Dosen ini sudah dikonfigurasi tarifnya.')
          }

          const associatedDosen = lecturers.find(l => l.id === parsedData.dosen_id)
          const newTarif = {
            id: crypto.randomUUID(),
            ...parsedData,
            dosen: associatedDosen
          }
          current.push(newTarif)
          localStorage.setItem('local_tarif_dosen', JSON.stringify(current))
          setSuccessMsg('Tarif dosen berhasil ditambahkan (Local Fallback)!')
        }
      } else {
        // Edit Mode
        try {
          const { error } = await supabase
            .from('tarif_dosen')
            .update(parsedData)
            .eq('id', selectedTarifId)
          if (error) throw error
          setSuccessMsg('Tarif dosen berhasil diperbarui!')
        } catch (dbErr: any) {
          console.warn("DB update failed, running local fallback:", dbErr.message)
          // LocalStorage fallback
          const local = localStorage.getItem('local_tarif_dosen')
          let current: TarifDosen[] = local ? JSON.parse(local) : []
          
          current = current.map(t => {
            if (t.id === selectedTarifId) {
              const associatedDosen = lecturers.find(l => l.id === parsedData.dosen_id)
              return { ...t, ...parsedData, dosen: associatedDosen }
            }
            return t
          })
          localStorage.setItem('local_tarif_dosen', JSON.stringify(current))
          setSuccessMsg('Tarif dosen berhasil diperbarui (Local Fallback)!')
        }
      }

      setDialogOpen(false)
      loadData()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal menyimpan konfigurasi tarif.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konfigurasi tarif ini?')) return

    try {
      try {
        const { error } = await supabase
          .from('tarif_dosen')
          .delete()
          .eq('id', id)
        if (error) throw error
        setSuccessMsg('Konfigurasi tarif berhasil dihapus!')
      } catch (dbErr: any) {
        console.warn("DB delete failed, running local fallback:", dbErr.message)
        const local = localStorage.getItem('local_tarif_dosen')
        if (local) {
          const current = JSON.parse(local).filter((t: TarifDosen) => t.id !== id)
          localStorage.setItem('local_tarif_dosen', JSON.stringify(current))
        }
        setSuccessMsg('Konfigurasi tarif berhasil dihapus (Local Fallback)!')
      }
      loadData()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Gagal menghapus konfigurasi tarif.')
    }
  }

  const handleToggleActive = async (tarif: TarifDosen) => {
    const updatedStatus = !tarif.is_active
    try {
      try {
        const { error } = await supabase
          .from('tarif_dosen')
          .update({ is_active: updatedStatus })
          .eq('id', tarif.id)
        if (error) throw error
      } catch (dbErr: any) {
        console.warn("DB toggle active failed, running local fallback:", dbErr.message)
        const local = localStorage.getItem('local_tarif_dosen')
        if (local) {
          const current = JSON.parse(local).map((t: TarifDosen) => {
            if (t.id === tarif.id) return { ...t, is_active: updatedStatus }
            return t
          })
          localStorage.setItem('local_tarif_dosen', JSON.stringify(current))
        }
      }
      loadData()
    } catch (err: any) {
      console.error(err)
    }
  }

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Master Tarif Mengajar
          </h1>
          <p className="text-slate-500">
            Atur nominal gaji pokok, tunjangan, dan insentif mengajar SKS dosen
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md transition-all flex items-center gap-2"
          onClick={handleOpenAdd}
        >
          <Plus className="h-4 w-4" />
          Tambah Tarif Mengajar
        </Button>
      </div>

      {/* Success/Error Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-center gap-3 text-emerald-800 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-lg flex items-center gap-3 text-rose-800 shadow-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Data Table Card */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg font-bold text-slate-800">
              Konfigurasi Tarif Dosen
            </CardTitle>
          </div>
          <CardDescription className="text-slate-500">
            Daftar konfigurasi aktif untuk perhitungan slip gaji dosen
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow className="border-slate-150">
                  <TableHead className="text-slate-600 font-bold">Dosen</TableHead>
                  <TableHead className="text-slate-600 font-bold">Status Ikatan</TableHead>
                  <TableHead className="text-slate-600 font-bold">Gaji Pokok</TableHead>
                  <TableHead className="text-slate-600 font-bold">Tunjangan</TableHead>
                  <TableHead className="text-slate-600 font-bold text-center">Daring / SKS</TableHead>
                  <TableHead className="text-slate-600 font-bold text-center">Luring / SKS</TableHead>
                  <TableHead className="text-slate-600 font-bold text-center">Status</TableHead>
                  <TableHead className="text-slate-600 font-bold text-right w-28">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span>Memuat data konfigurasi...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tariffs.length > 0 ? (
                  tariffs.map((tarif) => (
                    <TableRow key={tarif.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-slate-900">
                          {tarif.dosen?.profile ? `${tarif.dosen.profile.first_name} ${tarif.dosen.profile.last_name}` : 'Dosen Tidak Ditemukan'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          NIP: {tarif.dosen?.nip || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${
                          tarif.status_dosen === 'Tetap' ? 'bg-blue-55 text-blue-800 border-blue-200' :
                          tarif.status_dosen === 'Kontrak' ? 'bg-orange-55 text-orange-850 border-orange-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        } border px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
                          {tarif.status_dosen}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        {formatIDR(tarif.gaji_pokok)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        {formatIDR(tarif.tunjangan)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-slate-750">
                        {formatIDR(tarif.tarif_daring)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-slate-750">
                        {formatIDR(tarif.tarif_luring)}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleToggleActive(tarif)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                            tarif.is_active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${tarif.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          {tarif.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            onClick={() => handleOpenEdit(tarif)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => handleDelete(tarif.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldCheck className="h-10 w-10 text-slate-350" />
                        <span className="font-semibold text-slate-700">Belum Ada Konfigurasi Tarif</span>
                        <p className="text-xs text-slate-450 max-w-sm">
                          Silakan klik tombol "Tambah Tarif Mengajar" di atas untuk menambahkan pengaturan tarif gaji dosen.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-xl shadow-2xl border border-slate-100">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="pb-4 border-b border-slate-100">
              <DialogTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                {dialogMode === 'add' ? 'Tambah Konfigurasi Tarif' : 'Ubah Konfigurasi Tarif'}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Lengkapi rincian tarif dosen di bawah ini. Pastikan satu dosen hanya memiliki satu konfigurasi tarif.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              {/* Dosen Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="dosen_id" className="text-sm font-bold text-slate-800">Dosen</Label>
                {dialogMode === 'add' ? (
                  <select
                    id="dosen_id"
                    value={formData.dosen_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, dosen_id: e.target.value }))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    required
                  >
                    <option value="" disabled>-- Pilih Dosen --</option>
                    {lecturers
                      .filter(l => !tariffs.some(t => t.dosen_id === l.id))
                      .map(l => (
                        <option key={l.id} value={l.id}>
                          {l.nip} - {l.profile.first_name} {l.profile.last_name}
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-lg flex flex-col">
                    <span className="text-sm text-slate-900">
                      {tariffs.find(t => t.id === selectedTarifId)?.dosen?.profile 
                        ? `${tariffs.find(t => t.id === selectedTarifId)?.dosen?.profile?.first_name} ${tariffs.find(t => t.id === selectedTarifId)?.dosen?.profile?.last_name}`
                        : 'Nama Dosen'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      NIP: {tariffs.find(t => t.id === selectedTarifId)?.dosen?.nip}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Ikatan */}
              <div className="space-y-2">
                <Label htmlFor="status_dosen" className="text-sm font-bold text-slate-800">Status Ikatan Kerja</Label>
                <select
                  id="status_dosen"
                  value={formData.status_dosen}
                  onChange={(e) => setFormData(prev => ({ ...prev, status_dosen: e.target.value }))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  required
                >
                  <option value="Tetap">Dosen Tetap</option>
                  <option value="Kontrak">Dosen Kontrak</option>
                  <option value="Luar Biasa">Dosen Luar Biasa (LB)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Gaji Pokok */}
                <div className="space-y-2">
                  <Label htmlFor="gaji_pokok" className="text-sm font-bold text-slate-800">Gaji Pokok</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-450 font-semibold text-sm">Rp</span>
                    <Input
                      id="gaji_pokok"
                      type="number"
                      value={formData.gaji_pokok}
                      onChange={(e) => setFormData(prev => ({ ...prev, gaji_pokok: e.target.value }))}
                      className="pl-9 pr-3 py-2 text-slate-900 font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Tunjangan */}
                <div className="space-y-2">
                  <Label htmlFor="tunjangan" className="text-sm font-bold text-slate-800">Tunjangan</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-450 font-semibold text-sm">Rp</span>
                    <Input
                      id="tunjangan"
                      type="number"
                      value={formData.tunjangan}
                      onChange={(e) => setFormData(prev => ({ ...prev, tunjangan: e.target.value }))}
                      className="pl-9 pr-3 py-2 text-slate-900 font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tarif Daring */}
                <div className="space-y-2">
                  <Label htmlFor="tarif_daring" className="text-sm font-bold text-slate-800">Tarif Daring / SKS</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-450 font-semibold text-sm">Rp</span>
                    <Input
                      id="tarif_daring"
                      type="number"
                      value={formData.tarif_daring}
                      onChange={(e) => setFormData(prev => ({ ...prev, tarif_daring: e.target.value }))}
                      className="pl-9 pr-3 py-2 text-slate-900 font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Tarif Luring */}
                <div className="space-y-2">
                  <Label htmlFor="tarif_luring" className="text-sm font-bold text-slate-800">Tarif Luring / SKS</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-450 font-semibold text-sm">Rp</span>
                    <Input
                      id="tarif_luring"
                      type="number"
                      value={formData.tarif_luring}
                      onChange={(e) => setFormData(prev => ({ ...prev, tarif_luring: e.target.value }))}
                      className="pl-9 pr-3 py-2 text-slate-900 font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-emerald-600 border-slate-350 focus:ring-emerald-500 rounded cursor-pointer"
                />
                <Label htmlFor="is_active" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Aktifkan konfigurasi tarif ini untuk perhitungan payroll mendatang
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                className="hover:bg-slate-100"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md font-semibold"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { indonesianProvinces, getCitiesByProvince, getDistrictsByCity, getVillagesByDistrict } from '@/lib/indonesian-regions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Edit, Trash2, User, Users, Phone, Mail, FileText, Calendar, Briefcase, Building2, GraduationCap, Wallet, ArrowLeft, ArrowRight } from 'lucide-react'

// --- Types ---
type Program = { id: string; name: string; faculty_id: string }
type Faculty = { id: string; name: string }
type Lecturer = { id: string; first_name: string; last_name: string }

type FormData = {
  // 1. Biodata (students + profiles)
  nim: string;
  nik: string;
  first_name: string;
  last_name: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  religion: string;
  blood_type: string;
  phone_number: string;
  whatsapp: string;
  personal_email: string;
  campus_email: string;
  profile_picture: string;
  street_address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postal_code: string;
  residence_type: string;
  // 2. Akademik (student_academics)
  faculty_id: string;
  study_program_id: string;
  admission_year: string;
  entry_semester: string;
  admission_path: string;
  student_status: string;
  academic_advisor_id: string;
  current_semester: string;
  // 3. Orang Tua (student_parents)
  father_name: string;
  father_nik: string;
  father_birth_date: string;
  father_education: string;
  father_job: string;
  father_income: string;
  father_phone: string;
  mother_name: string;
  mother_nik: string;
  mother_birth_date: string;
  mother_education: string;
  mother_job: string;
  mother_income: string;
  mother_phone: string;
  guardian_name: string;
  guardian_relation: string;
  guardian_job: string;
  guardian_phone: string;
  // 4. Riwayat Pendidikan (student_educations)
  previous_school_name: string;
  school_major: string;
  graduation_year: string;
  certificate_number: string;
  nisn: string;
  // 5. Keuangan (student_finances)
  ukt_group: string;
  ukt_amount: string;
  payment_status: string;
  is_scholarship: boolean;
  scholarship_name: string;
}

const initialFormData: FormData = {
  nim: '',
  nik: '',
  first_name: '',
  last_name: '',
  birth_place: '',
  birth_date: '',
  gender: '',
  religion: '',
  blood_type: '',
  phone_number: '',
  whatsapp: '',
  personal_email: '',
  campus_email: '',
  profile_picture: '',
  street_address: '',
  village: '',
  district: '',
  city: '',
  province: '',
  postal_code: '',
  residence_type: '',
  faculty_id: '',
  study_program_id: '',
  admission_year: new Date().getFullYear().toString(),
  entry_semester: 'Ganjil',
  admission_path: '',
  student_status: 'Aktif',
  academic_advisor_id: '',
  current_semester: '1',
  father_name: '',
  father_nik: '',
  father_birth_date: '',
  father_education: '',
  father_job: '',
  father_income: '',
  father_phone: '',
  mother_name: '',
  mother_nik: '',
  mother_birth_date: '',
  mother_education: '',
  mother_job: '',
  mother_income: '',
  mother_phone: '',
  guardian_name: '',
  guardian_relation: '',
  guardian_job: '',
  guardian_phone: '',
  previous_school_name: '',
  school_major: '',
  graduation_year: new Date().getFullYear().toString(),
  certificate_number: '',
  nisn: '',
  ukt_group: '',
  ukt_amount: '',
  payment_status: 'Belum Lunas',
  is_scholarship: false,
  scholarship_name: ''
}

const FORM_TABS = [
  { id: 'biodata', label: 'Biodata Pribadi', icon: User },
  { id: 'akademik', label: 'Data Akademik', icon: GraduationCap },
  { id: 'orangtua', label: 'Orang Tua / Wali', icon: Users },
  { id: 'pendidikan', label: 'Riwayat Pendidikan', icon: FileText },
  { id: 'keuangan', label: 'Keuangan & Beasiswa', icon: Wallet },
]

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('biodata')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)

  // Regions state
  const [cities, setCities] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])

  async function loadData() {
    setLoading(true)
    const [studentsRes, programsRes, facultiesRes, lecturersRes] = await Promise.all([
      supabase.from('students').select('*, program:programs(name), profile:profiles(first_name, last_name, email)'),
      supabase.from('programs').select('id, name, faculty_id'),
      supabase.from('faculties').select('id, name'),
      supabase.from('lecturers').select('id, first_name, last_name')
    ])

    setStudents(studentsRes.data || [])
    setPrograms(programsRes.data || [])
    setFaculties(facultiesRes.data || [])
    setLecturers(lecturersRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // --- Region Handlers ---
  const handleProvinsiChange = (value: string) => {
    setFormData({ ...formData, province: value, city: '', district: '', village: '' })
    const cityList = getCitiesByProvince(value)
    setCities(cityList)
    setDistricts([])
    setVillages([])
  }

  const handleKotaChange = (value: string) => {
    setFormData({ ...formData, city: value, district: '', village: '' })
    const districtList = getDistrictsByCity(value)
    setDistricts(districtList)
    setVillages([])
  }

  const handleKecamatanChange = (value: string) => {
    setFormData({ ...formData, district: value, village: '' })
    const villageList = getVillagesByDistrict(value)
    setVillages(villageList)
  }

  // --- Form Handlers ---
  function resetForm() {
    setFormData(initialFormData)
    setCurrentTab('biodata')
    setCities([])
    setDistricts([])
    setVillages([])
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const profileId = crypto.randomUUID()
      // 1. Create Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: profileId,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.campus_email || formData.personal_email,
          phone: formData.phone_number,
          gender: formData.gender === 'Laki-laki' ? 'laki-laki' : (formData.gender === 'Perempuan' ? 'perempuan' : ''),
          place_of_birth: formData.birth_place,
          date_of_birth: formData.birth_date || null,
          address_ktp: formData.street_address,
        }])
        .select()
        .single()

      if (profileError) {
        console.error('Error inserting profile (Possible FK constraint with auth.users):', profileError)
        return
      }

      // 2. Create Student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert([{
          profile_id: profileId,
          nim: formData.nim,
          program_id: formData.study_program_id,
          enrollment_year: parseInt(formData.admission_year) || new Date().getFullYear(),
        }])
        .select()
        .single()

      if (studentError) {
        console.error('Error inserting student:', studentError)
        return
      }

      // 3. Create other records (student_academics, student_parents, etc.)
      await supabase.from('student_academics').insert([{
        student_id: studentData.id,
        faculty_id: formData.faculty_id || null,
        study_program_id: formData.study_program_id || null,
        admission_year: formData.admission_year,
        entry_semester: formData.entry_semester,
        admission_path: formData.admission_path,
        student_status: formData.student_status,
        academic_advisor_id: formData.academic_advisor_id || null,
        current_semester: parseInt(formData.current_semester) || 1
      }])

      await supabase.from('student_parents').insert([{
        student_id: studentData.id,
        father_name: formData.father_name,
        father_nik: formData.father_nik,
        father_birth_date: formData.father_birth_date || null,
        father_education: formData.father_education,
        father_job: formData.father_job,
        father_income: formData.father_income,
        father_phone: formData.father_phone,
        mother_name: formData.mother_name,
        mother_nik: formData.mother_nik,
        mother_birth_date: formData.mother_birth_date || null,
        mother_education: formData.mother_education,
        mother_job: formData.mother_job,
        mother_income: formData.mother_income,
        mother_phone: formData.mother_phone,
        guardian_name: formData.guardian_name,
        guardian_relation: formData.guardian_relation,
        guardian_job: formData.guardian_job,
        guardian_phone: formData.guardian_phone
      }])

      await supabase.from('student_educations').insert([{
        student_id: studentData.id,
        previous_school_name: formData.previous_school_name,
        school_major: formData.school_major,
        graduation_year: formData.graduation_year,
        certificate_number: formData.certificate_number,
        nisn: formData.nisn
      }])

      await supabase.from('student_finances').insert([{
        student_id: studentData.id,
        ukt_group: formData.ukt_group,
        ukt_amount: formData.ukt_amount ? Number(formData.ukt_amount) : null,
        payment_status: formData.payment_status,
        is_scholarship: formData.is_scholarship,
        scholarship_name: formData.scholarship_name
      }])

      await loadData()
      resetForm()
      setAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Gagal menambahkan mahasiswa! Periksa console untuk detail.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredPrograms = programs.filter(p => p.faculty_id === formData.faculty_id)

  if (loading) {
    return (
      <div className="p-8">Loading...</div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Data Mahasiswa</h1>
          <p className="text-slate-500 mt-2">Kelola data mahasiswa secara lengkap</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm()
          setAddDialogOpen(open)
        }}>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Mahasiswa
          </Button>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto w-[98vw] h-[95vh] sm:max-w-[98vw] p-6">
            <DialogHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setAddDialogOpen(false)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <DialogTitle className="text-2xl font-bold">Tambah Mahasiswa Baru</DialogTitle>
                    <DialogDescription className="text-sm">Isi form berikut untuk mendaftarkan mahasiswa baru</DialogDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setAddDialogOpen(false); resetForm(); }} disabled={submitting}>
                    Batal
                  </Button>
                  <Button type="submit" form="student-form" className="bg-gradient-to-r from-indigo-600 to-indigo-700" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan Mahasiswa'}
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="w-full overflow-x-auto flex flex-nowrap bg-slate-100 p-1 rounded-xl">
                {FORM_TABS.map((tab, idx) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex-1 min-w-fit data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                      <Icon className="h-4 w-4 mr-2" />
                      {idx + 1}. {tab.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <form id="student-form" onSubmit={handleAddSubmit} className="space-y-8 mt-8">
                {/* TAB 1: Biodata Pribadi */}
                <TabsContent value="biodata" className="space-y-6 mt-0">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        Identitas Utama
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">NIM / NPM <span className="text-rose-500">*</span></Label>
                        <Input
                          value={formData.nim}
                          onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                          placeholder="Contoh: 2210511001"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">NIK (Nomor KTP)</Label>
                        <Input
                          value={formData.nik}
                          onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                          placeholder="Contoh: 3201123456789012"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Golongan Darah</Label>
                        <Select
                          value={formData.blood_type}
                          onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                        >
                          <option value="">Pilih Golongan Darah</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="O">O</option>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Depan <span className="text-rose-500">*</span></Label>
                        <Input
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          placeholder="Contoh: Ahmad"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Belakang</Label>
                        <Input
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          placeholder="Contoh: Rizky Pratama"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Jenis Kelamin <span className="text-rose-500">*</span></Label>
                        <Select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          required
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tempat Lahir</Label>
                        <Input
                          value={formData.birth_place}
                          onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                          placeholder="Contoh: Jakarta"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tanggal Lahir</Label>
                        <Input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Agama</Label>
                        <Select
                          value={formData.religion}
                          onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                        >
                          <option value="">Pilih Agama</option>
                          <option value="Islam">Islam</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone className="h-4 w-4 text-blue-600" />
                        </div>
                        Kontak & Media
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">No. HP</Label>
                        <Input
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          placeholder="Contoh: 081234567890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">WhatsApp</Label>
                        <Input
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="Contoh: 081234567890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Email Pribadi</Label>
                        <Input
                          type="email"
                          value={formData.personal_email}
                          onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                          placeholder="email.pribadi@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Email Kampus</Label>
                        <Input
                          type="email"
                          value={formData.campus_email}
                          onChange={(e) => setFormData({ ...formData, campus_email: e.target.value })}
                          placeholder="nim@univ.ac.id"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">URL Foto Profil</Label>
                        <Input
                          value={formData.profile_picture}
                          onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                          placeholder="https://example.com/foto.jpg"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-indigo-600" />
                        </div>
                        Alamat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2 lg:col-span-1">
                          <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Provinsi</Label>
                          <Select
                            value={formData.province}
                            onChange={(e) => handleProvinsiChange(e.target.value)}
                          >
                            <option value="">Pilih Provinsi</option>
                            {indonesianProvinces.map((p) => <option key={p} value={p}>{p}</option>)}
                          </Select>
                        </div>
                        <div className="space-y-2 lg:col-span-1">
                          <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kota / Kabupaten</Label>
                          <Select
                            value={formData.city}
                            onChange={(e) => handleKotaChange(e.target.value)}
                            disabled={!formData.province}
                          >
                            <option value="">Pilih Kota</option>
                            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                          </Select>
                        </div>
                        <div className="space-y-2 lg:col-span-1">
                          <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kecamatan</Label>
                          <Select
                            value={formData.district}
                            onChange={(e) => handleKecamatanChange(e.target.value)}
                            disabled={!formData.city}
                          >
                            <option value="">Pilih Kecamatan</option>
                            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                          </Select>
                        </div>
                        <div className="space-y-2 lg:col-span-1">
                          <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kelurahan / Desa</Label>
                          <Select
                            value={formData.village}
                            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                            disabled={!formData.district}
                          >
                            <option value="">Pilih Kelurahan</option>
                            {villages.map((v) => <option key={v} value={v}>{v}</option>)}
                          </Select>
                        </div>
                        <div className="space-y-2 lg:col-span-1">
                          <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kode Pos</Label>
                          <Input
                            value={formData.postal_code}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                            placeholder="12345"
                          />
                        </div>
                        <div className="space-y-2 lg:col-span-1">
                          <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tipe Tempat Tinggal</Label>
                          <Select
                            value={formData.residence_type}
                            onChange={(e) => setFormData({ ...formData, residence_type: e.target.value })}
                          >
                            <option value="">Pilih Tipe</option>
                            <option value="Rumah Orang Tua">Rumah Orang Tua</option>
                            <option value="Kos">Kos</option>
                            <option value="Asrama">Asrama</option>
                            <option value="Kontrakan">Kontrakan</option>
                            <option value="Lainnya">Lainnya</option>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Jalan, RT/RW</Label>
                        <Textarea
                          value={formData.street_address}
                          onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                          placeholder="Jl. Raya No. 123 RT 05 RW 02"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB 2: Akademik */}
                <TabsContent value="akademik" className="space-y-6 mt-0">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-emerald-600" />
                        </div>
                        Data Akademik Kampus
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Fakultas <span className="text-rose-500">*</span></Label>
                        <Select
                          value={formData.faculty_id}
                          onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value, study_program_id: '' })}
                          required
                        >
                          <option value="">Pilih Fakultas</option>
                          {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Program Studi <span className="text-rose-500">*</span></Label>
                        <Select
                          value={formData.study_program_id}
                          onChange={(e) => setFormData({ ...formData, study_program_id: e.target.value })}
                          required
                          disabled={!formData.faculty_id}
                        >
                          <option value="">Pilih Program Studi</option>
                          {filteredPrograms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Dosen Wali / PA</Label>
                        <Select
                          value={formData.academic_advisor_id}
                          onChange={(e) => setFormData({ ...formData, academic_advisor_id: e.target.value })}
                        >
                          <option value="">Pilih Dosen Wali</option>
                          {lecturers.map((l) => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tahun Angkatan</Label>
                        <Input
                          type="number"
                          value={formData.admission_year}
                          onChange={(e) => setFormData({ ...formData, admission_year: e.target.value })}
                          placeholder="2024"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Semester Masuk</Label>
                        <Select
                          value={formData.entry_semester}
                          onChange={(e) => setFormData({ ...formData, entry_semester: e.target.value })}
                        >
                          <option value="Ganjil">Ganjil</option>
                          <option value="Genap">Genap</option>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Jalur Masuk</Label>
                        <Select
                          value={formData.admission_path}
                          onChange={(e) => setFormData({ ...formData, admission_path: e.target.value })}
                        >
                          <option value="">Pilih Jalur</option>
                          <option value="SNBP">SNBP</option>
                          <option value="SNBT">SNBT</option>
                          <option value="Mandiri">Mandiri</option>
                          <option value="Transfer">Transfer</option>
                          <option value="Lainnya">Lainnya</option>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Status Mahasiswa</Label>
                        <Select
                          value={formData.student_status}
                          onChange={(e) => setFormData({ ...formData, student_status: e.target.value })}
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Cuti">Cuti</option>
                          <option value="Non-Aktif">Non-Aktif</option>
                          <option value="Lulus">Lulus</option>
                          <option value="Drop Out">Drop Out</option>
                          <option value="Keluar">Keluar</option>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Semester Berjalan</Label>
                        <Input
                          type="number"
                          value={formData.current_semester}
                          onChange={(e) => setFormData({ ...formData, current_semester: e.target.value })}
                          placeholder="1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB 3: Orang Tua */}
                <TabsContent value="orangtua" className="space-y-6 mt-0">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-8 w-8 bg-rose-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-rose-600" />
                        </div>
                        Data Ayah Kandung
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Ayah</Label>
                        <Input value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">NIK Ayah</Label>
                        <Input value={formData.father_nik} onChange={(e) => setFormData({ ...formData, father_nik: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tanggal Lahir Ayah</Label>
                        <Input type="date" value={formData.father_birth_date} onChange={(e) => setFormData({ ...formData, father_birth_date: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Pendidikan Terakhir Ayah</Label>
                        <Select value={formData.father_education} onChange={(e) => setFormData({ ...formData, father_education: e.target.value })}>
                          <option value="">Pilih</option>
                          <option value="SD">SD</option>
                          <option value="SMP">SMP</option>
                          <option value="SMA">SMA</option>
                          <option value="D1">D1</option>
                          <option value="D2">D2</option>
                          <option value="D3">D3</option>
                          <option value="S1">S1</option>
                          <option value="S2">S2</option>
                          <option value="S3">S3</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Pekerjaan Ayah</Label>
                        <Input value={formData.father_job} onChange={(e) => setFormData({ ...formData, father_job: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Penghasilan Bulanan Ayah</Label>
                        <Input type="number" value={formData.father_income} onChange={(e) => setFormData({ ...formData, father_income: e.target.value })} placeholder="5000000" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">No. HP Ayah</Label>
                        <Input value={formData.father_phone} onChange={(e) => setFormData({ ...formData, father_phone: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-8 w-8 bg-pink-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-pink-600" />
                        </div>
                        Data Ibu Kandung
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Ibu</Label>
                        <Input value={formData.mother_name} onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">NIK Ibu</Label>
                        <Input value={formData.mother_nik} onChange={(e) => setFormData({ ...formData, mother_nik: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tanggal Lahir Ibu</Label>
                        <Input type="date" value={formData.mother_birth_date} onChange={(e) => setFormData({ ...formData, mother_birth_date: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Pendidikan Terakhir Ibu</Label>
                        <Select value={formData.mother_education} onChange={(e) => setFormData({ ...formData, mother_education: e.target.value })}>
                          <option value="">Pilih</option>
                          <option value="SD">SD</option>
                          <option value="SMP">SMP</option>
                          <option value="SMA">SMA</option>
                          <option value="D1">D1</option>
                          <option value="D2">D2</option>
                          <option value="D3">D3</option>
                          <option value="S1">S1</option>
                          <option value="S2">S2</option>
                          <option value="S3">S3</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Pekerjaan Ibu</Label>
                        <Input value={formData.mother_job} onChange={(e) => setFormData({ ...formData, mother_job: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Penghasilan Bulanan Ibu</Label>
                        <Input type="number" value={formData.mother_income} onChange={(e) => setFormData({ ...formData, mother_income: e.target.value })} placeholder="5000000" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">No. HP Ibu</Label>
                        <Input value={formData.mother_phone} onChange={(e) => setFormData({ ...formData, mother_phone: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 border-dashed">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-slate-600" />
                        </div>
                        Data Wali (Opsional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Wali</Label>
                        <Input value={formData.guardian_name} onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Hubungan dengan Wali</Label>
                        <Input value={formData.guardian_relation} onChange={(e) => setFormData({ ...formData, guardian_relation: e.target.value })} placeholder="Paman, Bibi, dll" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Pekerjaan Wali</Label>
                        <Input value={formData.guardian_job} onChange={(e) => setFormData({ ...formData, guardian_job: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">No. HP Wali</Label>
                        <Input value={formData.guardian_phone} onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB 4: Riwayat Pendidikan */}
                <TabsContent value="pendidikan" className="space-y-6 mt-0">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-amber-600" />
                        </div>
                        Riwayat Pendidikan Sebelumnya
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Sekolah / Universitas Asal</Label>
                        <Input value={formData.previous_school_name} onChange={(e) => setFormData({ ...formData, previous_school_name: e.target.value })} placeholder="SMA Negeri 1 Jakarta" />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Jurusan Sekolah</Label>
                        <Input value={formData.school_major} onChange={(e) => setFormData({ ...formData, school_major: e.target.value })} placeholder="IPA, IPS, Teknik, dll" />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tahun Lulus</Label>
                        <Input type="number" value={formData.graduation_year} onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })} placeholder="2022" />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">NISN</Label>
                        <Input value={formData.nisn} onChange={(e) => setFormData({ ...formData, nisn: e.target.value })} placeholder="0012345678" />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-2">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nomor Ijazah</Label>
                        <Input value={formData.certificate_number} onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })} placeholder="Nomor seri ijazah" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB 5: Keuangan */}
                <TabsContent value="keuangan" className="space-y-6 mt-0">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Wallet className="h-4 w-4 text-green-600" />
                        </div>
                        Data Keuangan & Beasiswa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Golongan UKT</Label>
                        <Input value={formData.ukt_group} onChange={(e) => setFormData({ ...formData, ukt_group: e.target.value })} placeholder="1, 2, 3, ..." />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nominal UKT per Semester</Label>
                        <Input type="number" value={formData.ukt_amount} onChange={(e) => setFormData({ ...formData, ukt_amount: e.target.value })} placeholder="5000000" />
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1">
                        <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Status Pembayaran</Label>
                        <Select value={formData.payment_status} onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}>
                          <option value="Belum Lunas">Belum Lunas</option>
                          <option value="Lunas">Lunas</option>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-1 lg:col-span-1 flex items-end">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="is_scholarship"
                            checked={formData.is_scholarship}
                            onChange={(e) => setFormData({ ...formData, is_scholarship: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Label htmlFor="is_scholarship" className="text-sm font-medium text-slate-700">Menerima Beasiswa</Label>
                        </div>
                      </div>
                      {formData.is_scholarship && (
                        <div className="space-y-2 md:col-span-2 lg:col-span-2">
                          <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Beasiswa</Label>
                          <Input value={formData.scholarship_name} onChange={(e) => setFormData({ ...formData, scholarship_name: e.target.value })} placeholder="KIP-Kuliah, Beasiswa Unggulan, dll" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  {currentTab !== 'biodata' ? (
                    <Button type="button" variant="secondary" onClick={() => setCurrentTab(FORM_TABS[FORM_TABS.findIndex(t => t.id === currentTab) - 1].id)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Sebelumnya
                    </Button>
                  ) : <div />}
                  {currentTab !== 'keuangan' ? (
                    <Button type="button" variant="secondary" onClick={() => setCurrentTab(FORM_TABS[FORM_TABS.findIndex(t => t.id === currentTab) + 1].id)}>
                      Selanjutnya
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : <div />}
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Program Studi</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono">{student.nim}</TableCell>
                  <TableCell>{student.profile?.first_name} {student.profile?.last_name}</TableCell>
                  <TableCell>{student.program?.name}</TableCell>
                  <TableCell>{student.profile?.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

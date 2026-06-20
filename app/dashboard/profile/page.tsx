'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Camera, Save, CheckCircle2, AlertCircle, LogOut } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Profile as ProfileType, Student, Program, Department, Faculty, Lecturer } from '@/types'

type FullStudentData = {
  profile: ProfileType
  student?: Student
  program?: Program
  department?: Department
  faculty?: Faculty
}

type FullAdminData = {
  profile: ProfileType
}

type FullLecturerData = {
  profile: ProfileType
  lecturer?: Lecturer
  department?: Department
  faculty?: Faculty
}

export default function ProfilePage() {
  const { profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [roleType, setRoleType] = useState<'admin' | 'lecturer' | 'student' | null>(null)
  const [studentData, setStudentData] = useState<FullStudentData | null>(null)
  const [adminData, setAdminData] = useState<FullAdminData | null>(null)
  const [lecturerData, setLecturerData] = useState<FullLecturerData | null>(null)

  // Editable fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressKtp, setAddressKtp] = useState('')
  const [addressDomicile, setAddressDomicile] = useState('')
  const [gender, setGender] = useState<'laki-laki' | 'perempuan' | ''>('')
  const [placeOfBirth, setPlaceOfBirth] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

  // Fetch full data with role-based logic
  useEffect(() => {
    if (authLoading || !profile) return

    const fetchFullData = async () => {
      setLoading(true)
      setError('')
      try {
        // Determine user role
        const roleName = profile.role?.name
        
        if (roleName === 'super_admin' || roleName === 'admin_akademik') {
          setRoleType('admin')
          setAdminData({ profile })
        } else if (roleName === 'dosen') {
          setRoleType('lecturer')
          // Try to fetch lecturer data, if not found use dummy data
          const { data: lecturerDataDB, error: lecturerError } = await supabase
            .from('lecturers')
            .select(`
              *,
              department:departments(
                *,
                faculty:faculties(*)
              )
            `)
            .eq('profile_id', profile.id)
            .maybeSingle()

          if (lecturerError && lecturerError.code !== 'PGRST116') {
            throw lecturerError
          }

          // Dummy data for lecturer
          const dummyLecturer = lecturerDataDB || {
            id: 'dummy-lecturer-id',
            profile_id: profile.id,
            nip: '198501012010011001',
            department_id: 'dummy-dept-id',
            created_at: new Date(),
            updated_at: new Date(),
            department: {
              id: 'dummy-dept-id',
              faculty_id: 'dummy-faculty-id',
              name: 'Teknik Informatika',
              code: 'TI',
              created_at: new Date(),
              updated_at: new Date(),
              faculty: {
                id: 'dummy-faculty-id',
                name: 'Fakultas Teknik',
                code: 'FT',
                created_at: new Date(),
                updated_at: new Date()
              }
            }
          }

          setLecturerData({
            profile,
            lecturer: dummyLecturer,
            department: dummyLecturer.department,
            faculty: dummyLecturer.department?.faculty
          })
        } else {
          setRoleType('student')
          // Try to fetch student data, if not found use dummy data
          const { data: studentDataDB, error: studentError } = await supabase
            .from('students')
            .select(`
              *,
              program:programs(
                *,
                department:departments(
                  *,
                  faculty:faculties(*)
                )
              )
            `)
            .eq('profile_id', profile.id)
            .maybeSingle()

          if (studentError && studentError.code !== 'PGRST116') {
            throw studentError
          }

          // Dummy data for student
          const dummyStudent = studentDataDB || {
            id: 'dummy-student-id',
            profile_id: profile.id,
            nim: '123456789',
            program_id: 'dummy-prog-id',
            enrollment_year: 2022,
            created_at: new Date(),
            updated_at: new Date(),
            program: {
              id: 'dummy-prog-id',
              department_id: 'dummy-dept-id',
              name: 'S1 Teknik Informatika',
              code: 'TI-S1',
              degree: 'S1',
              created_at: new Date(),
              updated_at: new Date(),
              department: {
                id: 'dummy-dept-id',
                faculty_id: 'dummy-faculty-id',
                name: 'Teknik Informatika',
                code: 'TI',
                created_at: new Date(),
                updated_at: new Date(),
                faculty: {
                  id: 'dummy-faculty-id',
                  name: 'Fakultas Teknik',
                  code: 'FT',
                  created_at: new Date(),
                  updated_at: new Date()
                }
              }
            }
          }

          setStudentData({
            profile,
            student: dummyStudent,
            program: dummyStudent.program,
            department: dummyStudent.program?.department,
            faculty: dummyStudent.program?.department?.faculty
          })
        }

        // Set editable fields for all roles
        setFirstName(profile.first_name || '')
        setLastName(profile.last_name || '')
        setPhone(profile.phone || '')
        setAddressKtp(profile.address_ktp || '')
        setAddressDomicile(profile.address_domicile || '')
        setGender(profile.gender || '')
        setPlaceOfBirth(profile.place_of_birth || '')
        setDateOfBirth(profile.date_of_birth || '')
      } catch (err: unknown) {
        console.error('Error fetching profile data:', err)
        setError('Terjadi kesalahan saat memuat data profil. Menggunakan data profil dasar.')
      } finally {
        setLoading(false)
      }
    }

    fetchFullData()
  }, [authLoading, profile])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          gender,
          place_of_birth: placeOfBirth,
          date_of_birth: dateOfBirth,
          address_ktp: addressKtp,
          address_domicile: addressDomicile,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setSuccess('Perubahan berhasil disimpan!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  const activeProfile = studentData?.profile || adminData?.profile || lecturerData?.profile || profile
  const initials = `${activeProfile?.first_name?.charAt(0) || ''}${activeProfile?.last_name?.charAt(0) || ''}`

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Profil Saya</h1>
          <p className="text-slate-600 mt-1">Kelola informasi profil dan akun Anda</p>
        </div>
        <Button variant="destructive" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Photo & Role-specific Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Photo Card */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Foto Profil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-slate-100 shadow-lg">
                  <AvatarImage src={activeProfile?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0">
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-slate-500">Klik ikon kamera untuk mengubah foto</p>
            </CardContent>
          </Card>

          {/* Role-specific Info Card */}
          {roleType === 'admin' && (
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Informasi Hak Akses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-slate-500">ID Pegawai</Label>
                  <p className="text-lg font-semibold text-slate-900">{activeProfile?.id || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Jabatan/Role</Label>
                  <p className="text-slate-900">
                    {activeProfile?.role?.name === 'super_admin' ? 'Superadmin / Full Access Control' : 'Admin Akademik'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Hak Akses</Label>
                  <p className="text-slate-900">Pengelola Sistem</p>
                </div>
              </CardContent>
            </Card>
          )}

          {roleType === 'lecturer' && (
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Informasi Dosen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-slate-500">NIP</Label>
                  <p className="text-lg font-semibold text-slate-900">{lecturerData?.lecturer?.nip || '198501012010011001'}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Fakultas</Label>
                  <p className="text-slate-900">{lecturerData?.faculty?.name || 'Fakultas Teknik'}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Jurusan</Label>
                  <p className="text-slate-900">{lecturerData?.department?.name || 'Teknik Informatika'}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Jabatan</Label>
                  <p className="text-slate-900">Lektor Kepala</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Pangkat/Golongan</Label>
                  <p className="text-slate-900">IV/a</p>
                </div>
              </CardContent>
            </Card>
          )}

          {roleType === 'student' && (
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Informasi Akademik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-slate-500">NIM</Label>
                  <p className="text-lg font-semibold text-slate-900">{studentData?.student?.nim || '123456789'}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Fakultas</Label>
                  <p className="text-slate-900">{studentData?.faculty?.name || 'Fakultas Teknik'}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Jurusan</Label>
                  <p className="text-slate-900">{studentData?.department?.name || 'Teknik Informatika'}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Program Studi</Label>
                  <p className="text-slate-900">{studentData?.program?.name || 'S1 Teknik Informatika'}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Tahun Angkatan</Label>
                  <p className="text-slate-900">{studentData?.student?.enrollment_year || 2022}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Editable Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Data Card */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Data Diri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nama Depan</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nama Belakang</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'laki-laki' | 'perempuan' | '')}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="laki-laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placeOfBirth">Tempat Lahir</Label>
                  <Input
                    id="placeOfBirth"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Address Card */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Kontak & Alamat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={activeProfile?.email || ''}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Nomor WhatsApp</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressKtp">Alamat KTP</Label>
                <Input
                  id="addressKtp"
                  value={addressKtp}
                  onChange={(e) => setAddressKtp(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressDomicile">Alamat Domisili</Label>
                <Input
                  id="addressDomicile"
                  value={addressDomicile}
                  onChange={(e) => setAddressDomicile(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={saving} className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Save className="h-4 w-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

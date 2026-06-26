'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  // Form state
  const [nim, setNim] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<'laki-laki' | 'perempuan' | ''>('')
  const [placeOfBirth, setPlaceOfBirth] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [facultyId, setFacultyId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [programId, setProgramId] = useState('')
  const [semester, setSemester] = useState('')
  const [enrollmentYear, setEnrollmentYear] = useState(new Date().getFullYear().toString())
  const [phone, setPhone] = useState('')
  const [addressKtp, setAddressKtp] = useState('')
  const [addressDomicile, setAddressDomicile] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [faculties, setFaculties] = useState<{ id: string; name: string; code: string }[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string; code: string }[]>([])
  const [programs, setPrograms] = useState<{ id: string; name: string; code: string }[]>([])
  const router = useRouter()

  // Fetch faculties on load
  useEffect(() => {
    const fetchFaculties = async () => {
      const { data, error } = await supabase
        .from('faculties')
        .select('id, name, code')
        .order('name')
      
      if (!error) setFaculties(data || [])
    }
    fetchFaculties()
  }, [])

  // Fetch departments when faculty changes
  useEffect(() => {
    if (!facultyId) return
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('faculty_id', facultyId)
        .order('name')
      
      if (!error) setDepartments(data || [])
    }
    fetchDepartments()
  }, [facultyId])

  // Fetch programs when department changes
  useEffect(() => {
    if (!departmentId) return
    const fetchPrograms = async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name, code')
        .eq('department_id', departmentId)
        .order('name')
      
      if (!error) setPrograms(data || [])
    }
    fetchPrograms()
  }, [departmentId])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate password match
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      setLoading(false)
      return
    }

    try {
      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Gagal membuat akun')

      // 2. Get role ID for 'mahasiswa'
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'mahasiswa')
        .single()
      
      if (roleError) throw roleError

      // 3. Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          role_id: roleData.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
        })
      
      if (profileError) throw profileError

      // 4. Insert into students table
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          profile_id: authData.user.id,
          nim,
          program_id: programId,
          enrollment_year: parseInt(enrollmentYear),
        })
      
      if (studentError) throw studentError

      setSuccess('Akun berhasil dibuat! Silakan login')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Pendaftaran Smart Campus Attendance
          </h1>
          <p className="text-slate-600">Isi form berikut untuk membuat akun baru</p>
        </div>

        <Card className="shadow-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Form Pendaftaran</CardTitle>
            <CardDescription>Semua kolom wajib diisi</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Success Alert */}
              {success && (
                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Section 1: Akun */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Akun</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nim">NIM</Label>
                    <Input
                      id="nim"
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      placeholder="1234567890"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email Kampus</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@universitas.ac.id"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 karakter"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Masukkan ulang password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Data Diri */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Data Diri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Nama Depan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nama Belakang"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Jenis Kelamin</Label>
                    <Select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'laki-laki' | 'perempuan')}
                      required
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="laki-laki">Laki-laki</option>
                      <option value="perempuan">Perempuan</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placeOfBirth">Tempat Lahir</Label>
                    <Input
                      id="placeOfBirth"
                      value={placeOfBirth}
                      onChange={(e) => setPlaceOfBirth(e.target.value)}
                      placeholder="Kota"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Akademik */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Akademik</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Fakultas</Label>
                    <Select
                      id="faculty"
                      value={facultyId}
                      onChange={(e) => {
                        const val = e.target.value
                        setFacultyId(val)
                        if (!val) {
                          setDepartments([])
                          setDepartmentId('')
                          setPrograms([])
                          setProgramId('')
                        }
                      }}
                      required
                    >
                      <option value="">Pilih Fakultas</option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>{f.code} - {f.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Jurusan</Label>
                    <Select
                      id="department"
                      value={departmentId}
                      onChange={(e) => {
                        const val = e.target.value
                        setDepartmentId(val)
                        if (!val) {
                          setPrograms([])
                          setProgramId('')
                        }
                      }}
                      required
                      disabled={!facultyId}
                    >
                      <option value="">Pilih Jurusan</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Program Studi</Label>
                    <Select
                      id="program"
                      value={programId}
                      onChange={(e) => setProgramId(e.target.value)}
                      required
                      disabled={!departmentId}
                    >
                      <option value="">Pilih Program Studi</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Input
                        id="semester"
                        type="number"
                        min="1"
                        max="14"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        placeholder="1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enrollmentYear">Tahun Angkatan</Label>
                      <Input
                        id="enrollmentYear"
                        type="number"
                        value={enrollmentYear}
                        onChange={(e) => setEnrollmentYear(e.target.value)}
                        placeholder="2024"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Kontak & Alamat */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Kontak & Alamat</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor WhatsApp Aktif</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressKtp">Alamat Lengkap KTP</Label>
                    <Input
                      id="addressKtp"
                      value={addressKtp}
                      onChange={(e) => setAddressKtp(e.target.value)}
                      placeholder="Jalan ..., Kota ..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressDomicile">Alamat Domisili</Label>
                    <Input
                      id="addressDomicile"
                      value={addressDomicile}
                      onChange={(e) => setAddressDomicile(e.target.value)}
                      placeholder="Jalan ..., Kota ..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-200">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={loading}>
                  {loading ? 'Membuat akun...' : 'Daftar'}
                </Button>
                <Link href="/login">
                  <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

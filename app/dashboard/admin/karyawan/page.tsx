"use client"

import { useState, useRef, useEffect } from 'react'
import { indonesianProvinces, getCitiesByProvince, getDistrictsByCity, getVillagesByDistrict } from '@/lib/indonesian-regions'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Briefcase, Building, UserCheck, Edit, Eye, UserX, Plus, Camera, Upload, X, ArrowLeft, ArrowRight, User, Phone, Mail, FileText, Calendar, CreditCard, MapPin, CheckCircle2, Download, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

// Mock Karyawan Data
const mockKaryawan = [
  {
    id: 1, nip: '198501012010015002', nama: 'Siti Aminah', divisi: 'Keuangan', status: 'Tetap', faceRegistered: false },
  {
    id: 2, nip: '199002022015015003', nama: 'Rizky Pratama', divisi: 'IT', status: 'Kontrak', faceRegistered: true },
  {
    id: 3, nip: '198803032012015004', nama: 'Dewi Lestari', divisi: 'HRD', status: 'Tetap', faceRegistered: false },
  {
    id: 4, nip: '199204042018015005', nama: 'Andi Santoso', divisi: 'Biro Akademik', status: 'Kontrak', faceRegistered: false },
  {
    id: 5, nip: '198705052011015006', nama: 'Rina Putri', divisi: 'Keuangan', status: 'Tetap', faceRegistered: false }
]

const divisiList = ['Semua Divisi', 'IT', 'HRD', 'Keuangan', 'Biro Akademik']
const statusList = ['Semua Status', 'Tetap', 'Kontrak']

// Form Step Configuration
const FORM_TABS = [
  { id: 'personal', label: 'Data Pribadi', icon: User },
  { id: 'contact', label: 'Informasi Kontak', icon: Phone },
  { id: 'documents', label: 'Dokumen', icon: FileText },
  { id: 'contract', label: 'Kontrak & Rekening', icon: CreditCard },
  { id: 'leave', label: 'Cuti & Izin', icon: Calendar },
  { id: 'allowance', label: 'Penjumlahan Gaji', icon: Briefcase },
  { id: 'deduction', label: 'Pengurangan Gaji', icon: X },
]

const initialFormData: Record<string, any> = {
  // Personal Data
  foto: '',
  nama: '',
  email: '',
  hp: '',
  username: '',
  password: '',
  lokasi: '',
  tglLahir: '',
  jenisKelamin: '',
  tglMasuk: '',
  masaKerja: '',
  role: '',
  divisi: '',
  isAdmin: 'user',
  namaIbu: '',
  // Address
  provinsi: '',
  kota: '',
  kecamatan: '',
  kelurahan: '',
  alamat: '',
  kodePos: '',
  provinsiDomisili: '',
  kotaDomisili: '',
  kecamatanDomisili: '',
  kelurahanDomisili: '',
  alamatDomisili: '',
  kodePosDomisili: '',
  // Emergency Contact
  namaKontakDarurat: '',
  hpKontakDarurat: '',
  hubungan: '',
  // Documents
  ktp: '',
  kartuKeluarga: '',
  bpjsKesehatan: '',
  bpjsKetenagakerjaan: '',
  npwp: '',
  sim: '',
  additionalDocs: [],
  // Contract & Bank
  noPkwt: '',
  noKontrak: '',
  tglMulaiPkwt: '',
  tglAkhirPkwt: '',
  noRekening: '',
  namaRekening: '',
}

export default function KaryawanManagementPage() {
  const [selectedDivisi, setSelectedDivisi] = useState('Semua Divisi')
  const [selectedStatus, setSelectedStatus] = useState('Semua Status')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResapanModalOpen, setIsResapanModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isMappingShiftModalOpen, setIsMappingShiftModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditPasswordModalOpen, setIsEditPasswordModalOpen] = useState(false)
  const [isKontakModalOpen, setIsKontakModalOpen] = useState(false)
  const [isFaceRecognitionModalOpen, setIsFaceRecognitionModalOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState('personal')
  const [formData, setFormData] = useState<Record<string, any>>(initialFormData)
  const [karyawans, setKaryawans] = useState<any[]>(mockKaryawan)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedKaryawan, setSelectedKaryawan] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  // Refs and state for Face Recognition modal
  const faceVideoRef = useRef<HTMLVideoElement>(null)
  const faceStreamRef = useRef<MediaStream | null>(null)
  const [faceCameraActive, setFaceCameraActive] = useState(false)
  const [faceCameraLoading, setFaceCameraLoading] = useState(false)
  const [facePhoto, setFacePhoto] = useState<string | null>(null)
  const faceStartingRef = useRef(false)

  // Auto-start camera when Face Recognition modal opens
  useEffect(() => {
    if (isFaceRecognitionModalOpen && !facePhoto) {
      startFaceCamera();
    }

    // Cleanup function when modal closes
    return () => {
      stopFaceCamera();
    };
  }, [isFaceRecognitionModalOpen, facePhoto])

  // Filter logic
  const filteredKaryawan = karyawans.filter(karyawan => {
    const matchDivisi = selectedDivisi === 'Semua Divisi' || karyawan.divisi === selectedDivisi
    const matchStatus = selectedStatus === 'Semua Status' || karyawan.status === selectedStatus
    return matchDivisi && matchStatus
  })

  const handleNextTab = () => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === currentTab)
    if (currentIndex < FORM_TABS.length - 1) {
      setCurrentTab(FORM_TABS[currentIndex + 1].id)
    }
  }

  const handlePrevTab = () => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === currentTab)
    if (currentIndex > 0) {
      setCurrentTab(FORM_TABS[currentIndex - 1].id)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => videoRef.current?.play()
      }
      setCameraActive(true)
    } catch (err) {
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        setFormData({ ...formData, foto: canvas.toDataURL('image/png') })
      }
    }
    stopCamera()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, foto: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddAdditionalDoc = () => {
    setFormData({
      ...formData,
      additionalDocs: [...(formData.additionalDocs || []), { name: '', file: null }]
    })
  }
  
  const handleRemoveAdditionalDoc = (index: number) => {
    const newDocs = [...(formData.additionalDocs || [])]
    newDocs.splice(index, 1)
    setFormData({ ...formData, additionalDocs: newDocs })
  }

  // Load karyawan from Supabase
  const loadKaryawan = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*, profile:profiles(first_name, last_name, email, phone)')
        .order('created_at', { ascending: false })
      
      if (error) throw error

      const formattedData = (data || []).map((emp, index) => ({
        id: emp.id,
        nip: emp.nip || `EMP-${index + 1}`,
        nama: `${emp.profile?.first_name || ''} ${emp.profile?.last_name || ''}`.trim(),
        divisi: 'IT',
        status: emp.status || 'Tetap',
        faceRegistered: false
      }))

      setKaryawans([...formattedData, ...mockKaryawan])
    } catch (err) {
      console.error('Error loading karyawan:', err)
    }
  }

  // Initial load
  useEffect(() => {
    loadKaryawan()
  }, [])

  const handleSubmit = async () => {
    try {
      setErrorMessage(null)
      setSuccessMessage(null)

      if (!formData.nama || !formData.email || !formData.password) {
        setErrorMessage('Nama Lengkap, Email, dan Password wajib diisi!')
        return
      }

      const nameParts = formData.nama.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName,
          lastName,
          phone: formData.hp,
          gender: formData.jenisKelamin,
          placeOfBirth: formData.lokasi,
          dateOfBirth: formData.tglLahir || null,
          addressKtp: formData.alamat,
          addressDomicile: formData.alamatDomisili || formData.alamatDomisile,
          roleName: 'pegawai',
          details: {
            nip: formData.nip || formData.username || Math.floor(Math.random() * 100000000).toString(),
            status: formData.status || 'Tetap'
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Gagal membuat akun pegawai')
        return
      }

      setSuccessMessage('Karyawan berhasil ditambahkan!')
      setFormData(initialFormData)
      setIsModalOpen(false)
      await loadKaryawan()

      // Automatically hide success alert after 4 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 4000)
    } catch (error) {
      console.error('Unexpected error during submit:', error)
      setErrorMessage('Terjadi kesalahan: ' + (error as Error).message)
    }
  }

  // Face Recognition Modal Functions
  const startFaceCamera = async () => {
    if (faceStartingRef.current || faceCameraActive) return
    faceStartingRef.current = true
    setFaceCameraLoading(true)

    try {
      // Stop any existing stream first
      if (faceStreamRef.current) {
        faceStreamRef.current.getTracks().forEach(track => track.stop())
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640, max: 1920 }, height: { ideal: 480, max: 1080 }, facingMode: 'user' },
        audio: false
      })
      faceStreamRef.current = stream
      
      // Wait for video element to be ready
      if (faceVideoRef.current) {
        faceVideoRef.current.srcObject = stream
        await new Promise<void>((resolve) => {
          if (faceVideoRef.current) {
            faceVideoRef.current.onloadedmetadata = () => {
              faceVideoRef.current?.play()
              resolve()
            }
          } else {
            resolve()
          }
        })
      }
      
      setFaceCameraActive(true)
    } catch (err: any) {
      console.error('Face camera error:', err)
      let errorMessage = 'Terjadi kesalahan saat mengakses kamera'
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Kamera tidak ditemukan di perangkat Anda.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Kamera sedang digunakan oleh aplikasi lain.'
      }
      alert(errorMessage)
    } finally {
      setFaceCameraLoading(false)
      faceStartingRef.current = false
    }
  }

  const stopFaceCamera = () => {
    if (faceStreamRef.current) {
      faceStreamRef.current.getTracks().forEach(track => track.stop())
      faceStreamRef.current = null
    }
    if (faceVideoRef.current) {
      faceVideoRef.current.srcObject = null
    }
    setFaceCameraActive(false)
  }

  const captureFacePhoto = () => {
    if (faceVideoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = faceVideoRef.current.videoWidth
      canvas.height = faceVideoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(faceVideoRef.current, 0, 0)
        setFacePhoto(canvas.toDataURL('image/png'))
      }
    }
    stopFaceCamera()
  }

  const handleFaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFacePhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveFace = () => {
    if (selectedKaryawan) {
      setKaryawans(prev => prev.map(k => k.id === selectedKaryawan.id ? { ...k, faceRegistered: true } : k));
      stopFaceCamera();
      setFacePhoto(null);
      setIsFaceRecognitionModalOpen(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Manajemen Karyawan
        </h1>
        <p className="text-slate-500">
          Kelola data karyawan non-dosen Universitas Batam
        </p>
      </div>

      {successMessage && !isModalOpen && (
        <Alert className="bg-emerald-50 text-emerald-800 border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle>Sukses</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && !isModalOpen && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 bg-white hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <Users className="h-6 w-6 text-teal-600" />
              Total Karyawan Aktif
            </CardTitle>
            <CardDescription className="text-slate-500">Karyawan yang masih aktif bekerja</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-900">15</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <Briefcase className="h-6 w-6 text-blue-600" />
              Staff Administrasi
            </CardTitle>
            <CardDescription className="text-slate-500">Karyawan di bagian administrasi</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-900">10</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <Building className="h-6 w-6 text-purple-600" />
              Staff Lapangan
            </CardTitle>
            <CardDescription className="text-slate-500">Karyawan yang bekerja di lapangan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-900">5</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <UserCheck className="h-6 w-6 text-orange-600" />
              Karyawan Cuti
            </CardTitle>
            <CardDescription className="text-slate-500">Karyawan yang sedang cuti</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-slate-900">2</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Action Buttons */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Button 
          variant="secondary"
          onClick={() => setIsResapanModalOpen(true)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Resapan Tenaga Kerja
        </Button>
        <Button 
          variant="secondary"
          onClick={() => setIsExportModalOpen(true)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button 
          variant="secondary"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button 
          variant="secondary"
          onClick={() => setIsMappingShiftModalOpen(true)}
        >
          <Clock className="h-4 w-4 mr-2" />
          Mapping Shift
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <label className="text-sm font-medium text-slate-700 mr-2">Divisi</label>
          <select
            value={selectedDivisi}
            onChange={(e) => setSelectedDivisi(e.target.value)}
            className="p-2 rounded-lg border border-slate-300"
          >
            {divisiList.map(divisi => (
              <option key={divisi} value={divisi}>{divisi}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mr-2">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 rounded-lg border border-slate-300"
          >
            {statusList.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto">
          <Button 
                    className="bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800"
                    onClick={() => {
                      setFormData(initialFormData)
                      setCameraActive(false)
                      stopCamera()
                      setCurrentTab('personal')
                      setIsModalOpen(true)
                    }}
                  >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">NIP</TableHead>
                <TableHead className="text-slate-600 font-medium">Nama Karyawan</TableHead>
                <TableHead className="text-slate-600 font-medium">Divisi</TableHead>
                <TableHead className="text-slate-600 font-medium">Status</TableHead>
                <TableHead className="text-slate-600 font-medium">Status Wajah</TableHead>
                <TableHead className="text-slate-600 font-medium text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKaryawan.map(karyawan => (
                <TableRow key={karyawan.id} className="border-slate-200 hover:bg-slate-50">
                  <TableCell className="font-medium">{karyawan.nip}</TableCell>
                  <TableCell>{karyawan.nama}</TableCell>
                  <TableCell>{karyawan.divisi}</TableCell>
                  <TableCell>
                    <Badge className={karyawan.status === 'Tetap' ? 'bg-emerald-500 text-white' : 'bg-yellow-500 text-white'}>
                      {karyawan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={karyawan.faceRegistered ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}>
                      {karyawan.faceRegistered ? 'Terdaftar' : 'Belum Terdaftar'}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setSelectedKaryawan(karyawan)
                        setIsModalOpen(true) // Reuse the add modal for detail, or create separate
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />Detail
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setSelectedKaryawan(karyawan)
                        setIsEditModalOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />Edit
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setSelectedKaryawan(karyawan)
                        setIsEditPasswordModalOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />Edit Password
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setSelectedKaryawan(karyawan)
                        setIsMappingShiftModalOpen(true)
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-1" />Mapping Shift
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setSelectedKaryawan(karyawan)
                        setIsKontakModalOpen(true)
                      }}
                    >
                      <Phone className="h-4 w-4 mr-1" />Kontak
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setSelectedKaryawan(karyawan)
                        setIsFaceRecognitionModalOpen(true)
                      }}
                    >
                      <Camera className="h-4 w-4 mr-1" />Face Recognition
                    </Button>
                    <Button variant="destructive" size="sm"><UserX className="h-4 w-4 mr-1" />Nonaktifkan</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <Dialog 
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) {
            stopCamera()
            setCurrentTab('personal')
            setFormData(initialFormData)
            setCameraActive(false)
            setErrorMessage(null)
            setSuccessMessage(null)
          }
        }}
      >
        <DialogContent className="max-w-[98vw] max-h-[98vh] overflow-y-auto w-[98vw] h-[98vh] sm:max-w-[98vw] p-6">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <DialogTitle className="text-2xl font-bold">Tambah Pegawai</DialogTitle>
                  <DialogDescription className="text-sm">Data lengkap pegawai baru</DialogDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button className="bg-gradient-to-r from-indigo-600 to-blue-600" onClick={handleSubmit}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </div>
          </DialogHeader>

          {successMessage && isModalOpen && (
            <Alert className="mb-4 bg-emerald-50 text-emerald-800 border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertTitle>Sukses</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {errorMessage && isModalOpen && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="w-full overflow-x-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
              {FORM_TABS.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 text-xs md:text-sm">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Personal Data */}
            <TabsContent value="personal" className="space-y-6">
              {/* Photo Section */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Camera className="h-4 w-4 text-purple-600" />
                    </div>
                    Foto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    {formData.foto ? (
                      <Avatar className="h-32 w-32 rounded-xl border-2 border-dashed border-slate-300">
                        <AvatarImage src={formData.foto} className="object-cover" />
                        <AvatarFallback>
                          <User className="h-12 w-12 text-slate-400" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-32 w-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                        <User className="h-12 w-12 text-slate-400" />
                      </div>
                    )}

                    {/* Video always in DOM so ref works */}
                    <div className="space-y-3">
                      <video ref={videoRef} playsInline muted autoPlay className={`w-48 h-36 object-cover rounded-xl bg-slate-900 ${cameraActive ? '' : 'hidden'}`} />
                      {cameraActive ? (
                        <div className="flex gap-2">
                          <Button onClick={capturePhoto} className="bg-emerald-600 hover:bg-emerald-700">
                            Ambil Foto
                          </Button>
                          <Button variant="secondary" onClick={stopCamera}>
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button variant="secondary" onClick={startCamera} className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Ambil dari Kamera
                          </Button>
                          <div className="text-xs text-slate-400">
                            Atau klik kotak untuk upload file (Max 2MB)
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="foto-upload"
                            onChange={handleFileChange}
                          />
                          <label htmlFor="foto-upload" className="cursor-pointer">
                            <Button variant="secondary" className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              Upload Foto
                            </Button>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    Data Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama" className="text-xs uppercase text-slate-500">Nama <span className="text-red-500">*</span></Label>
                    <Input 
                      id="nama" 
                      placeholder="Nama lengkap" 
                      value={formData.nama || ''} 
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase text-slate-500">Email <span className="text-red-500">*</span></Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={formData.email || ''} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hp" className="text-xs uppercase text-slate-500">HP <span className="text-red-500">*</span></Label>
                    <Input 
                      id="hp" 
                      placeholder="08xxxxxxxxxx" 
                      value={formData.hp || ''} 
                      onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs uppercase text-slate-500">Username <span className="text-red-500">*</span></Label>
                    <Input 
                      id="username" 
                      placeholder="Username" 
                      value={formData.username || ''} 
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs uppercase text-slate-500">Password <span className="text-red-500">*</span></Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Password" 
                      value={formData.password || ''} 
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lokasi" className="text-xs uppercase text-slate-500">Lokasi <span className="text-red-500">*</span></Label>
                    <Select 
                      id="lokasi" 
                      value={formData.lokasi || ''} 
                      onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                      className="bg-slate-50"
                    >
                      <option value="">Pilih lokasi</option>
                      <option value="Kampus A">Kampus A</option>
                      <option value="Kampus B">Kampus B</option>
                      <option value="Kampus C">Kampus C</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tglLahir" className="text-xs uppercase text-slate-500">Tgl Lahir <span className="text-red-500">*</span></Label>
                    <Input 
                      id="tglLahir" 
                      type="date" 
                      value={formData.tglLahir || ''} 
                      onChange={(e) => setFormData({ ...formData, tglLahir: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jenisKelamin" className="text-xs uppercase text-slate-500">Jenis Kelamin <span className="text-red-500">*</span></Label>
                    <Select 
                      id="jenisKelamin" 
                      value={formData.jenisKelamin || ''} 
                      onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                      className="bg-slate-50"
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tglMasuk" className="text-xs uppercase text-slate-500">Tgl Masuk <span className="text-red-500">*</span></Label>
                    <Input 
                      id="tglMasuk" 
                      type="date" 
                      value={formData.tglMasuk || ''} 
                      onChange={(e) => setFormData({ ...formData, tglMasuk: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="masaKerja" className="text-xs uppercase text-slate-500">Masa Kerja</Label>
                    <Input 
                      id="masaKerja" 
                      placeholder="Masa kerja" 
                      value={formData.masaKerja || ''} 
                      onChange={(e) => setFormData({ ...formData, masaKerja: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs uppercase text-slate-500">Role <span className="text-red-500">*</span></Label>
                    <Select 
                      id="role" 
                      value={formData.role || ''} 
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="bg-slate-50"
                    >
                      <option value="">Pilih Role</option>
                      <option value="karyawan">Karyawan</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="divisi" className="text-xs uppercase text-slate-500">Divisi <span className="text-red-500">*</span></Label>
                    <Select 
                      id="divisi" 
                      value={formData.divisi || ''} 
                      onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                      className="bg-slate-50"
                    >
                      <option value="">Pilih Divisi</option>
                      <option value="IT">IT</option>
                      <option value="HRD">HRD</option>
                      <option value="Keuangan">Keuangan</option>
                      <option value="Biro Akademik">Biro Akademik</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isAdmin" className="text-xs uppercase text-slate-500">Is Admin <span className="text-red-500">*</span></Label>
                    <Select 
                      id="isAdmin" 
                      value={formData.isAdmin || 'user'} 
                      onChange={(e) => setFormData({ ...formData, isAdmin: e.target.value })}
                      className="bg-slate-50"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaIbu" className="text-xs uppercase text-slate-500">Nama Ibu Kandung <span className="text-red-500">*</span></Label>
                    <Input 
                      id="namaIbu" 
                      placeholder="Nama Ibu Kandung" 
                      value={formData.namaIbu || ''} 
                      onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact */}
            <TabsContent value="contact" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    Alamat
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provinsi" className="text-xs uppercase text-slate-500">Provinsi <span className="text-red-500">*</span></Label>
                    <Select 
                      id="provinsi" 
                      value={formData.provinsi || ''} 
                      onChange={(e) => {
                        const newProvinsi = e.target.value
                        setFormData({ ...formData, provinsi: newProvinsi, kota: '', kecamatan: '', kelurahan: '' })
                      }}
                      className="bg-slate-50"
                    >
                      <option value="">Pilih Provinsi</option>
                      {indonesianProvinces.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kota" className="text-xs uppercase text-slate-500">Kota / Kabupaten <span className="text-red-500">*</span></Label>
                    <Select 
                      id="kota" 
                      value={formData.kota || ''} 
                      onChange={(e) => {
                        const newKota = e.target.value
                        setFormData({ ...formData, kota: newKota, kecamatan: '', kelurahan: '' })
                      }}
                      className="bg-slate-50"
                      disabled={!formData.provinsi}
                    >
                      <option value="">Pilih Kota</option>
                      {getCitiesByProvince(formData.provinsi).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kecamatan" className="text-xs uppercase text-slate-500">Kecamatan <span className="text-red-500">*</span></Label>
                    <Select 
                      id="kecamatan" 
                      value={formData.kecamatan || ''} 
                      onChange={(e) => {
                        const newKecamatan = e.target.value
                        setFormData({ ...formData, kecamatan: newKecamatan, kelurahan: '' })
                      }}
                      className="bg-slate-50"
                      disabled={!formData.kota}
                    >
                      <option value="">Pilih Kecamatan</option>
                      {getDistrictsByCity(formData.kota).map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kelurahan" className="text-xs uppercase text-slate-500">Kelurahan <span className="text-red-500">*</span></Label>
                    <Select 
                      id="kelurahan" 
                      value={formData.kelurahan || ''} 
                      onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                      className="bg-slate-50"
                      disabled={!formData.kecamatan}
                    >
                      <option value="">Pilih Kelurahan</option>
                      {getVillagesByDistrict(formData.kecamatan).map((village) => (
                        <option key={village} value={village}>{village}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alamat" className="text-xs uppercase text-slate-500">Detail Jalan / No Rumah</Label>
                    <Input 
                      id="alamat" 
                      placeholder="Jl. Raya No. 123..." 
                      value={formData.alamat || ''} 
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kodePos" className="text-xs uppercase text-slate-500">Kode Pos</Label>
                    <Input 
                      id="kodePos" 
                      placeholder="12345" 
                      value={formData.kodePos || ''} 
                      onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="alamtLengkap" className="text-xs uppercase text-slate-500">Kesimpulan Alamat (Otomatis)</Label>
                    <Textarea 
                      id="alamtLengkap" 
                      placeholder="Alamat akan terisi otomatis..." 
                      value={`${formData.alamat || ''}, ${formData.kelurahan || ''}, ${formData.kecamatan || ''}, ${formData.kota || ''}, ${formData.provinsi || ''}, ${formData.kodePos || ''}`}
                      className="bg-slate-50"
                      rows={3}
                      readOnly
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                    </div>
                    Alamat Domisili
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provinsiDomisili" className="text-xs uppercase text-slate-500">Provinsi <span className="text-red-500">*</span></Label>
                    <Select 
                      id="provinsiDomisili" 
                      value={formData.provinsiDomisili || ''} 
                      onChange={(e) => {
                        const newProvinsi = e.target.value
                        setFormData({ ...formData, provinsiDomisili: newProvinsi, kotaDomisili: '', kecamatanDomisili: '', kelurahanDomisili: '' })
                      }}
                      className="bg-slate-50"
                    >
                      <option value="">Pilih Provinsi</option>
                      {indonesianProvinces.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kotaDomisili" className="text-xs uppercase text-slate-500">Kota / Kabupaten <span className="text-red-500">*</span></Label>
                    <Select 
                      id="kotaDomisili" 
                      value={formData.kotaDomisili || ''} 
                      onChange={(e) => {
                        const newKota = e.target.value
                        setFormData({ ...formData, kotaDomisili: newKota, kecamatanDomisili: '', kelurahanDomisili: '' })
                      }}
                      className="bg-slate-50"
                      disabled={!formData.provinsiDomisili}
                    >
                      <option value="">Pilih Kota</option>
                      {getCitiesByProvince(formData.provinsiDomisili).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kecamatanDomisili" className="text-xs uppercase text-slate-500">Kecamatan <span className="text-red-500">*</span></Label>
                    <Select 
                      id="kecamatanDomisili" 
                      value={formData.kecamatanDomisili || ''} 
                      onChange={(e) => {
                        const newKecamatan = e.target.value
                        setFormData({ ...formData, kecamatanDomisili: newKecamatan, kelurahanDomisili: '' })
                      }}
                      className="bg-slate-50"
                      disabled={!formData.kotaDomisili}
                    >
                      <option value="">Pilih Kecamatan</option>
                      {getDistrictsByCity(formData.kotaDomisili).map((district) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kelurahanDomisili" className="text-xs uppercase text-slate-500">Kelurahan <span className="text-red-500">*</span></Label>
                    <Select 
                      id="kelurahanDomisili" 
                      value={formData.kelurahanDomisili || ''} 
                      onChange={(e) => setFormData({ ...formData, kelurahanDomisili: e.target.value })}
                      className="bg-slate-50"
                      disabled={!formData.kecamatanDomisili}
                    >
                      <option value="">Pilih Kelurahan</option>
                      {getVillagesByDistrict(formData.kecamatanDomisili).map((village) => (
                        <option key={village} value={village}>{village}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alamatDomisili" className="text-xs uppercase text-slate-500">Detail Jalan / No Rumah</Label>
                    <Input 
                      id="alamatDomisili" 
                      placeholder="Jl. Raya No. 123..." 
                      value={formData.alamatDomisili || ''} 
                      onChange={(e) => setFormData({ ...formData, alamatDomisili: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kodePosDomisili" className="text-xs uppercase text-slate-500">Kode Pos</Label>
                    <Input 
                      id="kodePosDomisili" 
                      placeholder="12345" 
                      value={formData.kodePosDomisili || ''} 
                      onChange={(e) => setFormData({ ...formData, kodePosDomisili: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="alamtLengkapDomisili" className="text-xs uppercase text-slate-500">Kesimpulan Alamat (Otomatis)</Label>
                    <Textarea 
                      id="alamtLengkapDomisili" 
                      placeholder="Alamat akan terisi otomatis..." 
                      value={`${formData.alamatDomisili || ''}, ${formData.kelurahanDomisili || ''}, ${formData.kecamatanDomisili || ''}, ${formData.kotaDomisili || ''}, ${formData.provinsiDomisili || ''}, ${formData.kodePosDomisili || ''}`}
                      className="bg-slate-50"
                      rows={3}
                      readOnly
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Phone className="h-4 w-4 text-red-600" />
                    </div>
                    Kontak Darurat
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="namaKontakDarurat" className="text-xs uppercase text-slate-500">Nama <span className="text-red-500">*</span></Label>
                    <Input 
                      id="namaKontakDarurat" 
                      placeholder="Nama Kontak Darurat" 
                      value={formData.namaKontakDarurat || ''} 
                      onChange={(e) => setFormData({ ...formData, namaKontakDarurat: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hpKontakDarurat" className="text-xs uppercase text-slate-500">HP <span className="text-red-500">*</span></Label>
                    <Input 
                      id="hpKontakDarurat" 
                      placeholder="08xxxxxxxxxx" 
                      value={formData.hpKontakDarurat || ''} 
                      onChange={(e) => setFormData({ ...formData, hpKontakDarurat: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="hubungan" className="text-xs uppercase text-slate-500">Hubungan <span className="text-red-500">*</span></Label>
                    <Select 
                      id="hubungan" 
                      value={formData.hubungan || ''} 
                      onChange={(e) => setFormData({ ...formData, hubungan: e.target.value })}
                      className="bg-slate-50"
                    >
                      <option value="">Pilih Hubungan</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Saudara">Saudara</option>
                      <option value="Pasangan">Pasangan</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-amber-600" />
                    </div>
                    Dokumen Identitas
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ktp" className="text-xs uppercase text-pink-600">KTP <span className="text-red-500">*</span></Label>
                    <Input 
                      id="ktp" 
                      placeholder="No. KTP" 
                      value={formData.ktp || ''} 
                      onChange={(e) => setFormData({ ...formData, ktp: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kartuKeluarga" className="text-xs uppercase text-pink-600">Kartu Keluarga <span className="text-red-500">*</span></Label>
                    <Input 
                      id="kartuKeluarga" 
                      placeholder="No. KK" 
                      value={formData.kartuKeluarga || ''} 
                      onChange={(e) => setFormData({ ...formData, kartuKeluarga: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bpjsKesehatan" className="text-xs uppercase text-pink-600">BPJS Kesehatan <span className="text-red-500">*</span></Label>
                    <Input 
                      id="bpjsKesehatan" 
                      placeholder="No. BPJS Kesehatan" 
                      value={formData.bpjsKesehatan || ''} 
                      onChange={(e) => setFormData({ ...formData, bpjsKesehatan: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bpjsKetenagakerjaan" className="text-xs uppercase text-pink-600">BPJS Ketenagakerjaan <span className="text-red-500">*</span></Label>
                    <Input 
                      id="bpjsKetenagakerjaan" 
                      placeholder="No. BPJS Ketenagakerjaan" 
                      value={formData.bpjsKetenagakerjaan || ''} 
                      onChange={(e) => setFormData({ ...formData, bpjsKetenagakerjaan: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="npwp" className="text-xs uppercase text-pink-600">NPWP <span className="text-red-500">*</span></Label>
                    <Input 
                      id="npwp" 
                      placeholder="No. NPWP" 
                      value={formData.npwp || ''} 
                      onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sim" className="text-xs uppercase text-pink-600">SIM <span className="text-red-500">*</span></Label>
                    <Input 
                      id="sim" 
                      placeholder="No. SIM" 
                      value={formData.sim || ''} 
                      onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Documents */}
              <div className="space-y-4">
                <div className="pt-4 border-t border-slate-200">
                  <Button 
                    variant="secondary" 
                    onClick={handleAddAdditionalDoc}
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 border border-blue-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Baru
                  </Button>
                </div>
                {(formData.additionalDocs || []).map((doc: any, index: number) => (
                  <Card key={index} className="border-slate-200 border-indigo-200">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <Input 
                          placeholder="Nama File (KTP, SIM, dll)" 
                          value={doc.name} 
                          onChange={(e) => {
                            const newDocs = [...(formData.additionalDocs || [])]
                            newDocs[index] = { ...newDocs[index], name: e.target.value }
                            setFormData({ ...formData, additionalDocs: newDocs })
                          }}
                          className="bg-slate-50"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="file" 
                          id={`doc-upload-${index}`}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const newDocs = [...(formData.additionalDocs || [])]
                              newDocs[index] = { ...newDocs[index], file }
                              setFormData({ ...formData, additionalDocs: newDocs })
                            }
                          }}
                        />
                        <label htmlFor={`doc-upload-${index}`} className="cursor-pointer">
                          <Button variant="secondary" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100">
                            Choose file
                          </Button>
                        </label>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveAdditionalDoc(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Contract */}
            <TabsContent value="contract" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-fuchsia-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-fuchsia-600" />
                    </div>
                    Kontrak Kerja
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="noPkwt" className="text-xs uppercase text-pink-600">No PKWT <span className="text-red-500">*</span></Label>
                    <Input 
                      id="noPkwt" 
                      placeholder="Nomor PKWT" 
                      value={formData.noPkwt || ''} 
                      onChange={(e) => setFormData({ ...formData, noPkwt: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noKontrak" className="text-xs uppercase text-pink-600">No Kontrak <span className="text-red-500">*</span></Label>
                    <Input 
                      id="noKontrak" 
                      placeholder="Nomor Kontrak" 
                      value={formData.noKontrak || ''} 
                      onChange={(e) => setFormData({ ...formData, noKontrak: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tglMulaiPkwt" className="text-xs uppercase text-pink-600">Tgl Mulai PKWT <span className="text-red-500">*</span></Label>
                    <Input 
                      id="tglMulaiPkwt" 
                      type="date" 
                      value={formData.tglMulaiPkwt || ''} 
                      onChange={(e) => setFormData({ ...formData, tglMulaiPkwt: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tglAkhirPkwt" className="text-xs uppercase text-pink-600">Tgl Berakhir PKWT <span className="text-red-500">*</span></Label>
                    <Input 
                      id="tglAkhirPkwt" 
                      type="date" 
                      value={formData.tglAkhirPkwt || ''} 
                      onChange={(e) => setFormData({ ...formData, tglAkhirPkwt: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-cyan-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-cyan-600" />
                    </div>
                    Informasi Rekening
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="noRekening" className="text-xs uppercase text-pink-600">No Rekening <span className="text-red-500">*</span></Label>
                    <Input 
                      id="noRekening" 
                      placeholder="#" 
                      value={formData.noRekening || ''} 
                      onChange={(e) => setFormData({ ...formData, noRekening: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaRekening" className="text-xs uppercase text-pink-600">Nama Rekening <span className="text-red-500">*</span></Label>
                    <Input 
                      id="namaRekening" 
                      placeholder="Nama sesuai rekening" 
                      value={formData.namaRekening || ''} 
                      onChange={(e) => setFormData({ ...formData, namaRekening: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs (Leave, Allowance, Deduction) - placeholders */}
            <TabsContent value="leave" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Cuti & Izin</CardTitle>
                  <CardDescription>Atur batas cuti dan izin pegawai</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-12 text-slate-400">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Data cuti akan diatur pada bagian ini</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="allowance" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Penjumlahan Gaji</CardTitle>
                  <CardDescription>Daftar tunjangan dan penambah gaji</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-12 text-slate-400">
                    <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Data tunjangan akan diatur pada bagian ini</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="deduction" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Pengurangan Gaji</CardTitle>
                  <CardDescription>Daftar potongan gaji</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-12 text-slate-400">
                    <X className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Data potongan gaji akan diatur pada bagian ini</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Bottom Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-8">
            <Button 
              variant="secondary" 
              onClick={handlePrevTab} 
              disabled={currentTab === FORM_TABS[0].id}
              className="rounded-full px-6 py-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {FORM_TABS.map((tab, index) => (
                <div
                  key={tab.id}
                  className={`h-2 w-2 rounded-full transition-all ${
                    currentTab === tab.id ? 'w-8 bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {currentTab === FORM_TABS[FORM_TABS.length - 1].id ? (
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full px-6 py-2">
                Simpan Data
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                onClick={handleNextTab} 
                className="rounded-full px-6 py-2"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Resapan Tenaga Kerja Modal */}
      <Dialog open={isResapanModalOpen} onOpenChange={setIsResapanModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Resapan Tenaga Kerja</DialogTitle>
            <DialogDescription>Analisis distribusi dan resapan tenaga kerja</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Data resapan tenaga kerja akan ditampilkan disini dalam bentuk grafik dan tabel.</p>
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <p className="text-slate-500">Fitur resapan tenaga kerja (visualisasi) akan ditambahkan disini.</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Export Data Karyawan</DialogTitle>
            <DialogDescription>Pilih format untuk export data karyawan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button className="flex flex-col gap-2 py-8">
                <FileText className="h-10 w-10" />
                <span>Excel (.xlsx)</span>
              </Button>
              <Button variant="secondary" className="flex flex-col gap-2 py-8">
                <FileText className="h-10 w-10" />
                <span>CSV</span>
              </Button>
              <Button variant="secondary" className="flex flex-col gap-2 py-8">
                <FileText className="h-10 w-10" />
                <span>PDF</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Import Data Karyawan</DialogTitle>
            <DialogDescription>Upload file untuk import data karyawan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
              <Upload className="h-10 w-10 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-500">Drag & drop file disini atau klik untuk upload</p>
              <input type="file" className="hidden" id="import-file" />
              <label htmlFor="import-file" className="mt-2 inline-block cursor-pointer">
                <Button variant="secondary">Pilih File</Button>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mapping Shift Modal */}
      <Dialog open={isMappingShiftModalOpen} onOpenChange={setIsMappingShiftModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Mapping Shift</DialogTitle>
            <DialogDescription>
              {selectedKaryawan ? `Mapping shift untuk ${selectedKaryawan.nama}` : 'Mapping shift karyawan'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <p className="text-slate-500">Fitur mapping shift akan ditambahkan disini.</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[90vw] h-[90vh]">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(false)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <DialogTitle className="text-2xl font-bold">Edit Pegawai</DialogTitle>
                <DialogDescription className="text-sm">
                  {selectedKaryawan ? `Edit data ${selectedKaryawan.nama}` : 'Edit data pegawai'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <p className="text-slate-500">Form edit pegawai (mirip form tambah) akan ditampilkan disini.</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Password Modal */}
      <Dialog open={isEditPasswordModalOpen} onOpenChange={setIsEditPasswordModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Password</DialogTitle>
            <DialogDescription>
              {selectedKaryawan ? `Ubah password untuk ${selectedKaryawan.nama}` : 'Ubah password pegawai'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-xs uppercase text-slate-500">Password Baru</Label>
              <Input id="new-password" type="password" className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-xs uppercase text-slate-500">Konfirmasi Password Baru</Label>
              <Input id="confirm-password" type="password" className="bg-slate-50" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setIsEditPasswordModalOpen(false)}>Batal</Button>
            <Button>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kontak Modal */}
      <Dialog open={isKontakModalOpen} onOpenChange={setIsKontakModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Kontak Pegawai</DialogTitle>
            <DialogDescription>
              {selectedKaryawan ? `Kontak untuk ${selectedKaryawan.nama}` : 'Kontak pegawai'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <p className="text-slate-500">Informasi kontak akan ditampilkan disini.</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Face Recognition Modal */}
      <Dialog 
        open={isFaceRecognitionModalOpen} 
        onOpenChange={(open) => {
          setIsFaceRecognitionModalOpen(open)
          if (!open) {
            stopFaceCamera()
            setFacePhoto(null)
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Face Recognition Registration</DialogTitle>
            <DialogDescription>
              {selectedKaryawan ? `Daftarkan wajah ${selectedKaryawan.nama} untuk absensi` : 'Daftarkan wajah pegawai untuk absensi'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="border-slate-200">
              <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                <div className="w-full max-w-md aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative">
                  {/* Always render the video element */}
                  <video 
                    ref={faceVideoRef} 
                    playsInline 
                    muted 
                    autoPlay 
                    className={`w-full h-full object-cover ${!faceCameraActive && !facePhoto ? 'hidden' : ''}`}
                  />
                  
                  {/* Show photo if captured */}
                  {facePhoto ? (
                    <img src={facePhoto} alt="Face capture" className="absolute inset-0 w-full h-full object-cover" />
                  ) : faceCameraLoading ? (
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <div className="h-10 w-10 border-4 border-slate-400 border-t-emerald-500 rounded-full animate-spin mb-2" />
                      <p>Mengaktifkan Kamera...</p>
                    </div>
                  ) : !faceCameraActive ? (
                    <Camera className="h-16 w-16 text-slate-600" />
                  ) : null}
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {faceCameraActive ? (
                    <>
                      <Button onClick={captureFacePhoto} className="bg-emerald-600 hover:bg-emerald-700">
                        <Camera className="h-4 w-4 mr-2" />Ambil Foto
                      </Button>
                      <Button variant="secondary" onClick={stopFaceCamera}>
                        <X className="h-4 w-4 mr-2" />Batal
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={startFaceCamera} className="bg-emerald-600 hover:bg-emerald-700">
                        <Camera className="h-4 w-4 mr-2" />Mulai Kamera
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="face-upload"
                        onChange={handleFaceFileChange}
                      />
                      <label htmlFor="face-upload" className="cursor-pointer">
                        <Button variant="secondary">
                          <Upload className="h-4 w-4 mr-2" />Upload Foto
                        </Button>
                      </label>
                      {facePhoto && (
                        <Button variant="destructive" onClick={() => setFacePhoto(null)}>
                          Hapus Foto
                        </Button>
                      )}
                    </>
                  )}
                </div>
                {facePhoto && (
                  <div className="w-full max-w-md">
                    <Button onClick={handleSaveFace} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                      Simpan Pendaftaran Wajah
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

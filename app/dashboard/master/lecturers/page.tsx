'use client'

import { useState, useRef, useEffect } from 'react'
import { indonesianProvinces, getCitiesByProvince, getDistrictsByCity, getVillagesByDistrict } from '@/lib/indonesian-regions'
import { validateAttendanceLocation } from '@/lib/geolocation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Briefcase, Building, UserCheck, Edit, Eye, UserX, Plus, Camera, Upload, X, ArrowLeft, ArrowRight, User, Phone, Mail, FileText, Calendar, CreditCard, MapPin, CheckCircle2, Download, Clock, GraduationCap } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface Lecturer {
  id: number
  nip: string
  nama: string
  jurusan: string
  status: string
  faceRegistered?: boolean
}

// Mock Lecturer Data
const mockLecturers = [
  {
    id: 1,
    nip: '198501012010015001',
    nama: 'Dr. Siti Aminah, M.Si',
    jurusan: 'Teknik Informatika',
    status: 'Tetap',
    faceRegistered: false,
  },
  {
    id: 2,
    nip: '199002022015015002',
    nama: 'Prof. Rizky Pratama, Ph.D',
    jurusan: 'Sistem Informasi',
    status: 'Tetap',
    faceRegistered: false,
  },
  {
    id: 3,
    nip: '198803032012015003',
    nama: 'Dewi Lestari, M.Kom',
    jurusan: 'Teknik Komputer',
    status: 'Kontrak',
    faceRegistered: false,
  },
] as Lecturer[];

const jurusanList = ['Semua Jurusan', 'Teknik Informatika', 'Sistem Informasi', 'Teknik Komputer', 'Teknologi Informasi']
const statusList = ['Semua Status', 'Tetap', 'Kontrak']

// Form Step Configuration
const FORM_TABS = [
  { id: 'personal', label: 'Data Pribadi', icon: User },
  { id: 'contact', label: 'Informasi Kontak', icon: Phone },
  { id: 'documents', label: 'Dokumen', icon: FileText },
  { id: 'academic', label: 'Data Akademik', icon: GraduationCap },
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
  jurusan: '',
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
  // Academic
  nidn: '',
  gelarDepan: '',
  gelarBelakang: '',
  pendidikanTerakhir: '',
  // Contract & Bank
  noPkwt: '',
  noKontrak: '',
  tglMulaiPkwt: '',
  tglAkhirPkwt: '',
  noRekening: '',
  namaRekening: '',
}

export default function LecturersPage() {
  const [selectedJurusan, setSelectedJurusan] = useState('Semua Jurusan')
  const [selectedStatus, setSelectedStatus] = useState('Semua Status')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFaceRecognitionModalOpen, setIsFaceRecognitionModalOpen] = useState(false)
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null)
  const [currentTab, setCurrentTab] = useState('personal')
  const [formData, setFormData] = useState(initialFormData)
  const [cameraActive, setCameraActive] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const faceVideoRef = useRef<HTMLVideoElement>(null)
  const faceStreamRef = useRef<MediaStream | null>(null)
  const [faceCameraActive, setFaceCameraActive] = useState(false)
  const [faceCameraLoading, setFaceCameraLoading] = useState(false)
  const [facePhoto, setFacePhoto] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const startingRef = useRef(false)

  const [provinces] = useState(indonesianProvinces)
  const [cities, setCities] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])
  const [domCities, setDomCities] = useState<string[]>([])
  const [domDistricts, setDomDistricts] = useState<string[]>([])
  const [domVillages, setDomVillages] = useState<string[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>(mockLecturers)

  useEffect(() => {
    if (isFaceRecognitionModalOpen && !facePhoto) {
      startFaceCamera();
    }
    return () => {
      stopFaceCamera();
    };
  }, [isFaceRecognitionModalOpen, facePhoto]);

  const handleSaveFace = () => {
    if (selectedLecturer) {
      setLecturers(prev => prev.map(l => l.id === selectedLecturer.id ? { ...l, faceRegistered: true } : l));
      stopFaceCamera();
      setFacePhoto(null);
      setIsFaceRecognitionModalOpen(false);
    }
  }

  const handleProvinsiChange = (value: string) => {
    setFormData({ ...formData, provinsi: value, kota: '', kecamatan: '', kelurahan: '' })
    const cityList = getCitiesByProvince(value)
    setCities(cityList)
    setDistricts([])
    setVillages([])
  }

  const handleKotaChange = (value: string) => {
    setFormData({ ...formData, kota: value, kecamatan: '', kelurahan: '' })
    const districtList = getDistrictsByCity(value)
    setDistricts(districtList)
    setVillages([])
  }

  const handleKecamatanChange = (value: string) => {
    setFormData({ ...formData, kecamatan: value, kelurahan: '' })
    const villageList = getVillagesByDistrict(value)
    setVillages(villageList)
  }

  const handleProvinsiDomisiliChange = (value: string) => {
    setFormData({ ...formData, provinsiDomisili: value, kotaDomisili: '', kecamatanDomisili: '', kelurahanDomisili: '' })
    const cityList = getCitiesByProvince(value)
    setDomCities(cityList)
    setDomDistricts([])
    setDomVillages([])
  }

  const handleKotaDomisiliChange = (value: string) => {
    setFormData({ ...formData, kotaDomisili: value, kecamatanDomisili: '', kelurahanDomisili: '' })
    const districtList = getDistrictsByCity(value)
    setDomDistricts(districtList)
    setDomVillages([])
  }

  const handleKecamatanDomisiliChange = (value: string) => {
    setFormData({ ...formData, kecamatanDomisili: value, kelurahanDomisili: '' })
    const villageList = getVillagesByDistrict(value)
    setDomVillages(villageList)
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)
      setCameraActive(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const imageDataUrl = canvasRef.current.toDataURL('image/png')
        setFormData({ ...formData, foto: imageDataUrl })
        stopCamera()
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const startFaceCamera = async () => {
    if (startingRef.current || faceCameraActive) return
    startingRef.current = true
    setFaceCameraLoading(true)
    setCameraError(null)

    try {
      // Validate location first
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          })
        });
        
        const validation = validateAttendanceLocation(position);
        if (!validation.isValid) {
          setCameraError(validation.error || 'Lokasi tidak valid.');
          setFaceCameraLoading(false);
          startingRef.current = false;
          return;
        }
      } else {
        setCameraError('Browser Anda tidak mendukung geolokasi!');
        setFaceCameraLoading(false);
        startingRef.current = false;
        return;
      }

      if (faceStreamRef.current) {
        faceStreamRef.current.getTracks().forEach(t => t.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      })

      faceStreamRef.current = stream

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
      if (err.name === 'NotAllowedError') {
        setCameraError('Izin kamera ditolak. Silakan izinkan akses kamera.')
      } else {
        setCameraError('Gagal mengakses kamera.')
      }
    } finally {
      setFaceCameraLoading(false)
      startingRef.current = false
    }
  };

  const stopFaceCamera = () => {
    if (faceStreamRef.current) {
      faceStreamRef.current.getTracks().forEach(t => t.stop());
      faceStreamRef.current = null;
    }
    if (faceVideoRef.current) {
      faceVideoRef.current.srcObject = null;
    }
    setFaceCameraActive(false);
  };

  const captureFacePhoto = () => {
    if (faceVideoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = faceVideoRef.current.videoWidth;
      canvas.height = faceVideoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(faceVideoRef.current, 0, 0);
        setFacePhoto(canvas.toDataURL('image/png'));
      }
    }
    stopFaceCamera();
  };

  const handleFaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFacePhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredLecturers = lecturers.filter(lecturer => {
    const matchJurusan = selectedJurusan === 'Semua Jurusan' || lecturer.jurusan === selectedJurusan
    const matchStatus = selectedStatus === 'Semua Status' || lecturer.status === selectedStatus
    return matchJurusan && matchStatus
  })

  const handleOpenModal = () => {
    setFormData(initialFormData)
    setCameraActive(false)
    stopCamera()
    setCurrentTab('personal')
    setIsModalOpen(true)
  }

  const handleAddAdditionalDoc = () => {
    setFormData({
      ...formData,
      additionalDocs: [...formData.additionalDocs, { name: '', file: '' }]
    })
  }

  const handleRemoveAdditionalDoc = (index: number) => {
    const updated = [...formData.additionalDocs]
    updated.splice(index, 1)
    setFormData({ ...formData, additionalDocs: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Create a UUID for profile since we don't have auth hook here (may fail FK constraint if not bypassed)
      const profileId = crypto.randomUUID()
      
      // Separate first and last name
      const nameParts = formData.nama.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // 1. Insert into profiles
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: profileId,
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        phone: formData.hp,
        gender: formData.jenisKelamin === 'Laki-laki' ? 'laki-laki' : (formData.jenisKelamin === 'Perempuan' ? 'perempuan' : ''),
        place_of_birth: formData.lokasi,
        date_of_birth: formData.tglLahir || null,
        address_ktp: formData.alamat,
        address_domicile: formData.alamatDomisili,
      }])

      if (profileError) {
        console.error('Error inserting profile:', profileError)
        return
      }

      // 2. Insert into lecturers
      const { error: lecturerError } = await supabase.from('lecturers').insert([{
        profile_id: profileId,
        nip: formData.nip || formData.username || Math.floor(Math.random() * 100000000).toString(),
      }])

      if (lecturerError) {
        console.error('Error inserting lecturer:', lecturerError)
        return
      }

      console.log('Successfully saved lecturer:', formData)
      setIsModalOpen(false)
      // TODO: refresh data list if necessary
    } catch (error) {
      console.error('Unexpected error during submit:', error)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Data Dosen</h1>
          <p className="text-slate-500 mt-2">Kelola data lengkap dosen dan tenaga pengajar</p>
        </div>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mr-2">Jurusan</label>
              <select
                value={selectedJurusan}
                onChange={(e) => setSelectedJurusan(e.target.value)}
                className="p-2 rounded-lg border border-slate-300"
              >
                {jurusanList.map(jurusan => (
                  <option key={jurusan} value={jurusan}>{jurusan}</option>
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
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                onClick={handleOpenModal}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Dosen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">NIP</TableHead>
                <TableHead className="text-slate-600 font-medium">Nama Dosen</TableHead>
                <TableHead className="text-slate-600 font-medium">Jurusan</TableHead>
                <TableHead className="text-slate-600 font-medium">Status</TableHead>
                <TableHead className="text-slate-600 font-medium">Wajah</TableHead>
                <TableHead className="text-slate-600 font-medium text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLecturers.map((lecturer) => (
                <TableRow key={lecturer.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono text-slate-500">{lecturer.nip}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lecturer.nama}`} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700">
                          {lecturer.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-800">{lecturer.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-700">{lecturer.jurusan}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      lecturer.status === 'Tetap' 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                    }>
                      {lecturer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={(lecturer.faceRegistered ?? false) ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}>
                      {(lecturer.faceRegistered ?? false) ? 'Terdaftar' : 'Belum Terdaftar'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-700" onClick={() => { setSelectedLecturer(lecturer); setIsFaceRecognitionModalOpen(true); }}>
                        <Camera className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-indigo-600 hover:text-indigo-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-rose-600 hover:text-rose-700">
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog 
        open={isFaceRecognitionModalOpen} 
        onOpenChange={(open) => {
          setIsFaceRecognitionModalOpen(open);
          if (!open) {
            stopFaceCamera();
            setFacePhoto(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Face Recognition Registration</DialogTitle>
            <DialogDescription>
              {selectedLecturer ? `Daftarkan wajah ${selectedLecturer.nama} untuk absensi` : 'Daftarkan wajah dosen untuk absensi'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="border-slate-200">
              <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                <div className="w-full max-w-md aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative">
                  <video 
                    ref={faceVideoRef} 
                    playsInline 
                    muted 
                    autoPlay 
                    className={`w-full h-full object-cover ${!faceCameraActive && !facePhoto ? 'hidden' : ''}`}
                  />
                  {facePhoto ? (
                    <img src={facePhoto} alt="Face capture" className="absolute inset-0 w-full h-full object-cover" />
                  ) : faceCameraLoading ? (
                    <div className="flex flex-col items-center justify-center text-slate-300">Loading camera...</div>
                  ) : cameraError ? (
                    <div className="flex flex-col items-center justify-center gap-2 bg-slate-900 w-full h-full p-4 text-center">
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                        <X className="h-6 w-6 text-red-500" />
                      </div>
                      <p className="text-red-400 font-semibold text-sm max-w-[250px] leading-relaxed">
                        {cameraError}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300">Kamera tidak aktif</div>
                  )}
                </div>
                <div className="flex gap-2">
                  {faceCameraActive ? (
                    <Button onClick={captureFacePhoto} className="bg-emerald-600 hover:bg-emerald-700">Ambil Foto</Button>
                  ) : (
                    <Button variant="secondary" onClick={startFaceCamera}>Mulai Kamera</Button>
                  )}
                  <Button variant="secondary" onClick={stopFaceCamera}>Batal</Button>
                  <input type="file" accept="image/*" className="hidden" id="face-upload" onChange={handleFaceFileChange} />
                  <label htmlFor="face-upload" className="cursor-pointer">
                    <Button variant="secondary">Upload Foto</Button>
                  </label>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={handleSaveFace} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Simpan
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          stopCamera()
          setFormData(initialFormData)
        }
        setIsModalOpen(open)
      }}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] overflow-y-auto w-[98vw] h-[98vh] sm:max-w-[98vw] p-6">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <DialogTitle className="text-2xl font-bold">Tambah Dosen</DialogTitle>
                  <DialogDescription className="text-sm">Data lengkap dosen baru</DialogDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button type="submit" form="lecturer-form" className="bg-gradient-to-r from-indigo-600 to-blue-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </div>
          </DialogHeader>

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

              {/* Personal Info */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    Data Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Lengkap <span className="text-rose-500">*</span></Label>
                    <Input
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Nama Lengkap"
                      className="bg-slate-50 border-slate-200 py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Email <span className="text-rose-500">*</span></Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="bg-slate-50 border-slate-200 py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">HP <span className="text-rose-500">*</span></Label>
                    <Input
                      value={formData.hp}
                      onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="bg-slate-50 border-slate-200 py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Username <span className="text-rose-500">*</span></Label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Username"
                      className="bg-slate-50 border-slate-200 py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Password <span className="text-rose-500">*</span></Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password"
                      className="bg-slate-50 border-slate-200 py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Lokasi <span className="text-rose-500">*</span></Label>
                    <Select
                      value={formData.lokasi}
                      onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                      className="bg-slate-50 border-slate-200 py-6"
                    >
                      <option value="">Pilih Lokasi</option>
                      <option value="Kampus A">Kampus A</option>
                      <option value="Kampus B">Kampus B</option>
                      <option value="Kampus C">Kampus C</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tgl. Lahir</Label>
                    <Input
                      type="date"
                      value={formData.tglLahir}
                      onChange={(e) => setFormData({ ...formData, tglLahir: e.target.value })}
                      className="bg-slate-50 border-slate-200 py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Jenis Kelamin <span className="text-rose-500">*</span></Label>
                    <Select
                      value={formData.jenisKelamin}
                      onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                      className="bg-slate-50 border-slate-200 py-6"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Tgl. Masuk <span className="text-rose-500">*</span></Label>
                    <Input
                      type="date"
                      value={formData.tglMasuk}
                      onChange={(e) => setFormData({ ...formData, tglMasuk: e.target.value })}
                      className="bg-slate-50 border-slate-200 py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Ibu</Label>
                    <Input
                      value={formData.namaIbu}
                      onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                      placeholder="Nama Ibu Kandung"
                      className="bg-slate-50 border-slate-200 py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Jurusan <span className="text-rose-500">*</span></Label>
                    <Select
                      value={formData.jurusan}
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                      className="bg-slate-50 border-slate-200 py-6"
                    >
                      <option value="">Pilih Jurusan</option>
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Sistem Informasi">Sistem Informasi</option>
                      <option value="Teknik Komputer">Teknik Komputer</option>
                      <option value="Teknologi Informasi">Teknologi Informasi</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Role <span className="text-rose-500">*</span></Label>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="bg-slate-50 border-slate-200 py-6"
                    >
                      <option value="">Pilih Role</option>
                      <option value="Dosen">Dosen</option>
                      <option value="Kaprodi">Kepala Program Studi</option>
                      <option value="Dekan">Dekan</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Info */}
            <TabsContent value="contact" className="space-y-6">
              {/* Address */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    Alamat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Provinsi <span className="text-rose-500">*</span></Label>
                      <Select
                        value={formData.provinsi}
                        onChange={(e) => handleProvinsiChange(e.target.value)}
                        className="bg-slate-50 border-slate-200 py-6"
                      >
                        <option value="">Pilih Provinsi</option>
                        {provinces.map((provinsi) => (
                          <option key={provinsi} value={provinsi}>{provinsi}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kota / Kabupaten <span className="text-rose-500">*</span></Label>
                      <Select
                        value={formData.kota}
                        onChange={(e) => handleKotaChange(e.target.value)}
                        className="bg-slate-50 border-slate-200 py-6"
                        disabled={!formData.provinsi}
                      >
                        <option value="">Pilih Kota</option>
                        {cities.map((kota) => (
                          <option key={kota} value={kota}>{kota}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kecamatan</Label>
                      <Select
                        value={formData.kecamatan}
                        onChange={(e) => handleKecamatanChange(e.target.value)}
                        className="bg-slate-50 border-slate-200 py-6"
                        disabled={!formData.kota}
                      >
                        <option value="">Pilih Kecamatan</option>
                        {districts.map((kecamatan) => (
                          <option key={kecamatan} value={kecamatan}>{kecamatan}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kelurahan</Label>
                      <Select
                        value={formData.kelurahan}
                        onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                        className="bg-slate-50 border-slate-200 py-6"
                        disabled={!formData.kecamatan}
                      >
                        <option value="">Pilih Kelurahan</option>
                        {villages.map((kelurahan) => (
                          <option key={kelurahan} value={kelurahan}>{kelurahan}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Detail Alamat / No Rumah</Label>
                      <Textarea
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        placeholder="Jalan Raya No. 123..."
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kode Pos</Label>
                      <Input
                        value={formData.kodePos}
                        onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                        placeholder="12345"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Domicile Address */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-cyan-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-cyan-600" />
                    </div>
                    Alamat Domisili
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Alamat tempat tinggal saat ini (jika berbeda dengan alamat KTP)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Provinsi</Label>
                      <Select
                        value={formData.provinsiDomisili}
                        onChange={(e) => handleProvinsiDomisiliChange(e.target.value)}
                        className="bg-slate-50 border-slate-200 py-6"
                      >
                        <option value="">Pilih Provinsi</option>
                        {provinces.map((provinsi) => (
                          <option key={provinsi} value={provinsi}>{provinsi}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kota / Kabupaten</Label>
                      <Select
                        value={formData.kotaDomisili}
                        onChange={(e) => handleKotaDomisiliChange(e.target.value)}
                        className="bg-slate-50 border-slate-200 py-6"
                        disabled={!formData.provinsiDomisili}
                      >
                        <option value="">Pilih Kota</option>
                        {domCities.map((kota) => (
                          <option key={kota} value={kota}>{kota}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kecamatan</Label>
                      <Select
                        value={formData.kecamatanDomisili}
                        onChange={(e) => handleKecamatanDomisiliChange(e.target.value)}
                        className="bg-slate-50 border-slate-200 py-6"
                        disabled={!formData.kotaDomisili}
                      >
                        <option value="">Pilih Kecamatan</option>
                        {domDistricts.map((kecamatan) => (
                          <option key={kecamatan} value={kecamatan}>{kecamatan}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kelurahan</Label>
                      <Select
                        value={formData.kelurahanDomisili}
                        onChange={(e) => setFormData({ ...formData, kelurahanDomisili: e.target.value })}
                        className="bg-slate-50 border-slate-200 py-6"
                        disabled={!formData.kecamatanDomisili}
                      >
                        <option value="">Pilih Kelurahan</option>
                        {domVillages.map((kelurahan) => (
                          <option key={kelurahan} value={kelurahan}>{kelurahan}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Detail Alamat / No Rumah</Label>
                      <Textarea
                        value={formData.alamatDomisili}
                        onChange={(e) => setFormData({ ...formData, alamatDomisili: e.target.value })}
                        placeholder="Jalan Raya No. 123..."
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Kode Pos</Label>
                      <Input
                        value={formData.kodePosDomisili}
                        onChange={(e) => setFormData({ ...formData, kodePosDomisili: e.target.value })}
                        placeholder="12345"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-rose-100 rounded-full flex items-center justify-center">
                      <Phone className="h-4 w-4 text-rose-600" />
                    </div>
                    Kontak Darurat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Nama Kontak Darurat</Label>
                      <Input
                        value={formData.namaKontakDarurat}
                        onChange={(e) => setFormData({ ...formData, namaKontakDarurat: e.target.value })}
                        placeholder="Nama"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">No HP</Label>
                      <Input
                        value={formData.hpKontakDarurat}
                        onChange={(e) => setFormData({ ...formData, hpKontakDarurat: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Hubungan</Label>
                      <Select
                        value={formData.hubungan}
                        onChange={(e) => setFormData({ ...formData, hubungan: e.target.value })}
                        className="bg-slate-50 border-slate-200 py-6"
                      >
                        <option value="">Pilih Hubungan</option>
                        <option value="Orang Tua">Orang Tua</option>
                        <option value="Suami">Suami</option>
                        <option value="Istri">Istri</option>
                        <option value="Saudara">Saudara</option>
                        <option value="Lainnya">Lainnya</option>
                      </Select>
                    </div>
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
                    Dokumen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">No KTP</Label>
                      <Input
                        value={formData.ktp}
                        onChange={(e) => setFormData({ ...formData, ktp: e.target.value })}
                        placeholder="3201xxxxxxxxxxxx"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">No KK</Label>
                      <Input
                        value={formData.kartuKeluarga}
                        onChange={(e) => setFormData({ ...formData, kartuKeluarga: e.target.value })}
                        placeholder="3201xxxxxxxxxxxx"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">BPJS Kesehatan</Label>
                      <Input
                        value={formData.bpjsKesehatan}
                        onChange={(e) => setFormData({ ...formData, bpjsKesehatan: e.target.value })}
                        placeholder="000xxxxxxxxx"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">BPJS Ketenagakerjaan</Label>
                      <Input
                        value={formData.bpjsKetenagakerjaan}
                        onChange={(e) => setFormData({ ...formData, bpjsKetenagakerjaan: e.target.value })}
                        placeholder="000xxxxxxxxx"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">NPWP</Label>
                      <Input
                        value={formData.npwp}
                        onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                        placeholder="00.000.000.0-000.000"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">No SIM</Label>
                      <Input
                        value={formData.sim}
                        onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
                        placeholder="000xxxxxxxxx"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                  </div>

                  {/* Additional Documents */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-slate-700">Dokumen Tambahan</Label>
                      <Button type="button" variant="ghost" onClick={handleAddAdditionalDoc} className="text-indigo-600 hover:text-indigo-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah
                      </Button>
                    </div>
                    {formData.additionalDocs.map((doc: any, index: number) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Nama Dokumen"
                            value={doc.name}
                            onChange={(e) => {
                              const updated = [...formData.additionalDocs]
                              updated[index] = { ...doc, name: e.target.value }
                              setFormData({ ...formData, additionalDocs: updated })
                            }}
                            className="bg-slate-50 border-slate-200"
                          />
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const updated = [...formData.additionalDocs]
                                updated[index] = { ...doc, file: file.name }
                                setFormData({ ...formData, additionalDocs: updated })
                              }
                            }}
                            className="bg-slate-50 border-slate-200"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAdditionalDoc(index)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Info */}
            <TabsContent value="academic" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-emerald-600" />
                    </div>
                    Data Akademik
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">NIDN</Label>
                      <Input
                        value={formData.nidn}
                        onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                        placeholder="0000000000"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Gelar Depan</Label>
                      <Input
                        value={formData.gelarDepan}
                        onChange={(e) => setFormData({ ...formData, gelarDepan: e.target.value })}
                        placeholder="Dr., Prof., dll"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Gelar Belakang</Label>
                      <Input
                        value={formData.gelarBelakang}
                        onChange={(e) => setFormData({ ...formData, gelarBelakang: e.target.value })}
                        placeholder="M.Si, Ph.D, dll"
                        className="bg-slate-50 border-slate-200 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400 font-semibold tracking-wide">Pendidikan Terakhir</Label>
                      <Select
                        value={formData.pendidikanTerakhir}
                        onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                        className="bg-slate-50 border-slate-200 py-6"
                      >
                        <option value="">Pilih Pendidikan</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leave & Permit */}
            <TabsContent value="leave" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-slate-600" />
                    </div>
                    Cuti & Izin
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Data cuti dan izin dosen
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-slate-400">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Data cuti akan tersedia setelah dosen disimpan</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Allowance */}
            <TabsContent value="allowance" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-emerald-600" />
                    </div>
                    Komponen Gaji
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Detail komponen pendapatan
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Gaji Pokok', placeholder: 'Rp 0' },
                      { label: 'Tunjangan Jabatan', placeholder: 'Rp 0' },
                      { label: 'Tunjangan Fungsional', placeholder: 'Rp 0' },
                      { label: 'Tunjangan Transport', placeholder: 'Rp 0' },
                      { label: 'Uang Makan', placeholder: 'Rp 0' },
                      { label: 'Lainnya', placeholder: 'Rp 0' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <Label className="text-sm text-slate-600">{item.label}</Label>
                        <Input
                          type="number"
                          placeholder={item.placeholder}
                          className="bg-slate-50 border-slate-200 py-6"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deduction */}
            <TabsContent value="deduction" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-8 w-8 bg-rose-100 rounded-full flex items-center justify-center">
                      <X className="h-4 w-4 text-rose-600" />
                    </div>
                    Potongan Gaji
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Detail komponen potongan
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Potongan BPJS', placeholder: 'Rp 0' },
                      { label: 'Potongan PPh 21', placeholder: 'Rp 0' },
                      { label: 'Potongan Lainnya', placeholder: 'Rp 0' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <Label className="text-sm text-slate-600">{item.label}</Label>
                        <Input
                          type="number"
                          placeholder={item.placeholder}
                          className="bg-slate-50 border-slate-200 py-6"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <form id="lecturer-form" onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

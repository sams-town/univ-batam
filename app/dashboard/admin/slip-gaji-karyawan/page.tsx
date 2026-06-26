'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, User, Calendar, DollarSign } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const dummySlipGaji = [
  {
    id: '1',
    karyawan: 'Siti Aminah',
    nip: '198501012010012001',
    periode: 'Januari 2024',
    gajiPokok: 5000000,
    tunjangan: 2000000,
    potongan: 500000,
    total: 6500000,
    status: 'Terverifikasi'
  },
  {
    id: '2',
    karyawan: 'Budi Santoso',
    nip: '198005052005051002',
    periode: 'Januari 2024',
    gajiPokok: 4500000,
    tunjangan: 1500000,
    potongan: 300000,
    total: 5700000,
    status: 'Terverifikasi'
  }
]

export default function SlipGajiKaryawanPage() {
  const { profile } = useAuth()
  
  // Determine if the logged-in user is an admin
  const userRole = (profile?.role ? (typeof profile.role === 'object' ? profile.role.name || '' : profile.role) : '').toLowerCase()
  const isLocalStorageAdmin = typeof window !== 'undefined' && ['admin', 'super_admin', 'superadmin', 'admin_akademik'].includes(localStorage.getItem('user_role') || '')
  const isAdmin = ['super_admin', 'superadmin', 'admin', 'admin_akademik'].includes(userRole) || isLocalStorageAdmin

  const userFullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Pegawai'

  // Filter slip gaji: admins see all, employees see only their own matching name
  const displayedSlipGaji = isAdmin
    ? dummySlipGaji
    : dummySlipGaji.filter(slip => slip.karyawan.toLowerCase() === userFullName.toLowerCase())

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          {isAdmin ? 'Slip Gaji Karyawan' : 'Slip Gaji Saya'}
        </h1>
        <p className="text-slate-500 mt-1">
          {isAdmin ? 'Kelola dan lihat slip gaji karyawan' : 'Detail dan riwayat slip gaji Anda'}
        </p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="h-5 w-5 text-blue-500" />
            {isAdmin ? 'Daftar Slip Gaji Karyawan' : 'Daftar Slip Gaji Anda'}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {isAdmin ? 'Data slip gaji semua karyawan' : 'Data slip gaji yang terbit'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="text-slate-600 font-medium">Karyawan</TableHead>
                <TableHead className="text-slate-600 font-medium">NIP</TableHead>
                <TableHead className="text-slate-600 font-medium">Periode</TableHead>
                <TableHead className="text-slate-600 font-medium">Gaji Pokok</TableHead>
                <TableHead className="text-slate-600 font-medium">Tunjangan</TableHead>
                <TableHead className="text-slate-600 font-medium">Potongan</TableHead>
                <TableHead className="text-slate-600 font-medium">Total</TableHead>
                <TableHead className="text-slate-600 font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedSlipGaji.length > 0 ? (
                displayedSlipGaji.map(slip => (
                  <TableRow key={slip.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      {slip.karyawan}
                    </TableCell>
                    <TableCell>{slip.nip}</TableCell>
                    <TableCell>{slip.periode}</TableCell>
                    <TableCell>Rp {slip.gajiPokok.toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {slip.tunjangan.toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {slip.potongan.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      Rp {slip.total.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {slip.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                    Tidak ada data slip gaji tersedia.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

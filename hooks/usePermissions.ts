'use client'

import { useAuth } from './useAuth'

// We'll map menu IDs to permission IDs
const menuPermissionMap: Record<string, string> = {
  'dashboard': 'dashboard.view',
  'akademik-kbm': 'akademik-kbm.view',
  'jadwal-kuliah': 'jadwal-kuliah.view',
  'ruang-kelas': 'ruang-kelas.view',
  'kurikulum-mk': 'kurikulum-mk.view',
  'manajemen-sdm': 'manajemen-sdm.view',
  'data-dosen': 'data-dosen.view',
  'data-karyawan': 'data-karyawan.view',
  'shift': 'shift.view',
  'cuti': 'cuti.view',
  'pegawai-keluar': 'pegawai-keluar.view',
  'proses-payroll': 'payroll.view',
  'payroll-dosen': 'payroll.view',
  'master-tarif-dosen': 'payroll.view',
  'slip-gaji-dosen': 'profil.view',
  'manajemen-mahasiswa': 'dashboard.view',
  'mhs-dashboard': 'dashboard.view',
  'mhs-data': 'profil.view',
  'mhs-status': 'profil.view',
  'mhs-krs': 'dashboard.view',
  'mhs-khs': 'dashboard.view',
  'mhs-transkrip': 'dashboard.view',
  'mhs-presensi': 'dashboard.view',
  'mhs-perizinan': 'dashboard.view',
  'mhs-pelanggaran': 'dashboard.view',
  'mhs-prestasi': 'dashboard.view',
  'mhs-beasiswa': 'dashboard.view',
  'mhs-pkl': 'dashboard.view',
  'mhs-skripsi': 'dashboard.view',
  'mhs-riwayat': 'dashboard.view',
  'mhs-alumni': 'profil.view',
  'mhs-pengaturan': 'profil.view',
  'keuangan-kampus': 'keuangan-kampus.view',
  'tagihan-ukt': 'tagihan-ukt.view',
  'pembayaran-sks-admin': 'pembayaran-sks-admin.view',
  'laporan-keuangan': 'laporan-keuangan.view',
  'laporan-rekap': 'laporan-rekap.view',
  'rekap-absensi-dosen': 'rekap-absensi-dosen.view',
  'rekap-absensi-mahasiswa': 'rekap-absensi-mahasiswa.view',
  'pengaturan-sistem': 'settings.view',
  'roles-permissions': 'settings.view',
  'settings': 'settings.view',
  'absensi': 'absensi.view',
  'profil': 'profil.view',
  'pembayaran-sks-mahasiswa': 'pembayaran-sks.view',
}

// Mock permissions for each role - in real app, fetch from DB
const rolePermissions: Record<string, string[]> = {
  'super_admin': ['all'], // has all permissions
  'admin_akademik': [
    'dashboard.view',
    'akademik-kbm.view',
    'jadwal-kuliah.view',
    'jadwal-kuliah.edit',
    'ruang-kelas.view',
    'ruang-kelas.edit',
    'kurikulum-mk.view',
    'kurikulum-mk.edit',
    'manajemen-sdm.view',
    'data-dosen.view',
    'data-dosen.edit',
    'data-karyawan.view',
    'data-karyawan.edit',
    'shift.view',
    'shift.edit',
    'cuti.view',
    'cuti.edit',
    'cuti.approve',
    'pegawai-keluar.view',
    'pegawai-keluar.edit',
    'payroll.view',
    'payroll.edit',
    'manajemen-mahasiswa.view',
    'data-mahasiswa.view',
    'data-mahasiswa.edit',
    'perizinan-absensi.view',
    'perizinan-absensi.edit',
    'pelanggaran.view',
    'pelanggaran.edit',
    'keuangan-kampus.view',
    'tagihan-ukt.view',
    'tagihan-ukt.edit',
    'pembayaran-sks-admin.view',
    'pembayaran-sks-admin.edit',
    'laporan-keuangan.view',
    'laporan-rekap.view',
    'rekap-absensi-dosen.view',
    'rekap-absensi-mahasiswa.view',
    'settings.view',
    'settings.edit',
  ],
  'dosen': [
    'dashboard.view',
    'absensi.view',
    'absensi.create',
    'absensi.edit',
    'profil.view',
    'profil.edit',
  ],
  'mahasiswa': [
    'dashboard.view',
    'absensi.view',
    'absensi.create',
    'profil.view',
    'profil.edit',
    'pembayaran-sks.view',
    'pembayaran-sks.create',
  ],
  'employee': [
    'dashboard.view',
    'profil.view',
    'profil.edit',
    'absensi.view',
    'absensi.create',
  ],
}

export function usePermissions() {
  const { profile } = useAuth()
  const roleName = (typeof profile?.role === 'string' ? profile.role : profile?.role?.name) || 'mahasiswa'

  // Get permissions for the current role
  const permissions = rolePermissions[roleName] || rolePermissions['mahasiswa']

  // Check if user has a specific permission
  const hasPermission = (permissionId: string): boolean => {
    if (permissions.includes('all')) return true
    return permissions.includes(permissionId)
  }

  // Check if user has access to a menu item
  const hasMenuAccess = (menuId: string): boolean => {
    const requiredPermission = menuPermissionMap[menuId]
    if (!requiredPermission) return true // If no permission defined, allow
    return hasPermission(requiredPermission)
  }

  return {
    permissions,
    hasPermission,
    hasMenuAccess,
    roleName,
  }
}

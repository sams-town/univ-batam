'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  User,
  GraduationCap,
  IdCard,
  FileText,
  DollarSign,
  Book,
  DoorOpen,
  UserCog,
  WalletCards,
  ChevronRight,
  Award,
  Clock,
  UserMinus,
  Briefcase,
  Shield,
  FolderOpen
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'

type MenuItem = {
  id: string
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  dynamicHref?: (role: string) => string
  children?: MenuItem[]
}

const getMenuItems = (role: string): MenuItem[] => {
  // Role: Super Admin / HR
  if (role === 'super_admin' || role === 'admin_akademik' || role === 'admin' || role === 'superadmin') {
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
        roles: ['super_admin', 'admin_akademik']
      },
      
      // Akademik & KBM
      {
        id: 'akademik-kbm',
        title: 'Akademik & KBM',
        href: '#',
        icon: BookOpen,
        roles: ['super_admin', 'admin_akademik'],
        children: [
          {
            id: 'jadwal-kuliah',
            title: 'Jadwal Kuliah',
            href: '/dashboard/schedules',
            icon: Calendar,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'ruang-kelas',
            title: 'Ruang & Kelas',
            href: '/dashboard/master/classrooms',
            icon: DoorOpen,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'kurikulum-mk',
            title: 'Kurikulum & Mata Kuliah',
            href: '/dashboard/master/courses',
            icon: Book,
            roles: ['super_admin', 'admin_akademik']
          },
        ]
      },

      // Manajemen SDM (Restructured)
      {
        id: 'manajemen-sdm',
        title: 'Manajemen SDM',
        href: '#',
        icon: UserCog,
        roles: ['super_admin', 'admin_akademik'],
        children: [
          // Data Kepegawaian sub-group
          {
            id: 'data-kepegawaian',
            title: 'Data Kepegawaian',
            href: '#',
            icon: FolderOpen,
            roles: ['super_admin', 'admin_akademik'],
            children: [
              {
                id: 'data-dosen',
                title: 'Data Dosen',
                href: '/dashboard/master/lecturers',
                icon: IdCard,
                roles: ['super_admin', 'admin_akademik']
              },
              {
                id: 'data-karyawan',
                title: 'Data Karyawan',
                href: '/dashboard/admin/karyawan',
                icon: Users,
                roles: ['super_admin', 'admin_akademik']
              },
              {
                id: 'dokumen-pegawai',
                title: 'Dokumen Pegawai',
                href: '/dashboard/admin/dokumen-pegawai',
                icon: FileText,
                roles: ['super_admin', 'admin_akademik']
              },
              {
                id: 'pegawai-keluar',
                title: 'Pegawai Keluar',
                href: '/dashboard/admin/resignation',
                icon: UserMinus,
                roles: ['super_admin', 'admin_akademik']
              },
            ]
          },
          // Kehadiran & Jadwal sub-group
          {
            id: 'kehadiran-jadwal',
            title: 'Kehadiran & Jadwal',
            href: '#',
            icon: Clock,
            roles: ['super_admin', 'admin_akademik'],
            children: [
              {
                id: 'shift',
                title: 'Shift Kerja',
                href: '/dashboard/admin/shift',
                icon: Clock,
                roles: ['super_admin', 'admin_akademik']
              },
              {
                id: 'cuti',
                title: 'Cuti Karyawan',
                href: '/dashboard/admin/cuti',
                icon: Briefcase,
                roles: ['super_admin', 'admin_akademik']
              },
            ]
          },
          // Kompensasi & Payroll sub-group
          {
            id: 'kompensasi-payroll',
            title: 'Kompensasi & Payroll',
            href: '#',
            icon: WalletCards,
            roles: ['super_admin', 'admin_akademik'],
            children: [
              {
                id: 'master-tarif-dosen',
                title: 'Master Tarif Mengajar',
                href: '/dashboard/admin/tarif-dosen',
                icon: Settings,
                roles: ['super_admin', 'admin_akademik']
              },
              {
                id: 'proses-payroll',
                title: 'Proses Payroll/Gaji',
                href: '/dashboard/admin/payroll',
                icon: WalletCards,
                roles: ['super_admin', 'admin_akademik']
              },
              {
                id: 'payroll-dosen',
                title: 'Payroll Dosen',
                href: '/dashboard/admin/payroll-dosen',
                icon: WalletCards,
                roles: ['super_admin', 'admin_akademik']
              },
              {
                id: 'slip-gaji-dosen',
                title: 'Slip Gaji Dosen',
                href: '/dashboard/admin/slip-gaji-dosen',
                icon: FileText,
                roles: ['super_admin', 'admin_akademik']
              },
              {
                id: 'slip-gaji-karyawan',
                title: 'Slip Gaji Karyawan',
                href: '/dashboard/admin/slip-gaji-karyawan', // Placeholder, create page if needed
                icon: FileText,
                roles: ['super_admin', 'admin_akademik']
              },
            ]
          },
        ]
      },

      // Visit & Kinerja Pegawai dan Dosen
      {
        id: 'visit-kinerja',
        title: 'Visit & Kinerja',
        href: '#',
        icon: Clock,
        roles: ['super_admin', 'admin_akademik'],
        children: [
          {
            id: 'patroli-security',
            title: 'Patroli Petugas Security',
            href: '/dashboard/admin/visit-kinerja/patroli-security',
            icon: Shield,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'kunjungan',
            title: 'Kunjungan',
            href: '/dashboard/admin/visit-kinerja/kunjungan',
            icon: Calendar,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'penugasan',
            title: 'Penugasan',
            href: '/dashboard/admin/visit-kinerja/penugasan',
            icon: UserCog,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'rapat',
            title: 'Rapat',
            href: '/dashboard/admin/visit-kinerja/rapat',
            icon: Calendar,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'jenis-kinerja',
            title: 'Jenis Kinerja',
            href: '/dashboard/admin/visit-kinerja/jenis-kinerja',
            icon: Settings,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'laporan-kinerja',
            title: 'Laporan Kinerja',
            href: '/dashboard/admin/visit-kinerja/laporan-kinerja',
            icon: BarChart3,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'kinerja-pegawai',
            title: 'Kinerja Pegawai',
            href: '/dashboard/admin/visit-kinerja/kinerja-pegawai',
            icon: User,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'laporan-kerja',
            title: 'Laporan Kerja',
            href: '/dashboard/admin/visit-kinerja/laporan-kerja',
            icon: FileText,
            roles: ['super_admin', 'admin_akademik']
          },
        ]
      },

      // Keuangan Kampus (Cleaned: No UKT/SKS)
      {
        id: 'keuangan-kampus',
        title: 'Keuangan Kampus',
        href: '#',
        icon: DollarSign,
        roles: ['super_admin', 'admin_akademik'],
        children: [
          {
            id: 'laporan-keuangan',
            title: 'Laporan Keuangan',
            href: '/dashboard/admin/financial-reports',
            icon: FileText,
            roles: ['super_admin', 'admin_akademik']
          },
        ]
      },

      // Laporan & Rekap (Cleaned: No Mahasiswa)
      {
        id: 'laporan-rekap',
        title: 'Laporan & Rekap',
        href: '#',
        icon: BarChart3,
        roles: ['super_admin', 'admin_akademik'],
        children: [
          {
            id: 'rekap-absensi-dosen',
            title: 'Rekap Absensi Dosen',
            href: '/dashboard/reports',
            icon: Award,
            roles: ['super_admin', 'admin_akademik']
          },
        ]
      },

      // Pengaturan Sistem
      {
        id: 'pengaturan-sistem',
        title: 'Pengaturan Sistem',
        href: '#',
        icon: Settings,
        roles: ['super_admin', 'admin_akademik'],
        children: [
          {
            id: 'roles-permissions',
            title: 'Roles & Permissions',
            href: '/dashboard/admin/roles',
            icon: Shield,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'settings',
            title: 'Pengaturan Umum',
            href: '/dashboard/admin/settings',
            icon: Settings,
            roles: ['super_admin', 'admin_akademik']
          }
        ]
      },

      // Common menus
      {
        id: 'absensi',
        title: 'Absensi',
        href: '/dashboard/attendance',
        icon: CheckSquare,
        roles: ['super_admin', 'admin_akademik']
      },
      {
        id: 'profil',
        title: 'Profil',
        href: '/dashboard/profile',
        icon: User,
        roles: ['super_admin', 'admin_akademik']
      },
    ]
  }
  // Role: Dosen
  else if (role === 'dosen' || role === 'lecturer') {
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/dashboard/lecturer',
        icon: LayoutDashboard,
        roles: ['dosen']
      },
      {
        id: 'jadwal-kuliah',
        title: 'Jadwal Kuliah',
        href: '/dashboard/schedules',
        icon: Calendar,
        roles: ['dosen']
      },
      {
        id: 'rekap-absensi-dosen',
        title: 'Rekap Absensi Dosen',
        href: '/dashboard/reports',
        icon: Award,
        roles: ['dosen']
      },
      {
        id: 'slip-gaji-dosen',
        title: 'Slip Gaji Dosen',
        href: '/dashboard/admin/slip-gaji-dosen',
        icon: FileText,
        roles: ['dosen']
      },
      {
        id: 'absensi',
        title: 'Absensi',
        href: '/dashboard/attendance',
        icon: CheckSquare,
        roles: ['dosen']
      },
      {
        id: 'profil',
        title: 'Profil',
        href: '/dashboard/profile',
        icon: User,
        roles: ['dosen']
      },
    ]
  }
  // Role: Karyawan / Pegawai
  else if (role === 'employee' || role === 'karyawan') {
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/dashboard/employee',
        icon: LayoutDashboard,
        roles: ['employee']
      },
      {
        id: 'shift',
        title: 'Shift Kerja',
        href: '/dashboard/admin/shift',
        icon: Clock,
        roles: ['employee']
      },
      {
        id: 'cuti',
        title: 'Cuti Karyawan',
        href: '/dashboard/admin/cuti',
        icon: Briefcase,
        roles: ['employee']
      },
      {
        id: 'slip-gaji-karyawan',
        title: 'Slip Gaji Karyawan',
        href: '/dashboard/admin/slip-gaji-karyawan',
        icon: FileText,
        roles: ['employee']
      },
      {
        id: 'absensi',
        title: 'Absensi',
        href: '/dashboard/attendance',
        icon: CheckSquare,
        roles: ['employee']
      },
      {
        id: 'profil',
        title: 'Profil',
        href: '/dashboard/profile',
        icon: User,
        roles: ['employee']
      },
    ]
  }
  // Default (no mahasiswa)
  else {
    return []
  }
}

export default function Sidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { hasMenuAccess } = usePermissions()
  const role = (typeof profile?.role === 'string' ? profile.role : profile?.role?.name) || ''
  const menuItems = getMenuItems(role)

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles.includes(role)) return false
    return hasMenuAccess(item.id)
  })

  const getItemHref = (item: MenuItem) => {
    return item.href
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const itemHref = getItemHref(item)
    const isActive = pathname.startsWith(itemHref) || pathname === itemHref
    const Icon = item.icon
    
    // If item has children, render as collapsible
    if (item.children && item.children.length > 0) {
      const filteredChildren = item.children.filter(child => {
        if (!child.roles.includes(role)) return false
        return hasMenuAccess(child.id)
      })
      if (filteredChildren.length === 0) return null
      
      return (
        <div key={item.id} className="space-y-1">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer hover:bg-muted">
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-70" />
          </div>
          <div className={`pl-${4 + depth * 4} space-y-1`}>
            {filteredChildren.map(child => renderMenuItem(child, depth + 1))}
          </div>
        </div>
      )
    }
    
    // Regular item
    return (
      <Link
        key={item.id}
        href={itemHref}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm">{item.title}</span>
      </Link>
    )
  }

  return (
    <div className="flex flex-col w-64 border-r bg-card min-h-screen">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
            <img 
              src="/logo-unbat.png" 
              alt="Universitas Batam Logo" 
              className="h-10 w-10 object-contain" 
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Universitas Batam</h2>
            <p className="text-xs text-muted-foreground">Sistem Informasi Manajemen Internal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map(item => renderMenuItem(item))}
      </nav>
    </div>
  )
}

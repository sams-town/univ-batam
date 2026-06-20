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
  CreditCard,
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
  FileSpreadsheet,
  Clock,
  UserMinus,
  Briefcase,
  Shield
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

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin_akademik', 'dosen', 'mahasiswa', 'employee'],
    dynamicHref: (role: string) => {
      switch (role) {
        case 'super_admin':
        case 'admin_akademik':
        case 'admin':
        case 'superadmin':
          return '/dashboard/admin'
        case 'dosen':
        case 'lecturer':
          return '/dashboard/lecturer'
        case 'employee':
        case 'karyawan':
          return '/dashboard/employee'
        case 'mahasiswa':
        default:
          return '/dashboard/student'
      }
    }
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

  // Manajemen SDM
  {
    id: 'manajemen-sdm',
    title: 'Manajemen SDM',
    href: '#',
    icon: UserCog,
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
      {
        id: 'pegawai-keluar',
        title: 'Pegawai Keluar',
        href: '/dashboard/admin/resignation',
        icon: UserMinus,
        roles: ['super_admin', 'admin_akademik']
      },
      {
        id: 'proses-payroll',
        title: 'Proses Payroll/Gaji',
        href: '/dashboard/admin/payroll',
        icon: WalletCards,
        roles: ['super_admin', 'admin_akademik']
      },
    ]
  },

  // Manajemen Mahasiswa
  {
    id: 'manajemen-mahasiswa',
    title: 'Manajemen Mahasiswa',
    href: '#',
    icon: GraduationCap,
    roles: ['super_admin', 'admin_akademik'],
    children: [
      {
        id: 'data-mahasiswa',
        title: 'Data Mahasiswa',
        href: '/dashboard/master/students',
        icon: IdCard,
        roles: ['super_admin', 'admin_akademik']
      },
      {
        id: 'perizinan-absensi',
        title: 'Perizinan Absensi',
        href: '/dashboard/admin/permits',
        icon: CheckSquare,
        roles: ['super_admin', 'admin_akademik']
      },
      {
        id: 'pelanggaran',
        title: 'Pelanggaran',
        href: '/dashboard/admin/violations',
        icon: FileText,
        roles: ['super_admin', 'admin_akademik']
      },
    ]
  },

  // Keuangan Kampus
  {
    id: 'keuangan-kampus',
    title: 'Keuangan Kampus',
    href: '#',
    icon: DollarSign,
    roles: ['super_admin', 'admin_akademik'],
    children: [
      {
        id: 'tagihan-ukt',
        title: 'Tagihan UKT',
        href: '/dashboard/admin/ukt',
        icon: FileSpreadsheet,
        roles: ['super_admin', 'admin_akademik']
      },
      {
        id: 'pembayaran-sks-admin',
        title: 'Pembayaran SKS',
        href: '/dashboard/admin/payments',
        icon: CreditCard,
        roles: ['super_admin', 'admin_akademik']
      },
      {
        id: 'laporan-keuangan',
        title: 'Laporan Keuangan',
        href: '/dashboard/admin/financial-reports',
        icon: FileText,
        roles: ['super_admin', 'admin_akademik']
      },
    ]
  },

  // Laporan & Rekap
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
      {
        id: 'rekap-absensi-mahasiswa',
        title: 'Rekap Absensi Mahasiswa',
        href: '/dashboard/reports',
        icon: GraduationCap,
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

  // Common menus for all roles
  {
    id: 'absensi',
    title: 'Absensi',
    href: '/dashboard/attendance',
    icon: CheckSquare,
    roles: ['super_admin', 'admin_akademik', 'dosen', 'mahasiswa']
  },
  {
    id: 'profil',
    title: 'Profil',
    href: '/dashboard/profile',
    icon: User,
    roles: ['super_admin', 'admin_akademik', 'dosen', 'mahasiswa']
  },
  {
    id: 'pembayaran-sks-mahasiswa',
    title: 'Pembayaran SKS',
    href: '/dashboard/payments',
    icon: CreditCard,
    roles: ['mahasiswa']
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { hasMenuAccess, roleName } = usePermissions()
  const role = profile?.role?.name || 'mahasiswa'

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles.includes(role)) return false
    return hasMenuAccess(item.id)
  })

  const getItemHref = (item: MenuItem, userRole: string) => {
    if (item.dynamicHref) {
      return item.dynamicHref(userRole)
    }
    return item.href
  }

  const renderMenuItem = (item: MenuItem) => {
    const itemHref = getItemHref(item, role)
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
          <div className="pl-4 space-y-1">
            {filteredChildren.map(child => {
              const childHref = getItemHref(child, role)
              const childIsActive = pathname.startsWith(childHref) || pathname === childHref
              const ChildIcon = child.icon
              return (
                <Link
                  key={child.id}
                  href={childHref}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    childIsActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <ChildIcon className="h-4 w-4" />
                  <span className="text-sm">{child.title}</span>
                </Link>
              )
            })}
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
        <Icon className="h-5 w-5" />
        <span>{item.title}</span>
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
            <p className="text-xs text-muted-foreground">Sistem Absensi</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map(renderMenuItem)}
      </nav>
    </div>
  )
}

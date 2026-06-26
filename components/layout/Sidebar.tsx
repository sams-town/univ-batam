'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  ChevronDown,
  Award,
  Clock,
  UserMinus,
  Briefcase,
  Shield,
  FolderOpen,
  TrendingUp,
  Menu,
  X
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
      
      // Akademik
      {
        id: 'akademik-kbm',
        title: 'Akademik',
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
            title: 'Ruang Kelas',
            href: '/dashboard/master/classrooms',
            icon: DoorOpen,
            roles: ['super_admin', 'admin_akademik']
          },
          {
            id: 'kurikulum-mk',
            title: 'Kurikulum',
            href: '/dashboard/master/courses',
            icon: Book,
            roles: ['super_admin', 'admin_akademik']
          },
        ]
      },

      // Manajemen SDM (Professional Name)
      {
        id: 'manajemen-sdm',
        title: 'Manajemen SDM',
        href: '#',
        icon: UserCog,
        roles: ['super_admin', 'admin_akademik'],
        children: [
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
                title: 'Resignasi',
                href: '/dashboard/admin/resignation',
                icon: UserMinus,
                roles: ['super_admin', 'admin_akademik']
              },
            ]
          },
          {
            id: 'kehadiran-jadwal',
            title: 'Kehadiran',
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
          {
            id: 'kompensasi-payroll',
            title: 'Penggajian',
            href: '#',
            icon: WalletCards,
            roles: ['super_admin', 'admin_akademik'],
            children: [
              {
                id: 'master-tarif-dosen',
                title: 'Tarif Mengajar',
                href: '/dashboard/admin/tarif-dosen',
                icon: Settings,
                roles: ['super_admin', 'admin_akademik']
              },
              {
                id: 'proses-payroll',
                title: 'Proses Payroll',
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
                href: '/dashboard/admin/slip-gaji-karyawan',
                icon: FileText,
                roles: ['super_admin', 'admin_akademik']
              },
            ]
          },
        ]
      },

      // Kinerja & Kunjungan
      {
        id: 'visit-kinerja',
        title: 'Kinerja & Kunjungan',
        href: '#',
        icon: TrendingUp,
        roles: ['super_admin', 'admin_akademik'],
        children: [
          {
            id: 'patroli-security',
            title: 'Patroli Security',
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

      // Keuangan
      {
        id: 'keuangan-kampus',
        title: 'Keuangan',
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

      // Laporan
      {
        id: 'laporan-rekap',
        title: 'Laporan',
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
            id: 'rekap-absensi-pegawai',
            title: 'Rekap Absensi Pegawai',
            href: '/dashboard/reports',
            icon: Award,
            roles: ['super_admin', 'admin_akademik']
          },
        ]
      },

      // Pengaturan Sistem
      {
        id: 'pengaturan-sistem',
        title: 'Pengaturan',
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
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set())
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles.includes(role)) return false
    return hasMenuAccess(item.id)
  })

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getItemHref = (item: MenuItem) => {
    return item.href
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const itemHref = getItemHref(item)
    const isActive = pathname.startsWith(itemHref) || pathname === itemHref
    const Icon = item.icon
    const isOpen = openMenus.has(item.id)
    
    // If item has children, render as collapsible
    if (item.children && item.children.length > 0) {
      const filteredChildren = item.children.filter(child => {
        if (!child.roles.includes(role)) return false
        return hasMenuAccess(child.id)
      })
      if (filteredChildren.length === 0) return null
      
      let plClass = 'pl-4'
      if (depth === 1) plClass = 'pl-8'
      if (depth === 2) plClass = 'pl-12'
      
      // Check if any child is active to auto-expand
      const hasActiveChild = filteredChildren.some(child => {
        if (child.children) {
          return child.children.some(grandChild => pathname.startsWith(grandChild.href) || pathname === grandChild.href)
        }
        return pathname.startsWith(child.href) || pathname === child.href
      })
      
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.id)}
            className={[
              'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all w-full text-left group',
              isActive || hasActiveChild ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            ].join(' ')}
          >
            <Icon className={['h-5 w-5', isActive || hasActiveChild ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'].join(' ')} />
            <span className="flex-1 text-sm">{item.title}</span>
            {isOpen || hasActiveChild ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {(isOpen || hasActiveChild) && (
            <div className={plClass + " space-y-1 mt-1"}>
              {filteredChildren.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }
    
    // Regular item
    const linkClass = isActive 
      ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
      
    return (
      <Link
        key={item.id}
        href={itemHref}
        onClick={() => setIsMobileOpen(false)} // Close drawer on menu click
        className={[
          'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all',
          linkClass
        ].join(' ')}
      >
        <Icon className={['h-4 w-4', isActive ? 'text-blue-600' : 'text-slate-400'].join(' ')} />
        <span className="text-sm">{item.title}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-40 w-full shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
            <img 
              src="/logo-unbat.png" 
              alt="Universitas Batam Logo" 
              className="h-7 w-7 object-contain" 
            />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Universitas Batam</h2>
            <p className="text-[10px] text-slate-500 font-medium">Sistem Informasi Manajemen</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-72 max-w-xs bg-white h-full shadow-2xl transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
                  <img 
                    src="/logo-unbat.png" 
                    alt="Universitas Batam Logo" 
                    className="h-7 w-7 object-contain" 
                  />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Universitas Batam</h2>
                  <p className="text-[10px] text-slate-500 font-medium">Sistem Informasi Manajemen</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto bg-white">
              {filteredMenuItems.map(item => renderMenuItem(item))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (visible on md and up) */}
      <div className="hidden md:flex flex-col w-72 border-r bg-white min-h-screen shadow-sm flex-shrink-0">
        <div className="p-6 border-b bg-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
              <img 
                src="/logo-unbat.png" 
                alt="Universitas Batam Logo" 
                className="h-9 w-9 object-contain" 
              />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Universitas Batam</h2>
              <p className="text-xs text-slate-500 font-medium">Sistem Informasi Manajemen</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto bg-white">
          {filteredMenuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>
    </>
  )
}

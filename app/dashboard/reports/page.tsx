'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, BarChart3, UserCheck, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ExcelJS from 'exceljs'

export default function ReportsPage() {

  // Helper to download Excel file
  const downloadExcel = async (workbook: ExcelJS.Workbook, filename: string) => {
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Laporan Absensi Dosen Harian
  const downloadDailyLecturerReport = async () => {
    try {
      const { data } = await supabase.from('absensi_kelas').select('*, lecturer:lecturers(*), profile:profiles(*), schedule:schedules(*), classroom:classrooms(*), course:courses(*)').order('date', { ascending: false })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Absensi Dosen Harian')

      // Headers
      worksheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'NIP', key: 'nip', width: 15 },
        { header: 'Nama Dosen', key: 'name', width: 30 },
        { header: 'Mata Kuliah', key: 'course', width: 25 },
        { header: 'Kelas', key: 'classroom', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Jam Masuk', key: 'time_in', width: 15 },
      ]

      // Add data
      if (data) {
        data.forEach((item: any) => {
          worksheet.addRow({
            date: item.date,
            nip: item.lecturer?.nip,
            name: `${item.profile?.first_name} ${item.profile?.last_name}`,
            course: item.course?.name,
            classroom: item.classroom?.name,
            status: item.status,
            time_in: item.time_in,
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Absensi_Dosen_Harian_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading daily lecturer report:', error)
      alert('Gagal mengunduh laporan absensi dosen harian!')
    }
  }

  // Laporan Absensi Pegawai Harian
  const downloadDailyEmployeeReport = async () => {
    try {
      const { data } = await supabase.from('attendance_employees').select('*, employee:employees(*), profile:profiles(*)').order('date', { ascending: false })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Absensi Pegawai Harian')

      // Headers
      worksheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'NIP', key: 'nip', width: 15 },
        { header: 'Nama Pegawai', key: 'name', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Jam Masuk', key: 'time_in', width: 15 },
        { header: 'Jam Keluar', key: 'time_out', width: 15 },
      ]

      // Add data
      if (data) {
        data.forEach((item: any) => {
          worksheet.addRow({
            date: item.date,
            nip: item.employee?.nip,
            name: `${item.profile?.first_name} ${item.profile?.last_name}`,
            status: item.status,
            time_in: item.time_in,
            time_out: item.time_out,
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Absensi_Pegawai_Harian_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading daily employee report:', error)
      alert('Gagal mengunduh laporan absensi pegawai harian!')
    }
  }

  // Laporan Absensi Dosen Mingguan
  const downloadWeeklyLecturerReport = async () => {
    try {
      const { data } = await supabase.from('absensi_kelas').select('*, lecturer:lecturers(*), profile:profiles(*), schedule:schedules(*), classroom:classrooms(*), course:courses(*)').order('date', { ascending: false })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Absensi Dosen Mingguan')

      // Headers
      worksheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'NIP', key: 'nip', width: 15 },
        { header: 'Nama Dosen', key: 'name', width: 30 },
        { header: 'Mata Kuliah', key: 'course', width: 25 },
        { header: 'Status Kehadiran', key: 'status', width: 20 },
        { header: 'Total Kehadiran', key: 'total', width: 15 },
      ]

      // Add data
      if (data) {
        data.forEach((item: any) => {
          worksheet.addRow({
            date: item.date,
            nip: item.lecturer?.nip,
            name: `${item.profile?.first_name} ${item.profile?.last_name}`,
            course: item.course?.name,
            status: item.status,
            total: 1,
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Absensi_Dosen_Mingguan_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading weekly lecturer report:', error)
      alert('Gagal mengunduh laporan absensi dosen mingguan!')
    }
  }

  // Laporan Absensi Dosen Bulanan
  const downloadMonthlyLecturerReport = async () => {
    try {
      const { data } = await supabase.from('absensi_kelas').select('*, lecturer:lecturers(*), profile:profiles(*), schedule:schedules(*), classroom:classrooms(*), course:courses(*)').order('date', { ascending: false })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Absensi Dosen Bulanan')

      // Headers
      worksheet.columns = [
        { header: 'Bulan', key: 'month', width: 15 },
        { header: 'NIP', key: 'nip', width: 15 },
        { header: 'Nama Dosen', key: 'name', width: 30 },
        { header: 'Mata Kuliah', key: 'course', width: 25 },
        { header: 'Hadir', key: 'present', width: 10 },
        { header: 'Izin', key: 'permission', width: 10 },
        { header: 'Sakit', key: 'sick', width: 10 },
        { header: 'Alpha', key: 'alpha', width: 10 },
      ]

      // Add data
      if (data) {
        data.forEach((item: any) => {
          const month = new Date(item.date).toLocaleString('id-ID', { month: 'long', year: 'numeric' })
          worksheet.addRow({
            month,
            nip: item.lecturer?.nip,
            name: `${item.profile?.first_name} ${item.profile?.last_name}`,
            course: item.course?.name,
            present: item.status === 'Hadir' ? 1 : 0,
            permission: item.status === 'Izin' ? 1 : 0,
            sick: item.status === 'Sakit' ? 1 : 0,
            alpha: item.status === 'Alpha' ? 1 : 0,
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Absensi_Dosen_Bulanan_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading monthly lecturer report:', error)
      alert('Gagal mengunduh laporan absensi dosen bulanan!')
    }
  }

  // Laporan Dosen
  const downloadLecturerReport = async () => {
    try {
      const { data } = await supabase.from('lecturers').select('*, program:programs(*), profile:profiles(*)').order('nip')

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Dosen')

      // Headers
      worksheet.columns = [
        { header: 'NIP', key: 'nip', width: 15 },
        { header: 'Nama Depan', key: 'first_name', width: 20 },
        { header: 'Nama Belakang', key: 'last_name', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Jabatan', key: 'position', width: 30 },
        { header: 'Program Studi', key: 'program', width: 30 },
      ]

      // Add data
      if (data) {
        data.forEach((item: any) => {
          worksheet.addRow({
            nip: item.nip,
            first_name: item.profile?.first_name,
            last_name: item.profile?.last_name,
            email: item.profile?.email,
            position: item.position,
            program: item.program?.name,
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Dosen_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading lecturer report:', error)
      alert('Gagal mengunduh laporan dosen!')
    }
  }

  // Laporan Pegawai
  const downloadEmployeeReport = async () => {
    try {
      // Try multiple possible table names
      let data = null
      let tableName = ''
      
      // Check if 'employees' table exists
      const { data: employeesData } = await supabase.from('employees').select('*, profile:profiles(*)').order('id')
      if (employeesData) {
        data = employeesData
        tableName = 'employees'
      } else {
        // Fallback to 'karyawan'
        const { data: karyawanData } = await supabase.from('karyawan').select('*, profile:profiles(*)').order('id')
        data = karyawanData
        tableName = 'karyawan'
      }

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Pegawai')

      // Headers
      worksheet.columns = [
        { header: 'NIP', key: 'nip', width: 15 },
        { header: 'Nama Depan', key: 'first_name', width: 20 },
        { header: 'Nama Belakang', key: 'last_name', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Jabatan', key: 'position', width: 25 },
      ]

      // Add data
      if (data) {
        data.forEach((item: any) => {
          worksheet.addRow({
            nip: item.nip,
            first_name: item.profile?.first_name,
            last_name: item.profile?.last_name,
            email: item.profile?.email,
            position: item.position || '-',
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Pegawai_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading employee report:', error)
      alert('Gagal mengunduh laporan pegawai!')
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Laporan</h1>
        <p className="text-muted-foreground">Unduh laporan absensi dan rekap data (format Excel)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Absensi Dosen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              Absensi Dosen Harian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Laporan absensi dosen per hari
            </p>
            <Button className="w-full" onClick={downloadDailyLecturerReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6" />
              Absensi Dosen Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Laporan absensi dosen per minggu
            </p>
            <Button className="w-full" onClick={downloadWeeklyLecturerReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              Absensi Dosen Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Laporan absensi dosen per bulan
            </p>
            <Button className="w-full" onClick={downloadMonthlyLecturerReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>

        {/* Absensi Pegawai */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              Absensi Pegawai Harian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Laporan absensi pegawai per hari
            </p>
            <Button className="w-full" onClick={downloadDailyEmployeeReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>

        {/* Laporan Data Dosen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserCheck className="h-6 w-6" />
              Laporan Dosen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Rekap data dosen
            </p>
            <Button className="w-full" onClick={downloadLecturerReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>

        {/* Laporan Data Pegawai */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6" />
              Laporan Pegawai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Rekap data pegawai
            </p>
            <Button className="w-full" onClick={downloadEmployeeReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

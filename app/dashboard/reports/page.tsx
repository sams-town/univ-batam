'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, BarChart3, Users, UserCheck } from 'lucide-react'
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

  // Laporan Harian
  const downloadDailyReport = async () => {
    try {
      const { data } = await supabase.from('attendance').select('*, student:students(*), profile:profiles(*), schedule:schedules(*), classroom:classrooms(*), course:courses(*)').order('date', { ascending: false })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Harian')

      // Headers
      worksheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'NIM', key: 'nim', width: 15 },
        { header: 'Nama Mahasiswa', key: 'name', width: 30 },
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
            nim: item.student?.nim,
            name: `${item.profile?.first_name} ${item.profile?.last_name}`,
            course: item.course?.name,
            classroom: item.classroom?.name,
            status: item.status,
            time_in: item.time_in,
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Harian_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading daily report:', error)
      alert('Gagal mengunduh laporan harian!')
    }
  }

  // Laporan Mingguan
  const downloadWeeklyReport = async () => {
    try {
      const { data } = await supabase.from('attendance').select('*, student:students(*), profile:profiles(*), schedule:schedules(*), classroom:classrooms(*), course:courses(*)').order('date', { ascending: false })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Mingguan (Pivot)')

      // Headers
      worksheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'NIM', key: 'nim', width: 15 },
        { header: 'Nama Mahasiswa', key: 'name', width: 30 },
        { header: 'Mata Kuliah', key: 'course', width: 25 },
        { header: 'Status Kehadiran', key: 'status', width: 20 },
        { header: 'Total Kehadiran', key: 'total', width: 15 },
      ]

      // Add data
      if (data) {
        data.forEach((item: any) => {
          worksheet.addRow({
            date: item.date,
            nim: item.student?.nim,
            name: `${item.profile?.first_name} ${item.profile?.last_name}`,
            course: item.course?.name,
            status: item.status,
            total: 1,
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Mingguan_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading weekly report:', error)
      alert('Gagal mengunduh laporan mingguan!')
    }
  }

  // Laporan Bulanan
  const downloadMonthlyReport = async () => {
    try {
      const { data } = await supabase.from('attendance').select('*, student:students(*), profile:profiles(*), schedule:schedules(*), classroom:classrooms(*), course:courses(*)').order('date', { ascending: false })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Bulanan (Pivot)')

      // Headers
      worksheet.columns = [
        { header: 'Bulan', key: 'month', width: 15 },
        { header: 'NIM', key: 'nim', width: 15 },
        { header: 'Nama Mahasiswa', key: 'name', width: 30 },
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
            nim: item.student?.nim,
            name: `${item.profile?.first_name} ${item.profile?.last_name}`,
            course: item.course?.name,
            present: item.status === 'Hadir' ? 1 : 0,
            permission: item.status === 'Izin' ? 1 : 0,
            sick: item.status === 'Sakit' ? 1 : 0,
            alpha: item.status === 'Alpha' ? 1 : 0,
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Bulanan_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading monthly report:', error)
      alert('Gagal mengunduh laporan bulanan!')
    }
  }

  // Laporan Mahasiswa
  const downloadStudentReport = async () => {
    try {
      const { data } = await supabase.from('students').select('*, program:programs(*), profile:profiles(*)').order('nim')

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Mahasiswa')

      // Headers
      worksheet.columns = [
        { header: 'NIM', key: 'nim', width: 15 },
        { header: 'Nama Depan', key: 'first_name', width: 20 },
        { header: 'Nama Belakang', key: 'last_name', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Program Studi', key: 'program', width: 30 },
      ]

      // Add data
      if (data) {
        data.forEach((item: any) => {
          worksheet.addRow({
            nim: item.nim,
            first_name: item.profile?.first_name,
            last_name: item.profile?.last_name,
            email: item.profile?.email,
            program: item.program?.name,
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Mahasiswa_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading student report:', error)
      alert('Gagal mengunduh laporan mahasiswa!')
    }
  }

  // Laporan Karyawan
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
        // Fallback to 'lecturers' or 'karyawan'
        const { data: lecturersData } = await supabase.from('lecturers').select('*, profile:profiles(*)').order('id')
        if (lecturersData) {
          data = lecturersData
          tableName = 'lecturers'
        } else {
          const { data: karyawanData } = await supabase.from('karyawan').select('*, profile:profiles(*)').order('id')
          data = karyawanData
          tableName = 'karyawan'
        }
      }

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Laporan Karyawan')

      // Headers
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 15 },
        { header: 'Nama Depan', key: 'first_name', width: 20 },
        { header: 'Nama Belakang', key: 'last_name', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Jabatan', key: 'position', width: 25 },
      ]

      // Add data
      if (data) {
        data.forEach((item: any) => {
          worksheet.addRow({
            id: item.id,
            first_name: item.profile?.first_name,
            last_name: item.profile?.last_name,
            email: item.profile?.email,
            position: item.position || item.nip || '-',
          })
        })
      }

      await downloadExcel(workbook, `Laporan_Karyawan_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error downloading employee report:', error)
      alert('Gagal mengunduh laporan karyawan!')
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Laporan</h1>
        <p className="text-muted-foreground">Unduh laporan absensi dan rekap data (format Excel)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              Laporan Harian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Laporan kehadiran per hari
            </p>
            <Button className="w-full" onClick={downloadDailyReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6" />
              Laporan Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Laporan kehadiran per minggu (pivot)
            </p>
            <Button className="w-full" onClick={downloadWeeklyReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              Laporan Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Laporan kehadiran per bulan (pivot)
            </p>
            <Button className="w-full" onClick={downloadMonthlyReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6" />
              Laporan Mahasiswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Rekap kehadiran per mahasiswa
            </p>
            <Button className="w-full" onClick={downloadStudentReport}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserCheck className="h-6 w-6" />
              Laporan Karyawan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Rekap data karyawan dan dosen
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

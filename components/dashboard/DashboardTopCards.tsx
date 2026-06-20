'use client'

import { Clock, Calendar, BookOpen, Users, FileText, DollarSign, UserCheck } from 'lucide-react'
import { Wallet } from 'lucide-react'

type Role = 'mahasiswa' | 'dosen' | 'employee' | 'karyawan'

interface DashboardTopCardsProps {
  role: Role
}

export default function DashboardTopCards({ role }: DashboardTopCardsProps) {
  if (role === 'mahasiswa') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-500">Jadwal Hari Ini</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">3 Matkul</p>
          <p className="text-xs text-slate-400 mt-1">Pemrograman Web, Basis Data, Struktur Data</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-500">SKS Semester</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">22 SKS</p>
          <p className="text-xs text-slate-400 mt-1">Semester Ganjil 2026/2027</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-semibold text-slate-500">Status KRS</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">Disetujui</p>
          <p className="text-xs text-slate-400 mt-1">Sudah diverifikasi oleh PA</p>
        </div>
      </div>
    )
  }

  if (role === 'dosen') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold text-slate-500">Jadwal Mengajar Hari Ini</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">2 Kelas</p>
          <p className="text-xs text-slate-400 mt-1">Pemrograman Web (10:00), Basis Data (13:00)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-500">Mahasiswa Bimbingan</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">45 Mahasiswa</p>
          <p className="text-xs text-slate-400 mt-1">Tersebar di semester 1-6</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-semibold text-slate-500">Status Absen Kelas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">85%</p>
          <p className="text-xs text-slate-400 mt-1">Rata-rata kehadiran mahasiswa</p>
        </div>
      </div>
    )
  }

  // Employee/Karyawan
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-b-2xl p-6 text-white">
      <div className="text-center mb-6">
        <p className="text-4xl font-bold tracking-tight">15:15:42</p>
        <p className="text-sm opacity-80 mt-1">SABTU, 20 JUNI 2026</p>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <div className="text-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-xs opacity-80">JAM KERJA</p>
          <p className="font-semibold">00:00 - 00:00</p>
          <p className="text-xs opacity-70">OFF</p>
        </div>

        <div className="text-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-xs opacity-80">JAM MASUK</p>
          <p className="font-semibold">Belum</p>
        </div>

        <div className="text-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-xs opacity-80">JAM PULANG</p>
          <p className="font-semibold">Belum</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white rounded-2xl p-4 text-center text-slate-800">
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-xs text-slate-500">PAYROLL</p>
          <p className="font-semibold">-</p>
        </div>

        <div className="bg-white rounded-2xl p-4 text-center text-slate-800">
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <FileText className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-500">REIMBURSE</p>
          <p className="font-semibold">Rp 0</p>
        </div>

        <div className="bg-white rounded-2xl p-4 text-center text-slate-800">
          <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <Wallet className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-xs text-slate-500">KASBON</p>
          <p className="font-semibold">Rp 0</p>
        </div>
      </div>
    </div>
  )
}

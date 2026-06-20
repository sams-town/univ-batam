'use client'

import { useState, useCallback } from 'react'
import { Fingerprint, X, Copy, CheckCircle2 } from 'lucide-react'
import DashboardTopCards from '@/components/dashboard/DashboardTopCards'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks'
import DashboardBottomNav from '@/components/dashboard/DashboardBottomNav'

function generateRandomToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let token = ''
  for (let i = 0; i < 4; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export default function LecturerDashboardPage() {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [generatedToken, setGeneratedToken] = useState('')
  const [isTokenActive, setIsTokenActive] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFabClick = useCallback(() => {
    const token = generateRandomToken()
    setGeneratedToken(token)
    setIsTokenActive(true)
    setCopied(false)
    setIsTokenModalOpen(true)
  }, [])

  const handleCloseSession = () => {
    setIsTokenActive(false)
    setGeneratedToken('')
    setIsTokenModalOpen(false)
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 pt-6">
        <div className="px-6 pb-8">
          <p className="text-4xl font-bold text-white mb-1">
            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-sm opacity-80 text-white uppercase">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-4">
        {/* Top Cards */}
        <DashboardTopCards role="dosen" />

        {/* Quick Attendance Button */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">MULAI HARI INI</p>
              <p className="text-xl font-bold text-slate-900">Generate Token Absen</p>
            </div>
            <button
              onClick={handleFabClick}
              className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Fingerprint className="h-8 w-8 text-white" />
            </button>
          </div>
        </div>

        {/* Token Status Indicator */}
        {isTokenActive && (
          <div
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 shadow-sm mb-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setIsTokenModalOpen(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-200">TOKEN AKTIF</p>
                <p className="text-3xl font-mono font-bold text-white tracking-[0.3em]">{generatedToken}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Quick Links */}
        <DashboardQuickLinks role="dosen" />

        {/* Activity List */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-slate-900">Aktivitas Terakhir</p>
            <p className="text-sm text-emerald-600 font-semibold">Lihat →</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Fingerprint className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Riwayat Generate Token</p>
                <p className="text-sm text-slate-500">Lihat token absensi yang sudah dibuat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Generator Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setIsTokenModalOpen(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center relative">
              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="text-sm font-semibold text-purple-200 mb-2">TOKEN ABSENSI</p>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl py-6 px-4">
                <p className="text-6xl font-mono font-bold text-white tracking-[0.4em] drop-shadow-lg">
                  {generatedToken}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-purple-200">Sesi Aktif</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              <button
                onClick={handleCopyToken}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-emerald-600">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    <span>Salin Token</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  const token = generateRandomToken()
                  setGeneratedToken(token)
                  setCopied(false)
                }}
                className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-700 font-semibold transition-colors"
              >
                Generate Ulang
              </button>

              <button
                onClick={handleCloseSession}
                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 font-semibold transition-colors"
              >
                Tutup Sesi / Matikan Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <DashboardBottomNav role="dosen" onFabClick={handleFabClick} />
    </div>
  )
}

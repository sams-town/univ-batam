'use client'

import { useState, useRef, useCallback } from 'react'
import { Fingerprint, X, CheckCircle2, AlertCircle } from 'lucide-react'
import DashboardTopCards from '@/components/dashboard/DashboardTopCards'
import DashboardQuickLinks from '@/components/dashboard/DashboardQuickLinks'
import DashboardBottomNav from '@/components/dashboard/DashboardBottomNav'
import AttendanceSuccessModal from '@/components/dashboard/AttendanceSuccessModal'

export default function StudentDashboardPage() {
  const [isTokenInputModalOpen, setIsTokenInputModalOpen] = useState(false)
  const [tokenDigits, setTokenDigits] = useState(['', '', '', ''])
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleFabClick = useCallback(() => {
    setTokenDigits(['', '', '', ''])
    setTokenStatus('idle')
    setIsTokenInputModalOpen(true)
    // Focus first input after modal renders
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }, [])

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.charAt(value.length - 1)
    const upper = value.toUpperCase()
    const newDigits = [...tokenDigits]
    newDigits[index] = upper
    setTokenDigits(newDigits)
    setTokenStatus('idle')

    // Auto-focus next input
    if (upper && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !tokenDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmitToken = () => {
    const token = tokenDigits.join('')
    if (token.length < 4) {
      setTokenStatus('error')
      return
    }
    // Simulate token verification (always success for demo)
    setTokenStatus('success')
    setTimeout(() => {
      setIsTokenInputModalOpen(false)
      setTokenDigits(['', '', '', ''])
      setTokenStatus('idle')
      setIsSuccessModalOpen(true)
    }, 500)
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-6">
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
        <DashboardTopCards role="mahasiswa" />

        {/* Quick Attendance Button */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">MULAI HARI INI</p>
              <p className="text-xl font-bold text-slate-900">Rekam Kehadiran</p>
            </div>
            <button
              onClick={handleFabClick}
              className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Fingerprint className="h-8 w-8 text-white" />
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <DashboardQuickLinks role="mahasiswa" />

        {/* Activity List */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-lg font-bold text-slate-900">Aktivitas Terakhir</p>
            <p className="text-sm text-indigo-600 font-semibold">Lihat →</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Fingerprint className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Riwayat Absensi</p>
                <p className="text-sm text-slate-500">Lihat log masuk & pulang</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Input Modal */}
      {isTokenInputModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setIsTokenInputModalOpen(false)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center relative">
              <button
                onClick={() => setIsTokenInputModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <Fingerprint className="h-12 w-12 text-white/80 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">Masukkan Token Absensi</p>
              <p className="text-sm text-indigo-200 mt-1">Ketik 4 digit token dari dosen</p>
            </div>

            {/* Token Input */}
            <div className="p-6 space-y-6">
              <div className="flex justify-center gap-3">
                {tokenDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-16 h-20 text-center text-3xl font-mono font-bold rounded-2xl border-2 outline-none transition-all ${
                      tokenStatus === 'error'
                        ? 'border-red-400 bg-red-50 text-red-600 animate-shake'
                        : tokenStatus === 'success'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200'
                    }`}
                  />
                ))}
              </div>

              {/* Status Feedback */}
              {tokenStatus === 'success' && (
                <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-3 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Absensi Berhasil!</span>
                </div>
              )}

              {tokenStatus === 'error' && (
                <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 py-3 rounded-xl">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Token tidak lengkap atau salah</span>
                </div>
              )}

              <button
                onClick={handleSubmitToken}
                disabled={tokenStatus === 'success'}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {tokenStatus === 'success' ? 'Terverifikasi ✓' : 'Kirim Token'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <DashboardBottomNav role="mahasiswa" onFabClick={handleFabClick} />

      {/* Success Modal */}
      <AttendanceSuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
        type="masuk" 
      />
    </div>
  )
}

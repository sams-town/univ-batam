import { CheckCircle2, X } from 'lucide-react'

interface AttendanceSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'masuk' | 'pulang'
  message?: string
  timestamp?: string
}

export default function AttendanceSuccessModal({
  isOpen,
  onClose,
  type,
  message,
  timestamp
}: AttendanceSuccessModalProps) {
  if (!isOpen) return null

  const currentTime = timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const defaultMessage = type === 'masuk' 
    ? 'Terima kasih, Anda sudah berhasil absen masuk untuk hari ini!' 
    : 'Terima kasih, Anda sudah berhasil absen pulang untuk hari ini!'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border-4 border-white/30">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-1">Berhasil!</h3>
          <p className="text-emerald-100 text-sm font-medium">Data kehadiran telah tersimpan</p>
        </div>

        <div className="p-6 text-center space-y-4">
          <p className="text-slate-700 font-medium leading-relaxed">
            {message || defaultMessage}
          </p>

          <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-mono font-bold">
            <span className="text-xs text-slate-500">JAM {type.toUpperCase()}:</span>
            <span className="text-lg text-emerald-600">{currentTime}</span>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

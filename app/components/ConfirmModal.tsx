// components/ui/ConfirmModal.tsx
'use client'

import { AlertCircle, X } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  isLoading?: boolean
  variant?: 'danger' | 'primary'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  isLoading = false,
  variant = 'primary'
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Ikon */}
        <div className="pt-8 flex justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-brand-blue'}`}>
                <AlertCircle className="w-10 h-10" />
            </div>
        </div>

        {/* Konten */}
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold text-brand-dark mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm text-white transition-all shadow-lg shadow-opacity-20 ${
                variant === 'danger' 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-brand-pink hover:bg-brand-dark shadow-brand-pink/20'
            }`}
          >
            {isLoading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
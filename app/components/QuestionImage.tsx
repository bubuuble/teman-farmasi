'use client'

import { useState } from 'react'
import { Image as ImageIcon, AlertCircle, Maximize2, X, ExternalLink } from 'lucide-react'

/**
 * Normalisasi URL gambar:
 * Jika user memasukkan link Google Drive biasa (misal /file/d/xxx/view),
 * otomatis konversi menjadi link direct stream Google (https://lh3.googleusercontent.com/d/xxx)
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  const driveMatch = trimmed.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|drive\.usercontent\.google\.com\/download\?id=)([a-zA-Z0-9_-]+)/
  )
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`
  }

  return trimmed
}

interface QuestionImageProps {
  src: string | null | undefined
  alt?: string
  className?: string
}

export default function QuestionImage({ src, alt = 'Lampiran Soal', className = 'max-w-2xl' }: QuestionImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const normalizedSrc = normalizeImageUrl(src)

  if (!normalizedSrc) return null

  if (hasError) {
    return (
      <div className={`my-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800 ${className}`}>
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Gambar tidak dapat dimuat</p>
          <p className="text-[11px] text-amber-700/90 leading-relaxed">
            Pastikan URL merupakan link langsung file gambar (.jpg, .png, .webp) atau link Google Drive yang disetel publik.
          </p>
          <a
            href={src || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-dark underline hover:text-brand-pink"
          >
            <span>Buka tautan asli di tab baru</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`my-3 group relative inline-block max-w-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xs cursor-pointer ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <img
          src={normalizedSrc}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-auto max-w-full h-auto max-h-[520px] object-contain block mx-auto transition duration-200 group-hover:scale-[1.01]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-xs text-white text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Klik untuk memperbesar</span>
          </div>
        </div>
      </div>

      {/* MODAL FULL PREVIEW */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full bg-white rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-gray-100 mb-2">
              <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-pink" />
                {alt}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={normalizedSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                  title="Buka gambar penuh di tab baru"
                >
                  <span>Buka Tab Baru</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[80vh] w-full flex items-center justify-center p-2">
              <img
                src={normalizedSrc}
                alt={alt}
                className="max-w-full max-h-[78vh] w-auto h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

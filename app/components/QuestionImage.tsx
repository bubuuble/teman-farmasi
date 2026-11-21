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

export default function QuestionImage({ src, alt = 'Lampiran Soal', className = 'max-w-md' }: QuestionImageProps) {
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
      <div className={`my-3 group relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50/50 shadow-xs cursor-pointer ${className}`} onClick={() => setIsOpen(true)}>
        <img
          src={normalizedSrc}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-auto object-contain max-h-80 transition duration-200 group-hover:scale-[1.01]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold pointer-events-none">
          <Maximize2 className="w-4 h-4" />
          <span>Klik untuk memperbesar</span>
        </div>
      </div>

      {/* MODAL FULL PREVIEW */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 px-2 border-b border-gray-100 mb-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-pink" />
                {alt}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={normalizedSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  title="Buka gambar penuh di tab baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center p-2">
              <img
                src={normalizedSrc}
                alt={alt}
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

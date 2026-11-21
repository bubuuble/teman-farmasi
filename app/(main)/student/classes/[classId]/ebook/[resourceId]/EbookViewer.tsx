'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function EbookViewer({
  resourceId, title, backHref, watermark,
}: { resourceId: string; title: string; backHref: string; watermark: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [hidden, setHidden] = useState(false)

  // Render PDF ke canvas (tanpa tombol download/print bawaan browser)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
        const pdf = await pdfjs.getDocument({ url: `/api/ebook/${resourceId}`, withCredentials: true }).promise
        const box = containerRef.current
        if (!box || cancelled) return
        box.innerHTML = ''
        const dpr = window.devicePixelRatio || 1
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          if (cancelled) return
          const base = page.getViewport({ scale: 1 })
          const width = Math.min(box.clientWidth, 900)
          const vp = page.getViewport({ scale: (width / base.width) * dpr })
          const canvas = document.createElement('canvas')
          canvas.width = vp.width
          canvas.height = vp.height
          canvas.style.width = `${vp.width / dpr}px`
          canvas.style.height = `${vp.height / dpr}px`
          canvas.className = 'mx-auto mb-4 shadow bg-white'
          box.appendChild(canvas)
          await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
          if (i === 1) setStatus('ready')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [resourceId])

  // Proteksi: blok klik kanan, shortcut simpan/print/copy/screenshot, sembunyikan saat fokus hilang
  useEffect(() => {
    const block = (e: Event) => e.preventDefault()
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        navigator.clipboard?.writeText('').catch(() => {})
        setHidden(true)
        setTimeout(() => setHidden(false), 1500)
      }
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'c', 'u', 'a'].includes(k)) e.preventDefault()
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(k)) { e.preventDefault(); setHidden(true) }
    }
    const onVis = () => setHidden(document.visibilityState !== 'visible')
    const onBlur = () => setHidden(true)
    const onFocus = () => setHidden(false)
    document.addEventListener('contextmenu', block)
    document.addEventListener('copy', block)
    document.addEventListener('dragstart', block)
    document.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
    return () => {
      document.removeEventListener('contextmenu', block)
      document.removeEventListener('copy', block)
      document.removeEventListener('dragstart', block)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return (
    <div className="select-none">
      <style>{`@media print { body * { display: none !important; } }`}</style>
      <div className="flex items-center justify-between mb-4">
        <Link href={backHref} className="text-sm font-bold text-brand-pink hover:underline">← Kembali</Link>
        <h1 className="font-bold text-brand-dark truncate px-4">{title}</h1>
        <span className="w-16" />
      </div>

      {status === 'loading' && <p className="text-center text-gray-400 py-20">Memuat e-book…</p>}
      {status === 'error' && <p className="text-center text-red-500 py-20">Gagal memuat e-book. Pastikan file berformat PDF dan kamu terdaftar di kelas ini.</p>}

      <div className="relative" style={{ visibility: hidden ? 'hidden' : 'visible' }}>
        <div ref={containerRef} />
        {/* Watermark identitas pengguna */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.12] flex flex-wrap content-start gap-x-16 gap-y-24 -rotate-12 scale-125 text-sm font-bold text-gray-700"
          aria-hidden
        >
          {Array.from({ length: 120 }).map((_, i) => <span key={i} className="whitespace-nowrap">{watermark}</span>)}
        </div>
      </div>
      {hidden && <p className="text-center text-gray-400 py-20">Konten disembunyikan. Kembali ke tab ini untuk melanjutkan.</p>}
    </div>
  )
}

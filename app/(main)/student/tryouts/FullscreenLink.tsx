'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

// Link ke halaman ujian yang langsung masuk layar penuh saat diklik.
// requestFullscreen harus dipanggil dari klik pengguna; layar penuh tetap aktif saat pindah halaman.
export default function FullscreenLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        document.documentElement.requestFullscreen?.().catch(() => {})
        onClick?.(e)
      }}
    />
  )
}

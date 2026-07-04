'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Saat route berubah, mulai progress bar
    setLoading(true)
    setProgress(20)

    const t1 = setTimeout(() => setProgress(60), 100)
    const t2 = setTimeout(() => setProgress(85), 400)
    const t3 = setTimeout(() => {
      setProgress(100)
      // Setelah selesai, fade out
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
    }, 700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname])

  if (!loading && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-gradient-to-r from-brand-pink via-brand-darkblue to-brand-pink transition-all"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
        transition: progress === 0 ? 'none' : 'width 0.4s ease, opacity 0.3s ease',
        boxShadow: '0 0 10px rgba(236, 72, 153, 0.7), 0 0 20px rgba(236, 72, 153, 0.3)',
      }}
    />
  )
}

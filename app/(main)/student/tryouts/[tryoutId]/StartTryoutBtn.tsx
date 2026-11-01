'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'
import { startTryoutAttempt } from '@/app/(main)/student/tryouts/actions'

export default function StartTryoutBtn({
  tryoutId,
  label = 'Mulai Ujian Sekarang'
}: {
  tryoutId: string
  label?: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    setIsLoading(true)
    try {
      const res = await startTryoutAttempt(tryoutId)
      if (res.error) {
        alert(res.error)
        setIsLoading(false)
      } else {
        router.push(`/student/tryouts/${tryoutId}/exam`)
      }
    } catch (e: any) {
      alert(e.message || "Gagal memulai ujian")
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleStart}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-brand-pink text-white rounded-xl text-xs font-extrabold hover:bg-brand-dark transition shadow-lg shadow-brand-pink/20 active:scale-95 disabled:opacity-50"
    >
      <Play className="w-4 h-4 fill-current" />
      {isLoading ? 'Menyiapkan Lembar Ujian...' : label}
    </button>
  )
}

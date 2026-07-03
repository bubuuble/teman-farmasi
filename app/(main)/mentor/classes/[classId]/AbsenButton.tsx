'use client'

import { useState } from 'react'
import { submitMentorAttendance } from '../actions'
import ConfirmModal from '@/app/components/ConfirmModal'

export default function AbsenButton({ sessionId, classId }: { sessionId: string; classId: string }) {
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-brand-pink text-white rounded-xl text-[10px] font-bold hover:bg-brand-dark transition-all disabled:opacity-50 shadow-lg shadow-brand-pink/20"
      >
        {loading ? 'Memproses...' : 'Klik Absen Mengajar'}
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={async () => {
          setIsOpen(false)
          setLoading(true)
          const res = await submitMentorAttendance(sessionId, classId)
          if (res.error) alert(res.error)
          setLoading(false)
        }}
        title="Konfirmasi Absen"
        message="Konfirmasi kehadiran mengajar untuk sesi ini?"
      />
    </>
  )
}

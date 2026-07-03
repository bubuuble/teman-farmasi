'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteSession } from '../actions'
import ConfirmModal from '@/app/components/ConfirmModal'

export default function DeleteSessionButton({ sessionId, classId }: { sessionId: string; classId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
        title="Hapus Sesi"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={async () => {
          setIsOpen(false)
          await deleteSession(sessionId, classId)
        }}
        title="Hapus Sesi"
        message="Apakah kamu yakin ingin menghapus sesi ini?"
        variant="danger"
      />
    </>
  )
}

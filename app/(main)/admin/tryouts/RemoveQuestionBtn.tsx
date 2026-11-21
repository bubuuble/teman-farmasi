'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { removeQuestionFromTryout } from './actions'
import { confirmDialog, notify } from '@/app/components/Feedback'

export default function RemoveQuestionBtn({
  tryoutId,
  questionId
}: {
  tryoutId: string
  questionId: string
}) {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    const ok = await confirmDialog({
      title: 'Keluarkan Soal',
      message: 'Keluarkan soal ini dari paket tryout? (Soal tetap tersimpan di Bank Soal)',
      confirmText: 'Ya, Keluarkan',
      variant: 'danger',
    })
    if (!ok) return

    setIsRemoving(true)
    try {
      await removeQuestionFromTryout(tryoutId, questionId)
      notify.success('Soal dikeluarkan dari paket tryout')
    } catch (e: any) {
      notify.error(e.message || 'Gagal mengeluarkan soal')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isRemoving}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
      title="Keluarkan dari tryout"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

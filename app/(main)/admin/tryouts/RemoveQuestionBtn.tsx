'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { removeQuestionFromTryout } from './actions'

export default function RemoveQuestionBtn({
  tryoutId,
  questionId
}: {
  tryoutId: string
  questionId: string
}) {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    if (!confirm('Keluarkan soal ini dari paket tryout? (Soal tetap tersimpan di Bank Soal)')) {
      return
    }

    setIsRemoving(true)
    try {
      await removeQuestionFromTryout(tryoutId, questionId)
    } catch (e: any) {
      alert(e.message || 'Gagal mengeluarkan soal')
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

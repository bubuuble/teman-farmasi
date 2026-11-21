'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteQuestion } from './actions'
import { confirmDialog, notify } from '@/app/components/Feedback'

export default function DeleteQuestionBtn({
  questionId,
  categoryId
}: {
  questionId: string
  categoryId: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Hapus Soal',
      message: 'Apakah Anda yakin ingin menghapus butir soal ini?',
      confirmText: 'Ya, Hapus',
      variant: 'danger',
    })
    if (!ok) return

    setIsDeleting(true)
    try {
      await deleteQuestion(questionId, categoryId)
      notify.success('Soal berhasil dihapus')
    } catch (e: any) {
      notify.error(e.message || 'Gagal menghapus soal')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition disabled:opacity-50"
      title="Hapus Soal"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

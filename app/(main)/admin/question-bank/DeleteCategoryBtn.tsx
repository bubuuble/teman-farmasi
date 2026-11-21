'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteCategory } from './actions'
import { confirmDialog, notify } from '@/app/components/Feedback'

export default function DeleteCategoryBtn({
  categoryId,
  categoryName
}: {
  categoryId: string
  categoryName: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Hapus Kategori',
      message: `Hapus kategori "${categoryName}" beserta semua soal di dalamnya?`,
      confirmText: 'Ya, Hapus',
      variant: 'danger',
    })
    if (!ok) return

    setIsDeleting(true)
    try {
      await deleteCategory(categoryId)
      notify.success('Kategori berhasil dihapus')
    } catch (e: any) {
      notify.error(e.message || 'Gagal menghapus kategori')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
      title="Hapus Kategori"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

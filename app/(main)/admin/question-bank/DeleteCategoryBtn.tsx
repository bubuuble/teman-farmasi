'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteCategory } from './actions'

export default function DeleteCategoryBtn({
  categoryId,
  categoryName
}: {
  categoryId: string
  categoryName: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Hapus kategori "${categoryName}" beserta semua soal di dalamnya?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteCategory(categoryId)
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus kategori')
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

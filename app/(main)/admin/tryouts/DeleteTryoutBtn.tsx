'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteTryout } from './actions'

export default function DeleteTryoutBtn({
  tryoutId,
  tryoutTitle
}: {
  tryoutId: string
  tryoutTitle: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Hapus paket ujian "${tryoutTitle}"? Semua data attempt dan jawaban siswa akan ikut terhapus.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteTryout(tryoutId)
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus tryout')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition disabled:opacity-50"
      title="Hapus Tryout"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}

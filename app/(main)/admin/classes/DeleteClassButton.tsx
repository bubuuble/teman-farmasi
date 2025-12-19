'use client'

import { Trash2 } from 'lucide-react'
import { deleteClass } from './actions'
import { useState } from 'react'

export default function DeleteClassButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if(!confirm("Yakin hapus kelas ini? Semua Batch didalamnya juga akan hilang.")) return

    setIsDeleting(true)
    await deleteClass(id)
    setIsDeleting(false)
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
    >
      {isDeleting ? "..." : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
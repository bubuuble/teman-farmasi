'use client'

import { Trash2 } from 'lucide-react'
import { deleteUser } from './actions'
import { useState } from 'react'

export default function DeleteUserButton({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const confirm = window.confirm("Yakin ingin menghapus user ini? Data tidak bisa dikembalikan.")
    if (!confirm) return

    setIsDeleting(true)
    const res = await deleteUser(userId)
    
    if (res?.error) {
      alert("Gagal hapus: " + res.error)
      setIsDeleting(false)
    } else {
        // Otomatis refresh karena revalidatePath di server action
        setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      title="Hapus User"
    >
      {isDeleting ? (
          <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin block"></span>
      ) : (
          <Trash2 className="w-4 h-4" />
      )}
    </button>
  )
}
'use client'

import { Trash2 } from 'lucide-react'
import { deleteClass } from './actions'
import { useState } from 'react'
import ConfirmModal from '@/app/components/ConfirmModal'

import { useRouter } from 'next/navigation'

export default function DeleteClassButton({ id, redirectOnDelete }: { id: string; redirectOnDelete?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteClass(id)
    setIsDeleting(false)
    if (res.success && redirectOnDelete) {
      router.push('/admin/classes')
    }
  }

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        {isDeleting ? "..." : <Trash2 className="w-4 h-4" />}
      </button>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
            setShowConfirm(false)
            handleDelete()
        }}
        title="Hapus Kelas"
        message="Yakin hapus kelas ini? Semua Batch didalamnya juga akan hilang."
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  )
}
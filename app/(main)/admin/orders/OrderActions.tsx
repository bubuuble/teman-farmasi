'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { updateOrderStatus, deleteOrder } from './actions'

type OrderProps = {
  id: string
  status: string
  class_id: string
  student_id: string
}

export default function OrderActions({ order }: { order: OrderProps }) {
  const [loading, setLoading] = useState(false)

  const handleStatus = async (newStatus: string) => {
    setLoading(true)
    await updateOrderStatus(order.id, newStatus, order.class_id, order.student_id)
    setLoading(false)
  }

  const handleDelete = async () => {
    if(!confirm("Hapus history order ini?")) return
    setLoading(true)
    await deleteOrder(order.id)
    setLoading(false)
  }

  if(loading) return <span className="text-xs text-gray-400">Loading...</span>

  return (
    <div className="flex items-center gap-2 justify-end">
      {order.status === 'pending' && (
        <>
          <button 
            onClick={() => handleStatus('paid')}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
            title="Tandai Lunas"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleStatus('cancelled')}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            title="Batalkan"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </>
      )}

      {order.status === 'paid' && (
        <span className="flex items-center gap-1 text-green-600 text-xs font-bold px-3 py-1 bg-green-100 rounded-full">
            <CheckCircle className="w-3 h-3" /> Lunas
        </span>
      )}

      {order.status === 'cancelled' && (
        <span className="flex items-center gap-1 text-red-600 text-xs font-bold px-3 py-1 bg-red-100 rounded-full">
            <XCircle className="w-3 h-3" /> Batal
        </span>
      )}

      {/* Delete Button (Selalu ada buat bersih2 data) */}
      <button 
        onClick={handleDelete}
        className="p-2 text-gray-300 hover:text-red-500 ml-2"
        title="Hapus Data"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
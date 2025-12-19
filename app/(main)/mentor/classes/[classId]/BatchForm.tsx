// app/(main)/mentor/classes/[classId]/BatchForm.tsx
'use client'

import { useState, useActionState } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import { createBatch, updateBatch, type ActionState } from '../actions'

const initialState: ActionState = { error: '', success: '' }

type BatchData = {
  id: string
  name: string
  start_date: string
  end_date: string
}

export default function BatchForm({ 
  classId, 
  existingData 
}: { 
  classId: string, 
  existingData?: BatchData 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Pilih action: Update atau Create
  const actionToUse = existingData ? updateBatch : createBatch
  const [state, formAction, isPending] = useActionState(actionToUse, initialState)

  if (state?.success && isOpen) {
    setIsOpen(false)
    window.location.reload()
  }

  return (
    <>
      {/* Trigger Button */}
      {existingData ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-gray-400 hover:text-brand-blue transition-colors p-1"
          title="Edit Batch"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-brand-pink text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-dark transition-all text-sm shadow-lg shadow-brand-pink/20"
        >
          <Plus className="w-4 h-4" />
          Buat Batch Baru
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-bold text-lg text-brand-dark">
                {existingData ? 'Edit Batch' : 'Buat Batch / Gelombang'}
              </h3>
              <button onClick={() => setIsOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="classId" value={classId} />
              {existingData && <input type="hidden" name="batchId" value={existingData.id} />}
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Nama Batch</label>
                <input 
                  name="name" 
                  type="text" 
                  defaultValue={existingData?.name}
                  placeholder="Contoh: Batch Januari 2025" 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Tanggal Mulai</label>
                    <input 
                      name="startDate" 
                      type="date" 
                      defaultValue={existingData?.start_date}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                      required 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Tanggal Selesai</label>
                    <input 
                      name="endDate" 
                      type="date" 
                      defaultValue={existingData?.end_date}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                      required 
                    />
                </div>
              </div>

              {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

              <button type="submit" disabled={isPending} className="w-full bg-brand-darkblue text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-all mt-2">
                {isPending ? "Menyimpan..." : (existingData ? "Simpan Perubahan" : "Simpan Batch")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
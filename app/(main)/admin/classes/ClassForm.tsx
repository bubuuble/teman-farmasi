'use client'

import { useState, useActionState } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import { createClass, updateClass, type ActionState } from './actions'

// Tipe data kelas
type ClassData = {
  id: string
  title: string
  description: string | null
  price: number | null
  level: string | null
}

const initialState: ActionState = { error: '', success: '' }

// Tambahkan prop 'customTrigger'
export default function ClassForm({ 
  existingData, 
  customTrigger 
}: { 
  existingData?: ClassData, 
  customTrigger?: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const actionToUse = existingData ? updateClass : createClass
  const [state, formAction, isPending] = useActionState(actionToUse, initialState)

  if (state?.success && isOpen) {
    setIsOpen(false)
    window.location.reload()
  }

  return (
    <>
      {/* LOGIC TRIGGER BUTTON */}
      {customTrigger ? (
        // Opsi 1: Jika ada Custom Trigger (dari Dashboard), gunakan itu
        <div onClick={() => setIsOpen(true)} className="cursor-pointer w-full">
          {customTrigger}
        </div>
      ) : (
        // Opsi 2: Default Button (dari halaman Classes)
        existingData ? (
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-brand-yellow hover:text-brand-dark transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-brand-pink text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-dark transition-all shadow-lg shadow-brand-pink/20"
          >
            <Plus className="w-5 h-5" />
            Buat Kelas
          </button>
        )
      )}

      {/* MODAL (Tetap Sama) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-brand-cream">
              <h3 className="font-heading font-bold text-lg text-brand-dark">
                {existingData ? 'Edit Kelas' : 'Buat Kelas Baru'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-brand-gray hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-4">
              {existingData && <input type="hidden" name="id" value={existingData.id} />}

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Nama Kelas</label>
                <input 
                  name="title" 
                  defaultValue={existingData?.title} 
                  type="text" 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Level</label>
                    <select 
                      name="level" 
                      defaultValue={existingData?.level || 'Beginner'}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white"
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Harga (Rp)</label>
                  <input 
                    name="price" 
                    defaultValue={existingData?.price || 0} 
                    type="number" 
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Deskripsi Singkat</label>
                <textarea 
                  name="description" 
                  defaultValue={existingData?.description || ''} 
                  rows={4}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue resize-none" 
                />
              </div>

              {state?.error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {state.error}
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full bg-brand-darkblue text-white font-bold py-4 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : (existingData ? "Update Kelas" : "Buat Kelas")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
'use client'

import { useState, useActionState } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import { createSession, updateSession, type ActionState } from '../actions'

const initialState: ActionState = { error: '', success: '' }

type SessionData = {
  id: string
  title: string
  date_time: string
  zoom_link: string | null
}

export default function SessionForm({ 
  classId, 
  existingData 
}: { 
  classId: string,
  existingData?: SessionData 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const actionToUse = existingData ? updateSession : createSession
  const [state, formAction, isPending] = useActionState(actionToUse, initialState)

  if (state?.success && isOpen) {
    setIsOpen(false)
    window.location.reload()
  }

  // Helper untuk parsing ISO string ke format input date & time
  const getDefaultDate = () => existingData ? new Date(existingData.date_time).toISOString().split('T')[0] : ''
  return (
    <>
      {existingData ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-gray-300 hover:text-brand-blue transition-colors p-2"
          title="Edit Sesi"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-brand-blue bg-blue-50 px-4 py-2 rounded-xl font-bold hover:bg-brand-blue hover:text-white transition-all text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Sesi
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-bold text-lg text-brand-dark">
                {existingData ? 'Edit Sesi' : 'Tambah Sesi'}
              </h3>
              <button onClick={() => setIsOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="classId" value={classId} />
              
              {existingData && (
                 <input type="hidden" name="sessionId" value={existingData.id} />
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Judul Sesi</label>
                <input 
                  name="title" 
                  type="text" 
                  defaultValue={existingData?.title}
                  placeholder="Contoh: Pertemuan 1 - Pengenalan" 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Tanggal</label>
                    <input 
                      name="date" 
                      type="date" 
                      defaultValue={getDefaultDate()}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                      required 
                    />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Link Zoom / GMeet</label>
                <input 
                  name="zoomLink" 
                  type="url" 
                  defaultValue={existingData?.zoom_link || ''}
                  placeholder="https://zoom.us/j/..." 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                />
              </div>

              {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

              <button type="submit" disabled={isPending} className="w-full bg-brand-darkblue text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-all mt-2">
                {isPending ? "Menyimpan..." : "Simpan Sesi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
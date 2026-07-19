'use client'

import { useState, useActionState } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import { createSession, updateSession, type ActionState } from '../actions'

const initialState: ActionState = { error: '', success: '' }

type SessionData = {
  id: string
  title: string
  date_time: string
  session_time: string | null
  zoom_link: string | null
  assigned_student_ids?: string[]
}

export default function SessionForm({ 
  classId, 
  subClassId,
  existingData,
  classType,
  availableStudents = []
}: { 
  classId: string,
  subClassId?: string | null,
  existingData?: SessionData,
  classType: 'pharmacore' | 'pharmacamp' | 'private',
  availableStudents?: { id: string; name: string }[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const actionToUse = existingData ? updateSession : createSession
  const [state, formAction, isPending] = useActionState(actionToUse, initialState)

  if (state?.success && isOpen) {
    setIsOpen(false)
    window.location.reload()
  }

  // Helper untuk parsing ISO string ke format input date dengan timezone lokal
  const getDefaultDate = () => {
    if (!existingData) return ''
    const d = new Date(existingData.date_time)
    const tzOffset = d.getTimezoneOffset() * 60000 // offset dalam milidetik
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10)
  }
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
              {subClassId && <input type="hidden" name="subClassId" value={subClassId} />}
              
              {existingData && (
                 <input type="hidden" name="sessionId" value={existingData.id} />
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Judul Sesi</label>
                <input 
                  name="title" 
                  type="text" 
                  defaultValue={existingData?.title}
                  placeholder={classType === 'pharmacamp' ? "Contoh: Kegiatan Hari ke-1" : "Contoh: Pertemuan 1 - Pengenalan"} 
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
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Jam</label>
                    <input 
                      name="time" 
                      type="time" 
                      defaultValue={existingData?.session_time ? existingData.session_time.slice(0, 5) : ''}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                      required 
                    />
                </div>
              </div>

              {classType !== 'pharmacamp' && (
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
              )}

              {classType !== 'pharmacore' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Pilih Student</label>
                  {availableStudents.length === 0 ? (
                    <p className="text-xs text-red-500 font-bold">Belum ada student di kelas/peminatan ini.</p>
                  ) : (
                    <select
                      name="studentId"
                      defaultValue={existingData?.assigned_student_ids?.[0] || ''}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                      required
                    >
                      <option value="">-- Pilih Student --</option>
                      {availableStudents.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

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
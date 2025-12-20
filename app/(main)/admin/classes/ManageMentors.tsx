'use client'

import { useState, useActionState } from 'react'
import { Users, X, Plus, Trash2 } from 'lucide-react'
import { assignMentor, removeMentor, type ActionState } from './actions'
import ConfirmModal from '@/app/components/ConfirmModal'

// Tipe Data
type Mentor = {
  id: string
  full_name: string | null
  email: string
}

// Gunakan tipe ini di props
type Assignment = {
  id: string
  mentor_id: string
  profiles: {
    full_name: string | null
    email: string
  } | null // Profile bisa null jika data korup/terhapus
}

const initialState: ActionState = { error: '', success: '' }

export default function ManageMentors({ 
  classId, 
  classTitle,
  allMentors, 
  currentAssignments 
}: { 
  classId: string, 
  classTitle: string,
  allMentors: Mentor[], 
  // PERBAIKAN: Ganti any[] dengan Assignment[]
  currentAssignments: Assignment[] 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(assignMentor, initialState)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    assignmentId: string;
  }>({
    isOpen: false,
    assignmentId: '',
  });

  const handleRemove = async (assignmentId: string) => {
    await removeMentor(assignmentId)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-brand-blue hover:text-white transition-colors"
        title="Atur Mentor"
      >
        <Users className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-brand-cream">
              <div>
                <h3 className="font-heading font-bold text-lg text-brand-dark">Atur Mentor</h3>
                <p className="text-xs text-brand-gray">{classTitle}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-brand-gray hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div>
                <h4 className="text-xs font-bold text-brand-dark uppercase mb-3">Mentor Bertugas</h4>
                <div className="space-y-2">
                  {currentAssignments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Belum ada mentor di kelas ini.</p>
                  ) : (
                    currentAssignments.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-bold text-sm text-brand-dark">{item.profiles?.full_name || "Tanpa Nama"}</p>
                          <p className="text-xs text-gray-500">{item.profiles?.email || "-"}</p>
                        </div>
                        <button 
                          onClick={() => setConfirmModal({ isOpen: true, assignmentId: item.id })}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <ConfirmModal 
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, assignmentId: '' })}
                onConfirm={() => {
                    handleRemove(confirmModal.assignmentId)
                    setConfirmModal({ isOpen: false, assignmentId: '' })
                }}
                title="Hapus Mentor"
                message="Apakah kamu yakin ingin menghapus mentor ini dari kelas?"
                variant="danger"
              />

              <hr className="border-gray-100" />

              <form action={formAction} className="space-y-3">
                <input type="hidden" name="classId" value={classId} />
                
                <h4 className="text-xs font-bold text-brand-dark uppercase">Tambah Mentor Baru</h4>
                <div className="flex gap-2">
                  <select 
                    name="mentorId" 
                    className="flex-1 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                    required
                  >
                    <option value="">-- Pilih Mentor --</option>
                    {allMentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name || m.email} ({m.email})
                      </option>
                    ))}
                  </select>
                  
                  <button 
                    type="submit"
                    disabled={isPending} 
                    className="bg-brand-darkblue text-white p-3 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
                  >
                    {isPending ? "..." : <Plus className="w-5 h-5" />}
                  </button>
                </div>
                {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
                {state?.success && <p className="text-xs text-green-500">Berhasil ditambahkan!</p>}
              </form>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
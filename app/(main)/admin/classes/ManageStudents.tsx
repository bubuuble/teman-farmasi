'use client'

import { useState, useActionState } from 'react'
import { GraduationCap, X, Plus, Trash2 } from 'lucide-react'
import { assignStudent, removeStudent, type ActionState } from './actions'
import ConfirmModal from '@/app/components/ConfirmModal'

// Tipe Data
type Student = {
  id: string
  full_name: string | null
  email: string
}

// Gunakan tipe ini di props
type Enrollment = {
  id: string
  student_id: string
  profiles: {
    full_name: string | null
    email: string
  } | null
}

const initialState: ActionState = { error: '', success: '' }

export default function ManageStudents({ 
  classId, 
  classTitle,
  allStudents, 
  currentEnrollments 
}: { 
  classId: string, 
  classTitle: string,
  allStudents: Student[], 
  // PERBAIKAN: Ganti any[] dengan Enrollment[]
  currentEnrollments: Enrollment[] 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(assignStudent, initialState)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    enrollmentId: string;
  }>({
    isOpen: false,
    enrollmentId: '',
  });

  const handleRemove = async (enrollmentId: string) => {
    await removeStudent(enrollmentId)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-green-500 hover:text-white transition-colors"
        title="Atur Siswa"
      >
        <GraduationCap className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-brand-cream">
              <div>
                <h3 className="font-heading font-bold text-lg text-brand-dark">Daftar Siswa</h3>
                <p className="text-xs text-brand-gray">{classTitle}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-brand-gray hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-brand-dark uppercase">Siswa Terdaftar</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-bold">{currentEnrollments.length} Siswa</span>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {currentEnrollments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Belum ada siswa di kelas ini.</p>
                  ) : (
                    currentEnrollments.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-bold text-sm text-brand-dark">{item.profiles?.full_name || "Tanpa Nama"}</p>
                          <p className="text-xs text-gray-500">{item.profiles?.email || "-"}</p>
                        </div>
                        <button 
                          onClick={() => setConfirmModal({ isOpen: true, enrollmentId: item.id })}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Keluarkan"
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
                onClose={() => setConfirmModal({ isOpen: false, enrollmentId: '' })}
                onConfirm={() => {
                    handleRemove(confirmModal.enrollmentId)
                    setConfirmModal({ isOpen: false, enrollmentId: '' })
                }}
                title="Keluarkan Siswa"
                message="Apakah kamu yakin ingin mengeluarkan siswa ini dari kelas?"
                variant="danger"
              />

              <hr className="border-gray-100" />

              <form action={formAction} className="space-y-3">
                <input type="hidden" name="classId" value={classId} />
                
                <h4 className="text-xs font-bold text-brand-dark uppercase">Masukkan Siswa Manual</h4>
                <div className="flex gap-2">
                  <select 
                    name="studentId" 
                    className="flex-1 p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white text-sm"
                    required
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || s.email} ({s.email})
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
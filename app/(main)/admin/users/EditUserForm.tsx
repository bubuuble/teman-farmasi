'use client'

import { useState, useActionState } from 'react'
import { Pencil, X } from 'lucide-react'
import { updateUser, type ActionState } from './actions'

// Definisikan tipe data User yang diterima dari page
type UserProps = {
  id: string
  email: string
  full_name: string | null
  username: string | null
  role: string
}

const initialState: ActionState = {
  error: '',
  success: ''
}

export default function EditUserForm({ user }: { user: UserProps }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateUser, initialState)

  // Tutup modal jika sukses
  if (state?.success && isOpen) {
    setIsOpen(false)
    alert("Data berhasil diperbarui!")
    window.location.reload()
  }

  return (
    <>
      {/* Tombol Trigger (Icon Pencil) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-brand-yellow hover:text-brand-dark transition-colors mr-2"
        title="Edit User"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-brand-cream">
              <h3 className="font-heading font-bold text-lg text-brand-dark">Edit Data User</h3>
              <button onClick={() => setIsOpen(false)} className="text-brand-gray hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-4">
              {/* Hidden Input ID */}
              <input type="hidden" name="userId" value={user.id} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Role</label>
                    <select 
                      name="role" 
                      defaultValue={user.role}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-brand-blue"
                    >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Username</label>
                    <input 
                      name="username" 
                      type="text" 
                      defaultValue={user.username || ''}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                      required 
                    />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Nama Lengkap</label>
                <input 
                  name="fullName" 
                  type="text" 
                  defaultValue={user.full_name || ''}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Email</label>
                <input 
                  name="email" 
                  type="email" 
                  defaultValue={user.email}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                  required 
                />
              </div>

              <div className="space-y-1 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                <label className="text-xs font-bold text-brand-dark uppercase">Ganti Password (Opsional)</label>
                <input 
                  name="password" 
                  type="text" 
                  placeholder="Kosongkan jika tidak ingin diganti" 
                  className="w-full p-3 mt-1 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white" 
                />
                <p className="text-[10px] text-gray-500 mt-1">Isi hanya jika user lupa password / reset.</p>
              </div>

              {state?.error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {state.error}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                 <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-1 bg-brand-darkblue text-white font-bold py-4 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Update Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
'use client'

import { useState, useActionState } from 'react' // Perbaikan import
import { Plus, X } from 'lucide-react'
// Import tipe ActionState dari file actions
import { createUser, type ActionState } from './actions'


// Definisikan initialState sesuai tipe ActionState
const initialState: ActionState = {
  error: '',
  success: ''
}

export default function AddUserForm({ customTrigger, currentUserRole }: { customTrigger?: React.ReactNode, currentUserRole?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState('student')
  const [state, formAction, isPending] = useActionState(createUser, initialState)

  // Tutup modal otomatis jika sukses
  if (state?.success && isOpen) {
    setIsOpen(false)
    alert("User berhasil ditambahkan!") 
    window.location.reload() 
  }

  return (
    <>
    {customTrigger ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer w-full">
            {customTrigger}
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-brand-pink text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-dark transition-all shadow-lg shadow-brand-pink/20"
        >
          <Plus className="w-5 h-5" />
          Tambah User
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-brand-cream">
              <h3 className="font-heading font-bold text-lg text-brand-dark">Tambah User Baru</h3>
              <button onClick={() => setIsOpen(false)} className="text-brand-gray hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Role</label>
                    <select
                      name="role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-brand-blue"
                    >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                        {/* Hanya superadmin yang bisa tambah superadmin baru */}
                        {currentUserRole === 'superadmin' && (
                          <option value="superadmin">Superadmin</option>
                        )}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark uppercase">Username</label>
                    <input name="username" type="text" placeholder="username" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Nama Lengkap</label>
                <input name="fullName" type="text" placeholder="Contoh: Budi Santoso" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Email</label>
                <input name="email" type="email" placeholder="email@contoh.com" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Password</label>
                <input name="password" type="text" placeholder="Min. 6 karakter" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" required />
                <p className="text-[10px] text-gray-400">Password default, user bisa ganti nanti.</p>
              </div>

              {/* Kolom Institusi — hanya untuk Student */}
              {selectedRole === 'student' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Institusi</label>
                  <input
                    name="institusi"
                    type="text"
                    placeholder="Contoh: Universitas Indonesia"
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue"
                  />
                  <p className="text-[10px] text-gray-400">Opsional — asal institusi / universitas student.</p>
                </div>
              )}

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
                  {isPending ? "Menyimpan..." : "Simpan User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
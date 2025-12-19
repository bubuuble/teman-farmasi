'use client'

import { useActionState } from 'react'
import { Save } from 'lucide-react'
import { updateAdminProfile, type ActionState } from './actions'
import { type User } from '@supabase/supabase-js'

// 1. Definisikan Tipe Props agar tidak 'any'
type Props = {
  user: User | null
  profile: {
    full_name: string | null
  } | null
}

// 2. Initial State harus sesuai tipe ActionState
const initialState: ActionState = {
  error: '',
  success: ''
}

export default function UpdateProfileForm({ user, profile }: Props) {
  // 3. Hook sekarang aman karena tipe data cocok
  const [state, formAction, isPending] = useActionState(updateAdminProfile, initialState)

  return (
    <form action={formAction} className="space-y-4">
        <input type="hidden" name="userId" value={user?.id} />

        <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark uppercase">Email (Read Only)</label>
            <input 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
        </div>

        <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark uppercase">Nama Lengkap</label>
            <input 
                name="fullName"
                type="text" 
                defaultValue={profile?.full_name || ''}
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue"
                required
            />
        </div>

        {/* Notifikasi */}
        {state?.error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{state.error}</div>
        )}
        {state?.success && (
            <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">{state.success}</div>
        )}

        <div className="pt-4">
            <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-brand-darkblue text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
                {isPending ? "Menyimpan..." : (
                    <>
                        <Save className="w-4 h-4" /> Simpan Perubahan
                    </>
                )}
            </button>
        </div>
    </form>
  )
}
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RegisterState {
  error: string
}

/** Pendaftaran mandiri siswa (untuk checkout online). Role selalu 'student'. */
export async function register(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const fullName = String(formData.get('fullName') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const institusi = String(formData.get('institusi') || '').trim()
  const next = String(formData.get('next') || '')

  if (!fullName || !email || !password) return { error: 'Nama, email, dan password wajib diisi.' }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Format email tidak valid.' }
  if (password.length < 8) return { error: 'Password minimal 8 karakter.' }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'student', ...(institusi ? { institusi } : {}) },
  })

  if (error) {
    const exists = /already|registered|exists/i.test(error.message)
    return { error: exists ? 'Email sudah terdaftar. Silakan login.' : `Gagal mendaftar: ${error.message}` }
  }

  if (data.user) {
    const profileUpdate: Record<string, string> = { full_name: fullName, role: 'student' }
    if (institusi) profileUpdate.institusi = institusi
    const { error: profileErr } = await admin.from('profiles').update(profileUpdate).eq('id', data.user.id)
    if (profileErr) console.error('[Register] Gagal update profile:', profileErr.message)
  }

  // Langsung login supaya alur checkout tidak terputus.
  const supabase = await createClient()
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
  if (signInErr) redirect('/login')

  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/student/dashboard')
}

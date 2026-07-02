'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface LoginState {
  error: string
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = formData.get('identifier') as string // Bisa Email atau Username
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  
  let emailToLogin = identifier

  // LOGIK 1: Cek apakah input BUKAN email (tidak ada @)
  if (!identifier.includes('@')) {
    // Jika Username, panggil fungsi RPC yang kita buat di SQL tadi
    const { data: foundEmail, error: rpcError } = await supabase
      .rpc('get_email_by_username', { username_input: identifier })

    if (rpcError || !foundEmail) {
      return { error: 'Username tidak ditemukan.' }
    }

    // Jika ketemu, gunakan email asli untuk login
    emailToLogin = foundEmail
  }

  // LOGIK 2: Login standar Supabase (selalu butuh email)
  const { error } = await supabase.auth.signInWithPassword({
    email: emailToLogin,
    password,
  })

  if (error) {
    // Pesan error generik agar user tidak bingung
    return { error: 'Email/Username atau Password salah.' }
  }

  // LOGIK 3: Cek Role & Redirect
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (role === 'superadmin') redirect('/admin/dashboard')
    if (role === 'admin') redirect('/admin/dashboard')
    if (role === 'mentor') redirect('/mentor/dashboard')
    if (role === 'student') redirect('/student/dashboard')
  }

  redirect('/')
}
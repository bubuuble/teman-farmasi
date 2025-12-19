'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOutAction() {
  const supabase = await createClient()
  
  // 1. Perintah logout ke Supabase (Server-side)
  // Ini otomatis menghapus cookies HTTP-Only di browser
  await supabase.auth.signOut()

  // 2. Redirect ke halaman login
  redirect('/login')
}
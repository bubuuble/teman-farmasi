'use server'

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
// Import tipe data resmi dari Supabase
import { type AdminUserAttributes } from "@supabase/supabase-js"

// Definisikan tipe agar Type Safety terjamin di kedua sisi (Server & Client)
export type ActionState = {
  error?: string
  success?: string
}

// Gunakan tipe ActionState untuk prevState dan Return type
export async function createUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabaseAdmin = createAdminClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const username = formData.get('username') as string
  const role = formData.get('role') as string

  // Validasi Input
  if (!email || !password || !fullName || !role) {
    return { error: "Semua field wajib diisi!" }
  }

  // Guard: hanya superadmin yang boleh membuat akun superadmin
  if (role === 'superadmin') {
    const supabase = await createClient()
    const { data: { user: caller } } = await supabase.auth.getUser()
    if (caller) {
      const { data: callerProfile } = await supabase
        .from('profiles').select('role').eq('id', caller.id).single()
      if (callerProfile?.role !== 'superadmin') {
        return { error: "Tidak diizinkan: hanya Superadmin yang dapat membuat akun Superadmin." }
      }
    } else {
      return { error: "Sesi tidak valid." }
    }
  }

  // Create User
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role,
      username: username 
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Update Username Manual
  if (data.user && username) {
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ username: username })
      .eq('id', data.user.id)
    
    if (updateError) console.error("Gagal set username:", updateError)
  }

  revalidatePath('/admin/users')
  return { success: "User berhasil dibuat!" }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // Guard: cek role caller
  const { data: { user: caller } } = await supabase.auth.getUser()
  if (!caller) return { error: "Sesi tidak valid." }

  const { data: callerProfile } = await supabase
    .from('profiles').select('role').eq('id', caller.id).single()

  // Guard: cek role target yang akan dihapus
  const { data: targetProfile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', userId).single()

  // Admin biasa tidak boleh menghapus akun superadmin
  if (callerProfile?.role !== 'superadmin' && targetProfile?.role === 'superadmin') {
    return { error: "Tidak diizinkan: hanya Superadmin yang dapat menghapus akun Superadmin." }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: "User berhasil dihapus" }
}

export async function updateUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabaseAdmin = createAdminClient()
  
  const userId = formData.get('userId') as string
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const username = formData.get('username') as string
  const role = formData.get('role') as string
  const password = formData.get('password') as string // Opsional

  if (!userId || !email || !fullName || !role) {
    return { error: "Data utama tidak boleh kosong!" }
  }

  // Guard: hanya superadmin yang boleh mengubah ke/dari role superadmin
  {
    const supabase = await createClient()
    const { data: { user: caller } } = await supabase.auth.getUser()
    if (!caller) return { error: "Sesi tidak valid." }

    const { data: callerProfile } = await supabase
      .from('profiles').select('role').eq('id', caller.id).single()

    // Cek target user — admin tidak boleh edit akun superadmin
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles').select('role').eq('id', userId).single()

    if (callerProfile?.role !== 'superadmin') {
      // Tidak boleh set role jadi superadmin
      if (role === 'superadmin') {
        return { error: "Tidak diizinkan: hanya Superadmin yang dapat mengubah role menjadi Superadmin." }
      }
      // Tidak boleh edit akun yang rolenya superadmin
      if (targetProfile?.role === 'superadmin') {
        return { error: "Tidak diizinkan: hanya Superadmin yang dapat mengedit akun Superadmin." }
      }
    }
  }

  // 1. Siapkan object update untuk Auth
  const authUpdateData: AdminUserAttributes = {
    email,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role,
      username: username
    }
  }

  // Hanya update password jika admin mengisinya
  if (password && password.trim() !== '') {
    authUpdateData.password = password
  }

  // 2. Update Data di Auth Supabase
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId, 
    authUpdateData
  )

  if (authError) {
    return { error: "Gagal update Auth: " + authError.message }
  }

  // 3. Update Data di Tabel Profiles (Sync Manual)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name: fullName,
      role: role,
      username: username,
      email: email // Update email juga di profile
    })
    .eq('id', userId)

  if (profileError) {
    return { error: "Gagal update Profile: " + profileError.message }
  }

  revalidatePath('/admin/users')
  return { success: "Data user berhasil diperbarui!" }
}
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// 1. Definisikan Tipe State
export type ActionState = {
  error?: string
  success?: string
}

// 2. Gunakan tipe tersebut di parameter dan return type
export async function updateAdminProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const userId = formData.get('userId') as string

  if (!fullName || !userId) return { error: "Nama tidak boleh kosong" }

  // Update Profile
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId)

  if (error) return { error: error.message }

  // Update Auth Metadata (Sync nama di Auth user juga)
  await supabase.auth.updateUser({
    data: { full_name: fullName }
  })

  revalidatePath('/admin/settings')
  return { success: "Profil berhasil diperbarui!" }
}
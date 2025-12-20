// app/(main)/student/schedule/actions.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function studentCheckIn(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Cek apakah sesi ada dan is_open (Tanpa cek jam lagi)
  const { data: session } = await supabase
    .from('attendance_sessions')
    .select('is_open')
    .eq('id', sessionId)
    .single()

  if (!session) return { error: "Sesi tidak ditemukan" }
  
  if (!session.is_open) {
    return { error: "Maaf, absensi untuk sesi ini sudah ditutup oleh Mentor." }
  }

  // 2. Cek apakah sudah absen sebelumnya
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('id').eq('session_id', sessionId).eq('student_id', user.id).single()

  if (existing) return { error: "Kamu sudah mengisi absensi." }

  // 3. Simpan Kehadiran
  const { error } = await supabase.from('attendance_records').insert({
    session_id: sessionId,
    student_id: user.id,
    status: 'present',
    notes: 'Self check-in'
  })

  if (error) return { error: error.message }

  revalidatePath('/student/schedule')
  revalidatePath('/student/dashboard')
  return { success: "Berhasil! Kehadiran tercatat." }
}
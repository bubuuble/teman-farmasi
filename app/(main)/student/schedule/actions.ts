// app/(main)/student/schedule/actions.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function studentCheckIn(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: session } = await supabase
    .from('attendance_sessions')
    .select('date_time, title')
    .eq('id', sessionId)
    .single()

  if (!session) return { error: "Sesi tidak ditemukan" }

  // --- LOGIKA BATAS WAKTU 1 JAM ---
  const now = new Date();
  const sessionStart = new Date(session.date_time);
  const oneHourLater = new Date(sessionStart.getTime() + 60 * 60 * 1000);

  if (now < sessionStart) {
    return { error: "Sesi belum dimulai. Harap tunggu sesuai jadwal." }
  }

  if (now > oneHourLater) {
    return { error: "Absensi sudah ditutup. Batas waktu absen mandiri adalah 1 jam sejak sesi dimulai." }
  }

  // Cek apakah sudah absen...
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('id').eq('session_id', sessionId).eq('student_id', user.id).single()

  if (existing) return { error: "Kamu sudah mengisi absensi." }

  const { error } = await supabase.from('attendance_records').insert({
    session_id: sessionId,
    student_id: user.id,
    status: 'present',
    notes: 'Self check-in'
  })

  if (error) return { error: error.message }
  revalidatePath('/student/schedule')
  return { success: "Berhasil! Kehadiran tercatat." }
}
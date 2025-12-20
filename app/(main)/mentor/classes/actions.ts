'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ActionState = {
  error?: string
  success?: string
}

// --- BATCH ACTIONS ---

// app/(main)/mentor/actions.ts

export async function createBatch(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser() // Ambil ID User Login

  if (!user) return { error: "Unauthorized" }

  const classId = formData.get('classId') as string
  const name = formData.get('name') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string

  const { error } = await supabase.from('batches').insert({
    class_id: classId,
    mentor_id: user.id, // <--- PASTIKAN INI TERISI
    name,
    start_date: startDate,
    end_date: endDate
  })

  if (error) return { error: error.message }

  revalidatePath(`/mentor/classes/${classId}`)
  return { success: "Batch berhasil dibuat!" }
}

export async function deleteBatch(batchId: string, classId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('batches').delete().eq('id', batchId)
  
  if (error) return { error: error.message }
  
  revalidatePath(`/mentor/classes/${classId}`)
  return { success: "Batch dihapus" }
}

// --- SESSION ACTIONS (JADWAL) ---

export async function createSession(prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const batchId = formData.get('batchId') as string
  const classId = formData.get('classId') as string
  const title = formData.get('title') as string
  const date = formData.get('date') as string // Hanya ambil date

  const { error } = await supabase.from('attendance_sessions').insert({
    batch_id: batchId,
    title,
    date_time: date, // Supabase akan menganggap jam 00:00:00 secara otomatis
    zoom_link: formData.get('zoomLink'),
    is_open: true, // Otomatis terbuka
  })

  if (error) return { error: error.message }
  
  revalidatePath(`/mentor/classes/${classId}`)
  return { success: "Sesi berhasil dibuat!" }
}

export async function deleteSession(sessionId: string, classId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('attendance_sessions').delete().eq('id', sessionId)
  
  if (error) return { error: error.message }
  
  revalidatePath(`/mentor/classes/${classId}`)
  return { success: "Sesi dihapus" }
}

export async function updateBatch(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  
  const batchId = formData.get('batchId') as string
  const classId = formData.get('classId') as string // Penting untuk revalidate
  const name = formData.get('name') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string

  if (!batchId || !name || !startDate || !endDate) {
    return { error: "Semua data wajib diisi!" }
  }

  const { error } = await supabase.from('batches').update({
    name,
    start_date: startDate,
    end_date: endDate
  }).eq('id', batchId)

  if (error) return { error: error.message }

  revalidatePath(`/mentor/classes/${classId}`)
  return { success: "Batch berhasil diperbarui!" }
}

// --- UPDATE SESSION ---
export async function updateSession(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const sessionId = formData.get('sessionId') as string
  const classId = formData.get('classId') as string // Penting untuk revalidate
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const zoomLink = formData.get('zoomLink') as string

  if (!sessionId || !title || !date || !time) return { error: "Data wajib diisi" }

  // Gabungkan Date & Time
  const dateTime = new Date(`${date}T${time}:00`).toISOString()

  const { error } = await supabase.from('attendance_sessions').update({
    title,
    date_time: dateTime,
    zoom_link: zoomLink
  }).eq('id', sessionId)

  if (error) return { error: error.message }

  revalidatePath(`/mentor/classes/${classId}`)
  return { success: "Sesi berhasil diperbarui!" }
}

export async function submitMentorAttendance(sessionId: string, classId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('attendance_sessions')
    .update({ mentor_status: 'present' }) // Ubah status jadi hadir
    .eq('id', sessionId)

  if (error) return { error: error.message }
  
  // Sangat penting: Refresh path agar UI terupdate
  revalidatePath(`/mentor/classes/${classId}`) 
  return { success: "Berhasil melakukan absen mengajar!" }
}
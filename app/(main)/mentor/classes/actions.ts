'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { sendNewSessionNotification } from "@/lib/email"

export type ActionState = {
  error?: string
  success?: string
}

// --- SESSION ACTIONS (JADWAL) ---

export async function createSession(prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const classId = formData.get('classId') as string
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const zoomLink = formData.get('zoomLink') as string | null
  const subClassId = formData.get('subClassId') as string || null

  const { data: newSession, error } = await supabase.from('attendance_sessions').insert({
    class_id: classId,
    sub_class_id: subClassId,
    title,
    date_time: date,
    zoom_link: zoomLink,
    is_open: true,
  }).select('id').single()

  if (error) return { error: error.message }

  // Send email notifications asynchronously in the background
  after(async () => {
    try {
      const { data: classData } = await supabase
        .from('classes')
        .select('title, level')
        .eq('id', classId)
        .single()

      // Calculate session index
      const { data: classSessions } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('class_id', classId)
        .eq('sub_class_id', subClassId || null)
        .order('date_time', { ascending: true })

      const sessionIndex = classSessions ? classSessions.findIndex((s: any) => s.id === newSession?.id) + 1 : 1

      const { data: enrolledStudents } = await supabase
        .from('enrollments')
        .select('profiles ( email )')
        .eq('class_id', classId)
        .eq('sub_class_id', subClassId || null)

      const studentEmails = enrolledStudents
        ?.map((item: any) => item.profiles?.email)
        .filter((email: any): email is string => !!email) || []

      if (studentEmails.length > 0 && classData?.title) {
        await sendNewSessionNotification({
          toEmails: studentEmails,
          classTitle: classData.title,
          sessionTitle: title,
          sessionDateTime: date,
          zoomLink: zoomLink,
          sessionNumber: sessionIndex > 0 ? sessionIndex : undefined,
          totalSessions: classData.level || undefined,
        })
      }
    } catch (err) {
      console.error('Failed to send session notifications in background:', err)
    }
  })

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
  const zoomLink = formData.get('zoomLink') as string

  if (!sessionId || !title || !date) return { error: "Data wajib diisi" }

  const { error } = await supabase.from('attendance_sessions').update({
    title,
    date_time: date,
    zoom_link: zoomLink
  }).eq('id', sessionId)

  if (error) return { error: error.message }

  // Send update email notifications asynchronously in the background
  after(async () => {
    try {
      const { data: classData } = await supabase
        .from('classes')
        .select('title, level')
        .eq('id', classId)
        .single()

      // Calculate session index
      const { data: classSessions } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('class_id', classId)
        .order('date_time', { ascending: true })

      const sessionIndex = classSessions ? classSessions.findIndex((s: any) => s.id === sessionId) + 1 : 1

      const { data: enrolledStudents } = await supabase
        .from('enrollments')
        .select('profiles ( email )')
        .eq('class_id', classId)

      const studentEmails = enrolledStudents
        ?.map((item: any) => item.profiles?.email)
        .filter((email: any): email is string => !!email) || []

      if (studentEmails.length > 0 && classData?.title) {
        await sendNewSessionNotification({
          toEmails: studentEmails,
          classTitle: classData.title,
          sessionTitle: title,
          sessionDateTime: date,
          zoomLink: zoomLink,
          isRevision: true,
          sessionNumber: sessionIndex > 0 ? sessionIndex : undefined,
          totalSessions: classData.level || undefined,
        })
      }
    } catch (err) {
      console.error('Failed to send session update notifications in background:', err)
    }
  })

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

// --- RESOURCE / E-BOOK ACTIONS (MENTOR) ---

export async function uploadMentorResource(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const classId = formData.get('classId') as string
  const title = formData.get('title') as string
  const file = formData.get('file') as File
  const subClassId = formData.get('subClassId') as string || null

  if (!classId || !title || !file || file.size === 0) return { error: "Lengkapi data file!" }

  // Guard: pastikan mentor ini memang bertugas di kelas/subkelas tersebut
  const checkQuery = supabase
    .from('class_mentors')
    .select('id')
    .eq('class_id', classId)
    .eq('mentor_id', user.id)
  
  if (subClassId) {
    checkQuery.eq('sub_class_id', subClassId)
  }

  const { data: assignment } = await checkQuery.maybeSingle()

  if (!assignment) return { error: "Kamu tidak memiliki akses ke kelas ini." }

  // Validasi ukuran file (50MB)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return { error: `File terlalu besar! Maksimal 50MB, file Anda ${(file.size / 1024 / 1024).toFixed(2)}MB` }
  }

  // Upload ke storage
  const sanitizedFileName = file.name
    .replace(/\s+/g, '-')
    .replace(/['"&]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '')
  const fileName = `${Date.now()}_${sanitizedFileName}`
  const filePath = subClassId ? `${classId}/${subClassId}/${fileName}` : `${classId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('ebooks')
    .upload(filePath, file)

  if (uploadError) return { error: "Gagal upload: " + uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('ebooks')
    .getPublicUrl(filePath)

  const { error: dbError } = await supabase.from('class_resources').insert({
    class_id: classId,
    sub_class_id: subClassId,
    title,
    file_url: publicUrl,
    file_path: filePath,
  })

  if (dbError) return { error: dbError.message }

  revalidatePath(`/mentor/classes/${classId}`)
  return { success: "E-Book berhasil diupload!" }
}

export async function deleteMentorResource(resourceId: string, filePath: string, classId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Hapus dari storage
  const { error: storageError } = await supabase.storage
    .from('ebooks')
    .remove([filePath])

  if (storageError) return { error: "Gagal hapus file: " + storageError.message }

  // Hapus dari database
  const { error: dbError } = await supabase
    .from('class_resources')
    .delete()
    .eq('id', resourceId)

  if (dbError) return { error: dbError.message }

  revalidatePath(`/mentor/classes/${classId}`)
  return { success: "File dihapus" }
}
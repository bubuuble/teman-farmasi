'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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
  const time = formData.get('time') as string || null
  const studentId = formData.get('studentId') as string | null

  const { data: classInfo } = await supabase
    .from('classes')
    .select('title')
    .eq('id', classId)
    .single()

  const isPharmacore = classInfo?.title?.startsWith('Pharmacore')
  const isPharmacamp = classInfo?.title?.startsWith('Pharmacamp')
  const isPrivate = !isPharmacore

  const { data: newSession, error } = await supabase.from('attendance_sessions').insert({
    class_id: classId,
    sub_class_id: subClassId,
    title,
    date_time: date,
    session_time: time,
    zoom_link: isPharmacamp ? null : zoomLink,
    is_open: true,
  }).select('id').single()

  if (error) return { error: error.message }

  // Jika kelas private, simpan relasi many-to-many ke session_students
  if (isPrivate && studentId) {
    const { error: ssError } = await supabase
      .from('session_students')
      .insert({
        session_id: newSession?.id,
        student_id: studentId,
      })
    if (ssError) return { error: ssError.message }
  }

  // Send email notifications asynchronously in the background
  // Gunakan adminClient agar tidak bergantung pada session cookies yang bisa expired setelah response dikirim
  after(async () => {
    try {
      const adminSupabase = createAdminClient()

      const { data: classData } = await adminSupabase
        .from('classes')
        .select('title, level')
        .eq('id', classId)
        .single()

      let sessionIndex = 1
      let studentEmails: string[] = []

      if (isPrivate && studentId) {
        // Ambil semua session_id yang diassign ke student ini, urutkan berdasarkan date_time
        const { data: studentSessions } = await adminSupabase
          .from('session_students')
          .select('session_id, attendance_sessions(date_time)')
          .eq('student_id', studentId)
        
        const sorted = (studentSessions || [])
          .map((ss: any) => ({
            id: ss.session_id,
            dateTime: new Date(ss.attendance_sessions?.date_time || 0)
          }))
          .sort((a: any, b: any) => a.dateTime.getTime() - b.dateTime.getTime())

        sessionIndex = sorted.findIndex((s: any) => s.id === newSession?.id) + 1

        const { data: assigned } = await adminSupabase
          .from('profiles')
          .select('email')
          .eq('id', studentId)
          .single()
        if (assigned?.email) {
          studentEmails = [assigned.email]
        }
      } else {
        // Calculate session index for public classes
        let sessionQuery = adminSupabase
          .from('attendance_sessions')
          .select('id')
          .eq('class_id', classId)
          .order('date_time', { ascending: true })

        if (subClassId) {
          sessionQuery = sessionQuery.eq('sub_class_id', subClassId)
        } else {
          sessionQuery = sessionQuery.is('sub_class_id', null)
        }

        const { data: classSessions } = await sessionQuery
        sessionIndex = classSessions ? classSessions.findIndex((s: any) => s.id === newSession?.id) + 1 : 1

        let enrollQuery = adminSupabase
          .from('enrollments')
          .select('profiles ( email )')
          .eq('class_id', classId)

        if (subClassId) {
          enrollQuery = enrollQuery.eq('sub_class_id', subClassId)
        } else {
          enrollQuery = enrollQuery.is('sub_class_id', null)
        }

        const { data: enrolledStudents } = await enrollQuery
        studentEmails = enrolledStudents
          ?.map((item: any) => item.profiles?.email)
          .filter((email: any): email is string => !!email) || []
      }

      console.log(`[Email] Mengirim notifikasi sesi baru ke ${studentEmails.length} student(s) (private: ${isPrivate}, studentId: ${studentId})...`)

      if (studentEmails.length > 0 && classData?.title) {
        const result = await sendNewSessionNotification({
          toEmails: studentEmails,
          classTitle: classData.title,
          sessionTitle: title,
          sessionDateTime: date,
          zoomLink: isPharmacamp ? null : zoomLink,
          sessionNumber: sessionIndex > 0 ? sessionIndex : undefined,
          totalSessions: classData.level || undefined,
          sessionTime: time,
        })
        console.log('[Email] Hasil pengiriman:', result)
      } else {
        console.log('[Email] Tidak ada student terdaftar atau data kelas tidak ditemukan, email tidak dikirim.')
      }
    } catch (err) {
      console.error('[Email] Gagal mengirim notifikasi sesi baru:', err)
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
  const time = formData.get('time') as string || null
  const studentId = formData.get('studentId') as string | null

  if (!sessionId || !title || !date) return { error: "Data wajib diisi" }

  const { data: classInfo } = await supabase
    .from('classes')
    .select('title')
    .eq('id', classId)
    .single()

  const isPharmacore = classInfo?.title?.startsWith('Pharmacore')
  const isPharmacamp = classInfo?.title?.startsWith('Pharmacamp')
  const isPrivate = !isPharmacore

  const { error } = await supabase.from('attendance_sessions').update({
    title,
    date_time: date,
    session_time: time,
    zoom_link: isPharmacamp ? null : zoomLink
  }).eq('id', sessionId)

  if (error) return { error: error.message }

  // Jika kelas private, update relasi many-to-many ke session_students
  if (isPrivate) {
    // Hapus relasi lama
    await supabase.from('session_students').delete().eq('session_id', sessionId)

    // Insert relasi baru
    if (studentId) {
      const { error: ssError } = await supabase
        .from('session_students')
        .insert({
          session_id: sessionId,
          student_id: studentId,
        })
      if (ssError) return { error: ssError.message }
    }
  }

  // Send update email notifications asynchronously in the background
  // Gunakan adminClient agar tidak bergantung pada session cookies yang bisa expired setelah response dikirim
  after(async () => {
    try {
      const adminSupabase = createAdminClient()

      // Ambil sub_class_id dari sesi yang di-update agar filter konsisten
      const { data: sessionData } = await adminSupabase
        .from('attendance_sessions')
        .select('sub_class_id')
        .eq('id', sessionId)
        .single()

      const subClassId = sessionData?.sub_class_id ?? null

      const { data: classData } = await adminSupabase
        .from('classes')
        .select('title, level')
        .eq('id', classId)
        .single()

      let sessionIndex = 1
      let studentEmails: string[] = []

      if (isPrivate && studentId) {
        // Ambil semua session_id yang diassign ke student ini, urutkan berdasarkan date_time
        const { data: studentSessions } = await adminSupabase
          .from('session_students')
          .select('session_id, attendance_sessions(date_time)')
          .eq('student_id', studentId)
        
        const sorted = (studentSessions || [])
          .map((ss: any) => ({
            id: ss.session_id,
            dateTime: new Date(ss.attendance_sessions?.date_time || 0)
          }))
          .sort((a: any, b: any) => a.dateTime.getTime() - b.dateTime.getTime())

        sessionIndex = sorted.findIndex((s: any) => s.id === sessionId) + 1

        const { data: assigned } = await adminSupabase
          .from('profiles')
          .select('email')
          .eq('id', studentId)
          .single()
        if (assigned?.email) {
          studentEmails = [assigned.email]
        }
      } else {
        // Calculate session index — filter berdasarkan sub_class_id yang sama
        let sessionIndexQuery = adminSupabase
          .from('attendance_sessions')
          .select('id')
          .eq('class_id', classId)
          .order('date_time', { ascending: true })

        if (subClassId) {
          sessionIndexQuery = sessionIndexQuery.eq('sub_class_id', subClassId)
        } else {
          sessionIndexQuery = sessionIndexQuery.is('sub_class_id', null)
        }

        const { data: classSessions } = await sessionIndexQuery
        sessionIndex = classSessions ? classSessions.findIndex((s: any) => s.id === sessionId) + 1 : 1

        // Ambil student yang enrolled di sub_class yang sama dengan sesi ini
        let enrollQuery = adminSupabase
          .from('enrollments')
          .select('profiles ( email )')
          .eq('class_id', classId)

        if (subClassId) {
          enrollQuery = enrollQuery.eq('sub_class_id', subClassId)
        } else {
          enrollQuery = enrollQuery.is('sub_class_id', null)
        }

        const { data: enrolledStudents } = await enrollQuery

        studentEmails = enrolledStudents
          ?.map((item: any) => item.profiles?.email)
          .filter((email: any): email is string => !!email) || []
      }

      console.log(`[Email] Mengirim notifikasi revisi sesi ke ${studentEmails.length} student(s) (sub_class_id: ${subClassId ?? 'null'}, private: ${isPrivate}, studentId: ${studentId})...`)

      if (studentEmails.length > 0 && classData?.title) {
        const result = await sendNewSessionNotification({
          toEmails: studentEmails,
          classTitle: classData.title,
          sessionTitle: title,
          sessionDateTime: date,
          zoomLink: isPharmacamp ? null : zoomLink,
          isRevision: true,
          sessionNumber: sessionIndex > 0 ? sessionIndex : undefined,
          totalSessions: classData.level || undefined,
          sessionTime: time,
        })
        console.log('[Email] Hasil pengiriman revisi:', result)
      } else {
        console.log('[Email] Tidak ada student terdaftar atau data kelas tidak ditemukan, email tidak dikirim.')
      }
    } catch (err) {
      console.error('[Email] Gagal mengirim notifikasi revisi sesi:', err)
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
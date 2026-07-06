'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ActionState = {
  error?: string
  success?: string
}

export async function createClass(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const level = formData.get('level') as string

  if (!title) return { error: "Pilih program terlebih dahulu!" }

  const { error } = await supabase.from('classes').insert({
    title,
    description,
    price: Number(price) || 0,
    level
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Kelas berhasil dibuat!" }
}

export async function updateClass(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const level = formData.get('level') as string

  const { error } = await supabase.from('classes').update({
    title,
    description,
    price: Number(price) || 0,
    level
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Kelas berhasil diupdate!" }
}

export async function deleteClass(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('classes').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/classes', 'layout')
  return { success: "Kelas dihapus" }
}

// --- FITUR ASSIGN MENTOR ---

// 1. Assign Mentor ke Kelas
export async function assignMentor(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  
  const classId = formData.get('classId') as string
  const mentorId = formData.get('mentorId') as string
  const subClassId = formData.get('subClassId') as string || null

  if (!classId || !mentorId) return { error: "Pilih mentor terlebih dahulu!" }

  const { error } = await supabase.from('class_mentors').insert({
    class_id: classId,
    mentor_id: mentorId,
    sub_class_id: subClassId
  })

  if (error) {
    if (error.code === '23505') return { error: "Mentor ini sudah ditugaskan." }
    return { error: error.message }
  }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Mentor berhasil ditugaskan!" }
}

// 2. Hapus Mentor dari Kelas
export async function removeMentor(assignmentId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('class_mentors').delete().eq('id', assignmentId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/classes', 'layout')
  return { success: "Mentor dihapus dari kelas" }
}

// --- FITUR ASSIGN STUDENT (ENROLLMENT) ---

// 1. Masukkan Siswa ke Kelas
export async function assignStudent(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  
  const classId = formData.get('classId') as string
  const studentId = formData.get('studentId') as string
  const subClassId = formData.get('subClassId') as string || null

  if (!classId || !studentId) return { error: "Pilih student terlebih dahulu!" }

  const { error } = await supabase.from('enrollments').insert({
    class_id: classId,
    student_id: studentId,
    sub_class_id: subClassId,
    status: 'active'
  })

  if (error) {
    if (error.code === '23505') return { error: "Student ini sudah terdaftar." }
    return { error: error.message }
  }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Student berhasil didaftarkan!" }
}

export async function assignMultipleStudents(classId: string, studentIds: string[], subClassId?: string): Promise<ActionState> {
  const supabase = await createClient()

  if (!classId || !studentIds || studentIds.length === 0) {
    return { error: "Pilih minimal 1 student!" }
  }

  const enrollmentsToInsert = studentIds.map(studentId => ({
    class_id: classId,
    student_id: studentId,
    sub_class_id: subClassId || null,
    status: 'active'
  }))

  const { error } = await supabase
    .from('enrollments')
    .upsert(enrollmentsToInsert, { onConflict: 'class_id,student_id' })

  if (error) {
    if (error.code === '23505') return { error: "Salah satu atau beberapa student sudah terdaftar." }
    return { error: error.message }
  }

  revalidatePath('/admin/classes', 'layout')
  return { success: `${studentIds.length} student berhasil didaftarkan!` }
}

// 2. Keluarkan Siswa dari Kelas
export async function removeStudent(enrollmentId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/classes', 'layout')
  return { success: "Student dikeluarkan dari kelas" }
}

export async function uploadResource(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const classId = formData.get('classId') as string
  const title = formData.get('title') as string
  const file = formData.get('file') as File
  const subClassId = formData.get('subClassId') as string || null

  if (!classId || !title || !file) return { error: "Lengkapi data file!" }

  console.log(`[Upload] Memulai upload file: ${file.name}`)
  console.log(`[Upload] Ukuran file: ${(file.size / 1024 / 1024).toFixed(2)} MB`)
  console.log(`[Upload] Class ID: ${classId}`)
  console.log(`[Upload] Tipe file: ${file.type}`)

  // Validasi ukuran file di server (safety check)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
    console.error(`[Upload] File terlalu besar: ${fileSizeMB}MB (max: 50MB)`)
    return { error: `File terlalu besar! Maksimal 50MB, file Anda ${fileSizeMB}MB` }
  }

  // 1. Upload ke Supabase Storage
  const sanitizedFileName = file.name
    .replace(/\s+/g, '-')           
    .replace(/['"&]/g, '')          
    .replace(/[^a-zA-Z0-9.\-_]/g, '') 
  const fileName = `${Date.now()}_${sanitizedFileName}`
  const filePath = subClassId ? `${classId}/${subClassId}/${fileName}` : `${classId}/${fileName}`

  console.log(`[Upload] Sanitized filename: ${sanitizedFileName}`)
  console.log(`[Upload] File path: ${filePath}`)

  const { error: uploadError } = await supabase.storage
    .from('ebooks')
    .upload(filePath, file)

  if (uploadError) {
    console.error(`[Upload] Error: ${uploadError.message}`)
    return { error: "Gagal upload: " + uploadError.message }
  }

  console.log(`[Upload] Upload ke storage berhasil`)

  // 2. Dapatkan Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('ebooks')
    .getPublicUrl(filePath)

  console.log(`[Upload] Public URL: ${publicUrl}`)

  // 3. Simpan ke Database
  const { error: dbError } = await supabase.from('class_resources').insert({
    class_id: classId,
    sub_class_id: subClassId,
    title: title,
    file_url: publicUrl,
    file_path: filePath
  })

  if (dbError) {
    console.error(`[Upload] Database error: ${dbError.message}`)
    return { error: dbError.message }
  }

  console.log(`[Upload] File berhasil disimpan ke database`)

  revalidatePath('/admin/classes', 'layout')
  return { success: "E-Book berhasil diupload!" }
}

export async function deleteResource(resourceId: string, filePath: string) {
  const supabase = await createClient()

  // 1. Hapus dari Storage
  const { error: storageError } = await supabase.storage
    .from('ebooks')
    .remove([filePath])

  if (storageError) return { error: "Gagal hapus file: " + storageError.message }

  // 2. Hapus dari Database
  const { error: dbError } = await supabase
    .from('class_resources')
    .delete()
    .eq('id', resourceId)

  if (dbError) return { error: dbError.message }

  revalidatePath('/admin/classes', 'layout')
  return { success: "File dihapus" }
}

// --- SUB CLASS CRUD ACTIONS ---

export async function createSubClass(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const classId = formData.get('classId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string || null
  const sessionOffset = parseInt(formData.get('session_offset') as string || '0', 10) || 0

  if (!classId || !title) return { error: "Nama sub kelas wajib diisi!" }

  const { error } = await supabase.from('sub_classes').insert({
    class_id: classId,
    title: title,
    description: description,
    session_offset: sessionOffset,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Sub kelas berhasil dibuat!" }
}

export async function updateSubClass(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string || null
  const sessionOffset = parseInt(formData.get('session_offset') as string || '0', 10) || 0

  if (!id || !title) return { error: "Nama sub kelas wajib diisi!" }

  const { error } = await supabase.from('sub_classes').update({
    title: title,
    description: description,
    session_offset: sessionOffset,
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Sub kelas berhasil diperbarui!" }
}

export async function deleteSubClass(id: string): Promise<ActionState> {
  const supabase = await createClient()

  const { error } = await supabase.from('sub_classes').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Sub kelas berhasil dihapus!" }
}

// --- MENTOR-STUDENT ASSIGNMENT ACTIONS ---

// Assign student ke mentor di dalam sub kelas
export async function assignStudentToMentor(
  mentorId: string,
  studentId: string,
  classId: string,
  subClassId: string
): Promise<ActionState> {
  const supabase = await createClient()

  if (!mentorId || !studentId || !classId || !subClassId) {
    return { error: "Data tidak lengkap!" }
  }

  const { error } = await supabase.from('mentor_student_assignments').insert({
    mentor_id: mentorId,
    student_id: studentId,
    class_id: classId,
    sub_class_id: subClassId,
  })

  if (error) {
    if (error.code === '23505') return { error: "Student ini sudah di-assign ke mentor tersebut." }
    return { error: error.message }
  }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Student berhasil di-assign ke mentor!" }
}

// Assign multiple students ke mentor di dalam sub kelas
export async function assignMultipleStudentsToMentor(
  mentorId: string,
  studentIds: string[],
  classId: string,
  subClassId: string
): Promise<ActionState> {
  const supabase = await createClient()

  if (!mentorId || !studentIds.length || !classId || !subClassId) {
    return { error: "Data tidak lengkap!" }
  }

  const rows = studentIds.map(studentId => ({
    mentor_id: mentorId,
    student_id: studentId,
    class_id: classId,
    sub_class_id: subClassId,
  }))

  const { error } = await supabase.from('mentor_student_assignments').insert(rows)

  if (error) {
    if (error.code === '23505') return { error: "Salah satu student sudah di-assign ke mentor ini." }
    return { error: error.message }
  }

  revalidatePath('/admin/classes', 'layout')
  return { success: `${studentIds.length} student berhasil di-assign!` }
}

// Enroll student ke sub kelas DAN assign ke mentor sekaligus (1 step)
export async function enrollAndAssignToMentor(
  mentorId: string,
  studentIds: string[],
  classId: string,
  subClassId: string
): Promise<ActionState> {
  const supabase = await createClient()

  if (!mentorId || !studentIds.length || !classId || !subClassId) {
    return { error: "Data tidak lengkap!" }
  }

  // Step 1: Upsert enrollment ke sub kelas (jika sudah enrolled di kelas lain, pindahkan sub_class_id-nya)
  const enrollments = studentIds.map(studentId => ({
    class_id: classId,
    student_id: studentId,
    sub_class_id: subClassId,
    status: 'active',
  }))

  const { error: enrollError } = await supabase
    .from('enrollments')
    .upsert(enrollments, { onConflict: 'class_id,student_id' })

  if (enrollError) return { error: "Gagal enroll student: " + enrollError.message }

  // Step 2: Upsert mentor-student assignment (hapus assignment lama jika ada, lalu insert baru)
  // Hapus assignment lama untuk student-student ini di sub kelas yang sama
  const { error: deleteError } = await supabase
    .from('mentor_student_assignments')
    .delete()
    .eq('class_id', classId)
    .eq('sub_class_id', subClassId)
    .in('student_id', studentIds)

  if (deleteError) return { error: "Gagal reset assignment lama: " + deleteError.message }

  // Insert assignment baru
  const assignments = studentIds.map(studentId => ({
    mentor_id: mentorId,
    student_id: studentId,
    class_id: classId,
    sub_class_id: subClassId,
  }))

  const { error: assignError } = await supabase
    .from('mentor_student_assignments')
    .insert(assignments)

  if (assignError) return { error: "Gagal assign ke mentor: " + assignError.message }

  revalidatePath('/admin/classes', 'layout')
  return { success: `${studentIds.length} student berhasil di-enroll dan di-assign ke mentor!` }
}

// Hapus assignment mentor-student
export async function removeStudentFromMentor(assignmentId: string): Promise<ActionState> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('mentor_student_assignments')
    .delete()
    .eq('id', assignmentId)

  if (error) return { error: error.message }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Assignment dihapus." }
}

// Pindahkan student dari satu mentor ke mentor lain dalam sub kelas yang sama
export async function reassignStudentMentor(
  oldAssignmentId: string,
  newMentorId: string,
  studentId: string,
  classId: string,
  subClassId: string
): Promise<ActionState> {
  const supabase = await createClient()

  // Hapus lama
  const { error: deleteError } = await supabase
    .from('mentor_student_assignments')
    .delete()
    .eq('id', oldAssignmentId)

  if (deleteError) return { error: deleteError.message }

  // Insert baru
  const { error: insertError } = await supabase.from('mentor_student_assignments').insert({
    mentor_id: newMentorId,
    student_id: studentId,
    class_id: classId,
    sub_class_id: subClassId,
  })

  if (insertError) return { error: insertError.message }

  revalidatePath('/admin/classes', 'layout')
  return { success: "Student berhasil dipindahkan ke mentor lain!" }
}
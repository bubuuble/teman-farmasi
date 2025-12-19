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

  if (!title) return { error: "Judul kelas wajib diisi!" }

  const { error } = await supabase.from('classes').insert({
    title,
    description,
    price: Number(price) || 0,
    level
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/classes')
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

  revalidatePath('/admin/classes')
  return { success: "Kelas berhasil diupdate!" }
}

export async function deleteClass(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('classes').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/classes')
  return { success: "Kelas dihapus" }
}

// --- FITUR ASSIGN MENTOR ---

// 1. Assign Mentor ke Kelas
export async function assignMentor(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  
  const classId = formData.get('classId') as string
  const mentorId = formData.get('mentorId') as string

  if (!classId || !mentorId) return { error: "Pilih mentor terlebih dahulu!" }

  const { error } = await supabase.from('class_mentors').insert({
    class_id: classId,
    mentor_id: mentorId
  })

  if (error) {
    if (error.code === '23505') return { error: "Mentor ini sudah ada di kelas tersebut." }
    return { error: error.message }
  }

  revalidatePath('/admin/classes')
  return { success: "Mentor berhasil ditugaskan!" }
}

// 2. Hapus Mentor dari Kelas
export async function removeMentor(assignmentId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('class_mentors').delete().eq('id', assignmentId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/classes')
  return { success: "Mentor dihapus dari kelas" }
}

// --- FITUR ASSIGN STUDENT (ENROLLMENT) ---

// 1. Masukkan Siswa ke Kelas
export async function assignStudent(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  
  const classId = formData.get('classId') as string
  const studentId = formData.get('studentId') as string

  if (!classId || !studentId) return { error: "Pilih siswa terlebih dahulu!" }

  const { error } = await supabase.from('enrollments').insert({
    class_id: classId,
    student_id: studentId,
    status: 'active'
  })

  if (error) {
    if (error.code === '23505') return { error: "Siswa ini sudah terdaftar di kelas tersebut." }
    return { error: error.message }
  }

  revalidatePath('/admin/classes')
  return { success: "Siswa berhasil didaftarkan!" }
}

// 2. Keluarkan Siswa dari Kelas
export async function removeStudent(enrollmentId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/classes')
  return { success: "Siswa dikeluarkan dari kelas" }
}

export async function uploadResource(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const classId = formData.get('classId') as string
  const title = formData.get('title') as string
  const file = formData.get('file') as File

  if (!classId || !title || !file) return { error: "Lengkapi data file!" }

  // 1. Upload ke Supabase Storage
  // Nama file dibuat unik dengan timestamp
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '-')}`
  const filePath = `${classId}/${fileName}` // Folder per classId

  const { error: uploadError } = await supabase.storage
    .from('ebooks')
    .upload(filePath, file)

  if (uploadError) return { error: "Gagal upload: " + uploadError.message }

  // 2. Dapatkan Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('ebooks')
    .getPublicUrl(filePath)

  // 3. Simpan ke Database
  const { error: dbError } = await supabase.from('class_resources').insert({
    class_id: classId,
    title: title,
    file_url: publicUrl,
    file_path: filePath
  })

  if (dbError) return { error: dbError.message }

  revalidatePath('/admin/classes')
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

  revalidatePath('/admin/classes')
  return { success: "File dihapus" }
}
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ActionState = {
  error?: string
  success?: string
}

// ----------------------------------------------------
// KATEGORI SOAL
// ----------------------------------------------------
export async function createCategory(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Silakan login terlebih dahulu" }

  const name = formData.get('name') as string
  const program_type = formData.get('program_type') as string
  const description = formData.get('description') as string

  if (!name?.trim()) return { error: "Nama kategori wajib diisi" }
  if (!program_type) return { error: "Pilih jenis program (Masuk Apoteker / UKMPPAI)" }

  const { error } = await supabase.from('question_categories').insert({
    name: name.trim(),
    program_type,
    description: description?.trim() || null,
    created_by: user.id
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/question-bank')
  revalidatePath('/mentor/question-bank')
  return { success: "Kategori soal berhasil ditambahkan!" }
}

export async function updateCategory(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const program_type = formData.get('program_type') as string
  const description = formData.get('description') as string

  if (!id) return { error: "ID kategori tidak valid" }
  if (!name?.trim()) return { error: "Nama kategori wajib diisi" }

  const { error } = await supabase.from('question_categories').update({
    name: name.trim(),
    program_type,
    description: description?.trim() || null
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/question-bank')
  revalidatePath(`/admin/question-bank/${id}`)
  revalidatePath('/mentor/question-bank')
  return { success: "Kategori berhasil diperbarui!" }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('question_categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/question-bank')
  revalidatePath('/mentor/question-bank')
  return { success: true }
}

// ----------------------------------------------------
// SOAL & OPSI
// ----------------------------------------------------
export async function createQuestion(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Silakan login terlebih dahulu" }

  const category_id = formData.get('category_id') as string
  const question_text = formData.get('question_text') as string
  const question_image_url = formData.get('question_image_url') as string
  const explanation = formData.get('explanation') as string
  const difficulty = (formData.get('difficulty') as string) || 'medium'
  const correct_option = formData.get('correct_option') as string // 'A', 'B', 'C', 'D', 'E'

  if (!category_id) return { error: "Kategori soal wajib dipilih" }
  if (!question_text?.trim()) return { error: "Isi teks pertanyaan wajib diisi" }
  if (!correct_option) return { error: "Pilih salah satu opsi jawaban yang benar (A/B/C/D/E)" }

  // 1. Simpan soal
  const { data: questionData, error: qErr } = await supabase.from('questions').insert({
    category_id,
    question_text: question_text.trim(),
    question_image_url: question_image_url?.trim() || null,
    explanation: explanation?.trim() || null,
    difficulty,
    created_by: user.id
  }).select('id').single()

  if (qErr || !questionData) return { error: qErr?.message || "Gagal menyimpan soal" }

  // 2. Simpan 5 opsi jawaban (A - E)
  const labels = ['A', 'B', 'C', 'D', 'E']
  const optionsToInsert = labels.map(label => {
    const text = (formData.get(`option_${label}`) as string) || ''
    return {
      question_id: questionData.id,
      label,
      option_text: text.trim(),
      is_correct: label === correct_option
    }
  })

  // Pastikan minimal opsi A, B, C, D terisi
  const emptyRequired = optionsToInsert.slice(0, 4).some(o => !o.option_text)
  if (emptyRequired) {
    // Rollback soal jika opsi belum lengkap
    await supabase.from('questions').delete().eq('id', questionData.id)
    return { error: "Minimal opsi jawaban A sampai D wajib diisi!" }
  }

  const { error: optErr } = await supabase.from('question_options').insert(
    optionsToInsert.filter(o => o.option_text)
  )

  if (optErr) {
    await supabase.from('questions').delete().eq('id', questionData.id)
    return { error: optErr.message }
  }

  revalidatePath(`/admin/question-bank/${category_id}`)
  revalidatePath('/admin/question-bank')
  revalidatePath(`/mentor/question-bank/${category_id}`)
  return { success: "Soal berhasil ditambahkan ke Bank Soal!" }
}

export async function updateQuestion(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const category_id = formData.get('category_id') as string
  const question_text = formData.get('question_text') as string
  const question_image_url = formData.get('question_image_url') as string
  const explanation = formData.get('explanation') as string
  const difficulty = (formData.get('difficulty') as string) || 'medium'
  const correct_option = formData.get('correct_option') as string

  if (!id) return { error: "ID soal tidak valid" }
  if (!question_text?.trim()) return { error: "Isi teks pertanyaan wajib diisi" }
  if (!correct_option) return { error: "Pilih jawaban benar" }

  // 1. Update pertanyaan
  const { error: qErr } = await supabase.from('questions').update({
    question_text: question_text.trim(),
    question_image_url: question_image_url?.trim() || null,
    explanation: explanation?.trim() || null,
    difficulty,
    updated_at: new Date().toISOString()
  }).eq('id', id)

  if (qErr) return { error: qErr.message }

  // 2. Update opsi (hapus lalu insert ulang)
  await supabase.from('question_options').delete().eq('question_id', id)

  const labels = ['A', 'B', 'C', 'D', 'E']
  const optionsToInsert = labels.map(label => {
    const text = (formData.get(`option_${label}`) as string) || ''
    return {
      question_id: id,
      label,
      option_text: text.trim(),
      is_correct: label === correct_option
    }
  }).filter(o => o.option_text)

  const { error: optErr } = await supabase.from('question_options').insert(optionsToInsert)
  if (optErr) return { error: optErr.message }

  revalidatePath(`/admin/question-bank/${category_id}`)
  revalidatePath('/admin/question-bank')
  revalidatePath(`/mentor/question-bank/${category_id}`)
  return { success: "Soal berhasil diperbarui!" }
}

export async function deleteQuestion(id: string, categoryId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/admin/question-bank/${categoryId}`)
  revalidatePath('/admin/question-bank')
  revalidatePath(`/mentor/question-bank/${categoryId}`)
  return { success: true }
}

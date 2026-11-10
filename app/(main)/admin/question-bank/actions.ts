'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type ActionState = {
  error?: string
  success?: string
}

async function verifyStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Silakan login terlebih dahulu" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isStaff = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'mentor'
  if (!isStaff) return { error: "Akses ditolak. Hanya Admin dan Mentor yang diizinkan." }

  return { user, adminDb: createAdminClient() }
}

// ----------------------------------------------------
// KATEGORI SOAL
// ----------------------------------------------------
export async function createCategory(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const name = formData.get('name') as string
  const program_type = formData.get('program_type') as string
  const description = formData.get('description') as string

  if (!name?.trim()) return { error: "Nama kategori wajib diisi" }
  if (!program_type) return { error: "Pilih jenis program (Masuk Apoteker / UKMPPAI)" }

  const { error } = await auth.adminDb.from('question_categories').insert({
    name: name.trim(),
    program_type,
    description: description?.trim() || null,
    created_by: auth.user.id
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/question-bank')
  revalidatePath('/mentor/question-bank')
  return { success: "Kategori soal berhasil ditambahkan!" }
}

export async function updateCategory(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await verifyStaff()
  if (auth.error || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const program_type = formData.get('program_type') as string
  const description = formData.get('description') as string

  if (!id) return { error: "ID kategori tidak valid" }
  if (!name?.trim()) return { error: "Nama kategori wajib diisi" }

  const { error } = await auth.adminDb.from('question_categories').update({
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
  const auth = await verifyStaff()
  if (auth.error || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const { error } = await auth.adminDb.from('question_categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/question-bank')
  revalidatePath('/mentor/question-bank')
  return { success: true }
}

// ----------------------------------------------------
// SOAL & OPSI
// ----------------------------------------------------
export async function createQuestion(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const category_id = formData.get('category_id') as string
  const question_text = formData.get('question_text') as string
  const question_image_url = formData.get('question_image_url') as string
  const explanation = formData.get('explanation') as string
  const difficulty = (formData.get('difficulty') as string) || 'medium'
  const correct_option = formData.get('correct_option') as string

  if (!category_id) return { error: "Kategori soal wajib dipilih" }
  if (!question_text?.trim()) return { error: "Isi teks pertanyaan wajib diisi" }
  if (!correct_option) return { error: "Pilih salah satu opsi jawaban yang benar (A/B/C/D/E)" }

  // 1. Simpan soal
  const { data: questionData, error: qErr } = await auth.adminDb.from('questions').insert({
    category_id,
    question_text: question_text.trim(),
    question_image_url: question_image_url?.trim() || null,
    explanation: explanation?.trim() || null,
    difficulty,
    created_by: auth.user.id
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
    await auth.adminDb.from('questions').delete().eq('id', questionData.id)
    return { error: "Minimal opsi jawaban A sampai D wajib diisi!" }
  }

  const { error: optErr } = await auth.adminDb.from('question_options').insert(
    optionsToInsert.filter(o => o.option_text)
  )

  if (optErr) {
    await auth.adminDb.from('questions').delete().eq('id', questionData.id)
    return { error: optErr.message }
  }

  revalidatePath(`/admin/question-bank/${category_id}`)
  revalidatePath('/admin/question-bank')
  revalidatePath(`/mentor/question-bank/${category_id}`)
  return { success: "Soal berhasil ditambahkan ke Bank Soal!" }
}

export async function updateQuestion(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await verifyStaff()
  if (auth.error || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

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
  const { error: qErr } = await auth.adminDb.from('questions').update({
    question_text: question_text.trim(),
    question_image_url: question_image_url?.trim() || null,
    explanation: explanation?.trim() || null,
    difficulty,
    updated_at: new Date().toISOString()
  }).eq('id', id)

  if (qErr) return { error: qErr.message }

  // 2. Update opsi (hapus lalu insert ulang)
  await auth.adminDb.from('question_options').delete().eq('question_id', id)

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

  const { error: optErr } = await auth.adminDb.from('question_options').insert(optionsToInsert)
  if (optErr) return { error: optErr.message }

  revalidatePath(`/admin/question-bank/${category_id}`)
  revalidatePath('/admin/question-bank')
  revalidatePath(`/mentor/question-bank/${category_id}`)
  return { success: "Soal berhasil diperbarui!" }
}

export async function deleteQuestion(id: string, categoryId: string) {
  const auth = await verifyStaff()
  if (auth.error || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const { error } = await auth.adminDb.from('questions').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/admin/question-bank/${categoryId}`)
  revalidatePath('/admin/question-bank')
  revalidatePath(`/mentor/question-bank/${categoryId}`)
  return { success: true }
}

// ----------------------------------------------------
// BULK UPLOAD SOAL DARI EXCEL
// ----------------------------------------------------
export async function bulkCreateQuestionsFromExcel(
  categoryId: string,
  rows: Array<{
    no: number
    pertanyaan: string
    opsiA: string
    opsiB: string
    opsiC: string
    opsiD: string
    opsiE: string
    kunciJawaban: string
    pembahasan: string
    urlGambar: string
  }>
): Promise<ActionState> {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  if (!categoryId) return { error: "Kategori tidak valid" }
  if (!rows || rows.length === 0) return { error: "Tidak ada soal yang akan diupload" }

  let successCount = 0
  const errors: string[] = []

  for (const row of rows) {
    // Insert question
    const { data: questionData, error: qErr } = await auth.adminDb.from('questions').insert({
      category_id: categoryId,
      question_text: row.pertanyaan,
      question_image_url: row.urlGambar?.trim() || null,
      explanation: row.pembahasan?.trim() || null,
      difficulty: 'medium',
      created_by: auth.user.id
    }).select('id').single()

    if (qErr || !questionData) {
      errors.push(`Soal #${row.no}: ${qErr?.message || 'Gagal insert'}`)
      continue
    }

    // Build options
    const labels = ['A', 'B', 'C', 'D', 'E']
    const optTexts = [row.opsiA, row.opsiB, row.opsiC, row.opsiD, row.opsiE]
    const optionsToInsert = labels
      .map((label, i) => ({
        question_id: questionData.id,
        label,
        option_text: optTexts[i]?.trim() || '',
        is_correct: label === row.kunciJawaban
      }))
      .filter(o => o.option_text)

    const { error: optErr } = await auth.adminDb.from('question_options').insert(optionsToInsert)

    if (optErr) {
      await auth.adminDb.from('questions').delete().eq('id', questionData.id)
      errors.push(`Soal #${row.no}: ${optErr.message}`)
      continue
    }

    successCount++
  }

  revalidatePath(`/admin/question-bank/${categoryId}`)
  revalidatePath('/admin/question-bank')
  revalidatePath(`/mentor/question-bank/${categoryId}`)

  if (errors.length > 0) {
    return {
      success: `${successCount} soal berhasil diupload.`,
      error: `${errors.length} soal gagal: ${errors.slice(0, 3).join('; ')}`
    }
  }

  return { success: `✓ ${successCount} soal berhasil ditambahkan ke bank soal!` }
}

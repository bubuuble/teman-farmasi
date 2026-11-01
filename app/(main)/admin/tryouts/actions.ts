'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type ActionState = {
  error?: string
  success?: string
  tryoutId?: string
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
// TRYOUT CRUD
// ----------------------------------------------------
export async function createTryout(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const program_type = formData.get('program_type') as string
  const class_id = (formData.get('class_id') as string) || null
  const duration_minutes = formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : null
  const max_attempts = formData.get('max_attempts') ? Number(formData.get('max_attempts')) : 1
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true'
  const shuffle_questions = formData.get('shuffle_questions') === 'on' || formData.get('shuffle_questions') === 'true'
  const shuffle_options = formData.get('shuffle_options') === 'on' || formData.get('shuffle_options') === 'true'
  const start_date = (formData.get('start_date') as string) || null
  const end_date = (formData.get('end_date') as string) || null

  if (!title?.trim()) return { error: "Judul tryout wajib diisi" }
  if (!program_type) return { error: "Pilih jenis program (Masuk Apoteker / UKMPPAI)" }

  const { data: newTryout, error } = await auth.adminDb.from('tryouts').insert({
    title: title.trim(),
    description: description?.trim() || null,
    program_type,
    class_id: class_id && class_id !== 'none' ? class_id : null,
    duration_minutes,
    max_attempts,
    is_active,
    shuffle_questions,
    shuffle_options,
    start_date: start_date ? new Date(start_date).toISOString() : null,
    end_date: end_date ? new Date(end_date).toISOString() : null,
    created_by: auth.user.id
  }).select('id').single()

  if (error || !newTryout) return { error: error?.message || "Gagal membuat tryout" }

  revalidatePath('/admin/tryouts')
  revalidatePath('/mentor/tryouts')
  revalidatePath('/student/tryouts')
  return { success: "Tryout berhasil dibuat!", tryoutId: newTryout.id }
}

export async function updateTryout(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const program_type = formData.get('program_type') as string
  const class_id = (formData.get('class_id') as string) || null
  const duration_minutes = formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : null
  const max_attempts = formData.get('max_attempts') ? Number(formData.get('max_attempts')) : 1
  const is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true'
  const shuffle_questions = formData.get('shuffle_questions') === 'on' || formData.get('shuffle_questions') === 'true'
  const shuffle_options = formData.get('shuffle_options') === 'on' || formData.get('shuffle_options') === 'true'
  const start_date = (formData.get('start_date') as string) || null
  const end_date = (formData.get('end_date') as string) || null

  if (!id) return { error: "ID tryout tidak valid" }
  if (!title?.trim()) return { error: "Judul tryout wajib diisi" }

  const { error } = await auth.adminDb.from('tryouts').update({
    title: title.trim(),
    description: description?.trim() || null,
    program_type,
    class_id: class_id && class_id !== 'none' ? class_id : null,
    duration_minutes,
    max_attempts,
    is_active,
    shuffle_questions,
    shuffle_options,
    start_date: start_date ? new Date(start_date).toISOString() : null,
    end_date: end_date ? new Date(end_date).toISOString() : null
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/tryouts')
  revalidatePath(`/admin/tryouts/${id}`)
  revalidatePath('/mentor/tryouts')
  revalidatePath('/student/tryouts')
  return { success: "Pengaturan tryout berhasil diperbarui!" }
}

export async function deleteTryout(id: string) {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const { error } = await auth.adminDb.from('tryouts').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/tryouts')
  revalidatePath('/mentor/tryouts')
  revalidatePath('/student/tryouts')
  return { success: true }
}

// ----------------------------------------------------
// ASSIGN SOAL DARI BANK SOAL
// ----------------------------------------------------
export async function assignQuestionsToTryout(tryoutId: string, questionIds: string[]) {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  if (!questionIds || questionIds.length === 0) {
    return { error: "Pilih minimal 1 soal untuk dimasukkan ke tryout" }
  }

  // Ambil nomor urut tertinggi saat ini
  const { data: existing } = await auth.adminDb
    .from('tryout_questions')
    .select('question_order')
    .eq('tryout_id', tryoutId)
    .order('question_order', { ascending: false })
    .limit(1)

  let startOrder = (existing?.[0]?.question_order || 0) + 1

  const rows = questionIds.map((qId, idx) => ({
    tryout_id: tryoutId,
    question_id: qId,
    question_order: startOrder + idx
  }))

  const { error } = await auth.adminDb.from('tryout_questions').upsert(rows, {
    onConflict: 'tryout_id,question_id'
  })

  if (error) return { error: error.message }

  // Update total_questions pada tryout
  const { count } = await auth.adminDb
    .from('tryout_questions')
    .select('*', { count: 'exact', head: true })
    .eq('tryout_id', tryoutId)

  await auth.adminDb.from('tryouts').update({ total_questions: count || 0 }).eq('id', tryoutId)

  revalidatePath(`/admin/tryouts/${tryoutId}`)
  revalidatePath('/admin/tryouts')
  revalidatePath(`/mentor/tryouts/${tryoutId}`)
  return { success: true }
}

// ----------------------------------------------------
// BUAT SOAL LANGSUNG DI DALAM TRYOUT (HYBRID MODE)
// ----------------------------------------------------
export async function createQuestionDirectToTryout(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const tryout_id = formData.get('tryout_id') as string
  const category_id = formData.get('category_id') as string
  const question_text = formData.get('question_text') as string
  const question_image_url = formData.get('question_image_url') as string
  const explanation = formData.get('explanation') as string
  const difficulty = (formData.get('difficulty') as string) || 'medium'
  const correct_option = formData.get('correct_option') as string

  if (!tryout_id) return { error: "ID Tryout tidak ditemukan" }
  if (!question_text?.trim()) return { error: "Isi pertanyaan wajib diisi" }
  if (!correct_option) return { error: "Pilih kunci jawaban yang benar" }

  // 1. Simpan ke questions
  let targetCategoryId = category_id
  if (!targetCategoryId) {
    // Cari kategori default atau buat jika belum ada untuk program_type ini
    const { data: tryout } = await auth.adminDb
      .from('tryouts')
      .select('program_type')
      .eq('id', tryout_id)
      .single()

    const programType = tryout?.program_type || 'masuk_apoteker'

    const { data: existingCat } = await auth.adminDb
      .from('question_categories')
      .select('id')
      .eq('program_type', programType)
      .limit(1)
      .maybeSingle()

    if (existingCat?.id) {
      targetCategoryId = existingCat.id
    } else {
      const { data: newCat } = await auth.adminDb
        .from('question_categories')
        .insert({
          name: 'Umum',
          program_type: programType,
          description: 'Kategori default soal tryout'
        })
        .select('id')
        .single()
      targetCategoryId = newCat?.id
    }
  }

  const { data: questionData, error: qErr } = await auth.adminDb.from('questions').insert({
    category_id: targetCategoryId,
    question_text: question_text.trim(),
    question_image_url: question_image_url?.trim() || null,
    explanation: explanation?.trim() || null,
    difficulty,
    created_by: auth.user.id
  }).select('id').single()

  if (qErr || !questionData) return { error: qErr?.message || "Gagal menyimpan soal" }

  // 2. Simpan opsi A - E
  const labels = ['A', 'B', 'C', 'D', 'E']
  const optionsToInsert = labels.map(label => {
    const text = (formData.get(`option_${label}`) as string) || ''
    return {
      question_id: questionData.id,
      label,
      option_text: text.trim(),
      is_correct: label === correct_option
    }
  }).filter(o => o.option_text)

  const { error: optErr } = await auth.adminDb.from('question_options').insert(optionsToInsert)
  if (optErr) {
    await auth.adminDb.from('questions').delete().eq('id', questionData.id)
    return { error: optErr.message }
  }

  // 3. Langsung assign ke tryout_questions
  const { data: maxOrderData } = await auth.adminDb
    .from('tryout_questions')
    .select('question_order')
    .eq('tryout_id', tryout_id)
    .order('question_order', { ascending: false })
    .limit(1)

  const nextOrder = (maxOrderData?.[0]?.question_order || 0) + 1

  await auth.adminDb.from('tryout_questions').insert({
    tryout_id,
    question_id: questionData.id,
    question_order: nextOrder
  })

  // 4. Update count
  const { count } = await auth.adminDb
    .from('tryout_questions')
    .select('*', { count: 'exact', head: true })
    .eq('tryout_id', tryout_id)

  await auth.adminDb.from('tryouts').update({ total_questions: count || 0 }).eq('id', tryout_id)

  revalidatePath(`/admin/tryouts/${tryout_id}`)
  revalidatePath('/admin/tryouts')
  revalidatePath(`/mentor/tryouts/${tryout_id}`)
  return { success: "Soal berhasil dibuat dan langsung ditautkan ke Tryout!" }
}

// ----------------------------------------------------
// EDIT SOAL LANGSUNG DARI TRYOUT
// ----------------------------------------------------
export async function updateQuestionInTryout(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const tryout_id = formData.get('tryout_id') as string
  const question_id = formData.get('question_id') as string
  const category_id = formData.get('category_id') as string
  const question_text = formData.get('question_text') as string
  const question_image_url = formData.get('question_image_url') as string
  const explanation = formData.get('explanation') as string
  const correct_option = formData.get('correct_option') as string

  if (!question_id) return { error: "ID soal tidak ditemukan" }
  if (!question_text?.trim()) return { error: "Isi pertanyaan wajib diisi" }
  if (!correct_option) return { error: "Pilih kunci jawaban yang benar" }

  // 1. Update questions
  const updatePayload: any = {
    question_text: question_text.trim(),
    question_image_url: question_image_url?.trim() || null,
    explanation: explanation?.trim() || null,
    updated_at: new Date().toISOString()
  }
  if (category_id) {
    updatePayload.category_id = category_id
  }

  const { error: qErr } = await auth.adminDb
    .from('questions')
    .update(updatePayload)
    .eq('id', question_id)

  if (qErr) return { error: qErr.message }

  // 2. Update options (delete and re-insert)
  await auth.adminDb.from('question_options').delete().eq('question_id', question_id)

  const labels = ['A', 'B', 'C', 'D', 'E']
  const optionsToInsert = labels.map(label => {
    const text = (formData.get(`option_${label}`) as string) || ''
    return {
      question_id,
      label,
      option_text: text.trim(),
      is_correct: label === correct_option
    }
  }).filter(o => o.option_text)

  const { error: optErr } = await auth.adminDb.from('question_options').insert(optionsToInsert)
  if (optErr) return { error: optErr.message }

  if (tryout_id) {
    revalidatePath(`/admin/tryouts/${tryout_id}`)
    revalidatePath(`/mentor/tryouts/${tryout_id}`)
  }
  revalidatePath('/admin/question-bank')
  return { success: "Soal berhasil diperbarui!" }
}

// ----------------------------------------------------
// BULK ASSIGN SOAL BERDASARKAN KATEGORI BANK SOAL
// ----------------------------------------------------
export async function assignCategoryQuestionsToTryout(tryoutId: string, categoryId: string) {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  if (!tryoutId || !categoryId) return { error: "Parameter tidak valid" }

  // Ambil semua ID soal dari kategori ini
  const { data: catQuestions, error: cqErr } = await auth.adminDb
    .from('questions')
    .select('id')
    .eq('category_id', categoryId)

  if (cqErr) return { error: cqErr.message }
  if (!catQuestions || catQuestions.length === 0) {
    return { error: "Tidak ada soal dalam kategori yang dipilih" }
  }

  // Cek soal yang sudah ada di tryout ini agar tidak duplikat
  const { data: existingTryoutQuestions } = await auth.adminDb
    .from('tryout_questions')
    .select('question_id, question_order')
    .eq('tryout_id', tryoutId)
    .order('question_order', { ascending: false })

  const existingIds = new Set((existingTryoutQuestions || []).map(r => r.question_id))
  const newQuestionIds = catQuestions
    .map(q => q.id)
    .filter(id => !existingIds.has(id))

  if (newQuestionIds.length === 0) {
    return { error: "Semua soal dalam kategori ini sudah pernah ditambahkan ke tryout ini" }
  }

  let startOrder = ((existingTryoutQuestions?.[0]?.question_order) || 0) + 1

  const rows = newQuestionIds.map((qId, idx) => ({
    tryout_id: tryoutId,
    question_id: qId,
    question_order: startOrder + idx
  }))

  const { error: upsertErr } = await auth.adminDb.from('tryout_questions').upsert(rows, {
    onConflict: 'tryout_id,question_id'
  })

  if (upsertErr) return { error: upsertErr.message }

  // Update total questions count
  const { count } = await auth.adminDb
    .from('tryout_questions')
    .select('*', { count: 'exact', head: true })
    .eq('tryout_id', tryoutId)

  await auth.adminDb.from('tryouts').update({ total_questions: count || 0 }).eq('id', tryoutId)

  revalidatePath(`/admin/tryouts/${tryoutId}`)
  revalidatePath('/admin/tryouts')
  revalidatePath(`/mentor/tryouts/${tryoutId}`)
  return { success: true, addedCount: newQuestionIds.length }
}

// ----------------------------------------------------
// HAPUS SOAL DARI TRYOUT (Bukan hapus dari bank soal)
// ----------------------------------------------------
export async function removeQuestionFromTryout(tryoutId: string, questionId: string) {
  const auth = await verifyStaff()
  if (auth.error || !auth.user || !auth.adminDb) return { error: auth.error || "Gagal autentikasi" }

  const { error } = await auth.adminDb
    .from('tryout_questions')
    .delete()
    .eq('tryout_id', tryoutId)
    .eq('question_id', questionId)

  if (error) return { error: error.message }

  // Update count
  const { count } = await auth.adminDb
    .from('tryout_questions')
    .select('*', { count: 'exact', head: true })
    .eq('tryout_id', tryoutId)

  await auth.adminDb.from('tryouts').update({ total_questions: count || 0 }).eq('id', tryoutId)

  revalidatePath(`/admin/tryouts/${tryoutId}`)
  revalidatePath('/admin/tryouts')
  revalidatePath(`/mentor/tryouts/${tryoutId}`)
  return { success: true }
}

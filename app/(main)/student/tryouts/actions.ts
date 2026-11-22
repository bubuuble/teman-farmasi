'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ----------------------------------------------------
// 1. START ATTEMPT
// ----------------------------------------------------
export async function startTryoutAttempt(tryoutId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Silakan login terlebih dahulu" }

  // Cek tryout
  const { data: tryout } = await supabase
    .from('tryouts')
    .select('*')
    .eq('id', tryoutId)
    .single()

  if (!tryout) return { error: "Tryout tidak ditemukan" }
  if (!tryout.is_active) return { error: "Tryout ini sedang tidak aktif" }

  // Cek hak akses jika tryout terkait kelas
  if (tryout.class_id) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, sub_class_id')
      .eq('class_id', tryout.class_id)
      .eq('student_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!enrollment || (tryout.sub_class_id && enrollment.sub_class_id !== tryout.sub_class_id)) {
      return { error: "Anda harus terdaftar di kelas/sub-kelas ini untuk mengakses tryout" }
    }
  }

  // Cek riwayat attempt sebelumnya
  const { data: existingAttempts } = await supabase
    .from('tryout_attempts')
    .select('id, attempt_number, status')
    .eq('tryout_id', tryoutId)
    .eq('student_id', user.id)
    .order('attempt_number', { ascending: false })

  const inProgressAttempt = existingAttempts?.find(a => a.status === 'in_progress')
  if (inProgressAttempt) {
    // Siswa masih punya attempt yang berjalan, resume attempt tersebut
    return { success: true, attemptId: inProgressAttempt.id }
  }

  const currentCount = existingAttempts?.length || 0
  if (tryout.max_attempts && currentCount >= tryout.max_attempts) {
    return { error: `Anda telah mencapai batas maksimal (${tryout.max_attempts}x) pengerjaan tryout ini` }
  }

  const nextAttemptNumber = currentCount + 1

  // Buat attempt baru
  const { data: newAttempt, error: attErr } = await supabase
    .from('tryout_attempts')
    .insert({
      tryout_id: tryoutId,
      student_id: user.id,
      attempt_number: nextAttemptNumber,
      status: 'in_progress'
    })
    .select('id')
    .single()

  if (attErr || !newAttempt) return { error: attErr?.message || "Gagal memulai tryout" }

  // Baris jawaban tidak dibuat di awal: dibuat (upsert) saat siswa menjawab / menandai ragu.
  // Total soal dihitung dari tryout_questions, bukan dari jumlah baris jawaban.

  revalidatePath('/student/tryouts')
  return { success: true, attemptId: newAttempt.id }
}

// Cache kebenaran opsi per instance server (kunci jawaban tidak berubah selama ujian).
// Menghindari 1 query DB per klik jawaban saat ratusan siswa ujian bersamaan.
const OPTION_CACHE_TTL_MS = 10 * 60 * 1000
const optionCorrectCache = new Map<string, { value: boolean; expires: number }>()

async function isOptionCorrect(supabase: Awaited<ReturnType<typeof createClient>>, optionId: string) {
  const hit = optionCorrectCache.get(optionId)
  if (hit && hit.expires > Date.now()) return hit.value

  const { data: opt } = await supabase
    .from('question_options')
    .select('is_correct')
    .eq('id', optionId)
    .maybeSingle()

  const value = opt?.is_correct ?? false
  if (optionCorrectCache.size > 20000) optionCorrectCache.clear()
  optionCorrectCache.set(optionId, { value, expires: Date.now() + OPTION_CACHE_TTL_MS })
  return value
}

// ----------------------------------------------------
// 2. SAVE ANSWER (AUTO-SAVE TIAP KLIK OPSI / RAGU)
// ----------------------------------------------------
export async function saveStudentAnswer({
  attemptId,
  questionId,
  selectedOptionId,
  isFlagged
}: {
  attemptId: string
  questionId: string
  selectedOptionId: string | null
  isFlagged?: boolean
}) {
  const supabase = await createClient()

  // Cek apakah opsi yang dipilih benar (untuk scoring otomatis)
  let isCorrect: boolean | null = null
  if (selectedOptionId) {
    isCorrect = await isOptionCorrect(supabase, selectedOptionId)
  }

  const { error } = await supabase
    .from('tryout_answers')
    .upsert({
      attempt_id: attemptId,
      question_id: questionId,
      selected_option_id: selectedOptionId,
      is_flagged: isFlagged ?? false,
      is_correct: isCorrect,
      answered_at: new Date().toISOString()
    }, {
      onConflict: 'attempt_id,question_id'
    })

  if (error) return { error: error.message }
  return { success: true }
}

// ----------------------------------------------------
// 3. SUBMIT FINAL ATTEMPT
// ----------------------------------------------------
export async function submitTryoutAttempt(attemptId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Sesi telah berakhir" }

  // Total soal berasal dari daftar soal tryout (baris jawaban hanya ada untuk soal yang disentuh siswa)
  const { data: attemptRow } = await supabase
    .from('tryout_attempts')
    .select('tryout_id')
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .maybeSingle()
  if (!attemptRow) return { error: "Attempt tidak ditemukan" }

  const { count: questionCount } = await supabase
    .from('tryout_questions')
    .select('question_id', { count: 'exact', head: true })
    .eq('tryout_id', attemptRow.tryout_id)

  // Hitung jumlah jawaban benar
  const { data: answers } = await supabase
    .from('tryout_answers')
    .select('is_correct, selected_option_id')
    .eq('attempt_id', attemptId)

  const totalAnswered = (answers || []).filter(a => a.selected_option_id != null).length
  const totalCorrect = (answers || []).filter(a => a.is_correct === true).length
  const totalQuestions = questionCount || answers?.length || 1

  const finalScore = (totalCorrect / totalQuestions) * 100

  const { error } = await supabase
    .from('tryout_attempts')
    .update({
      status: 'completed',
      finished_at: new Date().toISOString(),
      score: finalScore,
      total_correct: totalCorrect,
      total_answered: totalAnswered
    })
    .eq('id', attemptId)
    .eq('student_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/student/tryouts')
  return { success: true, score: finalScore }
}

import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import CBTExamClient from "./CBTExamClient"

export const dynamic = 'force-dynamic'

export default async function ExamPage({
  params
}: {
  params: Promise<{ tryoutId: string }>
}) {
  const { tryoutId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Fetch tryout details
  const { data: tryout } = await supabase
    .from('tryouts')
    .select('*')
    .eq('id', tryoutId)
    .single()

  if (!tryout || !tryout.is_active) return notFound()

  // 2. Fetch active attempt for this student
  const { data: attempt } = await supabase
    .from('tryout_attempts')
    .select('*')
    .eq('tryout_id', tryoutId)
    .eq('student_id', user.id)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Jika belum ada attempt aktif, redirect ke info tryout
  if (!attempt) {
    redirect(`/student/tryouts/${tryoutId}`)
  }

  // 3. Fetch all assigned questions & options
  const { data: assignedRows = [] } = await supabase
    .from('tryout_questions')
    .select(`
      question_id,
      question_order,
      questions(
        id,
        question_text,
        question_image_url,
        question_options(
          id,
          label,
          option_text
        )
      )
    `)
    .eq('tryout_id', tryoutId)
    .order('question_order', { ascending: true })

  const assignedList = assignedRows || []

  if (assignedList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 max-w-md shadow-sm">
          <h2 className="text-lg font-bold text-brand-dark mb-2">Soal Belum Tersedia</h2>
          <p className="text-xs text-gray-500 mb-4">
            Tryout ini belum memiliki butir soal aktif. Silakan hubungi admin atau mentor Anda.
          </p>
        </div>
      </div>
    )
  }

  // 4. Fetch existing answers for this attempt
  const { data: answersData = [] } = await supabase
    .from('tryout_answers')
    .select('question_id, selected_option_id, is_flagged')
    .eq('attempt_id', attempt.id)

  const answersMap: Record<string, { selectedOptionId: string | null; isFlagged: boolean }> = {}
  ;(answersData || []).forEach((a: any) => {
    answersMap[a.question_id] = {
      selectedOptionId: a.selected_option_id,
      isFlagged: a.is_flagged || false
    }
  })

  // Helper deterministic pseudo-random number generator berdasarkan seed string
  function getSeededRandom(seed: string) {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i)
      hash |= 0
    }
    return function() {
      hash = (hash * 9301 + 49297) % 233280
      return Math.abs(hash / 233280)
    }
  }

  // Helper shuffle array dengan seeded random
  function shuffleArray<T>(array: T[], randomFn: () => number): T[] {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1))
      const temp = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
    }
    return arr
  }

  // Format questions array & terapkan shuffle jika aktif
  const defaultLetters = ['A', 'B', 'C', 'D', 'E']

  let questionRows = [...assignedList]
  if (tryout.shuffle_questions) {
    const qRng = getSeededRandom(`questions-${attempt.id}`)
    questionRows = shuffleArray(questionRows, qRng)
  }

  const formattedQuestions = questionRows.map((r: any) => {
    const q = r.questions
    let rawOptions = [...(q?.question_options || [])]

    if (tryout.shuffle_options) {
      const optRng = getSeededRandom(`opt-${attempt.id}-${q?.id}`)
      rawOptions = shuffleArray(rawOptions, optRng)
    } else {
      rawOptions.sort((a: any, b: any) => a.label.localeCompare(b.label))
    }

    return {
      id: q?.id,
      question_text: q?.question_text,
      question_image_url: q?.question_image_url,
      options: rawOptions.map((opt: any, optIdx: number) => ({
        id: opt.id,
        label: defaultLetters[optIdx] || opt.label,
        option_text: opt.option_text
      }))
    }
  })

  // 5. Hitung sisa waktu jika ada durasi
  let remainingSeconds: number | null = null
  if (tryout.duration_minutes) {
    const startTime = new Date(attempt.started_at).getTime()
    const totalDurationMs = tryout.duration_minutes * 60 * 1000
    const now = Date.now()
    const elapsed = now - startTime
    const left = Math.max(0, Math.floor((totalDurationMs - elapsed) / 1000))
    remainingSeconds = left
  }

  return (
    <CBTExamClient
      attemptId={attempt.id}
      tryout={{
        id: tryout.id,
        title: tryout.title,
        duration_minutes: tryout.duration_minutes
      }}
      questions={formattedQuestions}
      initialAnswers={answersMap}
      initialTimeRemaining={remainingSeconds}
    />
  )
}

import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCheck
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TryoutResultPage({
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

  if (!tryout) return notFound()

  // 2. Fetch latest completed attempt
  const { data: attempt } = await supabase
    .from('tryout_attempts')
    .select('*')
    .eq('tryout_id', tryoutId)
    .eq('student_id', user.id)
    .eq('status', 'completed')
    .order('finished_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!attempt) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-gray-100 text-center space-y-4 shadow-sm">
        <HelpCircle className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-brand-dark">Belum Ada Hasil Ujian</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Anda belum menyelesaikan atau men-submit paket tryout ini.
        </p>
        <Link
          href={`/student/tryouts/${tryoutId}`}
          className="inline-block px-6 py-2.5 bg-brand-pink text-white rounded-xl text-xs font-bold"
        >
          Mulai Mengerjakan
        </Link>
      </div>
    )
  }

  // 3. Fetch questions, options & answers with explanation
  const { data: answersData = [] } = await supabase
    .from('tryout_answers')
    .select(`
      question_id,
      selected_option_id,
      is_correct,
      is_flagged,
      questions(
        id,
        question_text,
        question_image_url,
        explanation,
        difficulty,
        question_categories(name),
        question_options(
          id,
          label,
          option_text,
          is_correct
        )
      )
    `)
    .eq('attempt_id', attempt.id)

  const answersList = answersData || []
  const totalQuestions = answersList.length
  const totalCorrect = attempt.total_correct || 0
  const totalWrong = totalQuestions - totalCorrect
  const finalScore = Number(attempt.score || 0).toFixed(1)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link
        href="/student/tryouts"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-pink transition"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Portal Tryout
      </Link>

      {/* RESULT HERO SCORECARD */}
      <div className="bg-gradient-to-br from-brand-dark via-slate-900 to-teal-950 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 inline-block mb-3 border border-teal-400/30">
              Hasil & Evaluasi CBT
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {tryout.title}
            </h1>
            <p className="text-teal-100/70 text-xs mt-1">
              Diselesaikan pada: {attempt.finished_at ? new Date(attempt.finished_at).toLocaleString('id-ID') : '-'}
            </p>
          </div>

          {/* CIRCLE SCORE BADGE */}
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shrink-0">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-teal-200">Skor Akhir</p>
              <p className="text-4xl md:text-5xl font-extrabold text-teal-300 font-heading leading-tight mt-0.5">
                {finalScore}%
              </p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> {totalCorrect} Benar
              </div>
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <XCircle className="w-4 h-4" /> {totalWrong} Salah
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-[-10%] top-[-30%] w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* REVIEW & PEMBAHASAN LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-brand-dark flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-pink" />
            Pembahasan & Kunci Jawaban Lengkap
          </h2>
          <span className="text-xs font-bold text-gray-400">
            {totalQuestions} Soal
          </span>
        </div>

        <div className="space-y-5">
          {answersList.map((item: any, idx: number) => {
            const q = item.questions
            const options = (q?.question_options || []).sort((a: any, b: any) =>
              a.label.localeCompare(b.label)
            )
            const isCorrect = item.is_correct

            return (
              <div
                key={item.question_id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-brand-dark text-white font-extrabold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Benar
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Salah
                        </>
                      )}
                    </span>
                    {q?.question_categories?.name && (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
                        {q.question_categories.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* TEXT SOAL */}
                <p className="text-brand-dark font-medium text-sm leading-relaxed whitespace-pre-line pl-10">
                  {q?.question_text}
                </p>

                {/* OPSI JAWABAN */}
                <div className="space-y-2 pl-10 pt-1">
                  {options.map((opt: any) => {
                    const isStudentChoice = item.selected_option_id === opt.id
                    const isAnswerKey = opt.is_correct

                    let optStyle = 'border-gray-100 bg-gray-50/50 text-gray-700'
                    if (isAnswerKey) {
                      optStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                    } else if (isStudentChoice && !isAnswerKey) {
                      optStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 font-semibold line-through'
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-2xl border text-xs leading-relaxed ${optStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                          isAnswerKey ? 'bg-emerald-600 text-white' :
                          isStudentChoice ? 'bg-rose-500 text-white' : 'bg-white border text-gray-500'
                        }`}>
                          {opt.label}
                        </span>
                        <span className="flex-1 mt-0.5">{opt.option_text}</span>
                        {isAnswerKey && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase shrink-0">
                            Kunci Jawaban
                          </span>
                        )}
                        {isStudentChoice && !isAnswerKey && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md uppercase shrink-0">
                            Jawaban Anda
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* PEMBAHASAN DETAIL */}
                {q?.explanation && (
                  <div className="ml-10 p-4 bg-brand-yellow/15 rounded-2xl border border-brand-yellow/30 text-xs text-brand-dark mt-2">
                    <p className="font-bold mb-1 flex items-center gap-1.5 text-brand-dark">
                      <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                      Pembahasan & Tinjauan Konsep:
                    </p>
                    <p className="leading-relaxed opacity-90 whitespace-pre-line">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

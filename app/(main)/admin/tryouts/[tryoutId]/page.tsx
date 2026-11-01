import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Clock, 
  HelpCircle, 
  Users, 
  Layers, 
  CheckCircle2, 
  Award,
  Calendar,
  AlertCircle
} from "lucide-react"
import AssignQuestionsModal from "../AssignQuestionsModal"
import CreateDirectQuestionModal from "../CreateDirectQuestionModal"
import RemoveQuestionBtn from "../RemoveQuestionBtn"

export const dynamic = 'force-dynamic'

export default async function TryoutDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ tryoutId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { tryoutId } = await params
  const { tab = 'questions' } = await searchParams
  const supabase = await createClient()
  const adminDb = createAdminClient()

  // 1. Fetch Tryout details
  let { data: tryout, error: tryoutErr } = await supabase
    .from('tryouts')
    .select(`
      *,
      classes(id, title)
    `)
    .eq('id', tryoutId)
    .single()

  if (tryoutErr || !tryout) {
    const { data: adminTryout } = await adminDb
      .from('tryouts')
      .select(`
        *,
        classes(id, title)
      `)
      .eq('id', tryoutId)
      .single()
    tryout = adminTryout
  }

  if (!tryout) return notFound()

  // 2. Fetch Assigned questions in order
  const { data: assignedRows = [] } = await supabase
    .from('tryout_questions')
    .select(`
      question_id,
      question_order,
      questions(
        id,
        question_text,
        difficulty,
        explanation,
        question_categories(name),
        question_options(*)
      )
    `)
    .eq('tryout_id', tryoutId)
    .order('question_order', { ascending: true })

  // 3. Fetch all bank questions matching this program_type (for assignment picker)
  const { data: bankQuestions = [] } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      difficulty,
      category_id,
      question_categories!inner(id, name, program_type)
    `)
    .eq('question_categories.program_type', tryout.program_type)

  // 4. Fetch categories for direct question creation
  const { data: categories = [] } = await supabase
    .from('question_categories')
    .select('id, name')
    .eq('program_type', tryout.program_type)

  // 5. Fetch attempt results
  const { data: attempts = [] } = await supabase
    .from('tryout_attempts')
    .select(`
      *,
      profiles(full_name, email)
    `)
    .eq('tryout_id', tryoutId)
    .order('score', { ascending: false })

  const questionsList = assignedRows || []
  const attemptsList = attempts || []
  const existingQuestionIds = questionsList.map((r: any) => r.question_id)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/admin/tryouts"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-pink transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kelola Tryout
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-bold text-gray-400 capitalize">
            {tryout.program_type === 'ukmppai' ? 'Kelas UKMPPAI' : 'Masuk Apoteker'}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                tryout.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {tryout.is_active ? 'Tryout Aktif' : 'Draft'}
              </span>
              {tryout.classes?.title && (
                <span className="text-[11px] font-bold text-brand-dark bg-brand-cream px-3 py-1 rounded-full border border-brand-dark/5">
                  Kelas: {tryout.classes.title}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              {tryout.title}
            </h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
              {tryout.description || 'Simulasi ujian CBT interaktif dengan timer dan auto-save.'}
            </p>
          </div>

          {/* QUICK STATS */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="px-3 text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400">Total Soal</p>
              <p className="text-lg font-extrabold text-brand-dark">{questionsList.length}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="px-3 text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400">Durasi</p>
              <p className="text-lg font-extrabold text-brand-dark">
                {tryout.duration_minutes ? `${tryout.duration_minutes}m` : '∞'}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="px-3 text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400">Peserta</p>
              <p className="text-lg font-extrabold text-brand-pink">{attemptsList.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 gap-8">
        <Link
          href={`/admin/tryouts/${tryoutId}?tab=questions`}
          className={`pb-3 text-sm font-extrabold transition border-b-2 flex items-center gap-2 ${
            tab === 'questions'
              ? 'border-brand-pink text-brand-pink'
              : 'border-transparent text-gray-400 hover:text-brand-dark'
          }`}
        >
          <Layers className="w-4 h-4" /> Daftar Soal Ujian ({questionsList.length})
        </Link>
        <Link
          href={`/admin/tryouts/${tryoutId}?tab=results`}
          className={`pb-3 text-sm font-extrabold transition border-b-2 flex items-center gap-2 ${
            tab === 'results'
              ? 'border-brand-pink text-brand-pink'
              : 'border-transparent text-gray-400 hover:text-brand-dark'
          }`}
        >
          <Users className="w-4 h-4" /> Hasil Peserta ({attemptsList.length})
        </Link>
      </div>

      {/* TAB CONTENT: QUESTIONS */}
      {tab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="font-bold text-brand-dark text-base">
                Kelola Soal Tryout
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pilih soal dari bank soal yang sudah ada atau buat butir soal baru langsung
              </p>
            </div>

            <div className="flex items-center gap-3">
              <AssignQuestionsModal
                tryoutId={tryoutId}
                availableQuestions={bankQuestions as any[]}
                existingQuestionIds={existingQuestionIds}
              />
              <CreateDirectQuestionModal
                tryoutId={tryoutId}
                categories={categories || []}
              />
            </div>
          </div>

          {questionsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-700 text-lg">Belum ada butir soal di tryout ini</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1 mb-6">
                Pilih dari bank soal atau buat butir soal baru menggunakan tombol di atas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questionsList.map((row: any, idx: number) => {
                const q = row.questions
                const options = (q?.question_options || []).sort((a: any, b: any) =>
                  a.label.localeCompare(b.label)
                )

                return (
                  <div
                    key={row.question_id}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-brand-dark text-white font-extrabold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {q?.question_categories?.name && (
                          <span className="text-[10px] font-bold text-brand-dark bg-gray-100 px-2.5 py-1 rounded-md">
                            {q.question_categories.name}
                          </span>
                        )}
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                          q?.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                          q?.difficulty === 'hard' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {q?.difficulty}
                        </span>
                      </div>

                      <RemoveQuestionBtn
                        tryoutId={tryoutId}
                        questionId={row.question_id}
                      />
                    </div>

                    <p className="text-brand-dark font-medium text-sm leading-relaxed whitespace-pre-line pl-10">
                      {q?.question_text}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10 pt-2">
                      {options.map((opt: any) => (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs ${
                            opt.is_correct
                              ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                              : 'border-gray-100 bg-gray-50/50 text-gray-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            opt.is_correct ? 'bg-emerald-600 text-white' : 'bg-white border text-gray-500'
                          }`}>
                            {opt.label}
                          </span>
                          <span className="flex-1 mt-0.5">{opt.option_text}</span>
                        </div>
                      ))}
                    </div>

                    {q?.explanation && (
                      <div className="ml-10 p-3 bg-brand-yellow/15 rounded-xl text-xs text-brand-dark leading-relaxed">
                        <span className="font-bold">Pembahasan: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: RESULTS */}
      {tab === 'results' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
          {attemptsList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Belum ada siswa yang mengerjakan atau men-submit tryout ini.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
                  <th className="pb-3 pl-2">Peringkat</th>
                  <th className="pb-3">Nama Siswa</th>
                  <th className="pb-3">Attempt Ke</th>
                  <th className="pb-3">Benar / Total</th>
                  <th className="pb-3">Skor Akhir</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Waktu Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {attemptsList.map((att: any, rank: number) => {
                  const isTop3 = rank < 3
                  return (
                    <tr key={att.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-4 pl-2">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                          rank === 0 ? 'bg-amber-400 text-white shadow-sm' :
                          rank === 1 ? 'bg-gray-300 text-gray-700' :
                          rank === 2 ? 'bg-amber-700/60 text-white' : 'text-gray-400'
                        }`}>
                          #{rank + 1}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="font-bold text-brand-dark">
                          {att.profiles?.full_name || 'Siswa'}
                        </p>
                        <p className="text-xs text-gray-400 font-normal">
                          {att.profiles?.email}
                        </p>
                      </td>
                      <td className="py-4 text-xs text-gray-600">
                        Ke-{att.attempt_number || 1}
                      </td>
                      <td className="py-4 text-xs font-bold text-brand-dark">
                        {att.total_correct} / {att.total_answered || questionsList.length} Soal
                      </td>
                      <td className="py-4 font-extrabold text-base text-brand-pink">
                        {att.score != null ? `${Number(att.score).toFixed(1)}%` : '-'}
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          att.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                          att.status === 'timed_out' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-gray-400">
                        {att.finished_at ? new Date(att.finished_at).toLocaleString('id-ID') : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

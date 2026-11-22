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
  AlertCircle,
  Image as ImageIcon
} from "lucide-react"
import QuestionImage from "@/app/components/QuestionImage"
import StudentResultRow, { type StudentResult } from "./StudentResultRow"
import AssignQuestionsModal from "../AssignQuestionsModal"
import CreateDirectQuestionModal from "../CreateDirectQuestionModal"
import EditQuestionInTryoutModal from "../EditQuestionInTryoutModal"
import RemoveQuestionBtn from "../RemoveQuestionBtn"

export const dynamic = 'force-dynamic'

export default async function TryoutDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ tryoutId: string }>
  searchParams: Promise<{ tab?: string; page?: string; q?: string }>
}) {
  const { tryoutId } = await params
  const { tab = 'questions', page: pageParam, q: qParam } = await searchParams
  const supabase = await createClient()
  const adminDb = createAdminClient()

  // 1. Fetch Tryout details
  const { data: tryout } = await adminDb
    .from('tryouts')
    .select(`
      *,
      classes(id, title)
    `)
    .eq('id', tryoutId)
    .single()

  if (!tryout) return notFound()

  // 2. Fetch Assigned questions in order
  const { data: assignedRows = [] } = await adminDb
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
  const { data: bankQuestions = [] } = await adminDb
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
  const { data: categories = [] } = await adminDb
    .from('question_categories')
    .select('id, name')
    .eq('program_type', tryout.program_type)

  // 5. Fetch attempt results
  const { data: attempts = [] } = await adminDb
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

  // Hasil peserta: satu baris per siswa (skor tertinggi, attempt terakhir), peringkat dari skor tertinggi
  const RESULTS_PER_PAGE = 20
  const resultsQuery = (qParam || '').trim()
  const byStudent = new Map<string, any[]>()
  for (const att of attemptsList as any[]) {
    const list = byStudent.get(att.student_id) || []
    list.push(att)
    byStudent.set(att.student_id, list)
  }
  const studentResults: StudentResult[] = Array.from(byStudent.entries())
    .map(([studentId, atts]) => {
      const sorted = [...atts].sort((x, y) => (y.attempt_number || 0) - (x.attempt_number || 0)) // terbaru dulu
      const scores = atts.map(a => a.score).filter((v: any) => v != null).map(Number)
      const latest = sorted[0]
      // Percobaan dengan skor tertinggi (benar / total di tabel mengikuti percobaan ini)
      const best = atts.reduce((acc: any, a: any) => (acc == null || Number(a.score ?? -1) > Number(acc.score ?? -1) ? a : acc), null)
      return {
        studentId,
        rank: 0,
        name: latest.profiles?.full_name || 'Siswa',
        email: latest.profiles?.email || '',
        attemptsDone: atts.length,
        maxAttempts: (tryout as any)?.max_attempts ?? null,
        bestScore: scores.length ? Math.max(...scores) : null,
        bestCorrect: best?.total_correct ?? 0,
        latestStatus: latest.status,
        latestFinishedAt: latest.finished_at || null,
        attempts: sorted.map(a => ({
          id: a.id,
          attemptNumber: a.attempt_number || 1,
          totalCorrect: a.total_correct ?? 0,
          score: a.score ?? null,
          status: a.status,
          finishedAt: a.finished_at || null
        }))
      }
    })
    .sort((x, y) => (y.bestScore ?? -1) - (x.bestScore ?? -1))
    .map((r, i) => ({ ...r, rank: i }))

  const filteredAttempts = resultsQuery
    ? studentResults.filter(r => {
        const needle = resultsQuery.toLowerCase()
        return r.name.toLowerCase().includes(needle) || r.email.toLowerCase().includes(needle)
      })
    : studentResults
  const totalPages = Math.max(1, Math.ceil(filteredAttempts.length / RESULTS_PER_PAGE))
  const currentPage = Math.min(Math.max(parseInt(pageParam || '1', 10) || 1, 1), totalPages)
  const pagedAttempts = filteredAttempts.slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE)
  const pageHref = (n: number) =>
    `/admin/tryouts/${tryoutId}?tab=results&page=${n}${resultsQuery ? `&q=${encodeURIComponent(resultsQuery)}` : ''}`

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
                categories={categories || []}
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
                        {q?.question_image_url && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md">
                            <ImageIcon className="w-3 h-3" /> Ada Gambar
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <EditQuestionInTryoutModal
                          tryoutId={tryoutId}
                          question={q}
                          categories={categories || []}
                        />
                        <RemoveQuestionBtn
                          tryoutId={tryoutId}
                          questionId={row.question_id}
                        />
                      </div>
                    </div>

                    <p className="text-brand-dark font-medium text-sm leading-relaxed whitespace-pre-line pl-10">
                      {q?.question_text}
                    </p>

                    {q?.question_image_url && (
                      <div className="pl-10">
                        <QuestionImage src={q.question_image_url} alt="Lampiran Soal" />
                      </div>
                    )}

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
          {attemptsList.length > 0 && (
            <form method="get" className="flex items-center gap-2 mb-4">
              <input type="hidden" name="tab" value="results" />
              <input
                type="text"
                name="q"
                defaultValue={resultsQuery}
                placeholder="Cari nama atau email siswa..."
                className="flex-1 max-w-sm p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-blue bg-white"
              />
              <button type="submit" className="px-4 py-2.5 bg-brand-darkblue text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition">
                Cari
              </button>
              {resultsQuery && (
                <Link href={`/admin/tryouts/${tryoutId}?tab=results`} className="px-3 py-2.5 text-xs font-bold text-gray-500 hover:text-brand-dark">
                  Reset
                </Link>
              )}
            </form>
          )}
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
                  <th className="pb-3">Percobaan</th>
                  <th className="pb-3">Benar / Total</th>
                  <th className="pb-3">Skor Akhir</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Waktu Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {pagedAttempts.map((r) => (
                  <StudentResultRow key={r.studentId} student={r} totalQuestions={questionsList.length} />
                ))}
              </tbody>
            </table>
          )}

          {attemptsList.length > 0 && filteredAttempts.length === 0 && (
            <p className="text-center py-8 text-sm text-gray-400">Tidak ada siswa yang cocok dengan pencarian.</p>
          )}

          {filteredAttempts.length > RESULTS_PER_PAGE && (
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 text-xs font-bold text-gray-500">
              <span>
                {(currentPage - 1) * RESULTS_PER_PAGE + 1}–{Math.min(currentPage * RESULTS_PER_PAGE, filteredAttempts.length)} dari {filteredAttempts.length}
              </span>
              <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                  <Link href={pageHref(currentPage - 1)} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-brand-dark transition">Sebelumnya</Link>
                ) : (
                  <span className="px-3 py-2 rounded-lg bg-gray-50 text-gray-300">Sebelumnya</span>
                )}
                <span>Halaman {currentPage} / {totalPages}</span>
                {currentPage < totalPages ? (
                  <Link href={pageHref(currentPage + 1)} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-brand-dark transition">Berikutnya</Link>
                ) : (
                  <span className="px-3 py-2 rounded-lg bg-gray-50 text-gray-300">Berikutnya</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

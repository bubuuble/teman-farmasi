import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Image as ImageIcon
} from "lucide-react"
import QuestionForm from "../QuestionForm"
import DeleteQuestionBtn from "../DeleteQuestionBtn"
import ExcelUploadModal from "../ExcelUploadModal"
import DownloadTemplateBtn from "../DownloadTemplateBtn"

export const dynamic = 'force-dynamic'

export default async function CategoryQuestionsPage({
  params
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params

  const supabase = await createClient()
  const adminDb = createAdminClient()

  // 1. Fetch kategori info
  let { data: category, error: catErr } = await supabase
    .from('question_categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (catErr || !category) {
    // Fallback to adminDb if session cookie has RLS evaluation gap
    const { data: adminCategory } = await adminDb
      .from('question_categories')
      .select('*')
      .eq('id', categoryId)
      .single()
    category = adminCategory
  }

  if (!category) return notFound()

  // 2. Fetch soal & opsi
  const { data: questions = [] } = await (category ? adminDb : supabase)
    .from('questions')
    .select(`
      *,
      question_options(*)
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER WITH BREADCRUMB */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/admin/question-bank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-pink transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Bank Soal
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-bold text-gray-400 capitalize">
            {category.program_type === 'ukmppai' ? 'Kelas UKMPPAI' : 'Masuk Apoteker'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              {category.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
              {category.description || 'Kelola butir soal, opsi jawaban (A–E), dan pembahasan detail.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <DownloadTemplateBtn />
            <ExcelUploadModal categoryId={category.id} />
            <QuestionForm categoryId={category.id} />
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-sm font-semibold text-gray-600">
          Daftar Butir Soal
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Total: <span className="font-extrabold text-brand-dark">{questions?.length || 0}</span> butir soal
        </div>
      </div>

      {/* LIST SOAL */}
      {(!questions || questions.length === 0) ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-700 text-lg">Belum ada soal di kategori ini</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1 mb-6">
            Klik tombol tambah soal di bawah untuk mulai menginput soal kasus dan opsi jawaban.
          </p>
          <QuestionForm categoryId={category.id} />
        </div>
      ) : (
        <div className="space-y-5">
          {questions.map((q: any, idx: number) => {
            const sortedOptions = (q.question_options || []).sort((a: any, b: any) =>
              a.label.localeCompare(b.label)
            )

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-dark/5 font-extrabold text-brand-dark flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    {q.question_image_url && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md">
                        <ImageIcon className="w-3 h-3" /> Ada Gambar
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <QuestionForm categoryId={categoryId} question={q} />
                    <DeleteQuestionBtn questionId={q.id} categoryId={categoryId} />
                  </div>
                </div>

                {/* TEXT SOAL */}
                <p className="text-brand-dark font-medium text-sm leading-relaxed whitespace-pre-line">
                  {q.question_text}
                </p>

                {/* GAMBAR JIKA ADA */}
                {q.question_image_url && (
                  <div className="my-3 max-w-md rounded-2xl overflow-hidden border border-gray-100">
                    <img
                      src={q.question_image_url}
                      alt="Lampiran Soal"
                      className="w-full h-auto object-cover max-h-72"
                    />
                  </div>
                )}

                {/* OPSI JAWABAN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {sortedOptions.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`flex items-start gap-2.5 p-3 rounded-2xl border text-xs font-medium leading-relaxed ${
                        opt.is_correct
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                          : 'border-gray-100 bg-gray-50/50 text-gray-700'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                          opt.is_correct
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-500'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="flex-1 mt-0.5">{opt.option_text}</span>
                      {opt.is_correct && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>

                {/* PEMBAHASAN */}
                {q.explanation && (
                  <div className="p-4 bg-brand-yellow/15 rounded-2xl border border-brand-yellow/30 text-xs text-brand-dark mt-2">
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-brand-dark">
                      <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                      Pembahasan & Rasionalisasi:
                    </div>
                    <p className="leading-relaxed opacity-90 whitespace-pre-line">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

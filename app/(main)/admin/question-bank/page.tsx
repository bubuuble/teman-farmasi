import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { 
  FileQuestion, 
  FolderPlus, 
  ChevronRight, 
  GraduationCap, 
  Award,
  Layers
} from "lucide-react"
import CategoryForm from "./CategoryForm"
import DeleteCategoryBtn from "./DeleteCategoryBtn"

export const dynamic = 'force-dynamic'

export default async function QuestionBankPage({
  searchParams
}: {
  searchParams: Promise<{ program?: string }>
}) {
  const supabase = await createClient()
  const { program = 'all' } = await searchParams

  // Fetch categories with questions count
  let query = supabase
    .from('question_categories')
    .select(`
      *,
      questions(count)
    `)
    .order('created_at', { ascending: false })

  if (program && program !== 'all') {
    query = query.eq('program_type', program)
  }

  const { data: categories = [], error } = await query

  const totalQuestions = categories?.reduce((acc: number, curr: any) => {
    const count = curr.questions?.[0]?.count || 0
    return acc + count
  }, 0) || 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/30 text-brand-dark text-xs font-bold uppercase tracking-wider mb-2">
            <FileQuestion className="w-3.5 h-3.5" />
            Bank Soal & Blueprint
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
            Bank Soal UKAI Series
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola koleksi soal pilihan ganda (A–E) dan kelompokkan berdasarkan rumpun ilmu
          </p>
        </div>

        <CategoryForm />
      </div>

      {/* FILTER & STATS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <Link
            href="/admin/question-bank?program=all"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              program === 'all'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            Semua ({categories?.length || 0})
          </Link>
          <Link
            href="/admin/question-bank?program=masuk_apoteker"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              program === 'masuk_apoteker'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Masuk Apoteker
          </Link>
          <Link
            href="/admin/question-bank?program=ukmppai"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              program === 'ukmppai'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Kelas UKMPPAI
          </Link>
        </div>

        <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-xs font-semibold text-gray-500">
          <div>
            Total Kategori: <span className="font-extrabold text-brand-dark">{categories?.length || 0}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div>
            Total Soal: <span className="font-extrabold text-brand-pink">{totalQuestions}</span> butir
          </div>
        </div>
      </div>

      {/* CATEGORIES GRID */}
      {(!categories || categories.length === 0) ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-700 text-lg">Belum ada kategori soal</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1 mb-6">
            Mulai dengan menambahkan kategori soal seperti Farmakologi, Farmasetika, atau Farmasi Klinis.
          </p>
          <CategoryForm />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat: any) => {
            const count = cat.questions?.[0]?.count || 0
            const isUkmppai = cat.program_type === 'ukmppai'

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                    isUkmppai 
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : 'bg-orange-50 text-orange-700 border border-orange-100'
                  }`}>
                    {isUkmppai ? 'UKMPPAI' : 'Masuk Apoteker'}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <CategoryForm category={cat} />
                    <DeleteCategoryBtn categoryId={cat.id} categoryName={cat.name} />
                  </div>
                </div>

                <Link href={`/admin/question-bank/${cat.id}`} className="block flex-1">
                  <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-pink transition line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                    {cat.description || 'Tidak ada deskripsi kategori'}
                  </p>
                </Link>

                <div className="pt-4 border-t border-gray-50 mt-5 flex items-center justify-between">
                  <div className="text-xs font-extrabold text-brand-dark flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-pink" />
                    <span>{count} Butir Soal</span>
                  </div>

                  <Link
                    href={`/admin/question-bank/${cat.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 group-hover:text-brand-pink transition"
                  >
                    Buka Soal <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

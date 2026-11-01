import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { 
  ClipboardCheck, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  GraduationCap, 
  Award,
  Users,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react"
import TryoutForm from "./TryoutForm"
import DeleteTryoutBtn from "./DeleteTryoutBtn"

export const dynamic = 'force-dynamic'

export default async function TryoutsManagementPage({
  searchParams
}: {
  searchParams: Promise<{ program?: string }>
}) {
  const supabase = await createClient()
  const { program = 'all' } = await searchParams

  // 1. Fetch available classes for assignment dropdown
  const { data: classes = [] } = await supabase
    .from('classes')
    .select('id, title')
    .order('title', { ascending: true })

  // 2. Fetch tryouts with attempt count
  let query = supabase
    .from('tryouts')
    .select(`
      *,
      classes(title),
      tryout_attempts(count)
    `)
    .order('created_at', { ascending: false })

  if (program && program !== 'all') {
    query = query.eq('program_type', program)
  }

  const { data: tryouts = [] } = await query

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            CBT Exam Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
            Manajemen Tryout CBT
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Buat jadwal ujian simulasi, assign butir soal dari bank soal, dan pantau skor peserta
          </p>
        </div>

        <TryoutForm classes={classes || []} />
      </div>

      {/* FILTER PROGRAM */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <Link
            href="/admin/tryouts?program=all"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              program === 'all'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            Semua ({tryouts?.length || 0})
          </Link>
          <Link
            href="/admin/tryouts?program=masuk_apoteker"
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
            href="/admin/tryouts?program=ukmppai"
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

        <div className="text-xs font-semibold text-gray-500">
          Total Paket Tryout: <span className="font-extrabold text-brand-dark">{tryouts?.length || 0}</span>
        </div>
      </div>

      {/* LIST TRYOUT */}
      {(!tryouts || tryouts.length === 0) ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-700 text-lg">Belum ada paket ujian tryout</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1 mb-6">
            Klik tombol buat tryout untuk mengatur durasi, kuota pengerjaan, dan memilih soal ujian.
          </p>
          <TryoutForm classes={classes || []} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tryouts.map((t: any) => {
            const attemptCount = t.tryout_attempts?.[0]?.count || 0
            const isUkmppai = t.program_type === 'ukmppai'

            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                      isUkmppai 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}>
                      {isUkmppai ? 'UKMPPAI' : 'Masuk Apoteker'}
                    </span>

                    {t.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <TryoutForm tryout={t} classes={classes || []} />
                    <DeleteTryoutBtn tryoutId={t.id} tryoutTitle={t.title} />
                  </div>
                </div>

                <Link href={`/admin/tryouts/${t.id}`} className="block flex-1">
                  <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-pink transition line-clamp-1">
                    {t.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                    {t.description || 'Tidak ada petunjuk khusus'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-gray-500">
                    <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{t.duration_minutes ? `${t.duration_minutes} Menit` : 'Tanpa Batas'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span>{t.total_questions} Soal</span>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span>{attemptCount} Submit</span>
                    </div>
                  </div>

                  {t.classes?.title && (
                    <div className="mt-3 text-[11px] font-bold text-brand-dark/70 bg-brand-cream/60 px-3 py-1.5 rounded-xl border border-brand-dark/5 line-clamp-1">
                      Kelas: {t.classes.title}
                    </div>
                  )}
                </Link>

                <div className="pt-4 border-t border-gray-50 mt-5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-medium">
                    Max: {t.max_attempts ? `${t.max_attempts}x Percobaan` : 'Unlimited'}
                  </span>

                  <Link
                    href={`/admin/tryouts/${t.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 group-hover:text-brand-pink transition"
                  >
                    Kelola Ujian <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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

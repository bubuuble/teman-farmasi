import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { 
  ClipboardCheck, 
  Clock, 
  ChevronRight, 
  GraduationCap, 
  Award,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Search
} from "lucide-react"
import TryoutForm from "./TryoutForm"
import DeleteTryoutBtn from "./DeleteTryoutBtn"

export const dynamic = 'force-dynamic'

export default async function TryoutsManagementPage({
  searchParams
}: {
  searchParams: Promise<{ program?: string; q?: string }>
}) {
  const adminDb = createAdminClient()
  const { program = 'all', q = '' } = await searchParams

  // 1. Fetch UKAI Series classes only for assignment dropdown
  const { data: classes = [] } = await adminDb
    .from('classes')
    .select('id, title')
    .or('title.ilike.%UKAI%,title.ilike.%UKMPPAI%,title.ilike.%Apoteker%,title.ilike.%ukai%')
    .order('title', { ascending: true })

  // 2. Fetch all UKAI Series tryouts (masuk_apoteker + ukmppai only)
  let query = adminDb
    .from('tryouts')
    .select(`
      *,
      classes(title),
      sub_classes(title),
      tryout_attempts(count)
    `)
    .in('program_type', ['masuk_apoteker', 'ukmppai'])
    .order('created_at', { ascending: false })

  if (program && program !== 'all') {
    query = query.eq('program_type', program)
  }

  if (q?.trim()) {
    query = query.ilike('title', `%${q.trim()}%`)
  }

  const { data: tryouts = [] } = await query

  // Count per program for badges
  const { data: allTryouts = [] } = await adminDb
    .from('tryouts')
    .select('program_type')
    .in('program_type', ['masuk_apoteker', 'ukmppai'])

  const countAll = allTryouts?.length || 0
  const countMasukApoteker = allTryouts?.filter(t => t.program_type === 'masuk_apoteker').length || 0
  const countUkmppai = allTryouts?.filter(t => t.program_type === 'ukmppai').length || 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            UKAI Series — CBT Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
            Manajemen Tryout CBT
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola paket ujian simulasi UKAI Series — Masuk Apoteker & UKMPPAI
          </p>
        </div>

        <TryoutForm classes={classes || []} />
      </div>

      {/* FILTER + SEARCH ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Program Filter Tabs */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <Link
            href={`/admin/tryouts?program=all${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              program === 'all'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            Semua ({countAll})
          </Link>
          <Link
            href={`/admin/tryouts?program=masuk_apoteker${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              program === 'masuk_apoteker'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Masuk Apoteker ({countMasukApoteker})
          </Link>
          <Link
            href={`/admin/tryouts?program=ukmppai${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              program === 'ukmppai'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            UKMPPAI ({countUkmppai})
          </Link>
        </div>

        {/* Search Bar */}
        <form method="GET" action="/admin/tryouts" className="flex items-center gap-2">
          {program !== 'all' && (
            <input type="hidden" name="program" value={program} />
          )}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari judul tryout..."
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink w-64 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-dark text-white text-xs font-bold rounded-xl hover:bg-brand-pink transition shadow-sm"
          >
            Cari
          </button>
          {q && (
            <Link
              href={`/admin/tryouts${program !== 'all' ? `?program=${program}` : ''}`}
              className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
            >
              Reset
            </Link>
          )}
        </form>
      </div>

      {/* Search result indicator */}
      {q && (
        <div className="text-sm text-gray-500 font-medium">
          Hasil pencarian untuk <span className="font-bold text-brand-dark">&ldquo;{q}&rdquo;</span>: {tryouts?.length || 0} tryout ditemukan
        </div>
      )}

      {/* LIST TRYOUT */}
      {(!tryouts || tryouts.length === 0) ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
            {q ? <Search className="w-8 h-8" /> : <ClipboardCheck className="w-8 h-8" />}
          </div>
          <h3 className="font-bold text-gray-700 text-lg">
            {q ? `Tidak ada tryout yang cocok dengan "${q}"` : 'Belum ada paket ujian tryout'}
          </h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1 mb-6">
            {q ? 'Coba kata kunci lain atau reset pencarian.' : 'Klik tombol buat tryout untuk mengatur durasi, kuota pengerjaan, dan memilih soal ujian.'}
          </p>
          {!q && <TryoutForm classes={classes || []} />}
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

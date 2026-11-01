import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { 
  FileCheck, 
  Clock, 
  ChevronRight, 
  GraduationCap, 
  Award,
  Play,
  RotateCcw,
  CheckCircle2,
  Search
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function StudentTryoutsPage({
  searchParams
}: {
  searchParams: Promise<{ program?: string; q?: string }>
}) {
  const supabase = await createClient()
  const adminDb = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { program = 'all', q = '' } = await searchParams

  // 1. Ambil kelas di mana student terdaftar
  const { data: enrollments = [] } = await supabase
    .from('enrollments')
    .select('class_id')
    .eq('student_id', user?.id || '')
    .eq('status', 'active')

  const enrolledClassIds = (enrollments || []).map(e => e.class_id).filter(Boolean)

  // 2. Ambil tryout aktif dari UKAI Series (masuk_apoteker + ukmppai) via admin client
  let query = adminDb
    .from('tryouts')
    .select(`
      *,
      classes(title)
    `)
    .eq('is_active', true)
    .in('program_type', ['masuk_apoteker', 'ukmppai'])
    .order('created_at', { ascending: false })

  if (program && program !== 'all') {
    query = query.eq('program_type', program)
  }

  if (q?.trim()) {
    query = query.ilike('title', `%${q.trim()}%`)
  }

  const { data: tryouts = [] } = await query
  const tryoutsList = tryouts || []

  // Count totals for badges
  const { data: allActive = [] } = await adminDb
    .from('tryouts')
    .select('program_type')
    .eq('is_active', true)
    .in('program_type', ['masuk_apoteker', 'ukmppai'])

  const countAll = allActive?.length || 0
  const countMasukApoteker = allActive?.filter(t => t.program_type === 'masuk_apoteker').length || 0
  const countUkmppai = allActive?.filter(t => t.program_type === 'ukmppai').length || 0

  // 3. Ambil riwayat attempts student untuk masing-masing tryout
  const { data: userAttempts = [] } = await supabase
    .from('tryout_attempts')
    .select('*')
    .eq('student_id', user?.id || '')
    .order('started_at', { ascending: false })

  const attemptsList = userAttempts || []

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            UKAI Series — CBT Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
            Simulasi Tryout CBT
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Uji kesiapan ujian seleksi Masuk Apoteker dan sertifikasi nasional UKMPPAI
          </p>
        </div>
      </div>

      {/* FILTER + SEARCH ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Program Filter Tabs */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <Link
            href={`/student/tryouts?program=all${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              program === 'all'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            Semua ({countAll})
          </Link>
          <Link
            href={`/student/tryouts?program=masuk_apoteker${q ? `&q=${encodeURIComponent(q)}` : ''}`}
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
            href={`/student/tryouts?program=ukmppai${q ? `&q=${encodeURIComponent(q)}` : ''}`}
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
        <form method="GET" action="/student/tryouts" className="flex items-center gap-2">
          {program !== 'all' && (
            <input type="hidden" name="program" value={program} />
          )}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari tryout..."
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink w-56 shadow-sm"
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
              href={`/student/tryouts${program !== 'all' ? `?program=${program}` : ''}`}
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
          Hasil pencarian untuk <span className="font-bold text-brand-dark">&ldquo;{q}&rdquo;</span>: {tryoutsList.length} tryout ditemukan
        </div>
      )}

      {/* LIST TRYOUT */}
      {(!tryoutsList || tryoutsList.length === 0) ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          {q ? (
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          ) : (
            <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          )}
          <h3 className="font-bold text-gray-700 text-base">
            {q ? `Tidak ada tryout yang cocok dengan "${q}"` : 'Belum ada tryout aktif'}
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            {q ? 'Coba kata kunci lain atau reset pencarian.' : 'Tryout yang dijadwalkan oleh mentor atau admin akan muncul di sini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tryoutsList.map((t: any) => {
            const isUkmppai = t.program_type === 'ukmppai'
            const hasClassConstraint = !!t.class_id
            const isEnrolled = !hasClassConstraint || enrolledClassIds.includes(t.class_id)

            // Ambil attempt siswa untuk tryout ini
            const myAttempts = attemptsList.filter((a: any) => a.tryout_id === t.id)
            const completedAttempts = myAttempts.filter((a: any) => a.status === 'completed')
            const inProgressAttempt = myAttempts.find((a: any) => a.status === 'in_progress')
            const bestScore = completedAttempts.length > 0
              ? Math.max(...completedAttempts.map((a: any) => Number(a.score || 0)))
              : null

            const hasResults = completedAttempts.length > 0
            const isMaxReached = t.max_attempts && myAttempts.length >= t.max_attempts && !inProgressAttempt

            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                      isUkmppai 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}>
                      {isUkmppai ? 'UKMPPAI' : 'Masuk Apoteker'}
                    </span>

                    {bestScore !== null && (
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        Skor: {bestScore.toFixed(0)}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-pink transition line-clamp-1 mb-2">
                    {t.title}
                  </h3>

                  <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                    {t.description || 'Simulasi pengerjaan ujian berbasis komputer.'}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-gray-500 mb-4">
                    <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{t.duration_minutes ? `${t.duration_minutes} Menit` : 'Tanpa Batas'}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <FileCheck className="w-3 h-3 text-gray-400" />
                      <span>{t.total_questions} Soal</span>
                    </div>
                  </div>

                  {t.classes?.title && (
                    <div className="text-[11px] font-bold text-brand-dark/70 bg-brand-cream/60 px-3 py-1.5 rounded-xl border border-brand-dark/5 line-clamp-1 mb-4">
                      Kelas: {t.classes.title}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-gray-400 font-medium shrink-0">
                    Percobaan: {myAttempts.length} / {t.max_attempts ? `${t.max_attempts}x` : '∞'}
                  </span>

                  {!isEnrolled ? (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">
                      Perlu Terdaftar
                    </span>
                  ) : inProgressAttempt ? (
                    <Link
                      href={`/student/tryouts/${t.id}/exam`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition shadow-sm active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Lanjutkan
                    </Link>
                  ) : hasResults && isMaxReached ? (
                    <Link
                      href={`/student/tryouts/${t.id}/result`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-brand-pink transition shadow-sm active:scale-95"
                    >
                      Lihat Hasil <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : hasResults && !isMaxReached ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/student/tryouts/${t.id}/result`}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-brand-dark bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                      >
                        Lihat Hasil
                      </Link>
                      <Link
                        href={`/student/tryouts/${t.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-pink text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition shadow-sm active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5" /> Mulai Ujian
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/student/tryouts/${t.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-pink text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition shadow-sm active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5" /> Mulai Ujian
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

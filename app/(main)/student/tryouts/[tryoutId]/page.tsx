import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Clock, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  Sparkles,
  HelpCircle
} from "lucide-react"
import StartTryoutBtn from "./StartTryoutBtn"

export const dynamic = 'force-dynamic'

export default async function TryoutIntroPage({
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
    .select(`
      *,
      classes(title)
    `)
    .eq('id', tryoutId)
    .single()

  if (!tryout || !tryout.is_active) return notFound()

  // 2. Cek enrollment jika terikat kelas
  if (tryout.class_id) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('class_id', tryout.class_id)
      .eq('student_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!enrollment) {
      return (
        <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border border-red-100 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-brand-dark">Akses Terbatas</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tryout ini hanya dapat diakses oleh siswa yang terdaftar aktif di kelas{' '}
            <span className="font-bold text-brand-dark">{tryout.classes?.title || 'kelas terkait'}</span>.
          </p>
          <Link
            href="/student/tryouts"
            className="inline-block px-6 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-bold"
          >
            Kembali ke Daftar Tryout
          </Link>
        </div>
      )
    }
  }

  // 3. Cek riwayat attempts
  const { data: attempts = [] } = await supabase
    .from('tryout_attempts')
    .select('*')
    .eq('tryout_id', tryoutId)
    .eq('student_id', user.id)
    .order('attempt_number', { ascending: false })

  const attemptsList = attempts || []
  const inProgress = attemptsList.find(a => a.status === 'in_progress')
  const completedAttempts = attemptsList.filter(a => a.status === 'completed')
  const isMaxReached = tryout.max_attempts && attemptsList.length >= tryout.max_attempts && !inProgress

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        href="/student/tryouts"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-pink transition"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Portal Tryout
      </Link>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink inline-block mb-3">
            {tryout.program_type === 'ukmppai' ? 'Kelas UKMPPAI' : 'Masuk Apoteker'}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-dark">
            {tryout.title}
          </h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {tryout.description || 'Simulasi ujian Computer Based Test (CBT) komprehensif.'}
          </p>
        </div>

        {/* INFO SPEC TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-brand-cream/60 rounded-2xl border border-brand-dark/5">
            <p className="text-[10px] uppercase font-bold text-gray-400">Durasi Ujian</p>
            <p className="text-base font-extrabold text-brand-dark mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-pink" />
              {tryout.duration_minutes ? `${tryout.duration_minutes} Menit` : 'Tanpa Batas'}
            </p>
          </div>

          <div className="p-4 bg-brand-cream/60 rounded-2xl border border-brand-dark/5">
            <p className="text-[10px] uppercase font-bold text-gray-400">Jumlah Soal</p>
            <p className="text-base font-extrabold text-brand-dark mt-1 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-brand-blue" />
              {tryout.total_questions} Soal
            </p>
          </div>

          <div className="p-4 bg-brand-cream/60 rounded-2xl border border-brand-dark/5 col-span-2 sm:col-span-1">
            <p className="text-[10px] uppercase font-bold text-gray-400">Batas Percobaan</p>
            <p className="text-base font-extrabold text-brand-dark mt-1">
              {attemptsList.length} / {tryout.max_attempts ? `${tryout.max_attempts}x` : '∞'}
            </p>
          </div>
        </div>

        {/* PETUNJUK PENGERJAAN */}
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
          <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-pink" />
            Petunjuk & Tata Tertib CBT:
          </h3>
          <ul className="text-xs text-gray-600 space-y-2 leading-relaxed list-disc list-inside">
            <li>Pastikan koneksi internet stabil selama pelaksanaan ujian simulasi.</li>
            <li>Jawaban Anda akan <strong>tersimpan otomatis</strong> setiap kali Anda memilih salah satu opsi.</li>
            <li>Gunakan tombol <strong>Ragu-ragu</strong> untuk menandai nomor soal yang ingin Anda tinjau kembali.</li>
            <li>Waktu ujian akan otomatis menghitung mundur jika durasi telah ditentukan. Bila waktu habis, lembar ujian akan tersubmit secara otomatis.</li>
            <li>Hasil skor dan pembahasan jawaban per butir soal dapat langsung dilihat setelah ujian disubmit.</li>
          </ul>
        </div>

        {/* CTA ACTIONS */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-medium">
            {isMaxReached ? (
              <span className="text-amber-600 font-bold">
                Anda sudah mencapai batas kesempatan tryout ini.
              </span>
            ) : inProgress ? (
              <span className="text-emerald-700 font-bold">
                Ada ujian yang sedang berjalan. Klik tombol untuk melanjutkan.
              </span>
            ) : (
              <span>Siap memulai ujian sekarang?</span>
            )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto justify-end">
            {completedAttempts.length > 0 && (
              <Link
                href={`/student/tryouts/${tryoutId}/result`}
                className="px-5 py-3 border border-gray-200 text-brand-dark rounded-xl text-xs font-bold hover:bg-gray-50 transition text-center"
              >
                Lihat Hasil Sebelumnya
              </Link>
            )}

            {!isMaxReached && (
              <StartTryoutBtn
                tryoutId={tryoutId}
                label={inProgress ? 'Lanjutkan Ujian' : 'Mulai Ujian Sekarang'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

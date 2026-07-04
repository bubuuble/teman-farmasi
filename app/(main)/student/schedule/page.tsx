// app/(main)/student/schedule/page.tsx

import { createClient } from "@/lib/supabase/server"
import SessionCard from "./SessionCard"
import Link from "next/link"
import { BookOpen, ArrowRight, AlertCircle, History } from "lucide-react"

// --- DEFINISI TIPE DATA ---

type SessionData = {
  id: string
  title: string
  date_time: string
  zoom_link: string
  is_open: boolean
  classes: { id: string; title: string; level: string } | null
  sub_classes: { id: string; title: string } | null
}

type ClassInfo = {
  id: string
  title: string
  level: string
}

export default async function StudentSchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Ambil Enrollments & Classes
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('class_id, sub_class_id, classes ( id, title, level )')
    .eq('student_id', user.id)
    .eq('status', 'active')

  const myClasses = (enrollments?.map(e => e.classes).filter(Boolean) || []) as unknown as ClassInfo[]

  // 2. Ambil Sesi Jadwal berdasarkan class_id & sub_class_id dari enrollments
  let sessions: SessionData[] = []
  if (enrollments && enrollments.length > 0) {
      const orParts = enrollments.map(e => 
        e.sub_class_id 
          ? `and(class_id.eq.${e.class_id},sub_class_id.eq.${e.sub_class_id})` 
          : `and(class_id.eq.${e.class_id},sub_class_id.is.null)`
      )

      const { data: rawSessions } = await supabase
        .from('attendance_sessions')
        .select(`
            id, title, date_time, zoom_link, is_open, class_id, sub_class_id,
            classes ( id, title, level ),
            sub_classes ( id, title )
        `)
        .or(orParts.join(','))
        .order('date_time', { ascending: true })

      sessions = (rawSessions as unknown as SessionData[]) || []
  }

  // 3. Ambil Data Kehadiran
  const { data: myRecords } = await supabase
    .from('attendance_records')
    .select('session_id, status')
    .eq('student_id', user.id)

  const attendanceMap: Record<string, string> = {}
  myRecords?.forEach(r => { attendanceMap[r.session_id] = r.status })

  // --- LOGIKA PEMISAHAN BARU ---
  
  // 1. Belum Absen (Sesi Terbuka & Siswa belum klik hadir)
  const pendingSessions = sessions.filter(s => !attendanceMap[s.id] && s.is_open)
  
  // 2. Sudah Absen (Berhasil Hadir)
  const completedSessions = sessions.filter(s => attendanceMap[s.id]).reverse() // Terbaru di atas

  return (
    <div className="space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="font-heading font-bold text-4xl text-brand-dark">Jadwal & Absensi</h1>
            <p className="text-gray-500 font-medium mt-2">Kelola kehadiranmu di setiap sesi pertemuan dengan mudah.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-3 h-3 bg-brand-pink rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-brand-dark uppercase tracking-widest">Sesi Aktif Hari Ini</span>
        </div>
      </div>

      {/* SECTION 1: BELUM ABSEN (URGENT) */}
      {pendingSessions.length > 0 && (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-brand-pink rounded-full"></div>
                <h2 className="font-heading font-bold text-2xl text-brand-dark flex items-center gap-3">
                    Belum Diabsen <AlertCircle className="w-6 h-6 text-brand-pink animate-bounce" />
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pendingSessions.map(session => (
                    <SessionCard key={session.id} session={session} attendanceStatus={null} />
                ))}
            </div>
        </section>
      )}


      {/* SECTION 3: SUDAH SELESAI */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
            <div className="w-2 h-10 bg-green-500 rounded-full"></div>
            <h2 className="font-heading font-bold text-2xl text-brand-dark">Riwayat Absensi</h2>
        </div>
        {completedSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {completedSessions.map(session => (
                    <SessionCard key={session.id} session={session} attendanceStatus={attendanceMap[session.id]} />
                ))}
            </div>
        ) : (
            <div className="p-16 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Belum ada riwayat absensi yang tercatat.</p>
            </div>
        )}
      </section>

      {/* SECTION 4: DAFTAR KELAS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
            <div className="w-2 h-10 bg-brand-yellow rounded-full"></div>
            <h2 className="font-heading font-bold text-2xl text-brand-dark">Kelas Saya</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myClasses.map((cls: ClassInfo) => (
                <div key={cls.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-pink group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-brand-pink bg-brand-pink/10 px-3 py-1 rounded-full uppercase tracking-widest">{cls.level}</span>
                    </div>
                    <h3 className="font-heading font-bold text-brand-dark text-xl mb-6 group-hover:text-brand-pink transition-colors">{cls.title}</h3>
                    <Link href={`/student/classes/${cls.id}`} className="mt-auto w-full py-4 rounded-2xl bg-brand-yellow text-brand-dark font-bold text-sm text-center hover:bg-brand-dark hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm">
                        Buka Materi <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ))}
        </div>
      </section>

    </div>
  )
}
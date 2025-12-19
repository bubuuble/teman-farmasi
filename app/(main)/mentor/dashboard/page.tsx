// app/(main)/mentor/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server"
import { BookOpen, Calendar, Clock, Users, ClipboardCheck } from "lucide-react"
import Link from "next/link"

type NextSessionData = {
  id: string
  title: string
  date_time: string
  zoom_link: string | null
  batches: {
    name: string
    classes: {
      title: string
    } | null
  } | null
}

export default async function MentorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Ambil Kelas yang Diajar & Hitung Total Kelas
  const { data: myAssignments } = await supabase
    .from('class_mentors')
    .select('class_id')
    .eq('mentor_id', user.id)

  const classCount = myAssignments?.length || 0
  const myClassIds = myAssignments?.map(a => a.class_id) || []

  // 2. Hitung Total Siswa Unik (Active)
  let studentCount = 0
  if (myClassIds.length > 0) {
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('student_id')
        .in('class_id', myClassIds)
        .eq('status', 'active')

      // Menggunakan Set agar siswa yang terdaftar di beberapa kelas 
      // di bawah mentor yang sama hanya terhitung 1 kali
      studentCount = new Set(enrollmentData?.map(e => e.student_id)).size
  }

  // 3. Cari Jadwal Terdekat (Next Session)
  const { data: myBatches } = await supabase
    .from('batches')
    .select('id')
    .eq('mentor_id', user.id)

  let nextSession: NextSessionData | null = null

  if (myBatches && myBatches.length > 0) {
    const batchIds = myBatches.map(b => b.id)
    
    const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select(`
            id, title, date_time, zoom_link,
            batches ( name, classes ( title ) )
        `)
        .in('batch_id', batchIds)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })
        .limit(1)
        .maybeSingle()
    
    if (sessions) {
        nextSession = sessions as unknown as NextSessionData
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-brand-darkblue rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
            <h1 className="font-heading font-bold text-3xl mb-2 text-brand-yellow">Halo, Mentor! 🚀</h1>
            <p className="text-white/80 max-w-xl">
                Siap mencetak farmasis hebat hari ini? Jangan lupa cek jadwal mengajar dan siapkan materi sebelum kelas dimulai ya.
            </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-blue/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-card flex items-center gap-4">
                    <div className="p-3 bg-brand-cream rounded-xl text-brand-dark">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-gray uppercase font-bold">Kelas Diampu</p>
                        <h3 className="text-2xl font-bold text-brand-dark">{classCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-card flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-gray uppercase font-bold">Total Siswa</p>
                        <h3 className="text-2xl font-bold text-brand-dark">{studentCount}</h3>
                    </div>
                </div>
            </div>

            {/* Next Session Card */}
            <div className="bg-white p-8 rounded-3xl shadow-card border-l-8 border-brand-pink">
                <h3 className="font-heading font-bold text-lg text-brand-dark mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-pink" />
                    Jadwal Mengajar Terdekat
                </h3>

                {nextSession ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xl font-bold text-brand-dark">{nextSession.title}</h4>
                            <p className="text-brand-gray">
                                {nextSession.batches?.classes?.title || 'Unknown Class'} • {nextSession.batches?.name || 'Unknown Batch'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-brand-dark bg-gray-100 px-3 py-1 rounded-lg">
                                <Clock className="w-4 h-4" />
                                {new Date(nextSession.date_time).toLocaleString('id-ID', {
                                    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        </div>

                        <div className="pt-4">
                            <a 
                                href={nextSession.zoom_link || '#'} 
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block bg-brand-darkblue text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-dark transition-all"
                            >
                                Buka Zoom
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-brand-gray bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p>Belum ada jadwal sesi yang akan datang.</p>
                        <Link href="/mentor/classes" className="text-brand-pink text-sm font-bold hover:underline mt-2 inline-block">
                            + Buat Jadwal di Menu Kelas
                        </Link>
                    </div>
                )}
            </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-card">
                <h3 className="font-bold text-brand-dark mb-4">Aksi Cepat</h3>
                <div className="space-y-3">
                    <Link href="/mentor/classes" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-brand-cream transition-colors group">
                        <div className="bg-white p-2 rounded-lg shadow-sm text-brand-dark group-hover:text-brand-pink">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-brand-dark text-sm">Kelola Jadwal & Batch</span>
                    </Link>
                    <Link href="/mentor/attendance" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-brand-cream transition-colors group">
                        <div className="bg-white p-2 rounded-lg shadow-sm text-brand-dark group-hover:text-brand-pink">
                            <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-brand-dark text-sm">Input Absensi Manual</span>
                    </Link>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}
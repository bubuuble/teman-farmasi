// app/(main)/mentor/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server"
import { BookOpen, Calendar, Clock, Users, ClipboardCheck, Video } from "lucide-react"
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

export const revalidate = 0;

export default async function MentorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Ambil Kelas yang Diampu
  const { data: myAssignments } = await supabase
    .from('class_mentors')
    .select('class_id')
    .eq('mentor_id', user.id)

  const myClassIds = myAssignments?.map(a => a.class_id) || []

  // 2. Hitung Total Siswa Unik (Active)
  let studentCount = 0
  if (myClassIds.length > 0) {
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('student_id')
        .in('class_id', myClassIds)
        .eq('status', 'active')
      studentCount = new Set(enrollmentData?.map(e => e.student_id)).size
  }

  // 3. Cari Jadwal Terdekat (Berdasarkan Tanggal Hari Ini)
  let nextSession: NextSessionData | null = null

  if (myClassIds.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select(`
            id, title, date_time, zoom_link,
            batches!inner ( name, classes ( title ) )
        `)
        .in('batches.class_id', myClassIds)
        .gte('date_time', today.toISOString())
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
      <div className="bg-brand-darkblue rounded-[40px] p-10 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
            <h1 className="font-heading font-bold text-4xl mb-3 text-brand-yellow">Halo, Mentor! 🚀</h1>
            <p className="text-white/80 max-w-xl text-lg">
                Siap mencetak farmasis hebat hari ini? Jangan lupa cek jadwal mengajar harian Anda.
            </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-blue/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-8 rounded-[32px] shadow-card flex items-center gap-6 border border-gray-50">
                    <div className="w-14 h-14 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-dark">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-gray uppercase font-bold tracking-widest">Kelas Diampu</p>
                        <h3 className="text-3xl font-bold text-brand-dark">{myClassIds.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-card flex items-center gap-6 border border-gray-50">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-gray uppercase font-bold tracking-widest">Total Siswa</p>
                        <h3 className="text-3xl font-bold text-brand-dark">{studentCount}</h3>
                    </div>
                </div>
            </div>

            {/* Next Session Card */}
            <div className="bg-white p-10 rounded-[40px] shadow-card border-l-[12px] border-brand-pink border-y border-r border-gray-100">
                <h3 className="font-heading font-bold text-xl text-brand-dark mb-6 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-brand-pink" />
                    Jadwal Mengajar Terdekat
                </h3>

                {nextSession ? (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-2xl font-bold text-brand-dark mb-1">{nextSession.title}</h4>
                            <p className="text-brand-gray font-medium">
                                {nextSession.batches?.classes?.title} • {nextSession.batches?.name}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3 text-brand-dark bg-gray-50 px-5 py-3 rounded-2xl w-fit font-bold shadow-inner">
                            <Clock className="w-5 h-5 text-brand-pink" />
                            {new Date(nextSession.date_time).toLocaleDateString('id-ID', {
                                weekday: 'long', day: 'numeric', month: 'long'
                            })}
                        </div>

                        <div className="flex gap-4 pt-2">
                            {nextSession.zoom_link && (
                                <a 
                                    href={nextSession.zoom_link} 
                                    target="_blank"
                                    className="px-8 py-4 bg-brand-darkblue text-white rounded-[20px] font-bold hover:bg-brand-dark transition-all flex items-center gap-2 shadow-lg"
                                >
                                    <Video className="w-5 h-5 text-brand-yellow" /> Buka Zoom
                                </a>
                            )}
                            <Link 
                                href="/mentor/schedule"
                                className="px-8 py-4 bg-gray-100 text-brand-dark rounded-[20px] font-bold hover:bg-brand-pink hover:text-white transition-all shadow-sm"
                            >
                                Detail Jadwal
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center text-brand-gray bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                        <p>Belum ada jadwal sesi yang akan datang.</p>
                        <Link href="/mentor/classes" className="text-brand-pink text-sm font-bold hover:underline mt-2 inline-block">
                            + Buat Jadwal di Menu Kelas
                        </Link>
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-card border border-gray-50">
                <h3 className="font-bold text-brand-dark text-lg mb-6 tracking-wide">Aksi Cepat</h3>
                <div className="space-y-4">
                    <Link href="/mentor/classes" className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-brand-cream transition-all group shadow-sm">
                        <div className="bg-white p-3 rounded-xl shadow-inner text-brand-dark group-hover:text-brand-pink">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-brand-dark">Kelola Jadwal</span>
                    </Link>
                    <Link href="/mentor/attendance" className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 hover:bg-brand-cream transition-all group shadow-sm">
                        <div className="bg-white p-3 rounded-xl shadow-inner text-brand-dark group-hover:text-brand-pink">
                            <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-brand-dark">Input Absensi</span>
                    </Link>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}
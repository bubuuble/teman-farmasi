// app/(main)/student/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server"
import { BookOpen, Calendar, Clock, CheckCircle, Video } from "lucide-react"
import Link from "next/link"

type Session = {
  id: string
  title: string
  date_time: string
  zoom_link: string | null
  is_open: boolean
  classes: { title: string } | null
  sub_classes: { title: string } | null
}

export const revalidate = 0;

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Ambil Kelas Aktif
  const { count: classCount, data: enrollments } = await supabase
    .from('enrollments')
    .select('class_id, sub_class_id', { count: 'exact' })
    .eq('student_id', user.id)
    .eq('status', 'active')

  // 2. Hitung Statistik Kehadiran
  const { count: presentCount } = await supabase
    .from('attendance_records')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .in('status', ['present', 'late'])

  // 3. Cari Jadwal Terdekat (Berdasarkan Tanggal Hari Ini)
  let nextSession: Session | null = null
  
  if (enrollments && enrollments.length > 0) {
      // LOGIKA TANGGAL: Set ke awal hari ini (00:00:00) agar sesi hari ini muncul
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const orParts = enrollments.map(e => 
        e.sub_class_id 
          ? `and(class_id.eq.${e.class_id},sub_class_id.eq.${e.sub_class_id})` 
          : `and(class_id.eq.${e.class_id},sub_class_id.is.null)`
      )

      const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select(`
            id, title, date_time, zoom_link, is_open, class_id, sub_class_id,
            classes ( title ),
            sub_classes ( title )
        `)
        .or(orParts.join(','))
        .gte('date_time', today.toISOString()) // Filter Sesi >= Hari ini
        .order('date_time', { ascending: true })
        .limit(1)
        .maybeSingle()
      
      if(sessions) nextSession = sessions as unknown as Session
  }

  return (
    <div className="space-y-10">
      
      {/* Welcome Section */}
      <div className="bg-brand-darkblue rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl shadow-brand-darkblue/20">
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/10">
                <span className="w-2 h-2 bg-brand-pink rounded-full animate-pulse"></span>
                Student Dashboard
            </div>
            <h1 className="font-heading font-bold text-5xl mb-4 leading-tight text-brand-cream">
                Waktunya <span className="text-brand-yellow">Belajar</span> & <br/> Jadi <span className="text-brand-pink">Hebat!</span> 🚀
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-lg">
                Akses semua materi, cek jadwal, dan pantau progres belajarmu dalam satu tempat yang nyaman.
            </p>
         </div>
         <div className="absolute right-[-5%] top-[-10%] w-80 h-80 bg-brand-pink/10 rounded-full"></div>
         <div className="absolute right-[10%] bottom-[-20%] w-64 h-64 bg-brand-yellow/10 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-brand-yellow/20 flex items-center gap-6 hover:shadow-md transition-all hover:-translate-y-1">
                    <div className="w-16 h-16 bg-brand-yellow text-brand-dark rounded-2xl flex items-center justify-center shadow-inner">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Kelas Aktif</p>
                        <h3 className="text-3xl font-bold text-brand-dark">{classCount || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-brand-pink/20 flex items-center gap-6 hover:shadow-md transition-all hover:-translate-y-1">
                    <div className="w-16 h-16 bg-brand-pink text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-pink/20">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Total Hadir</p>
                        <h3 className="text-3xl font-bold text-brand-dark">
                            {presentCount || 0} 
                            <span className="text-sm font-normal text-gray-400 ml-2">Sesi</span>
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-brand-pink" />
                        </div>
                        <h3 className="font-heading font-bold text-xl text-brand-dark">Jadwal Terdekat</h3>
                    </div>
                    <Link href="/student/schedule" className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-1">
                        Lihat Semua Jadwal →
                    </Link>
                </div>

                {nextSession ? (
                    <div className="bg-brand-yellow/50 rounded-[32px] p-8 border border-brand-yellow/70 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-brand-pink uppercase tracking-widest mb-3 inline-block shadow-sm border border-brand-pink/10">
                                        {nextSession.classes?.title || "Kelas"}
                                    </span>
                                    <h4 className="font-bold text-3xl text-brand-dark group-hover:text-brand-pink transition-colors leading-tight">
                                        {nextSession.title}
                                    </h4>
                                    {nextSession.sub_classes?.title && (
                                        <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-brand-pink rounded-full"></span>
                                            Peminatan: {nextSession.sub_classes.title}
                                        </p>
                                    )}
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-bold shadow-sm border ${
                                    nextSession.is_open 
                                    ? 'bg-green-500 text-white border-green-500 animate-pulse' 
                                    : 'bg-white text-gray-400 border-gray-100'
                                }`}>
                                    {nextSession.is_open ? "● ABSEN DIBUKA" : "BELUM MULAI"}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-10">
                                <div className="flex items-center gap-3 text-brand-dark bg-white px-5 py-3 rounded-2xl text-sm font-bold shadow-sm border border-gray-50">
                                    <Clock className="w-5 h-5 text-brand-pink" />
                                    {new Date(nextSession.date_time).toLocaleDateString('id-ID', {
                                        weekday: 'long', day: 'numeric', month: 'long'
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {nextSession.zoom_link ? (
                                    <a 
                                        href={nextSession.zoom_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 bg-brand-darkblue text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-dark transition-all shadow-xl shadow-brand-darkblue/20"
                                    >
                                        <Video className="w-6 h-6" /> Gabung Kelas (Zoom)
                                    </a>
                                ) : (
                                    <div className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 border border-dashed border-gray-200">
                                        <Video className="w-6 h-6" /> Link Belum Tersedia
                                    </div>
                                )}
                                
                                <Link 
                                    href="/student/schedule"
                                    className={`flex-1 py-5 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 ${
                                        nextSession.is_open 
                                        ? "bg-brand-pink text-white shadow-xl shadow-brand-pink/20 hover:bg-brand-dark" 
                                        : "bg-brand-yellow text-brand-dark hover:bg-brand-dark hover:text-white"
                                    }`}
                                >
                                    {nextSession.is_open ? " Isi Absensi Sekarang" : "Lihat Detail Sesi"}
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center bg-brand-cream/20 rounded-[32px] border-2 border-dashed border-brand-yellow/30">
                        <p className="text-gray-500 font-medium">Tidak ada jadwal kelas dalam waktu dekat.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-10">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="font-heading font-bold text-xl text-brand-dark mb-8">Menu Cepat</h3>
                <div className="space-y-4">
                    <Link href="/student/classes" className="flex items-center justify-between p-6 rounded-3xl bg-brand-cream/30 hover:bg-brand-yellow transition-all group border border-brand-yellow/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-pink shadow-sm">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-brand-dark">Materi & E-Book</span>
                        </div>
                    </Link>
                    <Link href="/student/schedule" className="flex items-center justify-between p-6 rounded-3xl bg-brand-cream/30 hover:bg-brand-pink hover:text-white transition-all group border border-brand-pink/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <span className="font-bold">Cek Kehadiran</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
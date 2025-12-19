// app/(main)/student/classes/[classId]/page.tsx

import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, FileText, Download, Lock, Calendar } from "lucide-react"
import SessionListItem from "./SessionListItem"

// --- DEFINISI TIPE DATA ---
type Resource = {
  id: string; title: string; file_url: string; created_at: string;
}

type Session = {
  id: string; title: string; date_time: string; zoom_link: string | null; is_open: boolean;
}

type Batch = {
  id: string; name: string; start_date: string; end_date: string; attendance_sessions: Session[];
}

export default async function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Cek Enrollment (Security)
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', user?.id)
    .eq('class_id', classId)
    .eq('status', 'active')
    .single()

  if (!enrollment) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <Lock className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-brand-dark">Akses Ditolak</h2>
            <p className="text-gray-500">Kamu tidak terdaftar di kelas ini.</p>
            <Link href="/student/classes" className="mt-4 text-brand-pink font-bold hover:underline">Kembali ke Kelas Saya</Link>
        </div>
    )
  }

  // 2. Ambil Detail Kelas
  const { data: kelas } = await supabase
    .from('classes')
    .select('title, description, level')
    .eq('id', classId)
    .single()

  // 3. Ambil Resources (E-Book)
  const { data: rawResources } = await supabase
    .from('class_resources')
    .select('id, title, file_url, created_at')
    .eq('class_id', classId)
    .order('created_at', { ascending: false })
  const resources = (rawResources as unknown as Resource[]) || []

  // 4. Ambil Batch & Sesi
  const { data: rawBatches } = await supabase
    .from('batches')
    .select(`
        id, name, start_date, end_date,
        attendance_sessions ( id, title, date_time, zoom_link, is_open )
    `)
    .eq('class_id', classId)
    .order('created_at', { ascending: false })
  const batches = (rawBatches as unknown as Batch[]) || []

  // 5. Ambil Data Kehadiran Siswa
  const { data: myRecords } = await supabase
    .from('attendance_records')
    .select('session_id, status')
    .eq('student_id', user?.id)
  
  const attendanceMap: Record<string, string> = {}
  myRecords?.forEach(r => { attendanceMap[r.session_id] = r.status })

  // Sort sesi berdasarkan waktu
  batches?.forEach(b => {
      b.attendance_sessions?.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
  })

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col gap-6">
         <Link href="/student/classes" className="flex items-center gap-2 text-gray-500 hover:text-brand-pink transition-colors w-fit text-sm font-bold group">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-brand-pink group-hover:text-white transition-all">
                <ArrowLeft className="w-4 h-4" />
            </div>
            Kembali ke Kelas Saya
         </Link>
         
         <div className="bg-brand-darkblue p-10 rounded-[40px] shadow-xl relative overflow-hidden text-white">
            <div className="relative z-10">
                <span className="bg-brand-pink text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block shadow-lg">
                    {kelas?.level}
                </span>
                <h1 className="font-heading font-bold text-4xl mb-4 leading-tight text-brand-cream">{kelas?.title}</h1>
                <p className="text-blue-100 leading-relaxed max-w-3xl text-base font-medium">
                    {kelas?.description || "Selamat belajar! Silakan unduh materi dan cek jadwal di bawah ini untuk memulai perjalanan belajarmu."}
                </p>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl"></div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* KOLOM KIRI: JADWAL */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-heading font-bold text-2xl text-brand-dark flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-brand-pink" /> Jadwal & Sesi Pertemuan
                </h3>
            </div>

            {batches.length === 0 ? (
                <div className="p-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-bold italic">Belum ada jadwal sesi yang tersedia.</p>
                </div>
            ) : (
                batches.map((batch) => (
                    <div key={batch.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm mb-8">
                        <div className="bg-brand-cream/30 p-8 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-xl text-brand-dark">{batch.name}</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em] mt-2 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(batch.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(batch.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="bg-white px-5 py-2 rounded-2xl font-bold text-brand-dark shadow-sm text-xs border border-gray-50">
                                {batch.attendance_sessions.length} Sesi
                            </div>
                        </div>
                        
                        <div className="divide-y divide-gray-50">
                            {batch.attendance_sessions.map(session => (
                                <SessionListItem 
                                    key={session.id} 
                                    session={session} 
                                    attendanceStatus={attendanceMap[session.id] || null}
                                    batchName={batch.name}
                                    classTitle={kelas?.title || "Kelas"}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* KOLOM KANAN: MATERI */}
        <div className="space-y-8">
            <h3 className="font-heading font-bold text-2xl text-brand-dark flex items-center gap-3 px-2">
                <FileText className="w-6 h-6 text-brand-pink" /> Materi
            </h3>

            <div className="grid grid-cols-1 gap-6">
                {resources.map((res) => (
                    <div key={res.id} className="bg-white p-6 rounded-[40px] border border-gray-100 hover:border-brand-pink/20 hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="flex items-center gap-5 mb-6 relative z-10">
                            <div className="w-14 h-14 bg-brand-cream text-brand-pink rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="w-7 h-7" />
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-base text-brand-dark truncate group-hover:text-brand-pink transition-colors">{res.title}</h4>
                                <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-wider">Diupload: {new Date(res.created_at).toLocaleDateString('id-ID')}</p>
                            </div>
                        </div>

                        <a 
                            href={res.file_url} 
                            target="_blank" 
                            className="w-full bg-brand-yellow text-brand-dark py-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-dark hover:text-white transition-all shadow-sm relative z-10"
                        >
                            <Download className="w-4 h-4" /> Download PDF / Lihat Modul
                        </a>
                        
                        {/* Decorative background */}
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-brand-cream/20 rounded-full blur-2xl group-hover:bg-brand-pink/5 transition-colors"></div>
                    </div>
                ))}

                {resources.length === 0 && (
                    <div className="p-16 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-sm font-bold italic">Materi belum tersedia.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}
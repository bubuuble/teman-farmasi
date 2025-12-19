// app/(main)/mentor/classes/[classId]/page.tsx

import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, FileText, Download, Users, Mail } from "lucide-react" // Import Users & Mail
import BatchForm from "./BatchForm" 
import BatchList from "./BatchList"

// --- DEFINISI TIPE DATA ---
type Session = {
  id: string; title: string; date_time: string; zoom_link: string | null; mentor_status: string | null;
}

export type BatchWithSessions = {
  id: string; name: string; start_date: string; end_date: string; attendance_sessions: Session[] | null;
}

type Resource = {
  id: string; title: string; file_url: string; created_at: string;
}

// Tipe Data untuk Siswa
type EnrolledStudent = {
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default async function MentorClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const supabase = await createClient()

  // 1. Ambil Detail Kelas
  const { data: kelas } = await supabase
    .from('classes')
    .select('title, level')
    .eq('id', classId)
    .single()

  // 2. Ambil Batch + Sessions
  const { data: rawBatches } = await supabase
    .from('batches')
    .select(`*, attendance_sessions ( id, title, date_time, zoom_link, mentor_status )`)
    .eq('class_id', classId)
    .order('created_at', { ascending: false })

  const batches = rawBatches as unknown as BatchWithSessions[]

  // 3. Ambil Modul / E-Book
  const { data: rawResources } = await supabase
    .from('class_resources')
    .select('id, title, file_url, created_at')
    .eq('class_id', classId)
    .order('created_at', { ascending: false })
  
  const resources = rawResources as unknown as Resource[]

  // 4. AMBIL DATA SISWA TERDAFTAR (FITUR BARU)
  const { data: rawEnrollments } = await supabase
    .from('enrollments')
    .select(`
        profiles:student_id ( full_name, email )
    `)
    .eq('class_id', classId)
    .eq('status', 'active')

  const students = (rawEnrollments as unknown as EnrolledStudent[]) || []

  // Sorting Session (Sesi terlama ke terbaru dalam satu batch)
  batches?.forEach(b => {
      if (b.attendance_sessions) {
          b.attendance_sessions.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
      }
  })

  return (
    <div className="space-y-8">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <Link href="/mentor/classes" className="p-2 rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors text-brand-dark">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-heading font-bold text-2xl text-brand-dark">{kelas?.title}</h1>
                    <span className="bg-brand-blue/10 text-brand-blue text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {kelas?.level}
                    </span>
                </div>
                <p className="text-brand-gray text-xs">Kelola gelombang belajar, jadwal sesi, dan cek materi.</p>
            </div>
         </div>
         <BatchForm classId={classId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* KOLOM KIRI: JADWAL & BATCH */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="font-heading font-bold text-lg text-brand-dark px-2">Daftar Batch & Sesi</h3>
            {batches?.map((batch) => (
               <BatchList key={batch.id} batch={batch} classId={classId} />
            ))}

            {batches?.length === 0 && (
               <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-200">
                   <p className="text-brand-gray font-medium text-sm">Belum ada Batch di kelas ini.</p>
               </div>
            )}
         </div>

         {/* KOLOM KANAN: MATERI & SISWA */}
         <div className="space-y-8">
            
            {/* 1. KARTU MODUL */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-heading font-bold text-lg text-brand-dark">Modul & E-Book</h3>
                    <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-1 rounded-md font-bold uppercase tracking-tighter">Upload by Admin</span>
                </div>

                <div className="space-y-3">
                    {resources?.map((res) => (
                        <div key={res.id} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-brand-blue/20 transition-all group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-blue group-hover:text-white transition-colors shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-sm text-brand-dark truncate group-hover:text-brand-blue transition-colors">
                                        {res.title}
                                    </h4>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(res.created_at).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <a href={res.file_url} target="_blank" className="w-full bg-brand-cream/50 text-brand-dark py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-darkblue hover:text-white transition-all shadow-sm">
                                <Download className="w-3.5 h-3.5" /> Download / Baca Modul
                            </a>
                        </div>
                    ))}
                    {resources.length === 0 && <p className="text-xs text-center text-gray-400 py-4 italic bg-gray-50 rounded-2xl">Belum ada modul.</p>}
                </div>
            </section>

            {/* 2. KARTU SISWA TERDAFTAR (FITUR BARU) */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-heading font-bold text-lg text-brand-dark flex items-center gap-2">
                        <Users className="w-5 h-5 text-brand-pink" /> Siswa Terdaftar
                    </h3>
                    <span className="text-[10px] bg-brand-pink/10 text-brand-pink px-2 py-1 rounded-md font-bold">{students.length} Orang</span>
                </div>

                <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-card">
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {students.map((item, idx) => (
                            <div key={idx} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center font-bold text-brand-dark text-xs border border-white shadow-sm">
                                    {item.profiles?.full_name?.[0] || 'S'}
                                </div>
                                <div className="overflow-hidden">
                                    <h5 className="text-sm font-bold text-brand-dark truncate">{item.profiles?.full_name || 'Tanpa Nama'}</h5>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 truncate">
                                        <Mail className="w-3 h-3" />
                                        {item.profiles?.email || '-'}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {students.length === 0 && (
                            <div className="p-10 text-center">
                                <p className="text-xs text-gray-400 italic">Belum ada siswa yang terdaftar di kelas ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

         </div>

      </div>
    </div>
  )
}
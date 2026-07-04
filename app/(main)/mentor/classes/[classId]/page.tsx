import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, Users, Mail, Calendar, Video, CheckCircle } from "lucide-react"
import SessionForm from "./SessionForm"
import MentorManageResources from "./MentorManageResources"
import DeleteSessionButton from "./DeleteSessionButton"
import AbsenButton from "./AbsenButton"

// --- DEFINISI TIPE DATA ---
type Session = {
  id: string; title: string; date_time: string; zoom_link: string | null; mentor_status: string | null;
}

type Resource = {
  id: string; title: string; file_url: string; file_path: string; created_at: string;
}

type EnrolledStudent = {
  profiles: { full_name: string | null; email: string | null } | null;
}

export default async function MentorClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ subClassId?: string }>
}) {
  const { classId } = await params
  const { subClassId } = await searchParams
  const supabase = await createClient()

  // 1. Detail kelas
  const { data: kelas } = await supabase
    .from('classes')
    .select('title, level')
    .eq('id', classId)
    .single()

  // Fetch subclass if subClassId is present
  let subClassData = null
  if (subClassId) {
    const { data } = await supabase
      .from('sub_classes')
      .select('id, title')
      .eq('id', subClassId)
      .single()
    subClassData = data
  }

  // 2. Sesi langsung dari class_id & subClassId
  const sessionsQuery = supabase
    .from('attendance_sessions')
    .select('id, title, date_time, zoom_link, mentor_status')
    .eq('class_id', classId)
  
  if (subClassId) {
    sessionsQuery.eq('sub_class_id', subClassId)
  } else {
    sessionsQuery.is('sub_class_id', null)
  }

  const { data: rawSessions } = await sessionsQuery.order('date_time', { ascending: true })
  const sessions = (rawSessions as Session[]) || []

  // 3. E-Book / Materi
  const resourcesQuery = supabase
    .from('class_resources')
    .select('id, title, file_url, file_path, created_at')
    .eq('class_id', classId)
  
  if (subClassId) {
    resourcesQuery.eq('sub_class_id', subClassId)
  } else {
    resourcesQuery.is('sub_class_id', null)
  }

  const { data: rawResources } = await resourcesQuery.order('created_at', { ascending: false })
  const resources = (rawResources as Resource[]) || []

  // 4. Siswa terdaftar
  const studentsQuery = supabase
    .from('enrollments')
    .select('profiles:student_id ( full_name, email )')
    .eq('class_id', classId)
    .eq('status', 'active')
  
  if (subClassId) {
    studentsQuery.eq('sub_class_id', subClassId)
  } else {
    studentsQuery.is('sub_class_id', null)
  }

  const { data: rawEnrollments } = await studentsQuery
  const students = (rawEnrollments as unknown as EnrolledStudent[]) || []

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/mentor/classes" className="p-2 rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors text-brand-dark">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-heading font-bold text-2xl text-brand-dark">{kelas?.title}</h1>
              {subClassData && (
                <span className="bg-brand-pink/10 text-brand-pink text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Peminatan: {subClassData.title}
                </span>
              )}
              <span className="bg-brand-blue/10 text-brand-blue text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {kelas?.level}
              </span>
            </div>
            <p className="text-brand-gray text-xs">Kelola jadwal sesi dan materi kelas.</p>
          </div>
        </div>
        <SessionForm classId={classId} subClassId={subClassId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* KOLOM KIRI: DAFTAR SESI */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-heading font-bold text-lg text-brand-dark px-2">Jadwal Sesi</h3>

          {sessions.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-200">
              <p className="text-brand-gray font-medium text-sm">Belum ada sesi di kelas ini.</p>
              <p className="text-gray-400 text-xs mt-1">Klik &quot;Tambah Sesi&quot; untuk mulai.</p>
            </div>
          ) : (
            sessions.map((session, idx) => (
              <div key={session.id} className="bg-white rounded-[32px] shadow-card border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center font-bold text-brand-dark text-lg border border-gray-100 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-brand-dark leading-tight">{session.title}</h5>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.date_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {session.zoom_link && (
                          <a href={session.zoom_link} target="_blank" className="flex items-center gap-1 text-brand-blue hover:underline font-bold">
                            <Video className="w-3 h-3" /> Zoom
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {session.mentor_status === 'present' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-[10px] font-bold border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Absen Selesai
                      </div>
                    ) : (
                      <AbsenButton sessionId={session.id} classId={classId} />
                    )}
                    <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
                      <SessionForm classId={classId} subClassId={subClassId} existingData={session} />
                      <DeleteSessionButton sessionId={session.id} classId={classId} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* KOLOM KANAN: MATERI & SISWA */}
        <div className="space-y-8">

          <MentorManageResources classId={classId} subClassId={subClassId} resources={resources} />

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-heading font-bold text-lg text-brand-dark flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-pink" /> Student Terdaftar
              </h3>
              <span className="text-[10px] bg-brand-pink/10 text-brand-pink px-2 py-1 rounded-md font-bold">{students.length} Orang</span>
            </div>
            <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-card">
              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                {students.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center font-bold text-brand-dark text-xs border border-white shadow-sm flex-shrink-0">
                      {item.profiles?.full_name?.[0] || 'S'}
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="text-sm font-bold text-brand-dark truncate">{item.profiles?.full_name || 'Tanpa Nama'}</h5>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 truncate">
                        <Mail className="w-3 h-3" /> {item.profiles?.email || '-'}
                      </div>
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="p-10 text-center">
                    <p className="text-xs text-gray-400 italic">Belum ada student terdaftar.</p>
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
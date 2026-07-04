// app/(main)/admin/attendances/mentor/page.tsx
import { createClient } from "@/lib/supabase/server"
import { Clock, CheckCircle2, AlertCircle } from "lucide-react"
import MentorFilter from "../MentorFilter"

export const dynamic = 'force-dynamic'

type MentorSessionData = {
  id: string; title: string; date_time: string; mentor_status: string | null; class_id: string; sub_class_id: string | null;
  classes: {
    title: string;
  } | null;
  sub_classes: {
    title: string;
  } | null;
}

export default async function MentorAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ mentorId?: string }>
}) {
  const { mentorId } = await searchParams
  const supabase = await createClient()

  // Ambil list mentor untuk dropdown sort
  const { data: mentors } = await supabase.from('profiles').select('id, full_name').eq('role', 'mentor')

  // Ambil mentor assignments untuk dicocokkan dengan sesi
  const { data: allClassMentors } = await supabase
    .from('class_mentors')
    .select('class_id, sub_class_id, profiles:mentor_id ( full_name )')

  const getMentorNamesForSession = (classId: string, subClassId: string | null) => {
    const matched = allClassMentors?.filter(cm => cm.class_id === classId && cm.sub_class_id === subClassId) || []
    return matched.map(cm => {
      const p = cm.profiles as any
      if (!p) return null
      if (Array.isArray(p)) {
        return p[0]?.full_name
      }
      return p.full_name
    }).filter(Boolean).join(', ') || '-'
  }

  // Query dengan filter mentor jika ada
  let query = supabase.from('attendance_sessions').select(`
      id, title, date_time, mentor_status, class_id, sub_class_id,
      classes ( title ),
      sub_classes ( title )
    `)
  
  if (mentorId) {
    const { data: myClasses } = await supabase
      .from('class_mentors')
      .select('class_id, sub_class_id')
      .eq('mentor_id', mentorId)
    
    const orParts = myClasses?.map(c => 
      c.sub_class_id 
        ? `and(class_id.eq.${c.class_id},sub_class_id.eq.${c.sub_class_id})` 
        : `and(class_id.eq.${c.class_id},sub_class_id.is.null)`
    ) || []
    
    if (orParts.length > 0) {
      query = query.or(orParts.join(','))
    } else {
      query = query.eq('class_id', '00000000-0000-0000-0000-000000000000') // matches nothing
    }
  }
  
  const { data: rawSessions } = await query.order('date_time', { ascending: false })
  const sessions = rawSessions as unknown as MentorSessionData[]

  return (
    <div className="space-y-6">
      <MentorFilter mentors={mentors || []} />
      <div className="bg-white rounded-3xl shadow-card overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-brand-cream/50 text-[10px] font-bold uppercase tracking-widest text-brand-dark border-b border-gray-100">
            <tr>
              <th className="p-6">Jadwal Mengajar</th>
              <th className="p-6">Nama Mentor</th>
              <th className="p-6">Kelas / Peminatan</th>
              <th className="p-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {sessions?.map(s => {
              const mentorNames = getMentorNamesForSession(s.class_id, s.sub_class_id)
              const className = s.classes?.title || '-'
              const subClassName = s.sub_classes?.title ? `Peminatan: ${s.sub_classes.title}` : 'Program Utama'
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-6">
                    <div className="font-bold text-brand-dark">{new Date(s.date_time).toLocaleDateString('id-ID', { weekday: 'long', day:'numeric', month:'short'})}</div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(s.date_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} WIB</div>
                  </td>
                  <td className="p-6 font-bold text-brand-dark">{mentorNames}</td>
                  <td className="p-6">
                    <div className="font-semibold">{className}</div>
                    <div className="text-xs text-brand-blue font-semibold">{subClassName}</div>
                    <div className="text-[10px] text-gray-400 uppercase mt-0.5">{s.title}</div>
                  </td>
                <td className="p-6 text-right">
                  {s.mentor_status === 'present' ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Hadir Mengajar</span>
                  ) : (
                    <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border border-yellow-100"><AlertCircle className="w-3 h-3"/> Belum Absen</span>
                  )}
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
        {(!sessions || sessions.length === 0) && <div className="p-20 text-center text-gray-400">Tidak ada jadwal ditemukan.</div>}
      </div>
    </div>
  )
}
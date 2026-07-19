// app/(main)/admin/attendances/student/page.tsx
import { createClient } from "@/lib/supabase/server"
import { Filter } from "lucide-react"
import FilterAttendance from "../FilterAttendance"
import ExportAttendanceBtn from "../ExportAttendanceBtn"

export const dynamic = 'force-dynamic'

type Session = { id: string; title: string; date_time: string; assigned_student_ids?: string[] }
type Student = { id: string; full_name: string; email: string }
type AttendanceRecord = { session_id: string; student_id: string; status: string }

interface EnrollmentRow {
  profiles: Student | null;
}

export default async function StudentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>
}) {
  const { classId } = await searchParams
  const supabase = await createClient()

  // Load classes and subclasses
  const { data: allClasses } = await supabase.from('classes').select('id, title, level')
  const { data: allSubClasses } = await supabase.from('sub_classes').select('id, class_id, title')

  const classesList: { id: string; title: string }[] = []
  if (allClasses) {
    allClasses.forEach(c => {
      const subClassesOfClass = allSubClasses?.filter(s => s.class_id === c.id) || []
      if (subClassesOfClass.length > 0) {
        subClassesOfClass.forEach(s => {
          classesList.push({
            id: `${c.id}:${s.id}`,
            title: `${c.title} - Peminatan: ${s.title}`
          })
        })
      } else {
        classesList.push({
          id: c.id,
          title: c.title
        })
      }
    })
  }

  // Parse classId query parameter
  const [selectedClassId, selectedSubClassId] = classId && classId.includes(':') 
    ? classId.split(':')
    : [classId, undefined]

  let sessions: any[] = []
  let students: Student[] = []
  const attendanceMap: Record<string, string> = {}
  let isPrivate = false
  let maxSessions = 0

  if (selectedClassId) {
    const selectedClass = allClasses?.find(c => c.id === selectedClassId)
    const isPharmacore = selectedClass?.title?.startsWith('Pharmacore')
    isPrivate = selectedClass ? !isPharmacore : false
    maxSessions = selectedClass?.level || 0

    // Sesi langsung dari class_id & sub_class_id
    const sessionsQuery = supabase
      .from('attendance_sessions')
      .select('id, title, date_time')
      .eq('class_id', selectedClassId)
    
    if (selectedSubClassId) {
      sessionsQuery.eq('sub_class_id', selectedSubClassId)
    } else {
      sessionsQuery.is('sub_class_id', null)
    }
    const { data: sData } = await sessionsQuery.order('date_time', { ascending: true })
    sessions = (sData as any[]) || []

    // Siswa terdaftar
    const enrollQuery = supabase
      .from('enrollments')
      .select('profiles:student_id(id, full_name, email)')
      .eq('class_id', selectedClassId)
    
    if (selectedSubClassId) {
      enrollQuery.eq('sub_class_id', selectedSubClassId)
    } else {
      enrollQuery.is('sub_class_id', null)
    }

    const { data: eData } = await enrollQuery
    
    const rawEnrollments = (eData as unknown as EnrollmentRow[]) || []
    students = rawEnrollments
      .map((e) => e.profiles)
      .filter((p): p is Student => p !== null)

    // Sort A-Z berdasarkan nama siswa
    students.sort((a, b) => a.full_name.localeCompare(b.full_name, 'id'))

    // Fetch session_students mapping if private
    if (isPrivate && sessions.length > 0) {
      const { data: ssData } = await supabase
        .from('session_students')
        .select('session_id, student_id')
        .in('session_id', sessions.map(s => s.id))
      
      sessions = sessions.map(s => ({
        ...s,
        assigned_student_ids: ssData?.filter(ss => ss.session_id === s.id).map(ss => ss.student_id) || []
      }))
    }

    if (sessions.length > 0) {
      const { data: rData } = await supabase
        .from('attendance_records')
        .select('session_id, student_id, status')
        .in('session_id', sessions.map(s => s.id))
      const records = (rData as AttendanceRecord[]) || []
      records.forEach(r => { attendanceMap[`${r.session_id}_${r.student_id}`] = r.status })
    }
  }

  const colsCount = isPrivate 
    ? Math.max(
        maxSessions || 0,
        ...students.map(student => sessions.filter(s => s.assigned_student_ids?.includes(student.id)).length),
        1
      )
    : sessions.length;

  return (
    <div className="space-y-6">
      <FilterAttendance classes={classesList} selectedClassId={classId} />
      {classId ? (
        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-brand-dark">Matrix Kehadiran Student</h3>
            {sessions.length > 0 && (
              <ExportAttendanceBtn 
                sessions={sessions} 
                students={students} 
                attendanceMap={attendanceMap} 
                isPrivate={isPrivate}
                maxSessions={maxSessions}
                className={classesList.find(c => c.id === classId)?.title || ""}
              />
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-cream/50 text-[10px] font-bold uppercase tracking-widest text-brand-dark">
                  <th className="p-4 sticky left-0 bg-gray z-10 min-w-[200px]">Nama Student</th>
                  {isPrivate ? (
                    Array.from({ length: colsCount }).map((_, idx) => (
                      <th key={idx} className="p-4 text-center border-l border-gray-100 min-w-[120px]">
                        Pertemuan {idx + 1}
                      </th>
                    ))
                  ) : (
                    sessions.map((s, idx) => (
                      <th key={s.id} className="p-4 text-center border-l border-gray-100 min-w-[120px]">
                        Sesi {idx + 1}
                        <div className="font-normal text-gray-400 normal-case mt-1">
                          {new Date(s.date_time).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}
                        </div>
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-brand-cream/10 transition-colors">
                    <td className="p-4 sticky left-0 bg-white z-10 border-r border-gray-100 font-bold">
                      {student.full_name}
                      <div className="text-[10px] text-gray-400 font-normal">{student.email}</div>
                    </td>
                    {isPrivate ? (
                      Array.from({ length: colsCount }).map((_, idx) => {
                        const studentSessions = sessions
                          .filter(s => s.assigned_student_ids?.includes(student.id))
                          .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
                        const session = studentSessions[idx]
                        if (!session) {
                          return (
                            <td key={idx} className="p-4 text-center border-l border-gray-50 text-xs text-gray-300 italic">
                              -
                            </td>
                          )
                        }
                        const status = attendanceMap[`${session.id}_${student.id}`] || 'absent'
                        return (
                          <td key={session.id} className="p-4 text-center border-l border-gray-50">
                            {status === 'present' ? (
                              <span className="text-green-500 font-bold">Hadir</span>
                            ) : status === 'late' ? (
                              <span className="text-yellow-600 font-bold">Telat</span>
                            ) : status === 'permission' ? (
                              <span className="text-blue-500 font-bold">Ijin</span>
                            ) : (
                              <span className="text-red-500 font-bold">Alpha</span>
                            )}
                            <div className="text-[9px] text-gray-400 mt-1 font-medium">
                              {new Date(session.date_time).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}
                            </div>
                          </td>
                        )
                      })
                    ) : (
                      sessions.map(s => (
                        <td key={s.id} className="p-4 text-center border-l border-gray-50">
                          {attendanceMap[`${s.id}_${student.id}`] === 'present' ? 
                             <span className="text-green-500 font-bold">Hadir</span> : 
                           attendanceMap[`${s.id}_${student.id}`] === 'late' ?
                             <span className="text-yellow-600 font-bold">Telat</span> :
                           attendanceMap[`${s.id}_${student.id}`] === 'permission' ?
                             <span className="text-blue-500 font-bold">Ijin</span> :
                             <span className="text-red-500 font-bold">Alpha</span>
                          }
                        </td>
                      ))
                    )}
                  </tr>
                ))}
                {students.length === 0 && colsCount > 0 && (
                  <tr><td colSpan={colsCount + 1} className="p-8 text-center text-gray-400 text-sm italic">Belum ada student terdaftar.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
          <Filter className="w-12 h-12 text-gray-200 mx-auto mb-2" />
          <p className="text-brand-gray font-medium">Silakan pilih Kelas terlebih dahulu.</p>
        </div>
      )}
    </div>
  )
}
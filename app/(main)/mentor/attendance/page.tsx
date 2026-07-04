// app/(main)/mentor/attendance/page.tsx

import { createClient } from "@/lib/supabase/server"
import AttendanceFilter from "./AttendanceFilter"
import AttendanceMatrix from "./AttendanceMatrix"

interface ClassItem { id: string; title: string }
interface SessionItem { id: string; title: string; date_time: string }
interface StudentItem { id: string; full_name: string }

interface ClassMentorJoin {
    classes: ClassItem | null;
}

interface EnrollmentJoin {
    profiles: { id: string; full_name: string | null } | null;
}

interface AttendanceRecordJoin {
    session_id: string;
    student_id: string;
    status: string;
}

export default async function MentorAttendancePage({
    searchParams
}: {
    searchParams: Promise<{ classId?: string }>
}) {
    const { classId } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Ambil kelas & sub kelas yang diampu mentor
    const { data: rawClasses } = await supabase
        .from('class_mentors')
        .select(`
            class_id,
            sub_class_id,
            classes ( id, title ),
            sub_classes ( id, title )
        `)
        .eq('mentor_id', user.id)
    
    const classMentorData = rawClasses || []
    
    // Construct class options list
    const classList = classMentorData
        .map(item => {
            const cls = item.classes as any
            const sub = item.sub_classes as any
            if (!cls) return null
            if (item.sub_class_id) {
                return {
                    id: `${item.class_id}:${item.sub_class_id}`,
                    title: `${cls.title} - Peminatan: ${sub?.title}`
                }
            }
            return {
                id: item.class_id,
                title: cls.title
            }
        })
        .filter((c): c is ClassItem => c !== null)

    // 2. Parse classId query parameter
    const [selectedClassId, selectedSubClassId] = classId && classId.includes(':') 
        ? classId.split(':')
        : [classId, undefined]

    // 3. Jika kelas dipilih, ambil sesi + siswa + absensi
    let sessions: SessionItem[] = []
    let students: StudentItem[] = []
    const attendanceMap: Record<string, string> = {}

    if (selectedClassId) {
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
        sessions = (sData as SessionItem[]) || []

        // Siswa terdaftar
        const enrollQuery = supabase
            .from('enrollments')
            .select('profiles:student_id ( id, full_name )')
            .eq('class_id', selectedClassId)
            .eq('status', 'active')

        if (selectedSubClassId) {
            enrollQuery.eq('sub_class_id', selectedSubClassId)
        } else {
            enrollQuery.is('sub_class_id', null)
        }

        const { data: eData } = await enrollQuery

        if (eData) {
            const rawEnrollments = eData as unknown as EnrollmentJoin[]
            students = rawEnrollments
                .map(e => e.profiles)
                .filter((p): p is StudentItem => p !== null && p.full_name !== null) as StudentItem[]
            // Sort A-Z
            students.sort((a, b) => a.full_name.localeCompare(b.full_name, 'id'))
        }

        // Record absensi
        if (sessions.length > 0) {
            const sessionIds = sessions.map(s => s.id)
            const { data: rData } = await supabase
                .from('attendance_records')
                .select('session_id, student_id, status')
                .in('session_id', sessionIds)
            
            const records = (rData as AttendanceRecordJoin[]) || []
            records.forEach(r => {
                attendanceMap[`${r.session_id}_${r.student_id}`] = r.status
            })
        }
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="font-heading font-bold text-2xl text-brand-dark">Input Absensi Manual</h1>
                <p className="text-gray-500 text-sm">Monitor rekapitulasi dan edit kehadiran student secara mandiri.</p>
            </header>

            <AttendanceFilter 
                classes={classList} 
                selectedClassId={classId}
            />

            {classId ? (
                <AttendanceMatrix 
                    sessions={sessions}
                    students={students}
                    initialRecords={attendanceMap}
                />
            ) : (
                <div className="p-24 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300 font-bold text-2xl">?</div>
                    <h3 className="text-brand-dark font-bold">Pilih Kelas Terlebih Dahulu</h3>
                    <p className="text-gray-400 text-sm mt-1">Gunakan filter di atas untuk menampilkan data student.</p>
                </div>
            )}
        </div>
    )
}
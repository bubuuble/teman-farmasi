// app/(main)/mentor/attendance/page.tsx

import { createClient } from "@/lib/supabase/server"
import AttendanceFilter from "./AttendanceFilter"
import AttendanceMatrix from "./AttendanceMatrix"

// --- DEFINISI TIPE DATA ---
interface ClassItem { id: string; title: string }
interface BatchItem { id: string; name: string }
interface SessionItem { id: string; title: string; date_time: string }
interface StudentItem { id: string; full_name: string }

interface ClassMentorJoin {
    classes: ClassItem | null;
}

interface EnrollmentJoin {
    profiles: {
        id: string;
        full_name: string | null;
    } | null;
}

interface AttendanceRecordJoin {
    session_id: string;
    student_id: string;
    status: string;
}

export default async function MentorAttendancePage({
    searchParams
}: {
    searchParams: Promise<{ classId?: string, batchId?: string }>
}) {
    const { classId, batchId } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Ambil List Kelas yang diampu Mentor ini
    const { data: rawClasses } = await supabase
        .from('class_mentors')
        .select('classes(id, title)')
        .eq('mentor_id', user.id)
    
    const classMentorData = (rawClasses as unknown as ClassMentorJoin[]) || []
    const classList = classMentorData
        .map((item) => item.classes)
        .filter((c): c is ClassItem => c !== null)

    // 2. Ambil List Batch
    let batches: BatchItem[] = []
    if (classId) {
        const { data } = await supabase
            .from('batches')
            .select('id, name')
            .eq('class_id', classId)
            .order('created_at', { ascending: false })
        
        batches = (data as BatchItem[]) || []
    }

    // 3. LOGIKA MATRIX
    let sessions: SessionItem[] = []
    let students: StudentItem[] = []
    const attendanceMap: Record<string, string> = {}

    if (batchId && classId) {
        // A. Ambil semua sesi
        const { data: sData } = await supabase
            .from('attendance_sessions')
            .select('id, title, date_time')
            .eq('batch_id', batchId)
            .order('date_time', { ascending: true })
        
        sessions = (sData as SessionItem[]) || []

        // B. Ambil Siswa (Join ke Profiles)
        const { data: eData } = await supabase
            .from('enrollments')
            .select(`
                profiles:student_id ( id, full_name )
            `)
            .eq('class_id', classId)
            .eq('status', 'active')

        if (eData) {
            const rawEnrollments = eData as unknown as EnrollmentJoin[]
            students = rawEnrollments
                .map(e => e.profiles)
                .filter((p): p is StudentItem => p !== null && p.full_name !== null) as StudentItem[]
        }

        // C. Ambil Record Absensi
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
                <p className="text-gray-500 text-sm">Monitor rekapitulasi dan edit kehadiran siswa secara mandiri.</p>
            </header>

            <AttendanceFilter 
                classes={classList} 
                batches={batches} 
                sessions={sessions}
                selectedClassId={classId}
                selectedBatchId={batchId}
            />

            {batchId ? (
                <AttendanceMatrix 
                    sessions={sessions}
                    students={students}
                    initialRecords={attendanceMap}
                />
            ) : (
                <div className="p-24 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300 font-bold text-2xl">?</div>
                    <h3 className="text-brand-dark font-bold">Pilih Batch Terlebih Dahulu</h3>
                    <p className="text-gray-400 text-sm mt-1">Gunakan filter di atas untuk menampilkan data siswa.</p>
                </div>
            )}
        </div>
    )
}
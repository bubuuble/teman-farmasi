// app/(main)/admin/mentor-summary/page.tsx

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import MentorSummaryClient from "./MentorSummaryClient"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MentorAssignmentRaw = {
  id: string
  mentor_id: string
  student_id: string
  class_id: string
  sub_class_id: string | null
  mentor: { full_name: string | null; email: string | null } | null
  student: { full_name: string | null; email: string | null } | null
  class: { title: string } | null
  sub_class: { title: string } | null
}

export type StudentEntry = {
  studentId: string
  studentName: string
  studentEmail: string
  classTitle: string
  subClassTitle: string | null
}

export type MentorSummaryItem = {
  mentorId: string
  mentorName: string
  mentorEmail: string
  totalStudents: number
  // Unique student IDs across all classes
  uniqueStudentIds: string[]
  // Breakdown per class
  classSummary: {
    classId: string
    classTitle: string
    subClassTitle: string | null
    studentCount: number
    students: StudentEntry[]
  }[]
}

export default async function MentorSummaryPage() {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const currentUserRole = currentProfile?.role ?? ''
  if (currentUserRole !== 'admin' && currentUserRole !== 'superadmin') {
    redirect('/')
  }

  // ── Fetch mentor_student_assignments with all joins ──────────────────────────
  const { data: rawAssignments, error } = await supabase
    .from('mentor_student_assignments')
    .select(`
      id,
      mentor_id,
      student_id,
      class_id,
      sub_class_id,
      mentor:mentor_id ( full_name, email ),
      student:student_id ( full_name, email ),
      class:class_id ( title ),
      sub_class:sub_class_id ( title )
    `)
    .order('mentor_id')

  if (error) {
    console.error('[MentorSummary] Error fetching assignments:', error.message)
  }

  const assignments = (rawAssignments ?? []) as unknown as MentorAssignmentRaw[]

  // ── Also fetch mentors with 0 students (not in assignments yet) ─────────────
  const { data: allMentors } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'mentor')
    .order('full_name')

  // ── Build aggregation map ────────────────────────────────────────────────────
  const mentorMap = new Map<string, MentorSummaryItem>()

  // Init all mentors (even those with 0 students)
  for (const m of allMentors ?? []) {
    mentorMap.set(m.id, {
      mentorId: m.id,
      mentorName: m.full_name ?? 'Tanpa Nama',
      mentorEmail: m.email ?? '-',
      totalStudents: 0,
      uniqueStudentIds: [],
      classSummary: [],
    })
  }

  // Process assignments
  for (const a of assignments) {
    const mentorId = a.mentor_id
    const mentorName = (a.mentor as any)?.full_name ?? 'Tanpa Nama'
    const mentorEmail = (a.mentor as any)?.email ?? '-'
    const studentName = (a.student as any)?.full_name ?? 'Tanpa Nama'
    const studentEmail = (a.student as any)?.email ?? '-'
    const classTitle = (a.class as any)?.title ?? 'Kelas Tidak Diketahui'
    const subClassTitle = (a.sub_class as any)?.title ?? null

    if (!mentorMap.has(mentorId)) {
      mentorMap.set(mentorId, {
        mentorId,
        mentorName,
        mentorEmail,
        totalStudents: 0,
        uniqueStudentIds: [],
        classSummary: [],
      })
    }

    const mentor = mentorMap.get(mentorId)!
    const studentEntry: StudentEntry = {
      studentId: a.student_id,
      studentName,
      studentEmail,
      classTitle,
      subClassTitle,
    }

    // Track unique students
    if (!mentor.uniqueStudentIds.includes(a.student_id)) {
      mentor.uniqueStudentIds.push(a.student_id)
    }

    // Group by class + sub_class
    const existing = mentor.classSummary.find(
      c => c.classId === a.class_id && c.subClassTitle === subClassTitle
    )
    if (existing) {
      existing.students.push(studentEntry)
      existing.studentCount++
    } else {
      mentor.classSummary.push({
        classId: a.class_id,
        classTitle,
        subClassTitle,
        studentCount: 1,
        students: [studentEntry],
      })
    }
  }

  // Finalize total counts
  for (const [, mentor] of mentorMap) {
    mentor.totalStudents = mentor.uniqueStudentIds.length
    // Sort class summary by student count desc
    mentor.classSummary.sort((a, b) => b.studentCount - a.studentCount)
  }

  const summaryList: MentorSummaryItem[] = Array.from(mentorMap.values()).sort(
    (a, b) => b.totalStudents - a.totalStudents
  )

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalMentors = summaryList.length
  const mentorsWithStudents = summaryList.filter(m => m.totalStudents > 0).length
  const avgStudents = mentorsWithStudents > 0
    ? Math.round(summaryList.reduce((acc, m) => acc + m.totalStudents, 0) / mentorsWithStudents)
    : 0
  const topMentor = summaryList[0] ?? null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-brand-dark">Rekap Student per Mentor</h1>
        <p className="text-brand-gray text-sm mt-0.5">
          Ringkasan total student yang di-handle tiap mentor lintas semua program.
        </p>
      </div>

      <MentorSummaryClient
        summaryList={summaryList}
        totalMentors={totalMentors}
        mentorsWithStudents={mentorsWithStudents}
        avgStudents={avgStudents}
        topMentor={topMentor}
      />
    </div>
  )
}

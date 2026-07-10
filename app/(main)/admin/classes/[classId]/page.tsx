import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ClassManager from "./ClassManager"
import { notFound } from "next/navigation"

type ClassDetail = {
  id: string
  title: string
  description: string | null
  price: number
  level: string | null
  class_mentors: {
    id: string
    mentor_id: string
    sub_class_id: string | null
    profiles: {
      full_name: string | null
      email: string
    } | null
  }[]
  enrollments: {
    id: string
    student_id: string
    sub_class_id: string | null
    profiles: {
      full_name: string | null
      email: string
      institusi: string | null
    } | null
  }[]
  class_resources: {
    id: string
    title: string
    sub_class_id: string | null
    file_url: string
    file_path: string
    created_at: string
  }[]
}

type SubClass = {
  id: string
  class_id: string
  title: string
  description: string | null
  session_offset: number
  created_at: string
}

export default async function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>
}) {
  const { classId } = await params
  const supabase = await createClient()

  // 1. Fetch Class Detail with relations
  const { data: rawClass } = await supabase
    .from('classes')
    .select(`
      *,
      class_mentors ( id, mentor_id, sub_class_id, profiles ( full_name, email ) ),
      enrollments ( id, student_id, sub_class_id, profiles ( full_name, email, institusi ) ),
      class_resources ( id, title, sub_class_id, file_url, file_path, created_at )
    `)
    .eq('id', classId)
    .single()

  if (!rawClass) {
    notFound()
  }

  const kelas = rawClass as unknown as ClassDetail

  // 2. Fetch Sub Classes
  const { data: subClasses } = await supabase
    .from('sub_classes')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: true })

  // 3. Fetch list of all Mentors
  const { data: allMentors } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'mentor')

  // 4. Fetch list of all Students
  const { data: allStudents } = await supabase
    .from('profiles')
    .select('id, full_name, email, institusi')
    .eq('role', 'student')

  // 5. Fetch Mentor-Student Assignments for this class
  const { data: mentorStudentAssignments } = await supabase
    .from('mentor_student_assignments')
    .select('id, mentor_id, student_id, class_id, sub_class_id, created_at')
    .eq('class_id', classId)

  return (
    <div className="space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/classes" 
          className="p-2 rounded-xl bg-white shadow-sm hover:bg-gray-50 transition-colors text-brand-dark border border-gray-100 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-brand-gray font-medium">Kembali ke Manajemen Kelas</p>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">Kelola Kelas</h1>
        </div>
      </div>

      {/* Unified Tabbed Card Manager */}
      <ClassManager 
        kelas={kelas} 
        subClasses={(subClasses as unknown as SubClass[]) || []}
        allStudents={allStudents || []} 
        allMentors={allMentors || []}
        mentorStudentAssignments={(mentorStudentAssignments as any) || []}
      />
    </div>
  )
}



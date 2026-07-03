import { createClient } from "@/lib/supabase/server"
import ClassListClient from "./ClassListClient"

export default async function AdminClassesPage() {
  const supabase = await createClient()

  // 1. Ambil Kelas + Mentor + Enrollments (Student)
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      *,
      class_mentors ( id, mentor_id, profiles ( full_name, email ) ),
      enrollments ( id, student_id, profiles ( full_name, email ) ),
      class_resources ( id, title, file_url, file_path, created_at )
    `)
    .order('created_at', { ascending: false })

  return <ClassListClient initialClasses={classes || []} />
}
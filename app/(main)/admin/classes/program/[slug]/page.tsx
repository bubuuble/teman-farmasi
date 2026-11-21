import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { findProgramBySlug, getCategoryOfClass } from "@/lib/class-programs"
import ClassListClient from "../../ClassListClient"

export default async function AdminProgramClassesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const program = findProgramBySlug(slug)
  if (!program) notFound()

  const supabase = await createClient()

  const { data: classes } = await supabase
    .from('classes')
    .select(`
      *,
      class_mentors ( id, mentor_id, profiles ( full_name, email ) ),
      enrollments ( id, student_id, profiles ( full_name, email ) ),
      class_resources ( id, title, file_url, file_path, created_at )
    `)
    .order('created_at', { ascending: false })

  const programClasses = (classes || []).filter(c => getCategoryOfClass(c.title) === program.key)

  return <ClassListClient initialClasses={programClasses} fixedCategory={program.key} />
}

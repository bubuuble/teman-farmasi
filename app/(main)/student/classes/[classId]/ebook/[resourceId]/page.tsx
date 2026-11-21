import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EbookViewer from './EbookViewer'

export const dynamic = 'force-dynamic'

export default async function EbookPage({ params }: { params: Promise<{ classId: string; resourceId: string }> }) {
  const { classId, resourceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: enr } = await supabase
    .from('enrollments')
    .select('id, sub_class_id')
    .eq('class_id', classId)
    .eq('student_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!enr) redirect('/student/classes')

  const { data: res } = await supabase
    .from('class_resources')
    .select('id, title, sub_class_id')
    .eq('id', resourceId)
    .eq('class_id', classId)
    .maybeSingle()
  if (!res || (res.sub_class_id && res.sub_class_id !== enr.sub_class_id)) return notFound()

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
  const watermark = `${profile?.full_name || ''} • ${user.email}`

  return <EbookViewer resourceId={res.id} title={res.title} backHref={`/student/classes/${classId}`} watermark={watermark} />
}

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Stream e-book hanya untuk student yang terdaftar aktif di kelas/sub-kelas terkait.
export async function GET(_req: Request, { params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const admin = createAdminClient()
  const { data: res } = await admin
    .from('class_resources')
    .select('class_id, sub_class_id, file_path')
    .eq('id', resourceId)
    .maybeSingle()
  if (!res?.file_path) return new Response('Not found', { status: 404 })

  const { data: enr } = await admin
    .from('enrollments')
    .select('id, sub_class_id')
    .eq('class_id', res.class_id)
    .eq('student_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!enr || (res.sub_class_id && enr.sub_class_id !== res.sub_class_id)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { data: file, error } = await admin.storage.from('ebooks').download(res.file_path)
  if (error || !file) return new Response('Not found', { status: 404 })

  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

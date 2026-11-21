import type { SupabaseClient } from '@supabase/supabase-js'

/** Program UKAI Series: judul kelas diawali "UKAI". */
export function isUkaiTitle(title?: string | null): boolean {
  return !!title?.toUpperCase().startsWith('UKAI')
}

/** True jika kelas dengan id tersebut adalah kelas UKAI. */
export async function isUkaiClass(supabase: SupabaseClient, classId: string): Promise<boolean> {
  const { data } = await supabase.from('classes').select('title').eq('id', classId).maybeSingle()
  return isUkaiTitle(data?.title)
}

/**
 * Apakah mentor punya akses ke kelas (dan sub kelas, jika diberikan)?
 *
 * - Penugasan di sub kelas tertentu: akses hanya ke sub kelas itu.
 * - Penugasan di kelas induk (class_mentors.sub_class_id IS NULL): akses ke SEMUA
 *   sub kelas, tapi hanya untuk kelas UKAI. Di program lain, penugasan kelas induk
 *   tidak memperluas akses ke sub kelas (perilaku lama).
 */
export async function hasMentorAccess(
  supabase: SupabaseClient,
  mentorId: string,
  classId: string,
  subClassId?: string | null
): Promise<boolean> {
  // Tanpa sub kelas: cukup punya penugasan apa pun di kelas ini
  if (!subClassId) {
    const { data } = await supabase
      .from('class_mentors')
      .select('id')
      .eq('class_id', classId)
      .eq('mentor_id', mentorId)
      .limit(1)
    return (data?.length ?? 0) > 0
  }

  // Penugasan tepat di sub kelas ini
  const { data: exact } = await supabase
    .from('class_mentors')
    .select('id')
    .eq('class_id', classId)
    .eq('mentor_id', mentorId)
    .eq('sub_class_id', subClassId)
    .limit(1)
  if ((exact?.length ?? 0) > 0) return true

  // Penugasan kelas induk, hanya berlaku untuk UKAI
  if (!(await isClassLevelMentor(supabase, mentorId, classId))) return false
  return isUkaiClass(supabase, classId)
}

/** True jika mentor ditugaskan di kelas induk (bukan hanya di sub kelas tertentu). */
export async function isClassLevelMentor(
  supabase: SupabaseClient,
  mentorId: string,
  classId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('class_mentors')
    .select('id')
    .eq('class_id', classId)
    .eq('mentor_id', mentorId)
    .is('sub_class_id', null)
    .limit(1)
  return (data?.length ?? 0) > 0
}

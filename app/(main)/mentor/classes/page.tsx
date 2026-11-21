// app/(main)/mentor/classes/page.tsx

import { createClient } from "@/lib/supabase/server"
import { BookOpen, ArrowRight, Users } from "lucide-react"
import Link from "next/link"
import { isUkaiTitle } from "@/lib/mentor-access"

type AssignedClass = {
  class_id: string
  sub_class_id: string | null
  classes: {
    id: string
    title: string
    level: string
    description: string | null
  } | null
  sub_classes: {
    id: string
    title: string
  } | null
}

export default async function MentorClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Ambil kelas & sub kelas yang diampu mentor
  const { data: rawAssignments } = await supabase
    .from('class_mentors')
    .select(`
      class_id,
      sub_class_id,
      classes (
        id, title, level, description
      ),
      sub_classes (
        id, title
      )
    `)
    .eq('mentor_id', user.id)

  const rawList = (rawAssignments as unknown as AssignedClass[]) || []

  // Khusus UKAI: mentor yang ditugaskan di kelas induk otomatis mengampu semua sub kelasnya,
  // jadi tampilkan satu kartu per sub kelas. Program lain tetap satu kartu per penugasan.
  const classLevelIds = rawList
    .filter(a => !a.sub_class_id && isUkaiTitle(a.classes?.title))
    .map(a => a.class_id)

  const { data: allSubClasses } = classLevelIds.length > 0
    ? await supabase.from('sub_classes').select('id, class_id, title').in('class_id', classLevelIds).order('created_at', { ascending: true })
    : { data: [] as { id: string; class_id: string; title: string }[] }

  type CardItem = AssignedClass & { derived?: boolean }
  const cards: CardItem[] = []
  const seen = new Set<string>()
  const pushCard = (item: CardItem) => {
    const key = `${item.class_id}-${item.sub_class_id ?? 'main'}`
    if (seen.has(key)) return
    seen.add(key)
    cards.push(item)
  }

  // Penugasan spesifik sub kelas dulu supaya tidak tertimpa kartu turunan
  rawList.filter(a => a.sub_class_id).forEach(a => pushCard(a))
  rawList.filter(a => !a.sub_class_id).forEach(a => {
    const subs = (allSubClasses ?? []).filter(s => s.class_id === a.class_id)
    if (subs.length === 0) {
      pushCard(a)
    } else {
      subs.forEach(s => pushCard({
        ...a,
        sub_class_id: s.id,
        sub_classes: { id: s.id, title: s.title },
        derived: true,
      }))
    }
  })

  const assignments = cards

  // Ambil jumlah student yang di-assign ke mentor ini per sub_class
  const { data: myStudentAssignments } = await supabase
    .from('mentor_student_assignments')
    .select('class_id, sub_class_id')
    .eq('mentor_id', user.id)

  const getMyStudentCount = (classId: string, subClassId: string | null) => {
    if (!subClassId) {
      // Pharmacamp: hitung semua enrollment di kelas
      return 0 // handled separately
    }
    return myStudentAssignments?.filter(
      a => a.class_id === classId && a.sub_class_id === subClassId
    ).length || 0
  }

  // Untuk Pharmacamp (no subClassId), hitung dari enrollments biasa
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('class_id, sub_class_id')
    .eq('status', 'active')

  const getPharmaStudentCount = (classId: string) => {
    return enrollments?.filter(e => e.class_id === classId && e.sub_class_id === null).length || 0
  }

  const getSubClassEnrollmentCount = (classId: string, subClassId: string | null) => {
    return enrollments?.filter(e => e.class_id === classId && e.sub_class_id === subClassId).length || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-brand-dark">Kelas Saya</h1>
        <p className="text-brand-gray text-sm">Pilih kelas untuk mengatur Jadwal & Sesi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments?.map((item, idx) => {
          const kelas = item.classes
          const subKelas = item.sub_classes
          if (!kelas) return null

          const isSubClass = !!item.sub_class_id
          const isPharmacamp = kelas.title?.startsWith('Pharmacamp')

          // Student count logic
          const studentCount = isPharmacamp
            ? getPharmaStudentCount(item.class_id)
            : item.derived
              ? getSubClassEnrollmentCount(item.class_id, item.sub_class_id)
              : getMyStudentCount(item.class_id, item.sub_class_id)

          const displayTitle = kelas.title
          const displaySubtitle = isSubClass ? `Peminatan: ${subKelas?.title}` : "Program Utama"

          return (
            <div key={`${item.class_id}-${item.sub_class_id || 'main'}-${idx}`} className="bg-white rounded-3xl p-6 shadow-card hover:shadow-soft transition-all border border-transparent hover:border-brand-blue/30 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 bg-brand-cream text-brand-dark rounded-2xl flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <BookOpen className="w-6 h-6" />
                 </div>
                 <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {kelas.level}
                 </span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-heading font-bold text-xl text-brand-dark mb-1 line-clamp-1">
                  {displayTitle}
                </h3>
                <p className="text-xs text-brand-blue font-bold mb-3 uppercase tracking-wide">
                  {displaySubtitle}
                </p>
                <p className="text-brand-gray text-sm line-clamp-2 mb-4">
                  {kelas.description || "Tidak ada deskripsi."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                 <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-dark bg-green-50 px-2.5 py-1.5 rounded-lg">
                   <Users className="w-3.5 h-3.5 text-green-600" />
                   {studentCount} Student {isPharmacamp || item.derived ? '' : 'Saya'}
                 </div>
                 
                 <Link 
                    href={`/mentor/classes/${kelas.id}${item.sub_class_id ? `?subClassId=${item.sub_class_id}` : ''}`}
                    className="w-10 h-10 rounded-full bg-brand-darkblue text-white flex items-center justify-center hover:bg-brand-pink transition-colors"
                 >
                    <ArrowRight className="w-5 h-5" />
                 </Link>
              </div>
            </div>
          )
        })}

        {assignments?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-brand-gray">Kamu belum ditugaskan di kelas manapun oleh Admin.</p>
            </div>
        )}
      </div>
    </div>
  )
}
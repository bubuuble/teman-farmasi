// app/(main)/student/classes/page.tsx

import { createClient } from "@/lib/supabase/server"
import { BookOpen, ArrowRight, UserCheck } from "lucide-react"
import Link from "next/link"

type EnrolledClass = {
  id: string
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

export default async function StudentClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch enrollments dengan kelas dan sub_kelas info
  const { data: rawEnrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      class_id,
      sub_class_id,
      classes (
        id, title, level, description
      ),
      sub_classes (
        id, title
      )
    `)
    .eq('student_id', user.id)
    .eq('status', 'active')

  const enrollments = (rawEnrollments as unknown as EnrolledClass[]) || []

  // Fetch mentor assignment untuk student ini
  const { data: mentorAssignments } = await supabase
    .from('mentor_student_assignments')
    .select(`
      class_id,
      sub_class_id,
      profiles:mentor_id ( full_name, email )
    `)
    .eq('student_id', user.id)

  // Helper: get mentor name for a specific class+subclass
  const getMentorName = (classId: string, subClassId: string | null): string => {
    if (!subClassId) return 'Tim Pengajar' // Pharmacamp
    const assignment = (mentorAssignments as any[])?.find(
      a => a.class_id === classId && a.sub_class_id === subClassId
    )
    return assignment?.profiles?.full_name || 'Tim Pengajar'
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading font-bold text-4xl text-brand-dark">Kelas & Materi</h1>
        <p className="text-gray-500 font-medium mt-2">Akses modul pembelajaran dan e-book eksklusif kamu di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {enrollments?.map((item) => {
          const kelas = item.classes
          const subKelas = item.sub_classes
          if (!kelas) return null

          const isPharmacamp = kelas.title?.startsWith('Pharmacamp')
          const mentorName = getMentorName(item.class_id, item.sub_class_id)

          return (
            <div key={item.id} className="bg-white rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col h-full hover:-translate-y-1">
              
              <div className="flex justify-between items-start mb-6">
                 <div className="w-14 h-14 bg-brand-cream text-brand-pink rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-7 h-7" />
                 </div>
                 <div className="flex flex-col items-end gap-1.5">
                   <span className="bg-brand-pink/10 text-brand-pink text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                     {kelas.level}
                   </span>
                   {!isPharmacamp && subKelas && (
                     <span className="bg-brand-blue/10 text-brand-blue text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                       {subKelas.title}
                     </span>
                   )}
                 </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-heading font-bold text-2xl text-brand-dark mb-3 line-clamp-2 group-hover:text-brand-pink transition-colors">
                    {kelas.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <div className="w-6 h-6 bg-brand-yellow rounded-full flex items-center justify-center text-[10px] font-bold text-brand-dark">
                        {mentorName[0]}
                    </div>
                    <div>
                      <span className="font-bold text-brand-dark">{mentorName}</span>
                      {!isPharmacamp && (
                        <span className="text-[10px] text-gray-400 ml-1 font-medium">• Mentor Kamu</span>
                      )}
                    </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {kelas.description || "Pelajari materi farmasi terlengkap dengan kurikulum terbaru dan mentor berpengalaman."}
                </p>
              </div>

              <div className="pt-8 mt-6 border-t border-gray-50">
                 <Link 
                    href={`/student/classes/${kelas.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-brand-yellow text-brand-dark py-4 rounded-2xl font-bold hover:bg-brand-dark hover:text-white transition-all shadow-sm"
                 >
                    Buka Materi <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
            </div>
          )
        })}

        {(!enrollments || enrollments.length === 0) && (
            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-bold text-lg">Kamu belum terdaftar di kelas manapun.</p>
                <p className="text-sm text-gray-400 mt-2">Hubungi admin untuk mulai perjalanan belajarmu!</p>
            </div>
        )}
      </div>
    </div>
  )
}
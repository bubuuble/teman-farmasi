// app/(main)/mentor/classes/page.tsx

import { createClient } from "@/lib/supabase/server"
import { BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

// Definisi Tipe
type AssignedClass = {
  class_id: string
  classes: {
    id: string
    title: string
    level: string
    description: string | null
    enrollments: { count: number }[]
  }
}

export default async function MentorClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Ambil kelas
  const { data: rawAssignments } = await supabase
    .from('class_mentors')
    .select(`
      class_id,
      classes (
        id, title, level, description,
        enrollments ( count )
      )
    `)
    .eq('mentor_id', user.id)

  // Cast tipe
  const assignments = rawAssignments as unknown as AssignedClass[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-brand-dark">Kelas Saya</h1>
        <p className="text-brand-gray text-sm">Pilih kelas untuk mengatur Jadwal & Batch.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments?.map((item) => {
          const kelas = item.classes
          return (
            <div key={kelas.id} className="bg-white rounded-3xl p-6 shadow-card hover:shadow-soft transition-all border border-transparent hover:border-brand-blue/30 group">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 bg-brand-cream text-brand-dark rounded-2xl flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <BookOpen className="w-6 h-6" />
                 </div>
                 <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {kelas.level}
                 </span>
              </div>
              
              <h3 className="font-heading font-bold text-xl text-brand-dark mb-2 line-clamp-1">
                {kelas.title}
              </h3>
              <p className="text-brand-gray text-sm line-clamp-2 mb-4 h-10">
                {kelas.description || "Tidak ada deskripsi."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                 <div className="text-xs font-semibold text-brand-dark bg-green-50 px-2 py-1 rounded-md">
                    {kelas.enrollments?.[0]?.count || 0} Siswa Terdaftar
                 </div>
                 
                 <Link 
                    href={`/mentor/classes/${kelas.id}`}
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
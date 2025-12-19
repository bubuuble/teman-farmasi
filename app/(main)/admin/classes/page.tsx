import { createClient } from "@/lib/supabase/server"
import { BookOpen } from "lucide-react"
import ClassForm from "./ClassForm"
import DeleteClassButton from "./DeleteClassButton"
import ManageMentors from "./ManageMentors"
import ManageStudents from "./ManageStudents" 
import ManageResources from "./ManageResources"

export default async function AdminClassesPage() {
  const supabase = await createClient()

  // 1. Ambil Kelas + Mentor + Enrollments (Siswa)
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      *,
      class_mentors ( id, mentor_id, profiles ( full_name, email ) ),
      enrollments ( id, student_id, profiles ( full_name, email ) ),
      class_resources ( id, title, file_url, file_path, created_at )
    `)
    .order('created_at', { ascending: false })

  // 2. Ambil List Mentor (Untuk Dropdown)
  const { data: allMentors } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'mentor')

  // 3. Ambil List Student (Untuk Dropdown)
  const { data: allStudents } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'student')

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">Manajemen Kelas</h1>
          <p className="text-brand-gray text-sm">Buat materi, tugaskan mentor, dan kelola siswa.</p>
        </div>
        <ClassForm />
      </div>

      {/* Grid Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes?.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl p-6 shadow-card hover:shadow-soft transition-all group flex flex-col h-full border border-transparent hover:border-brand-blue/20">
            
            {/* Header Card */}
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-dark group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
               </div>
               <span className="px-3 py-1 bg-gray-100 text-xs font-bold text-gray-500 rounded-full uppercase tracking-wider">
                 {item.level}
               </span>
            </div>

            {/* Content */}
            <div className="flex-1 mb-4">
              <h3 className="font-heading font-bold text-xl text-brand-dark mb-2 line-clamp-2">
                {item.title}
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-3">
                 {/* Badge Mentor */}
                 <div className="flex items-center gap-2 text-xs text-brand-gray bg-brand-cream px-2 py-1 rounded-md">
                    <span className="font-bold text-brand-dark">{item.class_mentors?.length || 0}</span>
                    <span>Mentor</span>
                 </div>
                 {/* Badge Siswa */}
                 <div className="flex items-center gap-2 text-xs text-brand-gray bg-green-50 px-2 py-1 rounded-md">
                    <span className="font-bold text-green-700">{item.enrollments?.length || 0}</span>
                    <span>Siswa</span>
                 </div>
                 {/* Badge Resources Baru */}
                 <div className="flex items-center gap-2 text-xs text-brand-gray bg-purple-50 px-2 py-1 rounded-md">
                    <span className="font-bold text-purple-700">{item.class_resources?.length || 0}</span>
                    <span>Materi</span>
                 </div>
              </div>

              <p className="text-brand-gray text-sm line-clamp-3">
                {item.description || "Tidak ada deskripsi."}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
               <div className="text-sm font-bold text-brand-dark">
                 {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}
               </div>
               
               <div className="flex gap-1">
                  {/* Manage Student (Green) */}
                  <ManageStudents 
                     classId={item.id}
                     classTitle={item.title}
                     allStudents={allStudents || []}
                     currentEnrollments={item.enrollments || []}
                  />

                  {/* Manage Mentor (Blue) */}
                  <ManageMentors 
                    classId={item.id}
                    classTitle={item.title}
                    allMentors={allMentors || []}
                    currentAssignments={item.class_mentors || []}
                  />
                  
                  {/* Manage Resources (Purple) - FITUR BARU */}
                  <ManageResources 
                    classId={item.id}
                    classTitle={item.title}
                    resources={item.class_resources || []}
                  />

                  {/* Edit & Delete */}
                  <ClassForm existingData={item} />
                  <DeleteClassButton id={item.id} />
               </div>
            </div>
          </div>
        ))}

        {classes?.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-brand-gray">Belum ada kelas yang dibuat.</p>
          </div>
        )}
      </div>
    </div>
  )
}
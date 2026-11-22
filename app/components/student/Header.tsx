// components/student/Header.tsx
import { createClient } from "@/lib/supabase/server"
import StudentSidebarToggle from "./SidebarToggle"

export default async function StudentHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  return (
    <header className="h-16 sm:h-20 lg:h-24 bg-brand-cream/80 backdrop-blur-md flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <StudentSidebarToggle />
        <div className="min-w-0">
          <h2 className="font-heading font-bold text-lg sm:text-xl lg:text-2xl text-brand-dark truncate">
            Halo, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h2>
          <p className="text-sm text-gray-500 font-medium hidden sm:block">Senang melihatmu kembali hari ini.</p>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-brand-dark">
            {profile?.full_name || "Student"}
          </p>
          <p className="text-[10px] font-bold text-brand-pink uppercase tracking-widest">
            Premium Member
          </p>
        </div>
        
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-yellow text-brand-dark flex items-center justify-center font-bold text-xl shadow-sm border-2 border-white">
          {profile?.full_name?.[0] || "S"}
        </div>
      </div>
    </header>
  )
}
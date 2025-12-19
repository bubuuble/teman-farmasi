// components/student/Header.tsx
import { createClient } from "@/lib/supabase/server"

export default async function StudentHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  return (
    <header className="h-24 bg-brand-cream/50 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-40">
      <div>
        <h2 className="font-heading font-bold text-2xl text-brand-dark">
          Halo, {profile?.full_name?.split(' ')[0] || 'Siswa'}! 👋
        </h2>
        <p className="text-sm text-gray-500 font-medium">Senang melihatmu kembali hari ini.</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-brand-dark">
            {profile?.full_name || "Student"}
          </p>
          <p className="text-[10px] font-bold text-brand-pink uppercase tracking-widest">
            Premium Member
          </p>
        </div>
        
        <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-brand-dark flex items-center justify-center font-bold text-xl shadow-sm border-2 border-white">
          {profile?.full_name?.[0] || "S"}
        </div>
      </div>
    </header>
  )
}
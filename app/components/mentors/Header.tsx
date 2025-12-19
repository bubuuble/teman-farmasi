// components/mentor/Header.tsx
import { createClient } from "@/lib/supabase/server"

export default async function MentorHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', user?.id)
    .single()

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div>
        <h2 className="font-heading font-bold text-xl text-brand-dark">
          Selamat Datang, Kak {profile?.full_name?.split(' ')[0] || 'Mentor'}! 👋
        </h2>
        <p className="text-sm text-brand-gray">Semangat berbagi ilmu hari ini.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-brand-dark">
            {profile?.full_name || "Mentor User"}
          </p>
          <p className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">
            @{profile?.username || "mentor"}
          </p>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-lg shadow-sm">
          {profile?.full_name?.[0] || "M"}
        </div>
      </div>
    </header>
  )
}
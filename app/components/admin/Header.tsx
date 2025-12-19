// components/admin/Header.tsx
import { createClient } from "@/lib/supabase/server"

export default async function AdminHeader() {
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
          Dashboard
        </h2>
        <p className="text-sm text-brand-gray">Overview aktivitas sistem hari ini</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-brand-dark">
            {profile?.full_name || "Admin User"}
          </p>
          <p className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">
            @{profile?.username || "admin"}
          </p>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-brand-darkblue text-white flex items-center justify-center font-bold text-lg shadow-sm">
          {profile?.full_name?.[0] || "A"}
        </div>
      </div>
    </header>
  )
}
// components/admin/Header.tsx
import { createClient } from "@/lib/supabase/server"
import SidebarToggle from "./SidebarToggle"

export default async function AdminHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', user?.id)
    .single()

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <SidebarToggle />
        <div>
          <h2 className="font-heading font-bold text-xl text-brand-dark">
            Dashboard
          </h2>
          <p className="text-sm text-brand-gray hidden sm:block">Overview aktivitas sistem hari ini</p>
        </div>
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
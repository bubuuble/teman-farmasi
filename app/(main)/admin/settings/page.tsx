import { createClient } from "@/lib/supabase/server"
import { Settings, User, Shield } from "lucide-react" // Hapus 'Save'
import UpdateProfileForm from "./UpdateProfileForm"

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  
  // Ambil data admin yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-darkblue text-white rounded-xl">
            <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">Pengaturan Sistem</h1>
          <p className="text-brand-gray text-sm">Kelola profil admin dan konfigurasi global.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KIRI: Edit Profile */}
        <div className="bg-white p-8 rounded-3xl shadow-card">
           <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <User className="w-5 h-5 text-brand-blue" />
              <h3 className="font-bold text-brand-dark">Profil Administrator</h3>
           </div>
           
           <UpdateProfileForm user={user} profile={profile} />
        </div>

        {/* KANAN: System Config */}
        <div className="space-y-6">
            
            {/* Kartu Informasi Sistem */}
            <div className="bg-white p-8 rounded-3xl shadow-card">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <Shield className="w-5 h-5 text-brand-pink" />
                    <h3 className="font-bold text-brand-dark">Informasi Sistem</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-500">Versi Aplikasi</span>
                        <span className="font-bold text-brand-dark">v1.0.0 (Beta)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-gray-50">
                        <span className="text-sm text-gray-500">Timezone Server</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">Asia/Jakarta (GMT+7)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-gray-50">
                        <span className="text-sm text-gray-500">Status Database</span>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Connected</span>
                    </div>
                </div>
            </div>

            {/* Kartu Bantuan */}
            <div className="bg-brand-blue/10 p-8 rounded-3xl border border-brand-blue/20">
                <h4 className="font-bold text-brand-dark mb-2">Butuh Bantuan Teknis?</h4>
                <p className="text-sm text-brand-gray mb-4">
                    Jika ada kendala pada sistem atau database, silakan hubungi tim developer.
                </p>
                <button className="bg-white text-brand-blue font-bold px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-brand-blue hover:text-white transition-colors">
                    Hubungi Developer
                </button>
            </div>

        </div>
      </div>
    </div>
  )
}
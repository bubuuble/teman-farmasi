import { createClient } from "@/lib/supabase/server"
import AddUserForm from "./AddUserForm"
import UserTable from "./UserTable"
import { redirect } from "next/navigation"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // 1. Ambil data user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Ambil role user yang login dari tabel profiles
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const currentUserRole = currentProfile?.role ?? ''
  const isSuperAdmin = currentUserRole === 'superadmin'

  // Hanya admin dan superadmin yang boleh mengakses halaman ini
  if (currentUserRole !== 'admin' && currentUserRole !== 'superadmin') {
    redirect('/')
  }

  // 3. Query users — superadmin TIDAK ditampilkan ke admin biasa
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (!isSuperAdmin) {
    // Admin biasa tidak bisa melihat akun superadmin
    query = query.neq('role', 'superadmin')
  }

  const { data: users } = await query

  return (
    <div className="space-y-6">
      
      {/* Header Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">Manajemen User</h1>
          <p className="text-brand-gray text-sm">Kelola akun Student, Mentor, dan Admin.</p>
        </div>
        <AddUserForm currentUserRole={currentUserRole} />
      </div>

      {/* Tabel User Client Component (Dengan Filter Dropdown) */}
      <UserTable users={users || []} currentUserRole={currentUserRole} isSuperAdmin={isSuperAdmin} />
      
    </div>
  )
}
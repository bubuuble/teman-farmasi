import { createClient } from "@/lib/supabase/server"
import AddUserForm from "./AddUserForm"
import DeleteUserButton from "./DeleteUserButton"
import EditUserForm from "./EditUserForm"
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
          <p className="text-brand-gray text-sm">Kelola akun Siswa, Mentor, dan Admin.</p>
        </div>
        <AddUserForm currentUserRole={currentUserRole} />
      </div>

      {/* Tabel User */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/50 text-brand-dark border-b border-brand-gray/10">
                <th className="p-6 font-heading font-bold text-sm">Nama Lengkap</th>
                <th className="p-6 font-heading font-bold text-sm">Role</th>
                <th className="p-6 font-heading font-bold text-sm">Email / Username</th>
                <th className="p-6 font-heading font-bold text-sm">Tanggal Gabung</th>
                <th className="p-6 font-heading font-bold text-sm text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-brand-cream/20 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-brand-dark">{user.full_name || "Tanpa Nama"}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${user.role === 'superadmin' ? 'bg-red-100 text-red-600' : ''}
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : ''}
                      ${user.role === 'mentor' ? 'bg-blue-100 text-blue-600' : ''}
                      ${user.role === 'student' ? 'bg-green-100 text-green-600' : ''}
                    `}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6 text-sm text-brand-gray">
                    <div className="font-medium text-brand-dark">{user.email}</div>
                    <div className="text-xs">@{user.username || "-"}</div>
                  </td>
                  <td className="p-6 text-sm text-brand-gray">
                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-1">
                      {/* Tombol Edit & Delete HANYA tampil jika:
                          - User yang diedit BUKAN superadmin, ATAU
                          - Yang login adalah superadmin (bisa edit semua) */}
                      {(isSuperAdmin || user.role !== 'superadmin') && (
                        <>
                          <EditUserForm user={user} currentUserRole={currentUserRole} />
                          <DeleteUserButton userId={user.id} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-brand-gray">
                    Belum ada data user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
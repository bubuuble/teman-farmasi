'use client'

import { useState } from "react"
import EditUserForm from "./EditUserForm"
import DeleteUserButton from "./DeleteUserButton"

type UserProfile = {
  id: string
  full_name: string | null
  role: string | null
  email: string | null
  username: string | null
  created_at: string
  institusi?: string | null
}

interface UserTableProps {
  users: UserProfile[]
  currentUserRole: string
  isSuperAdmin: boolean
}

export default function UserTable({ users, currentUserRole, isSuperAdmin }: UserTableProps) {
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredUsers = users.filter((user) => {
    const roleMatch =
      selectedRole === 'all'
        ? true
        : selectedRole === 'admin'
        ? user.role === 'admin' || user.role === 'superadmin'
        : user.role === selectedRole

    const q = searchQuery.toLowerCase().trim()
    const searchMatch =
      !q ||
      (user.full_name ?? '').toLowerCase().includes(q) ||
      (user.email ?? '').toLowerCase().includes(q) ||
      (user.username ?? '').toLowerCase().includes(q)

    return roleMatch && searchMatch
  })

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/60 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            id="user-search"
            type="text"
            placeholder="Cari nama, email, atau username…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-gray/20 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm text-brand-dark bg-white shadow-sm transition-all placeholder:text-brand-gray/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray/60 hover:text-brand-dark transition-colors"
              aria-label="Hapus pencarian"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown Filter Role */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-brand-gray/10">
          <label htmlFor="role-filter" className="text-sm font-semibold text-brand-dark whitespace-nowrap">
            Filter Role:
          </label>
          <select
            id="role-filter"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1 rounded-lg border border-brand-gray/20 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm font-medium text-brand-dark bg-brand-cream/30 cursor-pointer transition-all"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="mentor">Mentor</option>
            <option value="student">Student</option>
          </select>
        </div>
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-brand-cream/20 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-brand-dark">{user.full_name || "Tanpa Nama"}</div>
                    {user.role === 'student' && user.institusi && (
                      <div className="text-xs text-brand-gray mt-0.5">{user.institusi}</div>
                    )}
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
                      {(isSuperAdmin || user.role !== 'superadmin') && (
                        <>
                          <EditUserForm 
                            user={{
                              id: user.id,
                              email: user.email || "",
                              full_name: user.full_name,
                              username: user.username,
                              role: user.role || "student",
                              institusi: user.institusi
                            }} 
                            currentUserRole={currentUserRole} 
                          />
                          <DeleteUserButton userId={user.id} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-brand-gray">
                    {searchQuery
                      ? `Tidak ada user yang cocok dengan "${searchQuery}".`
                      : 'Belum ada data user untuk role yang dipilih.'}
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

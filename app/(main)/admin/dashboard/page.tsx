import { createClient } from "@/lib/supabase/server"
import { Users, BookOpen, CreditCard, UserCheck } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

// IMPORT MODAL FORM
import ClassForm from "../classes/ClassForm"
import AddUserForm from "../users/AddUserForm" // Asumsi kamu update ini juga nanti

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: string
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-card flex items-center gap-4 hover:shadow-soft transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} text-white`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-brand-gray text-sm mb-1">{title}</p>
        <h3 className="font-heading font-bold text-2xl text-brand-dark">{value}</h3>
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
  const { count: mentorCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor')
  const { count: classCount } = await supabase.from('classes').select('*', { count: 'exact', head: true })
  const { count: pendingOrderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Siswa" value={studentCount || 0} icon={Users} color="bg-brand-blue" />
        <StatCard title="Total Mentor" value={mentorCount || 0} icon={UserCheck} color="bg-brand-teal" />
        <StatCard title="Total Kelas" value={classCount || 0} icon={BookOpen} color="bg-brand-pink" />
        <StatCard title="Pending Order" value={pendingOrderCount || 0} icon={CreditCard} color="bg-brand-dark" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri Besar */}
        <div className="lg:col-span-2 bg-white rounded-4xl p-8 shadow-card min-h-[400px]">
          <h3 className="font-heading font-bold text-xl text-brand-dark mb-4">
            Aktivitas Absensi Terbaru
          </h3>
          <div className="text-center py-20 text-brand-gray bg-brand-cream/30 rounded-3xl">
            <p>Belum ada data absensi hari ini.</p>
          </div>
        </div>

        {/* Kolom Kanan Kecil */}
        <div className="bg-white rounded-4xl p-8 shadow-card">
          <h3 className="font-heading font-bold text-xl text-brand-dark mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
             
             {/* 1. BUTTON BUAT KELAS (Modal) */}
             <ClassForm 
                customTrigger={
                  <button className="w-full py-3 bg-brand-cream text-brand-dark font-semibold rounded-xl hover:bg-brand-yellow transition-colors text-sm">
                    + Buat Kelas Baru
                  </button>
                } 
             />

             {/* 2. BUTTON TAMBAH USER (Modal - Perlu update AddUserForm.tsx juga) */}
             {/* Jika AddUserForm belum diupdate support customTrigger, pakai Link dulu atau update file-nya */}
             <AddUserForm
                customTrigger={
                   <button className="w-full py-3 bg-brand-cream text-brand-dark font-semibold rounded-xl hover:bg-brand-pink hover:text-white transition-colors text-sm">
                     + Tambah User Manual
                   </button>
                }
             />

          </div>
        </div>
      </div>
    </div>
  )
}
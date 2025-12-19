// app/(main)/admin/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server"
import { Users, BookOpen, CreditCard, UserCheck, Clock, CheckCircle2 } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import Link from "next/link"

// IMPORT MODAL FORM
import ClassForm from "../classes/ClassForm"
import AddUserForm from "../users/AddUserForm"

// --- DEFINISI TIPE DATA ---
type LatestAttendance = {
  id: string
  created_at: string
  status: string
  profiles: { full_name: string | null } | null
  attendance_sessions: {
    title: string
    batches: {
      classes: { title: string } | null
    } | null
  } | null
}

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

  // 1. Fetch Stats
  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
  const { count: mentorCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor')
  const { count: classCount } = await supabase.from('classes').select('*', { count: 'exact', head: true })
  const { count: pendingOrderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  // 2. Fetch Aktivitas Absensi Terbaru (Deep Join)
  const { data: rawAttendances } = await supabase
    .from('attendance_records')
    .select(`
      id, created_at, status,
      profiles:student_id ( full_name ),
      attendance_sessions (
        title,
        batches (
          classes ( title )
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(6)

  const latestAttendances = rawAttendances as unknown as LatestAttendance[]

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
        
        {/* Kolom Kiri: Aktivitas Absensi Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-4xl p-8 shadow-card flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading font-bold text-xl text-brand-dark">
              Aktivitas Absensi Terbaru
            </h3>
            <Link href="/admin/attendances" className="text-xs font-bold text-brand-blue hover:underline">
                Lihat Semua
            </Link>
          </div>

          <div className="flex-1">
            {latestAttendances && latestAttendances.length > 0 ? (
                <div className="space-y-4">
                    {latestAttendances.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-brand-cream/20 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${
                                    item.status === 'present' ? 'bg-green-100 text-green-600' : 
                                    item.status === 'late' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                                }`}>
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-brand-dark">
                                        {item.profiles?.full_name || "Siswa"}
                                    </h4>
                                    <p className="text-[10px] text-brand-gray uppercase font-bold tracking-wider">
                                        {item.attendance_sessions?.batches?.classes?.title} • {item.attendance_sessions?.title}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase border ${
                                    item.status === 'present' ? 'text-green-600 border-green-200 bg-green-50' : 
                                    item.status === 'late' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : 'text-red-600 border-red-200 bg-red-50'
                                }`}>
                                    {item.status === 'present' ? 'Hadir' : item.status === 'late' ? 'Telat' : 'Alpha'}
                                </span>
                                <div className="text-[9px] text-gray-400 mt-1 flex items-center justify-end gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-brand-gray bg-brand-cream/30 rounded-3xl border border-dashed border-gray-200 h-full flex flex-col items-center justify-center">
                    <p className="text-sm font-medium">Belum ada data absensi hari ini.</p>
                </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Quick Actions */}
        <div className="bg-white rounded-4xl p-8 shadow-card h-fit">
          <h3 className="font-heading font-bold text-xl text-brand-dark mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
             <ClassForm 
                customTrigger={
                  <button className="w-full py-3 bg-brand-cream text-brand-dark font-semibold rounded-xl hover:bg-brand-yellow transition-colors text-sm">
                    + Buat Kelas Baru
                  </button>
                } 
             />
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
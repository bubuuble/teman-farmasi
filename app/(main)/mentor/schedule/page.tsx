// app/(main)/mentor/schedule/page.tsx

import { createClient } from "@/lib/supabase/server"
import SessionCard from "./SessionCard"

// --- DEFINISI TIPE DATA ---
type SessionData = {
  id: string
  title: string
  date_time: string
  mentor_status: string | null
  batches: {
    name: string
    classes: { title: string } | null
  } | null
}

export default async function MentorSchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Ambil semua sesi dari batch yang diajar mentor ini
  const { data: rawSessions } = await supabase
    .from('attendance_sessions')
    .select(`
        id, title, date_time, mentor_status,
        batches!inner (
            name,
            classes ( title )
        )
    `)
    .eq('batches.mentor_id', user.id)
    .order('date_time', { ascending: true })

  const sessions = (rawSessions as unknown as SessionData[]) || []

  // Pisahkan Sesi Aktif vs Selesai
  const activeSessions = sessions.filter(s => s.mentor_status !== 'present')
  const completedSessions = sessions.filter(s => s.mentor_status === 'present').reverse() // Terbaru di atas

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-brand-dark">Jadwal Mengajar</h1>
        <p className="text-brand-gray text-sm">Kelola jadwal pertemuan dan absensi mengajar Anda.</p>
      </div>

      {/* SECTION 1: SESI AKTIF */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-brand-pink rounded-full"></span>
            <h2 className="font-bold text-lg text-brand-dark">Sesi Aktif / Mendatang</h2>
        </div>

        {activeSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                ))}
            </div>
        ) : (
            <div className="p-12 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">Tidak ada sesi aktif saat ini.</p>
            </div>
        )}
      </section>

      {/* SECTION 2: SESI SELESAI */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-gray-300 rounded-full"></span>
            <h2 className="font-bold text-lg text-brand-dark">Riwayat Sesi Selesai</h2>
        </div>

        {completedSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                {completedSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                ))}
            </div>
        ) : (
            <div className="py-8 text-center text-gray-400 text-xs">
                Belum ada riwayat sesi yang diselesaikan.
            </div>
        )}
      </section>
    </div>
  )
}
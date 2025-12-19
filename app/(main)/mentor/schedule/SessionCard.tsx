// app/(main)/mentor/schedule/SessionCard.tsx

'use client'

import { useState } from 'react'
import { Calendar, Clock, CheckCircle } from 'lucide-react'
import { submitMentorAttendance } from '../classes/actions'

type Session = {
  id: string
  title: string
  date_time: string
  mentor_status: string | null
  batches: {
    name: string
    classes: { title: string } | null
  } | null
}

export default function SessionCard({ session }: { session: Session }) {
  const [loading, setLoading] = useState(false)

  const handleAbsen = async () => {
    if(!confirm("Lakukan absen mengajar untuk sesi ini?")) return
    
    setLoading(true)
    // Kirim ID Sesi dan biarkan action meng-update database
    // Catatan: Pastikan submitMentorAttendance di actions.ts sudah menerima classId atau gunakan revalidatePath global
    const res = await submitMentorAttendance(session.id, "schedule") 
    setLoading(false)

    if (res.error) alert(res.error)
  }

  const dateObj = new Date(session.date_time)
  const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest block mb-1">
                {session.batches?.classes?.title || 'Kelas'}
            </span>
            <h3 className="font-bold text-brand-dark leading-tight">{session.title}</h3>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">{session.batches?.name}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-3 text-xs text-gray-500">
            <Calendar className="w-4 h-4 text-brand-pink" />
            <span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
            <Clock className="w-4 h-4 text-brand-pink" />
            <span>{timeStr} WIB</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-50">
        {session.mentor_status === 'present' ? (
            <div className="w-full py-3 rounded-2xl bg-green-50 text-green-600 font-bold text-[11px] flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Sesi Selesai
            </div>
        ) : (
            <button 
                onClick={handleAbsen}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-brand-pink text-white font-bold text-[11px] hover:bg-brand-dark transition-all disabled:opacity-50 shadow-lg shadow-brand-pink/20"
            >
                {loading ? "Memproses..." : " Klik Absen Mengajar"}
            </button>
        )}
      </div>
    </div>
  )
}
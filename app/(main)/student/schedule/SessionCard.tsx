// app/(main)/student/schedule/SessionCard.tsx
'use client'

import { useState } from 'react'
import { Calendar, Clock, CheckCircle, Lock, Video, X, ExternalLink } from 'lucide-react'
import { studentCheckIn } from './actions'

// PERBAIKAN: Definisikan tipe Session secara detail sesuai data nested dari Supabase
type Session = {
  id: string
  title: string
  date_time: string
  zoom_link: string | null
  is_open: boolean
  batches: {
    name: string
    classes: {
      title: string
    } | null
  } | null
}

// PERBAIKAN: Ganti 'any' dengan tipe 'Session' yang sudah didefinisikan
export default function SessionCard({ 
  session, 
  attendanceStatus 
}: { 
  session: Session, 
  attendanceStatus: string | null 
}) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.stopPropagation() 
    if(!confirm("Konfirmasi kehadiran untuk sesi ini?")) return
    setLoading(true)
    const res = await studentCheckIn(session.id)
    setLoading(false)
    if (res.error) alert(res.error)
    else window.location.reload() 
  }

  const dateStr = new Date(session.date_time).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeStr = new Date(session.date_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-pink/30 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-6">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-sm border ${
                attendanceStatus ? 'bg-green-50 text-green-600 border-green-100' : 
                session.is_open ? 'bg-brand-pink text-white border-brand-pink animate-pulse' : 'bg-gray-50 text-gray-400 border-gray-100'
            }`}>
                {attendanceStatus ? <><CheckCircle className="w-3.5 h-3.5" /> HADIR</> : 
                 session.is_open ? '● ABSEN DIBUKA' : '● BELUM BUKA'}
            </span>
        </div>

        <h3 className="font-heading font-bold text-brand-dark text-xl leading-tight group-hover:text-brand-pink transition-colors mb-6 line-clamp-2">
            {session.title}
        </h3>

        <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                <div className="w-8 h-8 bg-brand-cream rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-brand-pink" />
                </div>
                <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                <div className="w-8 h-8 bg-brand-cream rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-brand-pink" />
                </div>
                <span>{timeStr} WIB</span>
            </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50 text-[11px] font-bold text-brand-pink uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            Detail Sesi <ExternalLink className="w-4 h-4" />
        </div>

        {/* Decorative Circle */}
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-brand-pink/5 rounded-full group-hover:scale-150 transition-transform"></div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                <div className="bg-brand-pink p-10 text-white relative">
                    <button onClick={() => setShowModal(false)} className="absolute right-8 top-8 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-2 block">
                        {session.batches?.classes?.title || 'Kelas'}
                    </span>
                    <h2 className="text-3xl font-bold font-heading leading-tight">{session.title}</h2>
                    <p className="mt-2 opacity-90">{session.batches?.name}</p>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Jadwal Sesi</label>
                            <div className="flex items-center gap-2 font-bold text-brand-dark text-sm">
                                <Calendar className="w-4 h-4 text-brand-pink" /> {dateStr}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Waktu Mulai</label>
                            <div className="flex items-center gap-2 font-bold text-brand-dark text-sm">
                                <Clock className="w-4 h-4 text-brand-pink" /> {timeStr} WIB
                            </div>
                        </div>
                    </div>

                    {session.zoom_link && session.zoom_link.trim() !== "" ? (
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Link Pertemuan Online</label>
                            <a 
                                href={session.zoom_link} 
                                target="_blank"
                                rel="noreferrer"
                                className="w-full bg-brand-darkblue text-white p-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-brand-dark transition-all shadow-xl shadow-brand-darkblue/20"
                            >
                                <Video className="w-6 h-6" /> Masuk Ruang Kelas (Zoom)
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Link Pertemuan Online</label>
                            <div className="w-full bg-gray-50 text-gray-400 p-5 rounded-3xl font-bold flex items-center justify-center gap-3 border border-dashed border-gray-200">
                                <Video className="w-6 h-6" /> Link Belum Tersedia
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                        {attendanceStatus ? (
                            <div className="w-full p-5 rounded-3xl bg-green-50 border border-green-100 text-green-600 font-bold flex items-center justify-center gap-3">
                                <CheckCircle className="w-6 h-6" /> Kehadiran Kamu Sudah Tercatat
                            </div>
                        ) : session.is_open ? (
                            <button 
                                type="button"
                                onClick={handleCheckIn}
                                disabled={loading}
                                className="w-full p-5 rounded-3xl bg-brand-pink text-white font-bold flex items-center justify-center gap-3 hover:bg-brand-dark transition-all shadow-xl shadow-brand-pink/20"
                            >
                                {loading ? "Sedang Memproses..." : " Klik Untuk Absen Hadir"}
                            </button>
                        ) : (
                            <div className="w-full p-5 rounded-3xl bg-gray-50 border border-gray-200 text-gray-400 font-bold flex items-center justify-center gap-3 cursor-not-allowed">
                                <Lock className="w-5 h-5" /> Link Absensi Belum Dibuka
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  )
}
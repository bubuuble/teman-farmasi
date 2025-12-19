// app/(main)/student/classes/[classId]/SessionListItem.tsx
'use client'

import { useState } from 'react'
import { Calendar, Clock, Video, ExternalLink, X, CheckCircle, Lock } from 'lucide-react'
import { studentCheckIn } from '../../schedule/actions'

type Session = {
  id: string; title: string; date_time: string; zoom_link: string | null; is_open: boolean;
}

export default function SessionListItem({ 
    session, 
    attendanceStatus, 
    batchName, 
    classTitle 
}: { 
    session: Session, 
    attendanceStatus: string | null,
    batchName: string,
    classTitle: string
}) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCheckIn = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if(!confirm("Konfirmasi kehadiran untuk sesi ini?")) return
    setLoading(true)
    const res = await studentCheckIn(session.id)
    setLoading(false)
    if (res.error) alert(res.error)
    else window.location.reload()
  }

  const dateObj = new Date(session.date_time)
  const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* BARIS ITEM LIST */}
      <div 
        onClick={() => setShowModal(true)}
        className="p-6 hover:bg-brand-cream/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group border-l-4 border-transparent hover:border-brand-pink"
      >
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center text-xs font-bold text-brand-dark shadow-sm shrink-0 group-hover:shadow-md group-hover:scale-105 transition-all">
            <span className="text-xl leading-none">{dateObj.getDate()}</span>
            <span className="text-[9px] text-gray-400 uppercase mt-1">{dateObj.toLocaleDateString('id-ID', { month: 'short' })}</span>
          </div>
          <div>
            <h5 className="font-bold text-brand-dark text-base group-hover:text-brand-pink transition-colors">{session.title}</h5>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 font-bold">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-pink" />
                {timeStr} WIB 
              </div>
              {attendanceStatus && (
                 <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full text-[10px] border border-green-100">
                    <CheckCircle className="w-3 h-3" /> Hadir
                 </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pr-4">
            <span className="text-[10px] font-bold text-brand-pink uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-2 bg-brand-pink/10 px-3 py-1.5 rounded-full">
                Detail Sesi <ExternalLink className="w-3 h-3" />
            </span>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                
                {/* Modal Header */}
                <div className="bg-brand-darkblue p-10 text-white relative overflow-hidden">
                    <button 
                        onClick={() => setShowModal(false)} 
                        className="absolute right-8 top-8 p-2 bg-white/10 rounded-full hover:bg-brand-pink transition-all shadow-lg z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-pink mb-3 block">{classTitle}</span>
                        <h2 className="text-3xl font-bold font-heading leading-tight">{session.title}</h2>
                        <div className="text-xs text-blue-200 mt-3 font-bold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-yellow rounded-full"></div>
                            {batchName}
                        </div>
                    </div>
                    {/* Decorative */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-pink/20 rounded-full blur-3xl"></div>
                </div>

                {/* Modal Body */}
                <div className="p-10 space-y-8">
                    {/* Grid Waktu */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-brand-cream/30 p-6 rounded-[32px] border border-brand-cream shadow-sm">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block tracking-widest">Hari & Tanggal</label>
                            <div className="text-sm font-bold text-brand-dark flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-brand-pink" /> {dateStr}
                            </div>
                        </div>
                        <div className="bg-brand-cream/30 p-6 rounded-[32px] border border-brand-cream shadow-sm">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block tracking-widest">Waktu Mulai</label>
                            <div className="text-sm font-bold text-brand-dark flex items-center gap-2">
                                <Clock className="w-4 h-4 text-brand-pink" /> {timeStr} WIB
                            </div>
                        </div>
                    </div>

                    {/* Link Zoom */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase px-2 tracking-widest">Link Pertemuan</label>
                        {session.zoom_link ? (
                            <a 
                                href={session.zoom_link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center justify-between p-6 bg-brand-yellow text-brand-dark rounded-[32px] hover:bg-brand-dark hover:text-white transition-all group shadow-xl shadow-brand-yellow/10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base">Masuk ke Zoom</p>
                                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">Klik untuk bergabung</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        ) : (
                            <div className="flex items-center gap-4 p-6 bg-gray-100 text-gray-400 rounded-[32px] border border-dashed border-gray-200">
                                <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Link Belum Tersedia</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Akan muncul saat sesi dimulai</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Button Absensi */}
                    <div className="pt-4 border-t border-gray-100">
                        {attendanceStatus ? (
                            <div className="w-full p-6 rounded-[32px] bg-green-50 border border-green-100 text-green-600 font-bold flex items-center justify-center gap-3">
                                <CheckCircle className="w-6 h-6" /> Kamu Sudah Hadir
                            </div>
                        ) : session.is_open ? (
                            <button 
                                onClick={handleCheckIn} 
                                disabled={loading} 
                                className="w-full p-6 rounded-[32px] bg-brand-pink text-white font-bold flex items-center justify-center gap-3 hover:bg-brand-dark transition-all shadow-xl shadow-brand-pink/20"
                            >
                                {loading ? "Sedang Memproses..." : " Klik Untuk Absen Hadir"}
                            </button>
                        ) : (
                            <div className="w-full p-6 rounded-[32px] bg-gray-50 border border-gray-200 text-gray-400 font-bold flex items-center justify-center gap-3 cursor-not-allowed">
                                <Lock className="w-5 h-5" /> Absensi Belum Dibuka
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
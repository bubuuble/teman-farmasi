// app/(main)/mentor/classes/[classId]/BatchList.tsx

'use client'

import { useState } from 'react'
import { Calendar, Trash2, Video, Clock, CheckCircle } from 'lucide-react' // Pencil dihapus karena tidak terpakai
import { deleteBatch, deleteSession, submitMentorAttendance } from '../actions'
import SessionForm from './SessionForm'
import BatchForm from './BatchForm'

// --- DEFINISI TIPE DATA ---
type Session = {
  id: string
  title: string
  date_time: string
  zoom_link: string | null
  mentor_status: string | null
}

type Batch = {
  id: string
  name: string
  start_date: string
  end_date: string
  attendance_sessions: Session[] | null
}

export default function BatchList({ batch, classId }: { batch: Batch, classId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (!batch) return null

  const handleDeleteBatch = async () => {
    if(!confirm("Hapus Batch ini? Semua jadwal sesi di dalamnya akan hilang.")) return
    setIsDeleting(true)
    await deleteBatch(batch.id, classId)
    setIsDeleting(false)
  }

  const handleDeleteSession = async (sessionId: string) => {
    if(!confirm("Hapus sesi ini?")) return
    await deleteSession(sessionId, classId)
  }

  // NAMA FUNGSI DISERAGAMKAN: handleAbsen
  const handleAbsen = async (sessionId: string) => {
    if(!confirm("Konfirmasi kehadiran mengajar untuk sesi ini?")) return
    
    setLoadingId(sessionId)
    const res = await submitMentorAttendance(sessionId, classId)
    setLoadingId(null)

    if (res.error) {
        alert(res.error)
    }
  }

  return (
    <div className="bg-white rounded-[32px] shadow-card overflow-hidden border border-gray-100 mb-8 animate-in fade-in duration-500">
      
      {/* Batch Header */}
      <div className="p-6 bg-brand-cream/30 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h3 className="font-heading font-bold text-xl text-brand-dark">{batch.name}</h3>
             <div className="flex items-center gap-1 ml-2">
                <BatchForm classId={classId} existingData={batch} />
                <button onClick={handleDeleteBatch} disabled={isDeleting} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                </button>
             </div>
           </div>
           <div className="flex items-center gap-2 text-sm text-brand-gray">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {new Date(batch.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - {new Date(batch.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
           </div>
        </div>
        <SessionForm batchId={batch.id} classId={classId} />
      </div>

      {/* List Sessions */}
      <div className="p-6">
        <h4 className="text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-4 opacity-40">Jadwal Pertemuan</h4>
        <div className="space-y-4">
          {(!batch.attendance_sessions || batch.attendance_sessions.length === 0) ? (
             <p className="text-sm text-gray-400 italic py-4">Belum ada sesi dibuat.</p>
          ) : (
             batch.attendance_sessions.map((session) => (
               <div key={session.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-4 group">
                  
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-dark shadow-sm font-bold border border-gray-100 text-lg">
                        {new Date(session.date_time).getDate()}
                     </div>
                     <div>
                        <h5 className="font-bold text-brand-dark leading-tight">{session.title}</h5>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                           <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-brand-pink" />
                              {new Date(session.date_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                           </span>
                           {session.zoom_link && (
                             <a href={session.zoom_link} target="_blank" className="flex items-center gap-1 text-brand-blue hover:underline font-bold">
                                <Video className="w-3 h-3" /> Zoom
                             </a>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-200">
                    
                    {/* LOGIKA TOMBOL SEKALI PAKAI FIX */}
                    {session.mentor_status === 'present' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-[10px] font-bold border border-green-200 cursor-default select-none">
                            <CheckCircle className="w-3.5 h-3.5" /> Absen Selesai
                        </div>
                    ) : (
                        <button 
                            type="button"
                            disabled={loadingId === session.id}
                            onClick={() => handleAbsen(session.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-pink text-white rounded-xl text-[10px] font-bold hover:bg-brand-dark transition-all disabled:opacity-50 shadow-lg shadow-brand-pink/20"
                        >
                            {loadingId === session.id ? "Memproses..." : "✋ Klik Absen Mengajar"}
                        </button>
                    )}

                    <div className="flex items-center gap-1 pl-3 border-l border-gray-200">
                        <SessionForm classId={classId} existingData={session} />
                        <button onClick={() => handleDeleteSession(session.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
               </div>
             ))
          )}
        </div>
      </div>
    </div>
  )
}
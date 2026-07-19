// app/(main)/mentor/attendance/AttendanceMatrix.tsx
'use client'

import { useState } from 'react'
import { updateSingleAttendance } from './actions'

type Session = { id: string, title: string, date_time: string, assigned_student_ids?: string[] }
type Student = { id: string, full_name: string }

export default function AttendanceMatrix({ 
    sessions, 
    students, 
    initialRecords,
    isPrivate,
    maxSessions
}: { 
    sessions: Session[], 
    students: Student[], 
    initialRecords: Record<string, string>,
    isPrivate: boolean,
    maxSessions: number
}) {
    const [attendance, setAttendance] = useState(initialRecords)
    const [updating, setUpdating] = useState<string | null>(null)

    const handleStatusChange = async (sessionId: string, studentId: string, newStatus: string) => {
        const key = `${sessionId}_${studentId}`
        setUpdating(key)
        
        const res = await updateSingleAttendance(sessionId, studentId, newStatus)
        
        if (!res.error) {
            setAttendance(prev => ({ ...prev, [key]: newStatus }))
        } else {
            alert("Gagal update data")
        }
        setUpdating(null)
    }

    // Hitung jumlah kolom dinamis untuk private class
    const colsCount = isPrivate 
      ? Math.max(
          maxSessions || 0,
          ...students.map(student => sessions.filter(s => s.assigned_student_ids?.includes(student.id)).length),
          1
        )
      : sessions.length;

    return (
        <div className="bg-white rounded-[32px] shadow-card overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-50 bg-brand-cream/20">
                <h3 className="font-bold text-brand-dark">Matrix Kehadiran Student</h3>
                <p className="text-xs text-gray-400">Klik pada status untuk mengubah secara manual.</p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] font-bold uppercase text-brand-dark tracking-widest border-b border-gray-100">
                            <th className="p-4 sticky left-0 bg-gray-50 z-10 min-w-[180px]">Nama Student</th>
                            {isPrivate ? (
                                Array.from({ length: colsCount }).map((_, idx) => (
                                    <th key={idx} className="p-4 text-center border-l border-gray-100 min-w-[120px]">
                                        Pertemuan {idx + 1}
                                    </th>
                                ))
                            ) : (
                                sessions.map((s, idx) => (
                                    <th key={s.id} className="p-4 text-center border-l border-gray-100 min-w-[120px]">
                                        Sesi {idx + 1}
                                        <div className="font-normal text-gray-400 normal-case mt-1">
                                            {new Date(s.date_time).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}
                                        </div>
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                                <td className="p-4 sticky left-0 bg-white z-10 font-bold text-brand-dark border-r border-gray-50">
                                    {student.full_name}
                                </td>
                                {isPrivate ? (
                                    Array.from({ length: colsCount }).map((_, idx) => {
                                        // Cari sesi ke-idx milik student ini
                                        const studentSessions = sessions
                                            .filter(s => s.assigned_student_ids?.includes(student.id))
                                            .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
                                        
                                        const session = studentSessions[idx]
                                        if (!session) {
                                            return (
                                                <td key={idx} className="p-2 text-center border-l border-gray-50 text-[10px] text-gray-400 italic bg-gray-50/20">
                                                    Belum dijadwalkan
                                                </td>
                                            )
                                        }

                                        const key = `${session.id}_${student.id}`
                                        const currentStatus = attendance[key] || 'absent'
                                        const isUpdating = updating === key

                                        return (
                                            <td key={session.id} className="p-2 text-center border-l border-gray-50">
                                                <select 
                                                    disabled={isUpdating}
                                                    value={currentStatus}
                                                    onChange={(e) => handleStatusChange(session.id, student.id, e.target.value)}
                                                    className={`text-[10px] font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer transition-all border
                                                        ${currentStatus === 'present' ? 'bg-green-50 text-green-600 border-green-200' : 
                                                          currentStatus === 'late' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                          currentStatus === 'permission' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                                                          'bg-red-50 text-red-600 border-red-200'}
                                                        ${isUpdating ? 'opacity-30' : 'opacity-100'}
                                                    `}
                                                >
                                                    <option value="present">Hadir</option>
                                                    <option value="late">Telat</option>
                                                    <option value="permission">Ijin</option>
                                                    <option value="absent">Alpha</option>
                                                </select>
                                                <div className="text-[9px] text-gray-400 mt-1 font-medium">
                                                    {new Date(session.date_time).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}
                                                </div>
                                            </td>
                                        )
                                    })
                                ) : (
                                    sessions.map(session => {
                                        const key = `${session.id}_${student.id}`
                                        const currentStatus = attendance[key] || 'absent'
                                        const isUpdating = updating === key

                                        return (
                                            <td key={session.id} className="p-2 text-center border-l border-gray-50">
                                                <select 
                                                    disabled={isUpdating}
                                                    value={currentStatus}
                                                    onChange={(e) => handleStatusChange(session.id, student.id, e.target.value)}
                                                    className={`text-[10px] font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer transition-all border
                                                        ${currentStatus === 'present' ? 'bg-green-50 text-green-600 border-green-200' : 
                                                          currentStatus === 'late' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                          currentStatus === 'permission' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                                                          'bg-red-50 text-red-600 border-red-200'}
                                                        ${isUpdating ? 'opacity-30' : 'opacity-100'}
                                                    `}
                                                >
                                                    <option value="present">Hadir</option>
                                                    <option value="late">Telat</option>
                                                    <option value="permission">Ijin</option>
                                                    <option value="absent">Alpha</option>
                                                </select>
                                            </td>
                                        )
                                    })
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

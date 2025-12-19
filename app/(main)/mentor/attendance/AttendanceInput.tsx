// app/(main)/mentor/attendance/AttendanceInput.tsx
'use client'

import { useState } from 'react'
import { Save, Lock, Unlock } from 'lucide-react'
import { saveManualAttendance, toggleSessionStatus } from './actions'

// --- DEFINISI TIPE DATA ---
type Student = { id: string, full_name: string }
type AttendanceRow = { student_id: string, status: string }

export default function AttendanceInput({ 
    sessionId, 
    students, 
    existingRecords,
    isOpen 
}: { 
    sessionId: string, 
    students: Student[], 
    existingRecords: AttendanceRow[], // Ganti nama tipe di sini
    isOpen: boolean
}) {
    // Definisi tipe state secara eksplisit
    const [attendance, setAttendance] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {}
        students.forEach(s => {
            const found = existingRecords.find(r => r.student_id === s.id)
            initial[s.id] = found ? found.status : 'absent'
        })
        return initial
    })
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        // Pastikan status di-cast ke string agar tidak unknown
        const dataArray = Object.entries(attendance).map(([id, status]) => ({
            studentId: id,
            status: status as string
        }))
        const res = await saveManualAttendance(sessionId, dataArray)
        setLoading(false)
        if (res.error) alert(res.error)
        else alert(res.success)
    }

    const handleToggle = async () => {
        const res = await toggleSessionStatus(sessionId, isOpen)
        if (res.error) alert(res.error)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-card border border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-brand-dark">Input Kehadiran</h3>
                    <p className="text-xs text-gray-400">{students.length} Siswa terdaftar</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={handleToggle}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                            isOpen ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                        }`}
                    >
                        {isOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {isOpen ? 'Link Terbuka' : 'Link Tertutup'}
                    </button>
                    <button 
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-brand-darkblue text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan Data'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-brand-cream/50 text-[10px] font-bold uppercase text-brand-dark tracking-widest">
                            <th className="p-6 text-sm">Nama Siswa</th>
                            <th className="p-6 text-center text-sm">Hadir</th>
                            <th className="p-6 text-center text-sm">Telat</th>
                            <th className="p-6 text-center text-sm">Ijin</th>
                            <th className="p-6 text-center text-sm">Alpha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {students.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6 font-bold text-brand-dark text-sm">{s.full_name}</td>
                                {['present', 'late', 'permission', 'absent'].map(status => (
                                    <td key={status} className="p-6 text-center">
                                        <input 
                                            type="radio" 
                                            name={`status-${s.id}`} 
                                            checked={attendance[s.id] === status}
                                            onChange={() => setAttendance((prev: Record<string, string>) => ({ ...prev, [s.id]: status }))}
                                            className="w-4 h-4 accent-brand-pink cursor-pointer"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
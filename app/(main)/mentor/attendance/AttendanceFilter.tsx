// app/(main)/mentor/attendance/AttendanceFilter.tsx
'use client'

import { useRouter } from 'next/navigation'

type Props = {
  classes: { id: string; title: string }[]
  batches: { id: string; name: string }[]
  sessions: { id: string; title: string; date_time: string }[]
  selectedClassId?: string
  selectedBatchId?: string
}

export default function AttendanceFilter({ 
  classes, 
  batches, 
  selectedClassId, 
  selectedBatchId 
}: Props) {
  const router = useRouter()

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value
    // Reset batch saat kelas berubah
    router.push(`/mentor/attendance?classId=${classId}`)
  }

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const batchId = e.target.value
    router.push(`/mentor/attendance?classId=${selectedClassId}&batchId=${batchId}`)
  }

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-card flex flex-col md:flex-row gap-4 items-end md:items-center border border-gray-100">
        
      {/* Dropdown Kelas */}
      <div className="w-full md:w-1/2 space-y-2">
        <label className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">Pilih Kelas</label>
        <select 
            value={selectedClassId || ''}
            onChange={handleClassChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-brand-blue"
        >
            <option value="">-- Pilih Kelas --</option>
            {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
            ))}
        </select>
      </div>

      {/* Dropdown Batch */}
      <div className="w-full md:w-1/2 space-y-2">
        <label className="text-[10px] font-bold text-brand-dark uppercase tracking-widest">Pilih Batch / Gelombang</label>
        <select 
            disabled={!selectedClassId}
            value={selectedBatchId || ''}
            onChange={handleBatchChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-brand-blue disabled:opacity-50"
        >
            <option value="">-- Pilih Batch --</option>
            {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
            ))}
        </select>
      </div>
    </div>
  )
}
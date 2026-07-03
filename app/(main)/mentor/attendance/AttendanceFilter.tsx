// app/(main)/mentor/attendance/AttendanceFilter.tsx
'use client'

import { useRouter } from 'next/navigation'

type Props = {
  classes: { id: string; title: string }[]
  selectedClassId?: string
}

export default function AttendanceFilter({ classes, selectedClassId }: Props) {
  const router = useRouter()

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value
    if (classId) {
      router.push(`/mentor/attendance?classId=${classId}`)
    } else {
      router.push('/mentor/attendance')
    }
  }

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-card flex flex-col md:flex-row gap-4 items-end md:items-center border border-gray-100">
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
    </div>
  )
}
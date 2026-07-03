// app/(main)/admin/attendances/FilterAttendance.tsx
'use client'

import { useRouter } from 'next/navigation'

type Props = {
  classes: { id: string; title: string }[] | null
  selectedClassId?: string
}

export default function FilterAttendance({ classes, selectedClassId }: Props) {
  const router = useRouter()

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value
    if (classId) {
      router.push(`/admin/attendances/student?classId=${classId}`)
    } else {
      router.push('/admin/attendances/student')
    }
  }

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-card flex flex-col md:flex-row gap-4 items-end md:items-center border border-gray-50">
      <div className="w-full md:w-1/2 space-y-2">
        <label className="text-xs font-bold text-brand-dark uppercase tracking-widest">Pilih Kelas</label>
        <div className="relative">
          <select
            value={selectedClassId || ''}
            onChange={handleClassChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-brand-blue appearance-none transition-all"
          >
            <option value="">-- Pilih Kelas --</option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
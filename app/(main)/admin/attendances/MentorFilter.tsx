// app/(main)/admin/attendances/MentorFilter.tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MentorFilter({ mentors }: { mentors: { id: string; full_name: string | null }[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentId = searchParams.get('mentorId') || ""

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-card border border-gray-50 flex items-center gap-4">
      <div className="w-full md:w-1/3 space-y-2">
        <label className="text-xs font-bold text-brand-dark uppercase tracking-widest">Sort Berdasarkan Mentor</label>
        <select 
          value={currentId}
          onChange={(e) => router.push(`/admin/attendances/mentor?mentorId=${e.target.value}`)}
          className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-brand-blue"
        >
          <option value="">-- Semua Mentor --</option>
          {mentors.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </select>
      </div>
    </div>
  )
}
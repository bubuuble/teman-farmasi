// app/(main)/admin/attendances/MentorFilter.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MentorFilter({ mentors }: { mentors: { id: string; full_name: string | null }[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentId = searchParams.get('mentorId') || ""

  const [searchQuery, setSearchQuery] = useState('')

  // Sort mentors alphabetically
  const sortedMentors = [...mentors].sort((a, b) => 
    (a.full_name || '').localeCompare(b.full_name || '', 'id')
  )

  const filteredMentors = sortedMentors.filter(m => 
    (m.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-card border border-gray-50 flex items-center gap-4">
      <div className="w-full md:w-1/2 space-y-2">
        <label className="text-xs font-bold text-brand-dark uppercase tracking-widest">Sort Berdasarkan Mentor</label>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama mentor..."
          className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-blue bg-gray-50 mb-2"
        />

        <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto p-2 bg-white space-y-1">
          <div
            onClick={() => {
              setSearchQuery('')
              router.push('/admin/attendances/mentor')
            }}
            className={`p-2 rounded-lg cursor-pointer text-xs font-bold transition-colors
              ${!currentId ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue' : 'hover:bg-gray-50 border border-transparent text-gray-500'}
            `}
          >
            -- Semua Mentor --
          </div>
          {filteredMentors.map(m => {
            const isSelected = currentId === m.id
            return (
              <div
                key={m.id}
                onClick={() => router.push(`/admin/attendances/mentor?mentorId=${m.id}`)}
                className={`p-2 rounded-lg cursor-pointer text-xs font-bold transition-colors flex items-center justify-between
                  ${isSelected ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue' : 'hover:bg-gray-50 border border-transparent text-gray-500'}
                `}
              >
                <span>{m.full_name}</span>
                {isSelected && <span className="text-[10px]">Aktif</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
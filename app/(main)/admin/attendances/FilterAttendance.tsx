// app/(main)/admin/attendances/FilterAttendance.tsx
'use client'

import { useRouter } from 'next/navigation'

type Props = {
  classes: { id: string; title: string }[] | null
  selectedClassId?: string
}

const PROGRAMS = [
  'PharmaCore Class',
  'Pharma Research Mentoring',
  'PharmaPublish Academy',
  'Pharma Impact',
  'Pharmacamp'
]

function getCategory(title: string): string {
  for (const p of PROGRAMS) {
    if (title.startsWith(p)) {
      return p
    }
  }
  return 'Lainnya'
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

  // Group classes by category and sort within each group
  const groupedClasses = (classes || []).reduce((acc, c) => {
    const category = getCategory(c.title)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(c)
    return acc
  }, {} as Record<string, { id: string; title: string }[]>)

  // Sort groups alphabetically by title
  Object.keys(groupedClasses).forEach((category) => {
    groupedClasses[category].sort((a, b) => a.title.localeCompare(b.title, 'id'))
  })

  // Order categories for display
  const displayCategories = [...PROGRAMS, 'Lainnya']

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-card flex flex-col md:flex-row gap-4 items-end md:items-center border border-gray-50">
      <div className="w-full md:w-1/2 space-y-2">
        <label className="text-xs font-bold text-brand-dark uppercase tracking-widest">Pilih Kelas</label>
        <div className="relative">
          <select
            value={selectedClassId || ''}
            onChange={handleClassChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-brand-blue appearance-none transition-all cursor-pointer font-medium text-brand-dark"
          >
            <option value="">-- Pilih Kelas --</option>
            {displayCategories.map((category) => {
              const items = groupedClasses[category] || []
              if (items.length === 0) return null
              return (
                <optgroup key={category} label={category} className="font-bold text-brand-dark bg-white">
                  {items.map((c) => (
                    <option key={c.id} value={c.id} className="font-normal text-brand-dark bg-white">
                      {c.title}
                    </option>
                  ))}
                </optgroup>
              )
            })}
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
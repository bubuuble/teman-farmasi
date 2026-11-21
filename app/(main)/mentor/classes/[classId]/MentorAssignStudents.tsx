'use client'

import { useMemo, useState, useTransition } from 'react'
import { UserPlus, Search, Loader2, Trash2, X } from 'lucide-react'
import { mentorAssignStudents, mentorRemoveStudent } from '../actions'

type StudentOption = { id: string; full_name: string | null; email: string | null }
type Enrolled = { enrollmentId: string; student: StudentOption }

export default function MentorAssignStudents({
  classId,
  subClassId,
  subClassTitle,
  candidates,
  enrolled,
}: {
  classId: string
  subClassId: string
  subClassTitle: string
  candidates: StudentOption[]
  enrolled: Enrolled[]
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const enrolledIds = useMemo(() => new Set(enrolled.map(e => e.student.id)), [enrolled])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return candidates
      .filter(c => !enrolledIds.has(c.id))
      .filter(c => !q || (c.full_name ?? '').toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q))
      .slice(0, 50)
  }, [candidates, enrolledIds, search])

  const toggle = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  const handleAssign = () => {
    if (selected.length === 0) return
    startTransition(async () => {
      const res = await mentorAssignStudents(classId, subClassId, selected)
      if (res.error) {
        setFeedback({ ok: false, text: res.error })
      } else {
        setFeedback({ ok: true, text: res.success || 'Berhasil' })
        setSelected([])
        setSearch('')
      }
    })
  }

  const handleRemove = (enrollmentId: string) => {
    startTransition(async () => {
      const res = await mentorRemoveStudent(enrollmentId, classId)
      setFeedback(res.error ? { ok: false, text: res.error } : { ok: true, text: res.success || 'Berhasil' })
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-heading font-bold text-lg text-brand-dark flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-brand-blue" />
          Siswa Sub Kelas
        </h3>
        <span className="text-[10px] bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-md font-bold">
          {enrolled.length} Orang
        </span>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-card p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama / email siswa..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-blue"
          />
        </div>

        <div className="max-h-52 overflow-y-auto divide-y divide-gray-50 rounded-xl border border-gray-100">
          {filtered.length === 0 ? (
            <p className="p-4 text-xs text-gray-400 italic text-center">Tidak ada siswa yang bisa ditambahkan.</p>
          ) : (
            filtered.map(s => (
              <label key={s.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                  className="w-4 h-4"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-dark truncate">{s.full_name || 'Tanpa Nama'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{s.email || '-'}</p>
                </div>
              </label>
            ))
          )}
        </div>

        <button
          onClick={handleAssign}
          disabled={isPending || selected.length === 0}
          className="w-full bg-brand-darkblue text-white text-sm font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Assign ke {subClassTitle} ({selected.length})
        </button>

        {feedback && (
          <div className={`flex items-start gap-2 text-xs p-3 rounded-xl ${feedback.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {!feedback.ok && <X className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            {feedback.text}
          </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-card">
        <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
          {enrolled.length === 0 ? (
            <p className="p-8 text-center text-xs text-gray-400 italic">Belum ada siswa di sub kelas ini.</p>
          ) : (
            enrolled.map(e => (
              <div key={e.enrollmentId} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-brand-cream flex items-center justify-center font-bold text-brand-dark text-xs border border-white shadow-sm flex-shrink-0">
                  {e.student.full_name?.[0] || 'S'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-brand-dark truncate">{e.student.full_name || 'Tanpa Nama'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{e.student.email || '-'}</p>
                </div>
                <button
                  onClick={() => handleRemove(e.enrollmentId)}
                  disabled={isPending}
                  className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Keluarkan dari sub kelas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

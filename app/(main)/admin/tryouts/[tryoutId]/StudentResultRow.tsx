'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

export type AttemptDetail = {
  id: string
  attemptNumber: number
  totalCorrect: number
  score: number | null
  status: string
  finishedAt: string | null
}

export type StudentResult = {
  studentId: string
  rank: number
  name: string
  email: string
  attemptsDone: number
  maxAttempts: number | null
  bestScore: number | null
  bestCorrect: number // jumlah benar pada percobaan dengan skor tertinggi
  latestStatus: string
  latestFinishedAt: string | null
  attempts: AttemptDetail[] // semua percobaan, terbaru di atas
}

const statusStyle = (status: string) =>
  status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
  status === 'timed_out' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString('id-ID') : '-')

export default function StudentResultRow({
  student,
  totalQuestions
}: {
  student: StudentResult
  totalQuestions: number
}) {
  const [open, setOpen] = useState(false)
  const rank = student.rank
  // Semua percobaan, urut dari percobaan pertama
  const allAttempts = [...student.attempts].sort((a, b) => a.attemptNumber - b.attemptNumber)
  const expandable = allAttempts.length > 1

  return (
    <>
      <tr className="hover:bg-gray-50/70 transition">
        <td className="py-4 pl-2">
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
            rank === 0 ? 'bg-amber-400 text-white shadow-sm' :
            rank === 1 ? 'bg-gray-300 text-gray-700' :
            rank === 2 ? 'bg-amber-700/60 text-white' : 'text-gray-400'
          }`}>
            #{rank + 1}
          </span>
        </td>
        <td className="py-4">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            disabled={!expandable}
            className="flex items-start gap-1.5 text-left group disabled:cursor-default"
            title={expandable ? 'Lihat semua percobaan' : undefined}
          >
            <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-90' : ''} ${!expandable ? 'opacity-0' : 'group-hover:text-brand-pink'}`} />
            <span>
              <span className="block font-bold text-brand-dark group-enabled:group-hover:text-brand-pink">{student.name}</span>
              <span className="block text-xs text-gray-400 font-normal">{student.email}</span>
            </span>
          </button>
        </td>
        <td className="py-4 text-xs font-bold text-gray-600">
          {student.attemptsDone}/{student.maxAttempts ?? '∞'}
        </td>
        <td className="py-4 text-xs font-bold text-brand-dark">
          {student.bestCorrect} / {totalQuestions} Soal
        </td>
        <td className="py-4 font-extrabold text-base text-brand-pink">
          {student.bestScore != null ? `${student.bestScore.toFixed(1)}%` : '-'}
        </td>
        <td className="py-4">
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${statusStyle(student.latestStatus)}`}>
            {student.latestStatus}
          </span>
        </td>
        <td className="py-4 text-xs text-gray-400">{fmtDate(student.latestFinishedAt)}</td>
      </tr>

      {open && allAttempts.map(a => (
        <tr key={a.id} className="bg-gray-50/60">
          <td />
          <td />
          <td className="py-2.5 text-[11px] font-bold text-gray-500 whitespace-nowrap">
            <span className="text-gray-300 mr-1.5">↳</span>Ke-{a.attemptNumber}
          </td>
          <td className="py-2.5 text-[11px] text-gray-500">
            {a.totalCorrect} / {totalQuestions} Soal
          </td>
          <td className="py-2.5 text-xs font-bold text-brand-pink/80">
            {a.score != null ? `${Number(a.score).toFixed(1)}%` : '-'}
          </td>
          <td className="py-2.5">
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${statusStyle(a.status)}`}>
              {a.status}
            </span>
          </td>
          <td className="py-2.5 text-[11px] text-gray-400">{fmtDate(a.finishedAt)}</td>
        </tr>
      ))}
    </>
  )
}

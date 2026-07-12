'use client'

import { useState, useMemo } from 'react'
import {
  UserCheck,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Award,
  BookOpen,
  Mail,
  BarChart2,
  Layers,
} from 'lucide-react'
import type { MentorSummaryItem } from './page'

interface Props {
  summaryList: MentorSummaryItem[]
  totalMentors: number
  mentorsWithStudents: number
  avgStudents: number
  topMentor: MentorSummaryItem | null
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-card flex items-center gap-4 hover:shadow-soft transition-shadow">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} text-white flex-shrink-0`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="min-w-0">
        <p className="text-brand-gray text-sm mb-0.5">{label}</p>
        <h3 className="font-heading font-bold text-2xl text-brand-dark leading-none">{value}</h3>
        {sub && <p className="text-xs text-brand-gray mt-1 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ── Tier Badge ─────────────────────────────────────────────────────────────────
function TierBadge({ count }: { count: number }) {
  if (count >= 10) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <Award className="w-3 h-3" /> ≥10
    </span>
  )
  if (count >= 5) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
      ≥5
    </span>
  )
  if (count > 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
      {count}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
      0
    </span>
  )
}

// ── Expand Row ─────────────────────────────────────────────────────────────────
function MentorRow({ mentor, rank }: { mentor: MentorSummaryItem; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  const hasStudents = mentor.totalStudents > 0

  return (
    <>
      <tr
        className={`border-b border-gray-100 transition-colors cursor-pointer ${
          expanded ? 'bg-brand-cream/30' : 'hover:bg-gray-50/80'
        }`}
        onClick={() => hasStudents && setExpanded(e => !e)}
      >
        {/* Rank */}
        <td className="px-6 py-4 w-12">
          <span className={`font-bold text-sm ${rank <= 3 && mentor.totalStudents > 0 ? 'text-brand-blue' : 'text-brand-gray/50'}`}>
            #{rank}
          </span>
        </td>

        {/* Nama Mentor */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              mentor.totalStudents > 0 ? 'bg-brand-blue/10 text-brand-blue' : 'bg-gray-100 text-gray-400'
            }`}>
              {(mentor.mentorName?.[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-brand-dark text-sm">{mentor.mentorName}</div>
              <div className="text-xs text-brand-gray flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" />
                {mentor.mentorEmail}
              </div>
            </div>
          </div>
        </td>

        {/* Total Student */}
        <td className="px-6 py-4 text-center">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl font-heading font-bold text-lg ${
            mentor.totalStudents >= 10
              ? 'bg-amber-100 text-amber-700'
              : mentor.totalStudents >= 5
              ? 'bg-brand-blue/10 text-brand-blue'
              : mentor.totalStudents > 0
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {mentor.totalStudents}
          </div>
        </td>

        {/* Total Program */}
        <td className="px-6 py-4 text-center">
          <span className="text-sm font-semibold text-brand-dark">
            {mentor.classSummary.length > 0 ? mentor.classSummary.length : '-'}
          </span>
          {mentor.classSummary.length > 0 && (
            <span className="text-xs text-brand-gray ml-1">program</span>
          )}
        </td>

        {/* Breakdown Chips */}
        <td className="px-6 py-4">
          {mentor.classSummary.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {mentor.classSummary.slice(0, 3).map((c, i) => (
                <span
                  key={i}
                  title={c.subClassTitle ? `${c.classTitle} › ${c.subClassTitle}` : c.classTitle}
                  className="inline-block max-w-[160px] truncate px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-brand-cream text-brand-dark border border-brand-gray/15"
                >
                  {c.subClassTitle
                    ? `${c.classTitle} › ${c.subClassTitle}`
                    : c.classTitle}{' '}
                  <span className="font-bold text-brand-blue">({c.studentCount})</span>
                </span>
              ))}
              {mentor.classSummary.length > 3 && (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-500">
                  +{mentor.classSummary.length - 3} lainnya
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-brand-gray/60 italic">Belum ada assignment</span>
          )}
        </td>

        {/* Expand toggle */}
        <td className="px-6 py-4 text-right w-12">
          {hasStudents && (
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
              expanded ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-500 hover:bg-brand-blue/10'
            }`}>
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </td>
      </tr>

      {/* Expanded Detail Row */}
      {expanded && (
        <tr className="bg-brand-cream/20">
          <td colSpan={6} className="px-6 py-5">
            <div className="space-y-4">
              {mentor.classSummary.map((cls, ci) => (
                <div key={ci} className="bg-white rounded-2xl border border-brand-gray/10 overflow-hidden">
                  {/* Class Header */}
                  <div className="px-5 py-3 bg-brand-darkblue/5 border-b border-brand-gray/10 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-blue flex-shrink-0" />
                    <span className="font-bold text-sm text-brand-dark">
                      {cls.subClassTitle
                        ? `${cls.classTitle} › ${cls.subClassTitle}`
                        : cls.classTitle}
                    </span>
                    <span className="ml-auto px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-blue/10 text-brand-blue">
                      {cls.studentCount} student
                    </span>
                  </div>

                  {/* Student List */}
                  <div className="divide-y divide-gray-50">
                    {cls.students.map((s, si) => (
                      <div
                        key={si}
                        className="px-5 py-2.5 flex items-center gap-3 hover:bg-brand-cream/30 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-green-50 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(s.studentName?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-brand-dark">{s.studentName}</div>
                          <div className="text-xs text-brand-gray">{s.studentEmail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MentorSummaryClient({
  summaryList,
  totalMentors,
  mentorsWithStudents,
  avgStudents,
  topMentor,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'total' | 'name'>('total')

  const filtered = useMemo(() => {
    let list = [...summaryList]

    // Filter by mode
    if (filterMode === 'active') list = list.filter(m => m.totalStudents > 0)
    if (filterMode === 'inactive') list = list.filter(m => m.totalStudents === 0)

    // Search
    const q = searchQuery.toLowerCase().trim()
    if (q) {
      list = list.filter(
        m =>
          m.mentorName.toLowerCase().includes(q) ||
          m.mentorEmail.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortBy === 'name') {
      list.sort((a, b) => a.mentorName.localeCompare(b.mentorName))
    } else {
      list.sort((a, b) => b.totalStudents - a.totalStudents)
    }

    return list
  }, [summaryList, searchQuery, filterMode, sortBy])

  const totalAllStudents = summaryList.reduce((acc, m) => acc + m.totalStudents, 0)

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Mentor"
          value={totalMentors}
          icon={UserCheck}
          color="bg-brand-blue"
        />
        <StatCard
          label="Mentor Aktif"
          value={mentorsWithStudents}
          sub={`${totalMentors - mentorsWithStudents} belum punya student`}
          icon={TrendingUp}
          color="bg-brand-teal"
        />
        <StatCard
          label="Rata-rata Student"
          value={avgStudents}
          sub="per mentor aktif"
          icon={BarChart2}
          color="bg-brand-pink"
        />
        <StatCard
          label="Mentor Terbanyak"
          value={topMentor ? topMentor.totalStudents : '-'}
          sub={topMentor ? topMentor.mentorName : 'Belum ada data'}
          icon={Award}
          color="bg-amber-500"
        />
      </div>

      {/* ── Table Section ── */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray/50 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama atau email mentor…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-brand-gray/20 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm text-brand-dark bg-white shadow-sm transition-all placeholder:text-brand-gray/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray/50 hover:text-brand-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter tabs */}
            {(['all', 'active', 'inactive'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterMode === mode
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'bg-brand-cream/60 text-brand-dark hover:bg-brand-cream'
                }`}
              >
                {mode === 'all' ? 'Semua' : mode === 'active' ? 'Aktif' : 'Belum ada student'}
              </button>
            ))}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'total' | 'name')}
              className="px-3 py-2 rounded-xl border border-brand-gray/20 text-xs font-bold text-brand-dark bg-white outline-none focus:border-brand-blue cursor-pointer"
            >
              <option value="total">Urutkan: Terbanyak</option>
              <option value="name">Urutkan: Nama A-Z</option>
            </select>
          </div>

          {/* Summary count */}
          <div className="sm:ml-auto flex items-center gap-2 text-xs text-brand-gray bg-brand-cream/60 px-3 py-2 rounded-xl">
            <Layers className="w-3.5 h-3.5" />
            <span>{filtered.length} mentor · {totalAllStudents} total student</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-cream/30 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-brand-gray uppercase tracking-wider w-12">#</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-gray uppercase tracking-wider">Mentor</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-gray uppercase tracking-wider text-center">Total Student</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-gray uppercase tracking-wider text-center">Program</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-gray uppercase tracking-wider">Detail Kelas</th>
                <th className="px-6 py-4 w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((mentor, idx) => (
                <MentorRow key={mentor.mentorId} mentor={mentor} rank={idx + 1} />
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-brand-gray">
                    <div className="flex flex-col items-center gap-3">
                      <UserCheck className="w-10 h-10 text-brand-gray/30" />
                      <p className="font-medium">
                        {searchQuery
                          ? `Tidak ada mentor yang cocok dengan "${searchQuery}".`
                          : 'Belum ada data mentor.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer hint */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-50 text-xs text-brand-gray/60 text-center">
            Klik baris mentor untuk melihat detail student per kelas
          </div>
        )}
      </div>
    </div>
  )
}

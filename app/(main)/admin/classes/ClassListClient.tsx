'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Layers,
  Search,
  BookOpenCheck,
  Trophy,
  Sparkles,
  ChevronDown,
  ChevronRight,
  X,
  GraduationCap,
  Award,
  UserX,
} from "lucide-react"
import Link from "next/link"
import ClassForm from "./ClassForm"
import { formatRupiah } from "@/lib/currency"
import { getCategoryOfClass } from "@/lib/class-programs"

type ClassWithRelations = {
  id: string
  title: string
  description: string | null
  price: number | null
  level: string | null
  class_mentors: any[]
  enrollments: any[]
  class_resources: any[]
}

// Meta visual per program: ikon + warna aksen supaya tiap program mudah dikenali
const CATEGORY_META: Record<string, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  badgeBg: string
  badgeText: string
  accent: string
}> = {
  'PharmaCore Class (Private)': { label: 'PharmaCore Class (Private)', icon: BookOpen, badgeBg: 'bg-brand-blue/10', badgeText: 'text-brand-blue', accent: 'border-brand-blue' },
  'PharmaCore Class (Group)': { label: 'PharmaCore Class (Group)', icon: BookOpen, badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700', accent: 'border-indigo-400' },
  'PharmaCore Class': { label: 'PharmaCore Class', icon: BookOpen, badgeBg: 'bg-brand-blue/10', badgeText: 'text-brand-blue', accent: 'border-brand-blue' },
  'Pharma Research Mentoring': { label: 'Pharma Research Mentoring', icon: Search, badgeBg: 'bg-brand-pink/10', badgeText: 'text-brand-pink', accent: 'border-brand-pink' },
  'PharmaPublish Academy': { label: 'PharmaPublish Academy', icon: BookOpenCheck, badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', accent: 'border-emerald-400' },
  'Pharma Impact': { label: 'Pharma Impact', icon: Trophy, badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', accent: 'border-amber-400' },
  'Pharmacamp': { label: 'Pharmacamp', icon: Sparkles, badgeBg: 'bg-brand-purple/10', badgeText: 'text-brand-purple', accent: 'border-brand-purple' },
  'UKAI Series - Masuk Apoteker': { label: 'UKAI Series - Masuk Apoteker', icon: GraduationCap, badgeBg: 'bg-orange-50', badgeText: 'text-orange-700', accent: 'border-orange-400' },
  'UKAI Series - Kelas UKMPPAI': { label: 'UKAI Series - Kelas UKMPPAI', icon: Award, badgeBg: 'bg-rose-50', badgeText: 'text-rose-700', accent: 'border-rose-400' },
  'Lainnya': { label: 'Program Lainnya', icon: Layers, badgeBg: 'bg-gray-100', badgeText: 'text-gray-700', accent: 'border-gray-300' },
}

// Kelas yang sudah punya siswa tapi belum ada mentor
const needsMentor = (c: ClassWithRelations) =>
  (c.enrollments?.length || 0) > 0 && (c.class_mentors?.length || 0) === 0

function meetingLabel(category: string, level: string | null) {
  if (!level) return null
  return category === 'Pharmacamp' ? `${level} hari` : `${level}x pertemuan`
}

// Ringkasan angka sebagai pill: yang berisi berwarna, yang kosong abu-abu
const STAT_TONE = {
  mentor: 'bg-brand-cream text-brand-dark',
  siswa: 'bg-green-50 text-green-700',
  materi: 'bg-purple-50 text-purple-700',
} as const

function StatPill({
  label,
  value,
  tone,
  warn = false,
}: {
  label: string
  value: number
  tone: keyof typeof STAT_TONE
  warn?: boolean
}) {
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold'
  if (warn) {
    return (
      <span className={`${base} bg-amber-100 text-amber-800`} title="Sudah ada siswa, belum ada mentor">
        <UserX className="w-3 h-3" aria-hidden />
        Belum ada mentor
      </span>
    )
  }
  return (
    <span className={`${base} ${value === 0 ? 'bg-gray-50 text-gray-400' : STAT_TONE[tone]}`}>
      <span className="font-bold">{value}</span> {label}
    </span>
  )
}

/**
 * fixedCategory: jika diisi, komponen menampilkan satu program saja (halaman per program di sidebar):
 * tanpa chip filter, judul memakai nama program, dan kelas tampil sebagai grid kartu.
 */
export default function ClassListClient({
  initialClasses,
  fixedCategory,
}: {
  initialClasses: ClassWithRelations[]
  fixedCategory?: string
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(fixedCategory ?? 'all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [onlyNeedMentor, setOnlyNeedMentor] = useState(false)

  // Restore category filter from sessionStorage on mount (hanya untuk halaman semua kelas)
  useEffect(() => {
    if (fixedCategory) return
    const storedCategory = sessionStorage.getItem('admin-classes-category')
    if (storedCategory) {
      setSelectedCategory(storedCategory)
    }
  }, [fixedCategory])

  const chooseCategory = (value: string) => {
    setSelectedCategory(value)
    sessionStorage.setItem('admin-classes-category', value)
  }

  // Pencarian
  const searchedClasses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return initialClasses
    return initialClasses.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      (item.description ?? '').toLowerCase().includes(q) ||
      (item.level ?? '').toLowerCase().includes(q)
    )
  }, [initialClasses, searchQuery])

  const needMentorCount = useMemo(() => searchedClasses.filter(needsMentor).length, [searchedClasses])

  const filteredClasses = useMemo(
    () => (onlyNeedMentor ? searchedClasses.filter(needsMentor) : searchedClasses),
    [searchedClasses, onlyNeedMentor]
  )

  // Collapsible state per category (default: all open)
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({})

  const toggleCategory = useCallback((cat: string) => {
    setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }))
  }, [])

  // Kelompokkan kelas berdasarkan kategori
  const groupedClasses = useMemo(() => {
    const groups: Record<string, ClassWithRelations[]> = {
      'PharmaCore Class (Private)': [],
      'PharmaCore Class (Group)': [],
      'PharmaCore Class': [],
      'Pharma Research Mentoring': [],
      'PharmaPublish Academy': [],
      'Pharma Impact': [],
      'Pharmacamp': [],
      'UKAI Series - Masuk Apoteker': [],
      'UKAI Series - Kelas UKMPPAI': [],
      'Lainnya': [],
    }

    // Urutkan berdasarkan jumlah pertemuan (level) terkecil - terbesar
    const sortedClasses = [...filteredClasses].sort((a, b) => (Number(a.level) || 0) - (Number(b.level) || 0))

    sortedClasses.forEach((item) => {
      const category = getCategoryOfClass(item.title)
      if (groups[category]) groups[category].push(item)
      else groups['Lainnya'].push(item)
    })

    return groups
  }, [filteredClasses])

  // Program yang memang punya kelas (untuk chip), terlepas dari pencarian
  const existingCategories = useMemo(
    () => Object.keys(groupedClasses).filter(cat => initialClasses.some(k => getCategoryOfClass(k.title) === cat)),
    [groupedClasses, initialClasses]
  )

  const nonEmptyCategories = useMemo(
    () => Object.keys(groupedClasses).filter(cat => groupedClasses[cat].length > 0),
    [groupedClasses]
  )

  const categoriesToRender = fixedCategory
    ? [fixedCategory]
    : selectedCategory === 'all' ? nonEmptyCategories : [selectedCategory]

  const fixedMeta = fixedCategory ? (CATEGORY_META[fixedCategory] || CATEGORY_META['Lainnya']) : null
  const fixedClasses = fixedCategory ? (groupedClasses[fixedCategory] || []) : []
  const fixedDescription = fixedCategory
    ? initialClasses.find(c => getCategoryOfClass(c.title) === fixedCategory && c.description)?.description
    : null
  const allCollapsed = categoriesToRender.length > 0 && categoriesToRender.every(c => collapsedCats[c])

  const toggleAll = () => {
    const next: Record<string, boolean> = { ...collapsedCats }
    categoriesToRender.forEach(c => { next[c] = !allCollapsed })
    setCollapsedCats(next)
  }

  const chipBase =
    'px-3.5 py-2 rounded-full text-xs font-bold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue'
  const chipOff = 'bg-white border-gray-200 text-brand-dark hover:border-brand-blue/40'
  const chipOn = 'bg-brand-darkblue border-brand-darkblue text-white'

  const twoColumns = categoriesToRender.length > 1

  return (
    <div className="space-y-5">

      {/* Header: judul, pencarian, buat kelas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] shadow-card border border-gray-50">
        {fixedMeta ? (
          <div className="flex items-start gap-4 min-w-0">
            <div className={`w-12 h-12 rounded-2xl ${fixedMeta.badgeBg} ${fixedMeta.badgeText} flex items-center justify-center shrink-0`}>
              <fixedMeta.icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-2xl text-brand-dark">{fixedMeta.label}</h1>
              <p className="text-brand-gray text-sm mt-0.5">
                {initialClasses.length} kelas, {initialClasses.reduce((n, c) => n + (c.enrollments?.length || 0), 0)} siswa
              </p>
              {fixedDescription && (
                <p className="text-xs text-brand-gray/80 mt-1.5 max-w-2xl line-clamp-2">{fixedDescription}</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h1 className="font-heading font-bold text-2xl text-brand-dark">Manajemen Kelas</h1>
            <p className="text-brand-gray text-sm mt-0.5">
              {initialClasses.length} kelas di {existingCategories.length} program.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <input
              type="text"
              placeholder="Cari kelas…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white font-medium text-sm text-brand-dark outline-none focus:border-brand-blue transition-all shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-brand-dark transition-colors"
                aria-label="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <ClassForm />
        </div>
      </div>

      {/* Filter program (hanya di halaman semua kelas) */}
      <div className={`flex flex-wrap items-center gap-2 ${fixedCategory ? 'hidden' : ''}`}>
        <button
          type="button"
          onClick={() => chooseCategory('all')}
          aria-pressed={selectedCategory === 'all'}
          className={`${chipBase} ${selectedCategory === 'all' ? chipOn : chipOff}`}
        >
          Semua ({searchedClasses.length})
        </button>
        {existingCategories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => chooseCategory(cat)}
            aria-pressed={selectedCategory === cat}
            className={`${chipBase} ${selectedCategory === cat ? chipOn : chipOff}`}
          >
            {CATEGORY_META[cat]?.label || cat} ({groupedClasses[cat].length})
          </button>
        ))}
      </div>

      {/* Penanda kelas yang butuh tindakan + buka/ciutkan semua */}
      {(needMentorCount > 0 || onlyNeedMentor || categoriesToRender.length > 1) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {needMentorCount > 0 || onlyNeedMentor ? (
            <button
              type="button"
              onClick={() => setOnlyNeedMentor(v => !v)}
              aria-pressed={onlyNeedMentor}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                onlyNeedMentor
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <UserX className="w-3.5 h-3.5" aria-hidden />
              {needMentorCount} kelas sudah ada siswa tapi belum ada mentor
              {onlyNeedMentor && <X className="w-3.5 h-3.5" aria-hidden />}
            </button>
          ) : <span />}

          {categoriesToRender.length > 1 && (
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-bold text-brand-gray hover:text-brand-dark transition-colors"
            >
              {allCollapsed ? 'Buka semua program' : 'Ciutkan semua program'}
            </button>
          )}
        </div>
      )}

      {/* Halaman satu program: grid kartu kelas */}
      {fixedCategory && fixedMeta && fixedClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {fixedClasses.map((item) => {
            const meeting = meetingLabel(fixedCategory, item.level)
            return (
              <Link
                key={item.id}
                href={`/admin/classes/${item.id}`}
                className={`group flex flex-col gap-4 bg-white rounded-3xl p-6 shadow-card border-t-4 ${fixedMeta.accent} hover:shadow-soft transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading font-bold text-lg text-brand-dark leading-snug group-hover:text-brand-darkblue">
                    {item.title}
                  </h2>
                  <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-darkblue" aria-hidden />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {meeting && (
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${fixedMeta.badgeBg} ${fixedMeta.badgeText}`}>
                      {meeting}
                    </span>
                  )}
                  <StatPill label="Mentor" value={item.class_mentors?.length || 0} tone="mentor" warn={needsMentor(item)} />
                  <StatPill label="Siswa" value={item.enrollments?.length || 0} tone="siswa" />
                  <StatPill label="Materi" value={item.class_resources?.length || 0} tone="materi" />
                </div>

                <p className="text-sm font-bold text-brand-dark mt-auto">{formatRupiah(item.price)}</p>
              </Link>
            )
          })}
        </div>
      )}

      {/* Kartu per program: dua kolom di layar lebar */}
      <div className={fixedCategory ? 'hidden' : twoColumns ? 'columns-1 xl:columns-2 gap-5' : ''}>
        {categoriesToRender.map((category) => {
          const classes = groupedClasses[category] || []
          if (classes.length === 0 && selectedCategory === 'all') return null

          const meta = CATEGORY_META[category] || CATEGORY_META['Lainnya']
          const Icon = meta.icon
          const isCollapsed = !!collapsedCats[category]
          const totalStudents = classes.reduce((n, c) => n + (c.enrollments?.length || 0), 0)
          // Deskripsi program umumnya sama antar kelas: tampilkan sekali di header
          const programDescription = classes.find(c => c.description)?.description

          return (
            <section
              key={category}
              className={`break-inside-avoid mb-5 bg-white rounded-3xl shadow-card border-t-4 ${meta.accent} overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                aria-expanded={!isCollapsed}
                className="w-full flex items-start gap-3.5 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors focus-visible:outline-none focus-visible:bg-gray-50"
              >
                <div className={`w-11 h-11 rounded-2xl ${meta.badgeBg} ${meta.badgeText} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading font-bold text-lg text-brand-dark leading-tight">{meta.label}</h2>
                  <p className="text-xs text-brand-gray mt-1">
                    {classes.length} kelas, {totalStudents} siswa
                  </p>
                  {programDescription && (
                    <p className="text-xs text-brand-gray/80 mt-1.5 line-clamp-2">{programDescription}</p>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
              </button>

              {!isCollapsed && (
                classes.length === 0 ? (
                  <p className="px-5 pb-5 text-sm text-brand-gray">Belum ada kelas di program ini. Klik &quot;Buat Kelas&quot; untuk menambahkan.</p>
                ) : (
                  <ul className="border-t border-gray-100 divide-y divide-gray-100">
                    {classes.map((item) => {
                      const mentors = item.class_mentors?.length || 0
                      const students = item.enrollments?.length || 0
                      const resources = item.class_resources?.length || 0
                      const meeting = meetingLabel(category, item.level)

                      return (
                        <li key={item.id}>
                          <Link
                            href={`/admin/classes/${item.id}`}
                            className="group block px-5 py-3.5 hover:bg-brand-cream/40 transition-colors focus-visible:outline-none focus-visible:bg-brand-cream/60"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-semibold text-[15px] leading-snug text-brand-dark group-hover:text-brand-darkblue">
                                {item.title}
                              </p>
                              <span className="text-sm font-bold text-brand-dark whitespace-nowrap">
                                {formatRupiah(item.price)}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {meeting && (
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${meta.badgeBg} ${meta.badgeText}`}>
                                  {meeting}
                                </span>
                              )}
                              <StatPill label="Mentor" value={mentors} tone="mentor" warn={needsMentor(item)} />
                              <StatPill label="Siswa" value={students} tone="siswa" />
                              <StatPill label="Materi" value={resources} tone="materi" />
                              <ChevronRight className="ml-auto w-4 h-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-darkblue" aria-hidden />
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )
              )}
            </section>
          )
        })}
      </div>

      {initialClasses.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-brand-dark font-semibold">Belum ada kelas.</p>
          <p className="text-brand-gray text-sm mt-1">Klik &quot;Buat Kelas&quot; untuk membuat kelas pertama.</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-brand-dark font-semibold">
            {onlyNeedMentor ? 'Semua kelas yang ada siswanya sudah punya mentor.' : `Tidak ada kelas yang cocok dengan "${searchQuery}".`}
          </p>
          <p className="text-brand-gray text-sm mt-1">
            {onlyNeedMentor ? 'Matikan filter untuk melihat semua kelas.' : 'Coba kata kunci lain atau hapus pencarian.'}
          </p>
        </div>
      ) : null}
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  BookOpen, 
  Settings, 
  Filter,
  Layers,
  Search,
  BookOpenCheck,
  Trophy,
  Sparkles,
  ChevronDown,
  X
} from "lucide-react"
import Link from "next/link"
import ClassForm, { PROGRAMS } from "./ClassForm"

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

// Helper untuk menentukan kategori berdasarkan title
function getCategoryOfClass(title: string): string {
  const programs = PROGRAMS.map(p => p.value).sort((a, b) => b.length - a.length)
  for (const p of programs) {
    if (title.startsWith(p)) {
      if (p === 'PharmaCore Class') {
        if (title.toLowerCase().includes('private')) {
          return 'PharmaCore Class (Private)'
        }
        if (title.toLowerCase().includes('group') || title.toLowerCase().includes('grup')) {
          return 'PharmaCore Class (Group)'
        }
      }
      return p
    }
  }
  return 'Lainnya'
}

// Meta visual untuk masing-masing kategori
const CATEGORY_META: Record<string, { 
  label: string; 
  icon: React.ComponentType<{ className?: string }>; 
  borderColor: string; 
  badgeBg: string;
  badgeText: string;
  textColor: string;
}> = {
  'PharmaCore Class (Private)': {
    label: 'PharmaCore Class (Private)',
    icon: BookOpen,
    borderColor: 'hover:border-brand-blue/30',
    badgeBg: 'bg-brand-blue/10',
    badgeText: 'text-brand-blue',
    textColor: 'text-brand-blue'
  },
  'PharmaCore Class (Group)': {
    label: 'PharmaCore Class (Group)',
    icon: BookOpen,
    borderColor: 'hover:border-indigo-500/30',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    textColor: 'text-indigo-700'
  },
  'PharmaCore Class': {
    label: 'PharmaCore Class',
    icon: BookOpen,
    borderColor: 'hover:border-brand-blue/30',
    badgeBg: 'bg-brand-blue/10',
    badgeText: 'text-brand-blue',
    textColor: 'text-brand-blue'
  },
  'Pharma Research Mentoring': {
    label: 'Pharma Research Mentoring',
    icon: Search,
    borderColor: 'hover:border-brand-pink/30',
    badgeBg: 'bg-brand-pink/10',
    badgeText: 'text-brand-pink',
    textColor: 'text-brand-pink'
  },
  'PharmaPublish Academy': {
    label: 'PharmaPublish Academy',
    icon: BookOpenCheck,
    borderColor: 'hover:border-emerald-500/30',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    textColor: 'text-emerald-700'
  },
  'Pharma Impact': {
    label: 'Pharma Impact',
    icon: Trophy,
    borderColor: 'hover:border-amber-500/30',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    textColor: 'text-amber-700'
  },
  'Pharmacamp': {
    label: 'Pharmacamp',
    icon: Sparkles,
    borderColor: 'hover:border-brand-purple/30',
    badgeBg: 'bg-brand-purple/10',
    badgeText: 'text-brand-purple',
    textColor: 'text-brand-purple'
  },
  'Lainnya': {
    label: 'Program Lainnya',
    icon: Layers,
    borderColor: 'hover:border-gray-300',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    textColor: 'text-brand-dark'
  }
}

export default function ClassListClient({ initialClasses }: { initialClasses: ClassWithRelations[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Restore category filter from sessionStorage on mount
  useEffect(() => {
    const storedCategory = sessionStorage.getItem('admin-classes-category')
    if (storedCategory) {
      setSelectedCategory(storedCategory)
    }
  }, [])

  // Filter kelas berdasarkan kata kunci pencarian
  const filteredClasses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return initialClasses

    return initialClasses.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q) ||
        (item.level ?? '').toLowerCase().includes(q)
      )
    })
  }, [initialClasses, searchQuery])

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
      'Lainnya': []
    }

    // Urutkan kelas berdasarkan jumlah pertemuan (level) terkecil - terbesar
    const sortedClasses = [...filteredClasses].sort((a, b) => {
      const levelA = Number(a.level) || 0
      const levelB = Number(b.level) || 0
      return levelA - levelB
    })

    sortedClasses.forEach((item) => {
      const category = getCategoryOfClass(item.title)
      if (groups[category]) {
        groups[category].push(item)
      } else {
        groups['Lainnya'].push(item)
      }
    })

    return groups
  }, [filteredClasses])

  // Menentukan kategori mana saja yang perlu dirender berdasarkan filter
  const categoriesToRender = useMemo(() => {
    if (selectedCategory === 'all') {
      // Hanya tampilkan kategori yang memiliki minimal 1 kelas agar rapi
      return Object.keys(groupedClasses).filter(cat => groupedClasses[cat].length > 0)
    }
    return [selectedCategory]
  }, [selectedCategory, groupedClasses])

  const totalClassesCount = initialClasses.length

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Kategori */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] shadow-card border border-gray-50">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">Manajemen Kelas</h1>
          <p className="text-brand-gray text-sm mt-0.5">Buat materi, tugaskan mentor, dan kelola student.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <input
              type="text"
              placeholder="Cari kelas…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white font-medium text-sm text-brand-dark outline-none focus:border-brand-blue transition-all shadow-sm"
            />
            {/* Search Icon left */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            {/* Clear Button right */}
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

          {/* Dropdown Filter Kategori */}
          <div className="relative min-w-[220px]">
            <select
              value={selectedCategory}
              onChange={(e) => {
                const value = e.target.value
                setSelectedCategory(value)
                sessionStorage.setItem('admin-classes-category', value)
              }}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white font-bold text-sm text-brand-dark outline-none focus:border-brand-blue appearance-none transition-all shadow-sm cursor-pointer"
            >
              <option value="all">Semua Kategori ({totalClassesCount})</option>
              {Object.keys(groupedClasses).map((cat) => {
                const count = groupedClasses[cat].length
                const label = CATEGORY_META[cat]?.label || cat
                return (
                  <option key={cat} value={cat}>
                    {label} ({count})
                  </option>
                )
              })}
            </select>
            
            {/* Filter Icon left */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-brand-blue">
              <Filter className="w-4 h-4" />
            </div>

            {/* Chevron down right */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Tombol Buat Kelas */}
          <ClassForm />
        </div>
      </div>

      {/* Section List */}
      <div className="space-y-10">
        {categoriesToRender.map((category) => {
          const classes = groupedClasses[category] || []
          const meta = CATEGORY_META[category] || CATEGORY_META['Lainnya']
          const Icon = meta.icon

          // Jika menampilkan semua kategori, sembunyikan section yang kosong
          if (selectedCategory === 'all' && classes.length === 0) return null

          return (
            <div key={category} className="space-y-4">
              
              {/* Section Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <div className={`w-8 h-8 rounded-lg ${meta.badgeBg} ${meta.badgeText} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="font-heading font-bold text-lg text-brand-dark">
                  {meta.label}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${meta.badgeBg} ${meta.badgeText}`}>
                  {classes.length} Kelas
                </span>
              </div>

              {/* Grid Kelas */}
              {classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((item) => (
                    <div 
                      key={item.id} 
                      className={`bg-white rounded-3xl p-6 shadow-card hover:shadow-soft transition-all group flex flex-col h-full border border-transparent ${meta.borderColor} hover:border-brand-blue/20`}
                    >
                      {/* Header Card */}
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 ${meta.badgeBg} ${meta.badgeText} rounded-2xl flex items-center justify-center transition-colors group-hover:bg-brand-blue group-hover:text-white`}>
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-xs font-bold text-gray-500 rounded-full uppercase tracking-wider">
                          {item.level
                            ? (category === 'Pharmacamp' ? `${item.level} Hari` : `${item.level}x Pertemuan`)
                            : '-'
                          }
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 mb-4">
                        <h3 className="font-heading font-bold text-xl text-brand-dark mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {/* Badge Mentor */}
                          <div className="flex items-center gap-2 text-xs text-brand-gray bg-brand-cream px-2 py-1 rounded-md">
                            <span className="font-bold text-brand-dark">{item.class_mentors?.length || 0}</span>
                            <span>Mentor</span>
                          </div>
                          {/* Badge Student */}
                          <div className="flex items-center gap-2 text-xs text-brand-gray bg-green-50 px-2 py-1 rounded-md">
                            <span className="font-bold text-green-700">{item.enrollments?.length || 0}</span>
                            <span>Student</span>
                          </div>
                          {/* Badge Resources */}
                          <div className="flex items-center gap-2 text-xs text-brand-gray bg-purple-50 px-2 py-1 rounded-md">
                            <span className="font-bold text-purple-700">{item.class_resources?.length || 0}</span>
                            <span>Materi</span>
                          </div>
                        </div>

                        <p className="text-brand-gray text-sm line-clamp-3">
                          {item.description || "Tidak ada deskripsi."}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto gap-4">
                        <div className="text-sm font-bold text-brand-dark">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price || 0)}
                        </div>
                        
                        <Link 
                          href={`/admin/classes/${item.id}`}
                          className="px-4 py-2 bg-brand-darkblue text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition-all flex items-center gap-1.5 shadow-md shadow-brand-darkblue/10"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Kelola Kelas
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-brand-gray">Belum ada kelas untuk kategori ini.</p>
                </div>
              )}
            </div>
          )
        })}

        {initialClasses.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-brand-gray">Belum ada kelas yang dibuat.</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200 bg-gray-50/30">
            <p className="text-brand-gray font-medium">Tidak ada kelas yang cocok dengan pencarian &quot;{searchQuery}&quot;.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CLASS_PROGRAM_LINKS, programHref } from '@/lib/class-programs'
import {
  ChevronDown,
  LayoutDashboard,
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  CreditCard, 
  Settings,
  BarChart3,
  BarChart2,
  X,
  FileQuestion,
  ClipboardCheck,
  Banknote,
} from 'lucide-react'
import SignOutButton from '../SignOutButton'
import { useAdmin } from './AdminProvider'

type SubMenuItem = {
  label: string
  href: string
  /** Aktif hanya jika path sama persis */
  exact?: boolean
}

type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: SubMenuItem[]
}

type MenuGroup = {
  category: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    category: 'Utama',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    category: 'Akademik & CBT',
    items: [
      {
        label: 'Manajemen Kelas',
        href: '/admin/classes',
        icon: BookOpen,
        children: [
          { label: 'Semua kelas', href: '/admin/classes', exact: true },
          ...CLASS_PROGRAM_LINKS.map(p => ({ label: p.short, href: programHref(p.slug) })),
        ],
      },
      { label: 'Bank Soal', href: '/admin/question-bank', icon: FileQuestion },
      { label: 'Kelola Tryout', href: '/admin/tryouts', icon: ClipboardCheck },
    ]
  },
  {
    category: 'Operasional & Rekap',
    items: [
      { label: 'Manajemen User', href: '/admin/users', icon: Users },
      { label: 'Rekap Absensi', href: '/admin/attendances', icon: FileSpreadsheet },
      { label: 'Rekap Mentor', href: '/admin/mentor-summary', icon: BarChart2 },
      { label: 'Keuangan / Order', href: '/admin/orders', icon: CreditCard },
      { label: 'Honor Mentor', href: '/admin/disbursements', icon: Banknote },
    ]
  },
  {
    category: 'Sistem',
    items: [
      { label: 'Web Performance', href: '/admin/web-performance', icon: BarChart3 },
      { label: 'Pengaturan Sistem', href: '/admin/settings', icon: Settings },
    ]
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, setSidebarOpen } = useAdmin()

  // Sub-menu kelas: terbuka otomatis saat berada di area /admin/classes, bisa dilipat manual
  const inClasses = pathname.startsWith('/admin/classes')
  const [classesOpen, setClassesOpen] = useState(inClasses)
  useEffect(() => {
    if (inClasses) setClassesOpen(true)
  }, [inClasses])

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`w-64 bg-brand-darkblue text-white h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/10 shrink-0">
          <h1 className="font-heading font-bold text-xl tracking-wide text-brand-yellow">
            TEMAN FARMASI
            <span className="block text-xs text-white/50 font-sans font-normal">Admin Panel</span>
          </h1>
          {/* Close Button on Mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.category} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold text-white/35 uppercase tracking-[0.2em] mb-2">
                {group.category}
              </p>
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon

                if (item.children) {
                  return (
                    <div key={item.href}>
                      <div className="relative">
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 pl-3.5 pr-10 py-2.5 rounded-xl transition-all duration-200 group text-xs font-semibold ${
                            isActive
                              ? 'bg-brand-blue text-white shadow-md font-bold'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setClassesOpen(v => !v)}
                          aria-expanded={classesOpen}
                          aria-label={classesOpen ? `Lipat ${item.label}` : `Buka ${item.label}`}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${classesOpen ? '' : '-rotate-90'}`} />
                        </button>
                      </div>

                      {classesOpen && (
                        <ul className="mt-1 ml-[22px] pl-3 border-l border-white/10 space-y-0.5">
                          {item.children.map((child) => {
                            const childActive = child.exact ? pathname === child.href : pathname.startsWith(child.href)
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={`block px-3 py-2 rounded-lg text-[11px] transition-colors truncate ${
                                    childActive
                                      ? 'bg-white/15 text-white font-bold'
                                      : 'text-white/60 font-medium hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-xs font-semibold ${
                      isActive 
                        ? 'bg-brand-blue text-white shadow-md font-bold' 
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}

          {/* Footer / Logout */}
          <div className="pt-4 border-t border-white/10 mt-4">
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
               <div className="w-full">
                 <SignOutButton />
               </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}
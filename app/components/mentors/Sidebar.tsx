'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  ClipboardCheck, 
  FileQuestion,
  Laptop,
} from 'lucide-react'
import SignOutButton from '../../components/SignOutButton'

type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type MenuGroup = {
  category: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    category: 'Utama',
    items: [
      { label: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    category: 'Pembelajaran & CBT',
    items: [
      { label: 'Kelas Saya', href: '/mentor/classes', icon: BookOpen },
      { label: 'Bank Soal', href: '/mentor/question-bank', icon: FileQuestion },
      { label: 'Kelola Tryout', href: '/mentor/tryouts', icon: Laptop },
    ]
  },
  {
    category: 'Jadwal & Presensi',
    items: [
      { label: 'Jadwal Mengajar', href: '/mentor/schedule', icon: CalendarDays },
      { label: 'Input Absensi', href: '/mentor/attendance', icon: ClipboardCheck },
    ]
  }
]

export default function MentorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-brand-darkblue text-white h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-white/10 shrink-0">
        <h1 className="font-heading font-bold text-xl tracking-wide text-brand-yellow">
          TEMAN FARMASI
          <span className="block text-xs text-white/50 font-sans font-normal">Mentor Panel</span>
        </h1>
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
          <div className="bg-white/5 rounded-xl p-4 w-full">
             <SignOutButton />
          </div>
        </div>
      </nav>
    </aside>
  )
}
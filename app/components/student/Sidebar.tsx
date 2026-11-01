'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarCheck, 
  History,
  FileCheck,
} from 'lucide-react'
import SignOutButton from '../SignOutButton'

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
      { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    category: 'Akademik & CBT',
    items: [
      { label: 'Kelas & Materi', href: '/student/classes', icon: BookOpen },
      { label: 'Tryout CBT', href: '/student/tryouts', icon: FileCheck },
    ]
  },
  {
    category: 'Aktivitas & Keuangan',
    items: [
      { label: 'Jadwal & Absensi', href: '/student/schedule', icon: CalendarCheck },
      { label: 'Riwayat Pembayaran', href: '/student/orders', icon: History },
    ]
  }
]

export default function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-brand-yellow/30 h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="h-24 flex items-center px-8 shrink-0">
        <Link href="/student/dashboard" className="flex items-center gap-5 group">
            <img src="/images/logos/logo_5.png" alt="Teman Farmasi" className="w-32 h-auto object-contain group-hover:scale-105 transition-transform" />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-5">
        {menuGroups.map((group) => (
          <div key={group.category} className="space-y-1">
            <p className="px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-2">
              {group.category}
            </p>
            {group.items.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-brand-yellow text-brand-dark font-extrabold shadow-sm border border-brand-yellow' 
                      : 'text-gray-500 hover:bg-brand-cream hover:text-brand-dark'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white text-brand-pink shadow-xs' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-brand-pink'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}

        {/* Footer / Logout */}
        <div className="pt-4 border-t border-gray-50 mt-4">
          <div className="bg-gray-50 rounded-2xl p-2 w-full">
             <SignOutButton />
          </div>
        </div>
      </nav>
    </aside>
  )
}
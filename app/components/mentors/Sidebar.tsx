'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  ClipboardCheck, 
} from 'lucide-react'
import SignOutButton from '../../components/SignOutButton'

const menuItems = [
  { label: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
  { label: 'Kelas Saya', href: '/mentor/classes', icon: BookOpen }, // Lihat kelas & Buat Batch
  { label: 'Jadwal Mengajar', href: '/mentor/schedule', icon: CalendarDays }, // Kalender
  { label: 'Input Absensi', href: '/mentor/attendance', icon: ClipboardCheck }, // Buka link absen
]

export default function MentorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-brand-darkblue text-white h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-white/10">
        <h1 className="font-heading font-bold text-xl tracking-wide text-brand-yellow">
          TEMAN FARMASI
          <span className="block text-xs text-white/50 font-sans font-normal">Mentor Panel</span>
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
          Menu Pengajar
        </p>
        
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-brand-blue text-white shadow-lg font-medium' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}

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
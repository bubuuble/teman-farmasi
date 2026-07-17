'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarCheck, 
  History
} from 'lucide-react'
import SignOutButton from '../SignOutButton'

const menuItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Kelas & Materi', href: '/student/classes', icon: BookOpen },
  { label: 'Jadwal & Absensi', href: '/student/schedule', icon: CalendarCheck },
  { label: 'Riwayat Pembayaran', href: '/student/orders', icon: History },
]

export default function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-brand-yellow/30 h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="h-24 flex items-center px-8">
        <Link href="/student/dashboard" className="flex items-center gap-5 group">
            <img src="/images/logos/logo_5.png" alt="Teman Farmasi" className="w-32 h-auto object-contain group-hover:scale-105 transition-transform" />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
          Main Menu
        </p>
        
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-brand-yellow text-brand-dark font-bold shadow-sm border border-brand-yellow' 
                  : 'text-gray-500 hover:bg-brand-cream hover:text-brand-dark'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                isActive ? 'bg-white text-brand-pink' : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-brand-pink'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}

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
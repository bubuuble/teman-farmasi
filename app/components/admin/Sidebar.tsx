'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  CreditCard, 
  Settings,
  BarChart3,
  X,
} from 'lucide-react'
import SignOutButton from '../SignOutButton'
import { useAdmin } from './AdminProvider'

const menuItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Manajemen Kelas', href: '/admin/classes', icon: BookOpen },
  { label: 'Manajemen User', href: '/admin/users', icon: Users },
  { label: 'Rekap Absensi', href: '/admin/attendances', icon: FileSpreadsheet },
  { label: 'Keuangan / Order', href: '/admin/orders', icon: CreditCard },
  { label: 'Web Performance', href: '/admin/web-performance', icon: BarChart3 },
  { label: 'Pengaturan Sistem', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, setSidebarOpen } = useAdmin()

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
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/10">
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
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <p className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Menu Utama
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
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
             <div className="w-full">
               <SignOutButton />
             </div>
          </div>
        </div>
      </aside>
    </>
  )
}
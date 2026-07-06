'use client'

import { Menu } from 'lucide-react'
import { useAdmin } from './AdminProvider'

export default function SidebarToggle() {
  const { setSidebarOpen } = useAdmin()

  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden p-2 -ml-2 text-brand-dark hover:bg-brand-cream/55 rounded-xl transition-all"
      aria-label="Open sidebar"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}

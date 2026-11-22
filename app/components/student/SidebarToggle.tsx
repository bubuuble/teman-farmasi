'use client'

import { Menu } from 'lucide-react'
import { useStudentNav } from './StudentNavProvider'

export default function StudentSidebarToggle() {
  const { setSidebarOpen } = useStudentNav()

  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden p-2 -ml-2 text-brand-dark hover:bg-white/60 rounded-xl transition-all shrink-0"
      aria-label="Buka menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type StudentNavContextType = {
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const StudentNavContext = createContext<StudentNavContextType | undefined>(undefined)

export function StudentNavProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Tutup menu otomatis saat pindah halaman (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <StudentNavContext.Provider value={{ isSidebarOpen, setSidebarOpen }}>
      {children}
    </StudentNavContext.Provider>
  )
}

export function useStudentNav() {
  const context = useContext(StudentNavContext)
  if (context === undefined) {
    throw new Error('useStudentNav must be used within a StudentNavProvider')
  }
  return context
}

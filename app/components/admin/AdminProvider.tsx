'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type AdminContextType = {
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar automatically when navigating to a new page on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <AdminContext.Provider value={{ isSidebarOpen, setSidebarOpen }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

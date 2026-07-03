// app/(main)/admin/attendances/layout.tsx
'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Tab navigasi di dalam halaman
  const tabs = [
    { label: "Absensi Student", href: "/admin/attendances/student" },
    { label: "Absensi Mentor", href: "/admin/attendances/mentor" },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">Laporan Kehadiran</h1>
          <p className="text-brand-gray text-sm">Monitoring aktivitas harian student dan mentor.</p>
        </div>

        {/* TOMBOL TAB DI DALAM PAGE */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit shadow-inner">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-white text-brand-dark shadow-sm" 
                    : "text-gray-500 hover:text-brand-dark"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* ISI HALAMAN (Siswa atau Mentor) */}
      <div className="animate-in fade-in duration-500">
        {children}
      </div>
    </div>
  )
}
'use client'

import { Download } from 'lucide-react'

// Tipe data disamakan dengan page parent
type Session = { id: string; title: string; date_time: string }
type Student = { id: string; full_name: string; email: string }

export default function ExportAttendanceBtn({ 
  sessions, 
  students, 
  attendanceMap,
  className = ""
}: { 
  sessions: Session[]
  students: Student[]
  attendanceMap: Record<string, string>
  className?: string // Nama Kelas + Batch untuk nama file
}) {

  const handleExport = () => {
    if (sessions.length === 0 || students.length === 0) return alert("Data kosong")

    // 1. Header Dinamis: Nama, Email, ...[Judul Sesi]..., Persentase
    const headers = [
      "Nama Student", 
      "Email", 
      ...sessions.map((s, i) => `"Sesi ${i+1}: ${s.title}"`), 
      "Total Hadir",
      "Persentase"
    ]

    // 2. Rows Data
    const rows = students.map(student => {
      let presentCount = 0
      
      // Map status per sesi
      const sessionStatuses = sessions.map(session => {
        const status = attendanceMap[`${session.id}_${student.id}`]
        
        // Hitung kehadiran untuk total
        if (status === 'present' || status === 'late') presentCount++
        
        // Translate status ke bahasa manusia
        if (status === 'present') return "Hadir"
        if (status === 'late') return "Telat"
        if (status === 'permission') return "Ijin"
        if (status === 'absent') return "Alpha"
        return "-"
      })

      const percentage = Math.round((presentCount / sessions.length) * 100) + "%"

      return [
        `"${student.full_name}"`,
        student.email,
        ...sessionStatuses,
        presentCount,
        percentage
      ]
    })

    // 3. Gabungkan
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n")

    // 4. Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    // Nama file: Rekap_Absensi_NamaKelas.csv
    const safeName = className.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    link.setAttribute("download", `rekap_absensi_${safeName}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button 
      onClick={handleExport}
      className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-sm text-sm"
    >
      <Download className="w-4 h-4" />
      Download CSV
    </button>
  )
}
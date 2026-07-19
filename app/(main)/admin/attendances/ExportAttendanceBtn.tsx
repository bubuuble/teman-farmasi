'use client'

import { Download } from 'lucide-react'

// Tipe data disamakan dengan page parent
type Session = { id: string; title: string; date_time: string; assigned_student_ids?: string[] }
type Student = { id: string; full_name: string; email: string }

export default function ExportAttendanceBtn({ 
  sessions, 
  students, 
  attendanceMap,
  isPrivate,
  maxSessions,
  className = ""
}: { 
  sessions: Session[]
  students: Student[]
  attendanceMap: Record<string, string>
  isPrivate: boolean
  maxSessions: number
  className?: string // Nama Kelas + Batch untuk nama file
}) {

  const handleExport = () => {
    if (sessions.length === 0 || students.length === 0) return alert("Data kosong")

    // Hitung jumlah kolom dinamis untuk private class
    const colsCount = isPrivate 
      ? Math.max(
          maxSessions || 0,
          ...students.map(student => sessions.filter(s => s.assigned_student_ids?.includes(student.id)).length),
          1
        )
      : sessions.length;

    // 1. Header Dinamis
    const headers = [
      "Nama Student", 
      "Email", 
      ...(isPrivate 
        ? Array.from({ length: colsCount }).map((_, i) => `"Pertemuan ${i+1}"`)
        : sessions.map((s, i) => `"Sesi ${i+1}: ${s.title}"`)
      ), 
      "Total Hadir",
      "Persentase"
    ]

    // 2. Rows Data
    const rows = students.map(student => {
      let presentCount = 0
      
      const sessionStatuses = isPrivate 
        ? Array.from({ length: colsCount }).map((_, idx) => {
            const studentSessions = sessions
              .filter(s => s.assigned_student_ids?.includes(student.id))
              .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
            const session = studentSessions[idx]
            if (!session) return "-"

            const status = attendanceMap[`${session.id}_${student.id}`]
            if (status === 'present' || status === 'late') presentCount++

            if (status === 'present') return "Hadir"
            if (status === 'late') return "Telat"
            if (status === 'permission') return "Ijin"
            if (status === 'absent') return "Alpha"
            return "-"
          })
        : sessions.map(session => {
            const status = attendanceMap[`${session.id}_${student.id}`]
            
            if (status === 'present' || status === 'late') presentCount++
            
            if (status === 'present') return "Hadir"
            if (status === 'late') return "Telat"
            if (status === 'permission') return "Ijin"
            if (status === 'absent') return "Alpha"
            return "-"
          })

      const totalCols = isPrivate 
        ? sessions.filter(s => s.assigned_student_ids?.includes(student.id)).length
        : sessions.length

      const percentage = totalCols > 0 
        ? Math.round((presentCount / totalCols) * 100) + "%"
        : "0%"

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
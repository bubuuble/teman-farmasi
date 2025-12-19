'use client'

import { Download } from 'lucide-react'

type OrderData = {
  id: string
  created_at: string
  amount: number
  status: string
  profiles: { full_name: string | null; email: string } | null
  classes: { title: string } | null
}

export default function ExportButton({ orders }: { orders: OrderData[] }) {
  
  const handleExport = () => {
    if (!orders || orders.length === 0) return alert("Tidak ada data untuk diexport")

    // 1. Buat Header CSV
    const headers = ["Order ID", "Tanggal", "Nama Siswa", "Email", "Kelas", "Nominal", "Status"]
    
    // 2. Map Data ke Baris CSV
    const rows = orders.map(order => [
      order.id,
      new Date(order.created_at).toLocaleDateString('id-ID'), // Format Tanggal
      `"${order.profiles?.full_name || '-'}"`, // Pakai tanda kutip biar aman ada koma di nama
      order.profiles?.email || '-',
      `"${order.classes?.title || '-'}"`,
      order.amount,
      order.status
    ])

    // 3. Gabungkan Header dan Rows
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n")

    // 4. Trigger Download di Browser
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `rekap_order_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button 
      onClick={handleExport}
      className="bg-green-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg"
    >
      <Download className="w-5 h-5" />
      Export CSV
    </button>
  )
}
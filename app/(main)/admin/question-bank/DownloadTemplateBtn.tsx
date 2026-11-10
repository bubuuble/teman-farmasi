'use client'

import { Download } from 'lucide-react'

export default function DownloadTemplateBtn() {
  const handleDownload = async () => {
    const XLSX = await import('xlsx')

    const headers = [
      'No', 'Pertanyaan', 'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Opsi E',
      'Kunci Jawaban', 'Pembahasan', 'URL Gambar'
    ]

    // Sample rows
    const sampleData = [
      {
        'No': 1,
        'Pertanyaan': 'Seorang pasien dewasa mendapatkan resep amoksisilin 500 mg 3x1. Berapa total kapsul untuk 5 hari?',
        'Opsi A': '15 kapsul',
        'Opsi B': '10 kapsul',
        'Opsi C': '20 kapsul',
        'Opsi D': '12 kapsul',
        'Opsi E': '18 kapsul',
        'Kunci Jawaban': 'A',
        'Pembahasan': '3 kali sehari x 5 hari = 15 kapsul amoksisilin 500 mg.',
        'URL Gambar': ''
      },
      {
        'No': 2,
        'Pertanyaan': 'Obat berikut yang termasuk golongan ACE Inhibitor adalah...',
        'Opsi A': 'Amlodipine',
        'Opsi B': 'Captopril',
        'Opsi C': 'Valsartan',
        'Opsi D': 'Bisoprolol',
        'Opsi E': 'Furosemide',
        'Kunci Jawaban': 'B',
        'Pembahasan': 'Captopril adalah ACE Inhibitor. Amlodipine = CCB, Valsartan = ARB, Bisoprolol = Beta-blocker, Furosemide = Loop diuretik.',
        'URL Gambar': 'https://example.com/gambar.png'
      }
    ]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers })

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 60 },  // Pertanyaan
      { wch: 30 },  // Opsi A
      { wch: 30 },  // Opsi B
      { wch: 30 },  // Opsi C
      { wch: 30 },  // Opsi D
      { wch: 30 },  // Opsi E
      { wch: 15 },  // Kunci Jawaban
      { wch: 60 },  // Pembahasan
      { wch: 40 },  // URL Gambar
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Template Soal')
    XLSX.writeFile(wb, 'template-bank-soal-teman-farmasi.xlsx')
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-brand-dark rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm active:scale-95"
    >
      <Download className="w-4 h-4 text-brand-dark" /> Download Template
    </button>
  )
}


'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileSpreadsheet, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { bulkCreateQuestionsFromExcel } from './actions'

type ParsedRow = {
  no: number
  pertanyaan: string
  opsiA: string
  opsiB: string
  opsiC: string
  opsiD: string
  opsiE: string
  kunciJawaban: string
  pembahasan: string
  urlGambar: string
}

export default function ExcelUploadModal({ categoryId }: { categoryId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success?: string; error?: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    setIsOpen(false)
    setParsedRows([])
    setParseError(null)
    setFileName(null)
    setUploadResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParseError(null)
    setParsedRows([])
    setUploadResult(null)

    try {
      const XLSX = await import('xlsx')
      const data = await file.arrayBuffer()
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

      const parsed: ParsedRow[] = []
      const errors: string[] = []

      rows.forEach((row, idx) => {
        const rowNum = idx + 2 // header is row 1
        const pertanyaan = String(row['Pertanyaan'] || row['pertanyaan'] || '').trim()
        const opsiA = String(row['Opsi A'] || row['opsi_a'] || '').trim()
        const opsiB = String(row['Opsi B'] || row['opsi_b'] || '').trim()
        const opsiC = String(row['Opsi C'] || row['opsi_c'] || '').trim()
        const opsiD = String(row['Opsi D'] || row['opsi_d'] || '').trim()
        const opsiE = String(row['Opsi E'] || row['opsi_e'] || '').trim()
        const kunci = String(row['Kunci Jawaban'] || row['kunci_jawaban'] || '').trim().toUpperCase()
        const pembahasan = String(row['Pembahasan'] || row['pembahasan'] || '').trim()
        const urlGambar = String(row['URL Gambar'] || row['url_gambar'] || '').trim()

        if (!pertanyaan) {
          errors.push(`Baris ${rowNum}: Kolom Pertanyaan kosong`)
          return
        }
        if (!opsiA || !opsiB || !opsiC || !opsiD) {
          errors.push(`Baris ${rowNum}: Minimal Opsi A–D wajib diisi`)
          return
        }
        if (!['A', 'B', 'C', 'D', 'E'].includes(kunci)) {
          errors.push(`Baris ${rowNum}: Kunci Jawaban harus A/B/C/D/E (ditemukan: "${kunci}")`)
          return
        }

        parsed.push({
          no: idx + 1,
          pertanyaan,
          opsiA,
          opsiB,
          opsiC,
          opsiD,
          opsiE,
          kunciJawaban: kunci,
          pembahasan,
          urlGambar
        })
      })

      if (errors.length > 0) {
        setParseError(`Ditemukan ${errors.length} error:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...dan ${errors.length - 5} error lainnya` : ''}`)
      }

      setParsedRows(parsed)
    } catch (err: any) {
      setParseError('Gagal membaca file Excel. Pastikan format file valid (.xlsx/.xls).')
    }
  }

  const handleUpload = async () => {
    if (parsedRows.length === 0) return
    setIsUploading(true)
    setUploadResult(null)

    try {
      const result = await bulkCreateQuestionsFromExcel(categoryId, parsedRows)
      setUploadResult(result)
      if (result.success) {
        setParsedRows([])
        setFileName(null)
        if (fileRef.current) fileRef.current.value = ''
      }
    } catch (err: any) {
      setUploadResult({ error: err.message || 'Gagal mengupload soal' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm active:scale-95"
      >
        <Upload className="w-4 h-4" /> Upload Excel
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Upload Soal dari Excel
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload file Excel sesuai template untuk menambahkan soal secara massal
                </p>
              </div>
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {/* SUCCESS */}
              {uploadResult?.success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-bold text-emerald-800">{uploadResult.success}</p>
                </div>
              )}

              {/* ERROR */}
              {uploadResult?.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-sm font-bold text-red-700">{uploadResult.error}</p>
                </div>
              )}

              {/* FILE INPUT */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition"
              >
                <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-600">
                  {fileName ? fileName : 'Klik untuk pilih file Excel'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Format: .xlsx atau .xls</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              {/* PARSE ERROR */}
              {parseError && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <pre className="text-xs text-amber-800 whitespace-pre-wrap font-mono">{parseError}</pre>
                  </div>
                </div>
              )}

              {/* PREVIEW */}
              {parsedRows.length > 0 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <p className="text-sm font-bold text-emerald-800 mb-3">
                    ✓ {parsedRows.length} soal siap diupload
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {parsedRows.slice(0, 5).map(row => (
                      <div key={row.no} className="text-xs text-emerald-900 bg-white rounded-xl p-2.5 border border-emerald-100">
                        <span className="font-bold">#{row.no}</span> {row.pertanyaan.substring(0, 80)}{row.pertanyaan.length > 80 ? '...' : ''}
                        <span className="ml-2 text-emerald-600 font-bold">Jawaban: {row.kunciJawaban}</span>
                      </div>
                    ))}
                    {parsedRows.length > 5 && (
                      <p className="text-xs text-emerald-600 font-semibold text-center">
                        ...dan {parsedRows.length - 5} soal lainnya
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* FORMAT HINT */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 space-y-1">
                <p className="font-bold text-gray-700 mb-2">Format Kolom Excel:</p>
                <div className="grid grid-cols-2 gap-1">
                  {['No', 'Pertanyaan', 'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Opsi E', 'Kunci Jawaban', 'Pembahasan', 'URL Gambar'].map(col => (
                    <span key={col} className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">{col}</span>
                  ))}
                </div>
                <p className="text-gray-400 mt-2">Kunci Jawaban: isi A, B, C, D, atau E • URL Gambar: URL Google/eksternal (opsional)</p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={parsedRows.length === 0 || isUploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengupload...</>
                ) : (
                  <><Upload className="w-3.5 h-3.5" /> Upload {parsedRows.length} Soal</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


'use client'

import { useState, useActionState, useEffect } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import { createClass, updateClass, type ActionState } from './actions'

// Tipe data kelas
type ClassData = {
  id: string
  title: string
  description: string | null
  price: number | null
  level: string | null
}

// Daftar program yang tersedia
const PROGRAMS = [
  {
    value: 'PharmaCore Class',
    label: 'PharmaCore Class',
    description: 'Kelas pendampingan Mata Kuliah Farmasi (Basic Science, Chemistry, Pharmaceutics, Pharmacology, Phytochemistry, dll) berbasis blok. Program ini dirancang khusus untuk memperkuat pemahaman teori & praktikum, membantu persiapan ujian (UTS/UAS), pembahasan modul praktikum, serta latihan bank soal kefarmasian secara intensif.',
  },
  {
    value: 'Pharma Research Mentoring',
    label: 'Pharma Research Mentoring',
    description: 'Bimbingan privat riset & skripsi farmasi secara end-to-end (Private Monitoring Riset). Program meliputi pendampingan penentuan judul/topik riset, penyusunan outline proposal (Bab 1-3), bimbingan desain penelitian & metodologi lab, analisis data & statistika (SPSS), pembahasan hasil praktikum, hingga simulasi sidang skripsi.',
  },
  {
    value: 'PharmaPublish Academy',
    label: 'PharmaPublish Academy',
    description: 'Kelas khusus penulisan manuskrip jurnal ilmiah farmasi untuk publikasi nasional (SINTA) maupun internasional bereputasi (Scopus). Program mencakup drafting naskah, review artikel komprehensif, pemilihan jurnal target yang tepat, pendampingan proses submit, hingga strategi merespons revisi dari reviewer.',
  },
  {
    value: 'Pharma Impact',
    label: 'Pharma Impact',
    description: 'Kelas pendampingan intensif untuk kompetisi ilmiah kemahasiswaan nasional seperti PKM-RE (Riset Eksakta), P2MW (Wirausaha), PPK Ormawa, Program Mahasiswa Wirausaha, dan Lomba Karya Tulis Ilmiah (LKTI). Pendampingan dilakukan dari pencarian ide, penyusunan proposal berkualitas, pembuatan prototype, hingga persiapan presentasi penilaian.',
  },
  {
    value: 'Pharmacamp',
    label: 'Pharmacamp - Formulation Cosmetics Class',
    description: 'Program edukasi intensif formulasi kosmetik (skincare & personal care) dan sains formulasi. Menjembatani teori akademik dengan praktik industri nyata melalui pembelajaran hands-on lab, pengenalan bahan baku & fungsinya, teknik troubleshooting formula, regulasi dasar (CPKB, BPOM, Halal), serta business mentoring (costing, pricing, branding).',
  },
]

const initialState: ActionState = { error: '', success: '' }

// Helper untuk parse title kelas yang sudah ada (misal: "Pharma Research Mentoring 3")
function parseTitleAndNumber(title: string): { program: string; number: string } {
  const programs = PROGRAMS.map(p => p.value).sort((a, b) => b.length - a.length) // sort by length desc
  for (const p of programs) {
    if (title.startsWith(p)) {
      const rest = title.slice(p.length).trim()
      return { program: p, number: rest }
    }
  }
  return { program: title, number: '' }
}

// Tambahkan prop 'customTrigger'
export default function ClassForm({ 
  existingData, 
  customTrigger 
}: { 
  existingData?: ClassData, 
  customTrigger?: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const actionToUse = existingData ? updateClass : createClass
  const [state, formAction, isPending] = useActionState(actionToUse, initialState)

  // Parse existing title jika edit mode
  const parsed = existingData ? parseTitleAndNumber(existingData.title) : { program: '', number: '' }

  const [selectedProgram, setSelectedProgram] = useState(parsed.program || '')
  const [classNumber, setClassNumber] = useState(parsed.number || '')
  const [description, setDescription] = useState(existingData?.description || '')

  // Sync deskripsi saat program berubah (hanya jika bukan edit mode atau deskripsi masih auto)
  useEffect(() => {
    if (!existingData) {
      const prog = PROGRAMS.find(p => p.value === selectedProgram)
      if (prog) setDescription(prog.description)
      else setDescription('')
    }
  }, [selectedProgram, existingData])

  // Reset state saat modal dibuka (untuk create mode)
  const handleOpen = () => {
    if (!existingData) {
      setSelectedProgram('')
      setClassNumber('')
      setDescription('')
    } else {
      const p = parseTitleAndNumber(existingData.title)
      setSelectedProgram(p.program)
      setClassNumber(p.number)
      setDescription(existingData.description || '')
    }
    setIsOpen(true)
  }

  if (state?.success && isOpen) {
    setIsOpen(false)
    window.location.reload()
  }

  // Gabungkan nama program + nomor kelas sebagai title
  const composedTitle = classNumber
    ? `${selectedProgram} ${classNumber}`.trim()
    : selectedProgram

  return (
    <>
      {/* LOGIC TRIGGER BUTTON */}
      {customTrigger ? (
        <div onClick={handleOpen} className="cursor-pointer w-full">
          {customTrigger}
        </div>
      ) : (
        existingData ? (
          <button 
            onClick={handleOpen}
            className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-brand-yellow hover:text-brand-dark transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={handleOpen}
            className="bg-brand-pink text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-dark transition-all shadow-lg shadow-brand-pink/20"
          >
            <Plus className="w-5 h-5" />
            Buat Kelas
          </button>
        )
      )}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-brand-cream">
              <h3 className="font-heading font-bold text-lg text-brand-dark">
                {existingData ? 'Edit Kelas' : 'Buat Kelas Baru'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-brand-gray hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-4">
              {existingData && <input type="hidden" name="id" value={existingData.id} />}
              {/* Field title gabungan (hidden, dikirim ke server) */}
              <input type="hidden" name="title" value={composedTitle} />

              {/* NAMA PROGRAM (Dropdown) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Program</label>
                <select
                  value={selectedProgram}
                  onChange={e => setSelectedProgram(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue bg-white"
                  required
                >
                  <option value="" disabled>Pilih program...</option>
                  {PROGRAMS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* NOMOR KELAS (misal: 1, 2, 3 → jadi "Pharma Research 1") */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">
                  Nomor Kelas <span className="text-brand-gray font-normal normal-case">(opsional, misal: 1 → &quot;{selectedProgram || 'Program'} 1&quot;)</span>
                </label>
                <input
                  type="text"
                  value={classNumber}
                  onChange={e => setClassNumber(e.target.value)}
                  placeholder="Kosongkan jika hanya 1 kelas"
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue"
                />
                {composedTitle && (
                  <p className="text-xs text-brand-blue font-semibold mt-1">
                    Nama kelas: <span className="font-bold">{composedTitle}</span>
                  </p>
                )}
              </div>

              {/* JUMLAH PERTEMUAN + HARGA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Jumlah Pertemuan</label>
                  <input
                    name="level"
                    defaultValue={existingData?.level || ''}
                    type="number"
                    min="1"
                    placeholder="Contoh: 5"
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark uppercase">Harga (Rp)</label>
                  <input
                    name="price"
                    defaultValue={existingData?.price || 0}
                    type="number"
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              {/* DESKRIPSI (auto-fill, bisa diedit) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">
                  Deskripsi Kelas
                  <span className="text-brand-gray font-normal normal-case ml-1">(terisi otomatis, bisa diubah)</span>
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Deskripsi kelas ini..."
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue resize-none"
                />
              </div>

              {state?.error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {state.error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isPending || !selectedProgram}
                  className="w-full bg-brand-darkblue text-white font-bold py-4 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : (existingData ? "Update Kelas" : "Buat Kelas")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
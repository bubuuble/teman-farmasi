'use client'

import { useState } from 'react'
import { Plus, Check, Search, Filter, BookOpen } from 'lucide-react'
import { assignQuestionsToTryout } from './actions'

type QuestionItem = {
  id: string
  question_text: string
  difficulty: string
  category_id: string
  question_categories?: { name: string }
}

export default function AssignQuestionsModal({
  tryoutId,
  availableQuestions = [],
  existingQuestionIds = []
}: {
  tryoutId: string
  availableQuestions: QuestionItem[]
  existingQuestionIds: string[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter out questions that are already in this tryout
  const unassigned = availableQuestions.filter(q => !existingQuestionIds.includes(q.id))

  const filtered = unassigned.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.question_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty
    return matchesSearch && matchesDiff
  })

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const selectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map(q => q.id))
    }
  }

  const handleAssign = async () => {
    if (selectedIds.length === 0) return
    setIsSubmitting(true)
    try {
      const res = await assignQuestionsToTryout(tryoutId, selectedIds)
      if (res?.error) {
        alert(res.error)
      } else {
        setIsOpen(false)
        setSelectedIds([])
      }
    } catch (e: any) {
      alert(e.message || "Gagal menambahkan soal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-brand-pink transition shadow-sm active:scale-95"
      >
        <Plus className="w-4 h-4" /> Pilih dari Bank Soal
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0 mb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-dark">
                  Pilih Soal dari Bank Soal
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Centang soal yang ingin dimasukkan ke dalam paket tryout ini
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold px-2 py-1"
              >
                Tutup
              </button>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari teks soal atau topik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                />
              </div>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink bg-white"
              >
                <option value="all">Semua Kesulitan</option>
                <option value="easy">Mudah</option>
                <option value="medium">Sedang</option>
                <option value="hard">Sulit</option>
              </select>

              {filtered.length > 0 && (
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-3 py-2 text-xs font-bold text-brand-pink bg-brand-pink/10 rounded-xl hover:bg-brand-pink hover:text-white transition whitespace-nowrap"
                >
                  {selectedIds.length === filtered.length ? 'Batal Semua' : 'Pilih Semua'}
                </button>
              )}
            </div>

            {/* LIST SOAL AVAILABLE */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-2">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Tidak ada soal yang tersedia untuk ditambahkan. Buat soal baru di Bank Soal terlebih dahulu.
                </div>
              ) : (
                filtered.map((q) => {
                  const isChecked = selectedIds.includes(q.id)
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleSelect(q.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'border-brand-pink bg-brand-pink/5'
                          : 'border-gray-100 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border transition ${
                          isChecked
                            ? 'bg-brand-pink border-brand-pink text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {q.question_categories?.name && (
                            <span className="text-[10px] font-bold text-brand-dark bg-gray-100 px-2 py-0.5 rounded-md">
                              {q.question_categories.name}
                            </span>
                          )}
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                            q.difficulty === 'hard' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-relaxed">
                          {q.question_text}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 shrink-0 mt-4">
              <span className="text-xs font-bold text-gray-600">
                {selectedIds.length} soal terpilih
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={selectedIds.length === 0 || isSubmitting}
                  className="px-5 py-2.5 bg-brand-pink text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menambahkan...' : `Tambahkan (${selectedIds.length}) Soal`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

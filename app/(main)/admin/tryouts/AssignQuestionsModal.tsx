'use client'

import { useState } from 'react'
import { Plus, Check, Search, Filter, BookOpen, FolderPlus, Layers } from 'lucide-react'
import { assignQuestionsToTryout, assignCategoryQuestionsToTryout } from './actions'

type QuestionItem = {
  id: string
  question_text: string
  difficulty?: string
  category_id: string
  question_categories?: { id?: string; name: string }
}

type CategoryItem = {
  id: string
  name: string
}

export default function AssignQuestionsModal({
  tryoutId,
  availableQuestions = [],
  existingQuestionIds = [],
  categories = []
}: {
  tryoutId: string
  availableQuestions: QuestionItem[]
  existingQuestionIds: string[]
  categories?: CategoryItem[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'individual' | 'category'>('individual')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter out questions that are already in this tryout
  const unassigned = availableQuestions.filter(q => !existingQuestionIds.includes(q.id))

  const filtered = unassigned.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.question_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Group unassigned count by category
  const categoryStats = categories.map(cat => {
    const totalInBank = availableQuestions.filter(q => q.category_id === cat.id).length
    const unassignedCount = unassigned.filter(q => q.category_id === cat.id).length
    return {
      ...cat,
      totalInBank,
      unassignedCount
    }
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

  const handleAssignIndividual = async () => {
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

  const handleAssignCategory = async () => {
    if (!selectedCategoryId) return
    setIsSubmitting(true)
    try {
      const res = await assignCategoryQuestionsToTryout(tryoutId, selectedCategoryId)
      if (res?.error) {
        alert(res.error)
      } else {
        alert(`Berhasil menambahkan ${res.addedCount} butir soal dari kategori ini!`)
        setIsOpen(false)
        setSelectedCategoryId('')
      }
    } catch (e: any) {
      alert(e.message || "Gagal menambahkan soal kategori")
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
                  Tambahkan soal secara per butir soal atau langsung seluruh kategori
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold px-2 py-1"
              >
                Tutup
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-gray-100 mb-4 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('individual')}
                className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition ${
                  activeTab === 'individual'
                    ? 'border-brand-pink text-brand-pink'
                    : 'border-transparent text-gray-400 hover:text-brand-dark'
                }`}
              >
                <Layers className="w-4 h-4" /> Pilih Per Butir Soal ({unassigned.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('category')}
                className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition ${
                  activeTab === 'category'
                    ? 'border-brand-pink text-brand-pink'
                    : 'border-transparent text-gray-400 hover:text-brand-dark'
                }`}
              >
                <FolderPlus className="w-4 h-4" /> Masukkan Sekaligus Per Kategori
              </button>
            </div>

            {/* TAB 1: INDIVIDUAL SELECTION */}
            {activeTab === 'individual' && (
              <>
                {/* SEARCH & FILTERS */}
                <div className="flex items-center gap-3 mb-4 shrink-0">
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
                      onClick={handleAssignIndividual}
                      disabled={selectedIds.length === 0 || isSubmitting}
                      className="px-5 py-2.5 bg-brand-pink text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Menambahkan...' : `Tambahkan (${selectedIds.length}) Soal`}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: BULK CATEGORY SELECTION */}
            {activeTab === 'category' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-brand-pink/5 rounded-2xl border border-brand-pink/20 mb-4 text-xs text-brand-dark">
                  Pilih satu kategori di bawah untuk memasukkan <strong>semua butir soal</strong> yang ada di kategori tersebut ke dalam tryout ini sekaligus (soal yang sudah ada tidak akan diduplikasi).
                </div>

                <div className="overflow-y-auto space-y-3 flex-1 pr-2">
                  {categoryStats.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      Belum ada kategori bank soal untuk program ini.
                    </div>
                  ) : (
                    categoryStats.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id
                      const isDisabled = cat.unassignedCount === 0

                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            if (!isDisabled) setSelectedCategoryId(cat.id)
                          }}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                            isDisabled
                              ? 'opacity-40 bg-gray-50 border-gray-100 cursor-not-allowed'
                              : isSelected
                              ? 'border-brand-pink bg-brand-pink/5 cursor-pointer shadow-sm'
                              : 'border-gray-100 bg-white hover:border-gray-300 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition ${
                                isSelected
                                  ? 'border-brand-pink bg-brand-pink text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-brand-dark">{cat.name}</h4>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Total {cat.totalInBank} butir soal di Bank Soal
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            {isDisabled ? (
                              <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                Semua sudah masuk
                              </span>
                            ) : (
                              <span className="text-[11px] font-extrabold text-brand-pink bg-brand-pink/10 px-3 py-1 rounded-full">
                                +{cat.unassignedCount} Soal Tersedia
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 shrink-0 mt-4">
                  <span className="text-xs text-gray-500 font-medium">
                    {selectedCategoryId
                      ? `Kategori terpilih: ${categories.find(c => c.id === selectedCategoryId)?.name}`
                      : 'Pilih satu kategori'}
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
                      onClick={handleAssignCategory}
                      disabled={!selectedCategoryId || isSubmitting}
                      className="px-5 py-2.5 bg-brand-pink text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Memasukkan...' : 'Masukkan Semua Soal Kategori Ini'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

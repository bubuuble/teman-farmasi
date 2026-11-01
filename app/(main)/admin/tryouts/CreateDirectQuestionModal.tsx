'use client'

import { useState, useActionState, useEffect } from 'react'
import { Plus, X, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { createQuestionDirectToTryout, type ActionState } from './actions'

type CategoryOption = {
  id: string
  name: string
}

const initialState: ActionState = { error: '', success: '' }

export default function CreateDirectQuestionModal({
  tryoutId,
  categories = []
}: {
  tryoutId: string
  categories: CategoryOption[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [correctOption, setCorrectOption] = useState<string>('A')
  const [state, formAction, isPending] = useActionState(createQuestionDirectToTryout, initialState)

  useEffect(() => {
    if (state.success && !state.error) {
      setIsOpen(false)
    }
  }, [state])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-pink text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition shadow-sm active:scale-95"
      >
        <Plus className="w-4 h-4" /> Buat Soal Langsung
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0 mb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-dark">
                  Buat Soal Langsung ke Tryout
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Soal otomatis masuk ke paket tryout ini dan tersimpan di Bank Soal
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {state.error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100 shrink-0">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-4 overflow-y-auto pr-2 flex-1">
              <input type="hidden" name="tryout_id" value={tryoutId} />
              <input type="hidden" name="correct_option" value={correctOption} />

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Kategori Bank Soal *
                </label>
                <select
                  name="category_id"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink bg-white"
                >
                  <option value="">Pilih Kategori Bank Soal</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teks Pertanyaan *
                </label>
                <textarea
                  name="question_text"
                  rows={3}
                  required
                  placeholder="Seorang apoteker..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Pilihan Jawaban (A - E) & Jawaban Benar *
                </label>
                <div className="space-y-2">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map(label => {
                    const isSelected = correctOption === label
                    return (
                      <div
                        key={label}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                          isSelected ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCorrectOption(label)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs transition-all shrink-0 ${
                            isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isSelected ? <CheckCircle className="w-3.5 h-3.5" /> : label}
                        </button>
                        <input
                          type="text"
                          name={`option_${label}`}
                          placeholder={`Isi pilihan ${label}...`}
                          required={label !== 'E'}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pembahasan Jawaban (Opsional)
                </label>
                <textarea
                  name="explanation"
                  rows={2}
                  placeholder="Rasionalisasi kunci jawaban..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 shrink-0 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-brand-pink text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan ke Tryout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

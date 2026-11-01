'use client'

import { useState, useActionState, useEffect } from 'react'
import { Pencil, X, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { updateQuestionInTryout, type ActionState } from './actions'

type Option = {
  id?: string
  label: string
  option_text: string
  is_correct: boolean
}

type QuestionData = {
  id: string
  question_text: string
  question_image_url?: string | null
  explanation?: string | null
  category_id?: string
  question_options?: Option[]
}

const initialState: ActionState = { error: '', success: '' }

export default function EditQuestionInTryoutModal({
  tryoutId,
  question,
  categories = []
}: {
  tryoutId: string
  question: QuestionData
  categories?: { id: string; name: string }[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const initialCorrect = question.question_options?.find(o => o.is_correct)?.label || 'A'
  const [correctOption, setCorrectOption] = useState<string>(initialCorrect)
  const [state, formAction, isPending] = useActionState(updateQuestionInTryout, initialState)

  useEffect(() => {
    if (state.success && !state.error) {
      setIsOpen(false)
    }
  }, [state])

  const getOptText = (label: string) => {
    return question.question_options?.find(o => o.label === label)?.option_text || ''
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition"
        title="Edit butir soal ini"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0 mb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-dark">
                  Edit Butir Soal Tryout
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Perubahan akan langsung ter-update di Tryout ini dan Bank Soal
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
              <input type="hidden" name="question_id" value={question.id} />
              <input type="hidden" name="correct_option" value={correctOption} />

              {categories.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Kategori Bank Soal
                  </label>
                  <select
                    name="category_id"
                    defaultValue={question.category_id || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink bg-white"
                  >
                    <option value="">Pertahankan kategori saat ini</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teks Pertanyaan *
                </label>
                <textarea
                  name="question_text"
                  rows={4}
                  required
                  defaultValue={question.question_text}
                  placeholder="Seorang apoteker..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  URL Gambar Lampiran (Opsional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="question_image_url"
                    defaultValue={question.question_image_url || ''}
                    placeholder="https://... (jika ada gambar)"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                  />
                  <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Pilihan Jawaban (A - E) & Kunci Jawaban *
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
                          defaultValue={getOptText(label)}
                          placeholder={`Isi pilihan ${label}...`}
                          required={label !== 'E'}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                        />
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                            Kunci
                          </span>
                        )}
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
                  defaultValue={question.explanation || ''}
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
                  {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

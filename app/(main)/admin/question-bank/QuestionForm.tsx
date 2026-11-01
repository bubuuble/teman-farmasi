'use client'

import { useState, useActionState, useEffect } from 'react'
import { Plus, Pencil, X, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { createQuestion, updateQuestion, type ActionState } from './actions'

type OptionData = {
  id?: string
  label: string
  option_text: string
  is_correct: boolean
}

type QuestionData = {
  id: string
  category_id: string
  question_text: string
  question_image_url: string | null
  explanation: string | null
  difficulty?: string
  question_options?: OptionData[]
}

const initialState: ActionState = { error: '', success: '' }

export default function QuestionForm({
  categoryId,
  question,
  customTrigger
}: {
  categoryId: string
  question?: QuestionData
  customTrigger?: (open: () => void) => React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditing = !!question

  const action = isEditing ? updateQuestion : createQuestion
  const [state, formAction, isPending] = useActionState(action, initialState)

  // Pre-fill initial correct option
  const initialCorrect = question?.question_options?.find(o => o.is_correct)?.label || 'A'
  const [correctOption, setCorrectOption] = useState<string>(initialCorrect)

  useEffect(() => {
    if (state.success && !state.error) {
      setIsOpen(false)
    }
  }, [state])

  // Get option value by label
  const getOptText = (label: string) => {
    return question?.question_options?.find(o => o.label === label)?.option_text || ''
  }

  return (
    <>
      {customTrigger ? (
        customTrigger(() => setIsOpen(true))
      ) : isEditing ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition"
          title="Edit Soal"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-pink text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Soal Baru
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0 mb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-dark">
                  {isEditing ? 'Edit Soal Pilihan Ganda' : 'Tambah Soal ke Bank Soal'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Isi pertanyaan, 5 pilihan jawaban (A–E), dan pembahasan detail
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

            <form action={formAction} className="space-y-5 overflow-y-auto pr-2 flex-1">
              <input type="hidden" name="category_id" value={categoryId} />
              {isEditing && <input type="hidden" name="id" value={question.id} />}
              <input type="hidden" name="correct_option" value={correctOption} />

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  URL Gambar Lampiran (Opsional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="question_image_url"
                    defaultValue={question?.question_image_url || ''}
                    placeholder="https://... (jika ada gambar struktur/kurva)"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                  />
                  <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teks Pertanyaan / Soal Kasus *
                </label>
                <textarea
                  name="question_text"
                  defaultValue={question?.question_text || ''}
                  rows={4}
                  required
                  placeholder="Seorang apoteker di instalasi farmasi rumah sakit sedang melakukan penyiapan..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink leading-relaxed"
                />
              </div>

              {/* 5 OPSI JAWABAN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Pilihan Jawaban (A - E) & Jawaban Benar *
                </label>
                <p className="text-[11px] text-gray-500 mb-3">
                  Klik lingkaran huruf (A/B/C/D/E) untuk menandai kunci jawaban yang benar.
                </p>

                <div className="space-y-2.5">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map(label => {
                    const isSelected = correctOption === label
                    return (
                      <div
                        key={label}
                        className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCorrectOption(label)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs transition-all shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={`Tandai ${label} sebagai kunci jawaban`}
                        >
                          {isSelected ? <CheckCircle className="w-4 h-4" /> : label}
                        </button>
                        <input
                          type="text"
                          name={`option_${label}`}
                          defaultValue={getOptText(label)}
                          placeholder={`Isi pilihan ${label}...`}
                          required={label !== 'E'} // A-D required, E opsional jika format 4 opsi
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                        />
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                            Kunci Jawaban
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* PEMBAHASAN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pembahasan Soal / Keterangan Kunci
                </label>
                <textarea
                  name="explanation"
                  defaultValue={question?.explanation || ''}
                  rows={3}
                  placeholder="Jelaskan rasionalisasi jawaban benar dan kenapa opsi lainnya salah..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 shrink-0 sticky bottom-0 bg-white">
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
                  className="px-6 py-2.5 bg-brand-pink text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambahkan Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

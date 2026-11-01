'use client'

import { useState, useActionState, useEffect } from 'react'
import { Plus, Pencil, X, Clock, Calendar, Users, Settings2 } from 'lucide-react'
import { createTryout, updateTryout, type ActionState } from './actions'

type ClassOption = {
  id: string
  title: string
}

type TryoutData = {
  id: string
  title: string
  description: string | null
  program_type: string
  class_id: string | null
  duration_minutes: number | null
  max_attempts: number | null
  is_active: boolean
  shuffle_questions: boolean
  shuffle_options: boolean
  start_date: string | null
  end_date: string | null
}

const initialState: ActionState = { error: '', success: '' }

export default function TryoutForm({
  tryout,
  classes = [],
  customTrigger
}: {
  tryout?: TryoutData
  classes?: ClassOption[]
  customTrigger?: (open: () => void) => React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditing = !!tryout

  const action = isEditing ? updateTryout : createTryout
  const [state, formAction, isPending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success && !state.error) {
      setIsOpen(false)
    }
  }, [state])

  // Format date helper for input type="datetime-local"
  const formatDateForInput = (isoString: string | null | undefined) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    } catch {
      return ''
    }
  }

  return (
    <>
      {customTrigger ? (
        customTrigger(() => setIsOpen(true))
      ) : isEditing ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition"
          title="Edit Tryout"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-bold hover:bg-brand-pink transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> Buat Tryout Baru
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0 mb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-dark">
                  {isEditing ? 'Edit Konfigurasi Tryout' : 'Buat Ujian Tryout Baru'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Atur durasi pengerjaan, batas kesempatan, dan kelas yang berhak mengakses
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
              {isEditing && <input type="hidden" name="id" value={tryout.id} />}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Judul Tryout CBT *
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={tryout?.title || ''}
                  placeholder="Misal: Tryout Simulasi Masuk Apoteker UI / ITB / UGM Batch 1"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Program UKAI Series *
                  </label>
                  <select
                    name="program_type"
                    defaultValue={tryout?.program_type || 'masuk_apoteker'}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink bg-white"
                  >
                    <option value="masuk_apoteker">Masuk Apoteker (Ujian Kampus)</option>
                    <option value="ukmppai">Kelas UKMPPAI (Sertifikasi Profesi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tautkan ke Kelas Tertentu
                  </label>
                  <select
                    name="class_id"
                    defaultValue={tryout?.class_id || 'none'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink bg-white"
                  >
                    <option value="none">Terbuka / Tanpa Kelas Khusus</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Durasi Pengerjaan (Menit)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duration_minutes"
                      defaultValue={tryout?.duration_minutes ?? 120}
                      min="1"
                      placeholder="120 (Kosongkan jika tanpa batas)"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                    />
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Maksimal Percobaan (Attempts)
                  </label>
                  <select
                    name="max_attempts"
                    defaultValue={tryout?.max_attempts?.toString() || '1'}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink bg-white"
                  >
                    <option value="1">1x Kesempatan</option>
                    <option value="2">2x Kesempatan</option>
                    <option value="3">3x Kesempatan</option>
                    <option value="5">5x Kesempatan</option>
                    <option value="999">Unlimited (Bebas Latihan Berulang)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Waktu Mulai Buka (Opsional)
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    defaultValue={formatDateForInput(tryout?.start_date)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Waktu Selesai Tutup (Opsional)
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    defaultValue={formatDateForInput(tryout?.end_date)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Deskripsi / Petunjuk Pengerjaan
                </label>
                <textarea
                  name="description"
                  defaultValue={tryout?.description || ''}
                  rows={2}
                  placeholder="Petunjuk ujian: waktu pengerjaan 120 menit, dilarang membuka catatan..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                />
              </div>

              {/* TOGGLES */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={tryout ? tryout.is_active : true}
                    className="w-4 h-4 text-brand-pink rounded border-gray-300 focus:ring-brand-pink"
                  />
                  <span className="text-xs font-bold text-brand-dark">
                    Publikasikan Tryout (Bisa diakses siswa yang terdaftar)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="shuffle_questions"
                    defaultChecked={tryout?.shuffle_questions || false}
                    className="w-4 h-4 text-brand-pink rounded border-gray-300 focus:ring-brand-pink"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Acak urutan nomor soal saat ujian dimulai
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="shuffle_options"
                    defaultChecked={tryout?.shuffle_options || false}
                    className="w-4 h-4 text-brand-pink rounded border-gray-300 focus:ring-brand-pink"
                  />
                  <span className="text-xs font-medium text-gray-700">
                    Acak urutan opsi pilihan (A, B, C, D, E) per siswa
                  </span>
                </label>
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
                  {isPending ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Tryout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useActionState, useEffect } from 'react'
import { Plus, Pencil, X } from 'lucide-react'
import { createCategory, updateCategory, type ActionState } from './actions'

type CategoryData = {
  id: string
  name: string
  program_type: string
  description: string | null
}

const initialState: ActionState = { error: '', success: '' }

export default function CategoryForm({
  category,
  defaultProgramType = 'masuk_apoteker',
  customTrigger
}: {
  category?: CategoryData
  defaultProgramType?: string
  customTrigger?: (open: () => void) => React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditing = !!category

  const action = isEditing ? updateCategory : createCategory
  const [state, formAction, isPending] = useActionState(action, initialState)

  useEffect(() => {
    if (state.success && !state.error) {
      setIsOpen(false)
    }
  }, [state])

  return (
    <>
      {customTrigger ? (
        customTrigger(() => setIsOpen(true))
      ) : isEditing ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-gray-500 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition"
          title="Edit Kategori"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-xl text-sm font-bold hover:bg-brand-pink transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-brand-dark">
                  {isEditing ? 'Edit Kategori Soal' : 'Tambah Kategori Soal Baru'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Organisasikan bank soal berdasarkan rumpun ilmu atau topik
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
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {isEditing && <input type="hidden" name="id" value={category.id} />}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Program UKAI Series *
                </label>
                <select
                  name="program_type"
                  defaultValue={category?.program_type || defaultProgramType}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink bg-white"
                >
                  <option value="masuk_apoteker">Masuk Apoteker (Ujian Kampus)</option>
                  <option value="ukmppai">Kelas UKMPPAI (Blueprint Nasional)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nama Kategori / Bidang *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={category?.name || ''}
                  placeholder="Misal: Farmakoterapi, Farmasetika, Biologi Farmasi"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Deskripsi Kategori (Opsional)
                </label>
                <textarea
                  name="description"
                  defaultValue={category?.description || ''}
                  rows={3}
                  placeholder="Ringkasan cakupan materi dalam kategori ini..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-6">
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
                  {isPending ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

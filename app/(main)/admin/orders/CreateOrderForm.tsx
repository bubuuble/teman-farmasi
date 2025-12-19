'use client'

import { useState, useActionState } from 'react'
import { Plus, X } from 'lucide-react'
import { createOrder, type ActionState } from './actions'

type Props = {
  students: { id: string, full_name: string, email: string }[]
  classes: { id: string, title: string, price: number }[]
}

const initialState: ActionState = { error: '', success: '' }

export default function CreateOrderForm({ students, classes }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedClassPrice, setSelectedClassPrice] = useState<number>(0) // Auto-fill harga
  const [state, formAction, isPending] = useActionState(createOrder, initialState)

  if (state?.success && isOpen) {
    setIsOpen(false)
    window.location.reload()
  }

  // Handle saat kelas dipilih, harga otomatis terisi
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value
    const cls = classes.find(c => c.id === classId)
    if (cls) setSelectedClassPrice(cls.price)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-brand-pink text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-dark transition-all shadow-lg shadow-brand-pink/20"
      >
        <Plus className="w-5 h-5" />
        Buat Order
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-brand-cream">
              <h3 className="font-heading font-bold text-lg text-brand-dark">Buat Order Manual</h3>
              <button onClick={() => setIsOpen(false)} className="text-brand-gray hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Pilih Siswa</label>
                <select name="studentId" className="w-full p-3 rounded-xl border border-gray-200 bg-white" required>
                  <option value="">-- Cari Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Pilih Kelas</label>
                <select 
                    name="classId" 
                    onChange={handleClassChange}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white" 
                    required
                >
                  <option value="">-- Cari Kelas --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Nominal Tagihan (Rp)</label>
                <input 
                  name="amount" 
                  type="number" 
                  value={selectedClassPrice}
                  onChange={(e) => setSelectedClassPrice(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase">Catatan (Opsional)</label>
                <input 
                  name="notes" 
                  type="text" 
                  placeholder="Contoh: Transfer BCA a/n Budi" 
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-blue" 
                />
              </div>

              {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full bg-brand-darkblue text-white font-bold py-4 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {isPending ? "Memproses..." : "Simpan Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
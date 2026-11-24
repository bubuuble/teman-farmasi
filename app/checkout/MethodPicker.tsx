'use client'

import { useState } from 'react'
import { QrCode, Landmark } from 'lucide-react'
import { VA_BANKS, type PaymentMethod } from '@/lib/gdcpay/payment-options'

type Props = {
  loading: boolean
  error?: string | null
  submitLabel: string
  onSubmit: (method: PaymentMethod, bankCode: string) => void
}

/** Pilihan metode bayar (QRIS / Virtual Account) — dipakai di halaman checkout & halaman bayar. */
export default function MethodPicker({ loading, error, submitLabel, onSubmit }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('qris')
  const [bank, setBank] = useState<string>(VA_BANKS[0].code)

  const option = (value: PaymentMethod, title: string, desc: string, Icon: typeof QrCode) => (
    <label
      className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
        method === value ? 'border-brand-pink bg-brand-pink/5' : 'border-gray-100 hover:border-gray-200 bg-white'
      }`}
    >
      <input type="radio" name="method" value={value} checked={method === value} onChange={() => setMethod(value)} className="mt-1 accent-pink-500" />
      <div className="w-10 h-10 rounded-xl bg-brand-cream text-brand-pink flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-brand-dark">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
    </label>
  )

  return (
    <div className="space-y-4">
      {option('qris', 'QRIS', 'Scan dengan m-banking atau e-wallet apa pun.', QrCode)}
      {option('va', 'Virtual Account', 'Transfer ke nomor VA lewat ATM / m-banking.', Landmark)}

      {method === 'va' && (
        <div className="pl-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bank</label>
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 font-bold text-brand-dark bg-white"
          >
            {VA_BANKS.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>}

      <button
        type="button"
        disabled={loading}
        onClick={() => onSubmit(method, bank)}
        className="w-full bg-brand-dark text-white font-extrabold py-4 rounded-2xl hover:bg-brand-pink transition-all disabled:opacity-60 shadow-lg"
      >
        {loading ? 'Memproses…' : submitLabel}
      </button>
    </div>
  )
}

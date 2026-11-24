'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { inquiryRecipient, sendDisbursement } from './actions'
import { DISBURSE_BANKS, DISBURSE_MAX, DISBURSE_MIN } from '@/lib/gdcpay/disbursement-options'
import { formatRupiah } from '@/lib/currency'

type Mentor = { id: string; full_name: string | null; email: string }

const input = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20'
const label = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2'

export default function DisbursementForm({ mentors }: { mentors: Mentor[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  // Kunci idempotensi: dibuat sekali per form, dibuat ulang hanya setelah transfer selesai diproses.
  const requestId = useRef(crypto.randomUUID())

  const [recipientId, setRecipientId] = useState('')
  const [bankCode, setBankCode] = useState<string>(DISBURSE_BANKS[0].code)
  const [accountNumber, setAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('Honor mentor')
  const [verifiedName, setVerifiedName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const amountNum = Number(amount)
  const mentorName = mentors.find((m) => m.id === recipientId)?.full_name || ''

  // Mengubah data rekening/nominal membatalkan verifikasi sebelumnya.
  const edit = (fn: () => void) => { fn(); setVerifiedName(null); setError(null) }

  const check = () => {
    setError(null)
    start(async () => {
      const r = await inquiryRecipient({ bankCode, accountNumber, amount: amountNum })
      if (r.error) return setError(r.error)
      setVerifiedName(r.accountName!)
    })
  }

  const send = () => {
    if (!verifiedName) return
    const ok = window.confirm(
      `Kirim ${formatRupiah(amountNum)} ke ${verifiedName}?\n${DISBURSE_BANKS.find((b) => b.code === bankCode)?.name} · ${accountNumber}\n\nTransfer tidak dapat dibatalkan.`
    )
    if (!ok) return
    setError(null)
    start(async () => {
      const r = await sendDisbursement({
        requestId: requestId.current,
        recipientId: recipientId || null,
        recipientName: mentorName,
        bankCode, accountNumber, amount: amountNum, remarks,
      })
      if (r.error) return setError(r.error)
      requestId.current = crypto.randomUUID()
      router.push(`/admin/disbursements/${r.id}`)
    })
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">
      <h2 className="font-heading font-bold text-lg text-brand-dark">Kirim Honor Mentor</h2>

      <div>
        <label className={label}>Penerima (opsional)</label>
        <select className={input} value={recipientId} onChange={(e) => edit(() => setRecipientId(e.target.value))}>
          <option value="">— Tanpa mentor / penerima lain —</option>
          {mentors.map((m) => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Bank</label>
          <select className={input} value={bankCode} onChange={(e) => edit(() => setBankCode(e.target.value))}>
            {DISBURSE_BANKS.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Nomor Rekening</label>
          <input className={input} inputMode="numeric" value={accountNumber} placeholder="Contoh: 123123123"
            onChange={(e) => edit(() => setAccountNumber(e.target.value.replace(/\D/g, '')))} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Nominal (Rp)</label>
          <input className={input} inputMode="numeric" value={amount} placeholder={String(DISBURSE_MIN)}
            onChange={(e) => edit(() => setAmount(e.target.value.replace(/\D/g, '')))} />
          <p className="text-xs text-gray-400 mt-1">Min {formatRupiah(DISBURSE_MIN)} · maks {formatRupiah(DISBURSE_MAX)}. Ada biaya transfer di luar nominal.</p>
        </div>
        <div>
          <label className={label}>Catatan</label>
          <input className={input} value={remarks} onChange={(e) => setRemarks(e.target.value)} maxLength={60} />
        </div>
      </div>

      {verifiedName && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-sm">
          <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Rekening terverifikasi</p>
          <p className="font-extrabold text-brand-dark text-lg">{verifiedName}</p>
          <p className="text-gray-500">Pastikan nama ini benar sebelum mengirim.</p>
        </div>
      )}

      {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={check} disabled={pending || !accountNumber || !amountNum}
          className="flex-1 border-2 border-brand-dark text-brand-dark font-extrabold py-3 rounded-2xl hover:bg-brand-dark hover:text-white transition-all disabled:opacity-50">
          {pending && !verifiedName ? 'Memeriksa…' : '1. Cek Rekening'}
        </button>
        <button type="button" onClick={send} disabled={pending || !verifiedName}
          className="flex-1 bg-brand-dark text-white font-extrabold py-3 rounded-2xl hover:bg-brand-pink transition-all disabled:opacity-40">
          {pending && verifiedName ? 'Mengirim…' : '2. Kirim Transfer'}
        </button>
      </div>
    </div>
  )
}

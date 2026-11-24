'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, RefreshCw } from 'lucide-react'
import { checkDisbursementStatus } from '../actions'

export default function ReceiptActions({ id, pending }: { id: string; pending: boolean }) {
  const router = useRouter()
  const [busy, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <>
      {pending ? (
        <button
          disabled={busy}
          onClick={() => start(async () => {
            setMsg(null)
            const r = await checkDisbursementStatus(id)
            if (r.error) return setMsg(r.error)
            if (r.status !== 'pending') return router.refresh()
            setMsg(r.message || 'Status masih menunggu konfirmasi.')
          })}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-dark text-white font-extrabold py-3 rounded-2xl hover:bg-brand-pink disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} /> Cek Status
        </button>
      ) : (
        <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 bg-brand-dark text-white font-extrabold py-3 rounded-2xl hover:bg-brand-pink">
          <Printer className="w-4 h-4" /> Cetak Bukti
        </button>
      )}
      {msg && <p className="sm:basis-full text-sm font-bold text-orange-600">{msg}</p>}
    </>
  )
}

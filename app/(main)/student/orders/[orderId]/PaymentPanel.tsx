'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Copy, Printer, Clock } from 'lucide-react'
import MethodPicker from '@/app/checkout/MethodPicker'
import { refreshOrderStatus, startPayment } from '@/app/checkout/actions'
import { formatRupiah } from '@/lib/currency'
import { vaBankName } from '@/lib/gdcpay/payment-options'

type OrderView = {
  id: string
  createdAt: string
  amount: number
  status: string
  label: string
  method: string | null
  bankCode: string | null
  vaNumber: string | null
  qrDataUrl: string | null
  expiresAt: string | null
  paidAt: string | null
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' })
    : '-'

export default function PaymentPanel({ order }: { order: OrderView }) {
  const router = useRouter()
  const [changing, setChanging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [copied, setCopied] = useState(false)

  const expired = !!order.expiresAt && new Date(order.expiresAt).getTime() < Date.now()
  const waiting = order.status === 'pending' && !!order.method && !expired && !changing

  // Polling status ke server (yang menyinkronkan ke GDC) tiap 5 detik selama menunggu pembayaran.
  useEffect(() => {
    if (!waiting) return
    const timer = setInterval(async () => {
      const res = await refreshOrderStatus(order.id)
      if (res.status && res.status !== 'pending') router.refresh()
    }, 5000)
    return () => clearInterval(timer)
  }, [waiting, order.id, router])

  // ───────── STRUK: pembayaran sukses ─────────
  if (order.status === 'paid') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none">
          <div className="bg-green-50 p-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-3" />
            <h1 className="font-heading font-extrabold text-2xl text-brand-dark">Pembayaran Berhasil</h1>
            <p className="text-gray-500 font-medium mt-1">Kamu sudah terdaftar di kelas.</p>
          </div>
          <dl className="p-8 space-y-4 text-sm">
            <Row label="No. Pesanan" value={`#${order.id.slice(0, 8).toUpperCase()}`} />
            <Row label="Program" value={order.label} />
            <Row label="Metode" value={order.method === 'qris' ? 'QRIS' : `Virtual Account ${vaBankName(order.bankCode)}`} />
            <Row label="Waktu Bayar" value={fmtDate(order.paidAt)} />
            <div className="border-t border-dashed border-gray-200 pt-4 flex items-center justify-between">
              <dt className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Total Dibayar</dt>
              <dd className="text-2xl font-extrabold text-brand-dark">{formatRupiah(order.amount)}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6 print:hidden">
          <Link href="/student/classes" className="flex-1 text-center bg-brand-dark text-white font-extrabold py-4 rounded-2xl hover:bg-brand-pink transition-all">
            Lihat Kelas Saya
          </Link>
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-gray-200 font-bold text-brand-dark bg-white hover:bg-gray-50">
            <Printer className="w-4 h-4" /> Cetak Struk
          </button>
        </div>
      </div>
    )
  }

  if (order.status === 'cancelled') {
    return <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 text-center font-bold text-gray-500">Pesanan ini dibatalkan.</div>
  }

  // ───────── Pilih / ganti metode ─────────
  if (!order.method || expired || changing) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Pesanan</p>
          <h1 className="font-heading font-bold text-xl text-brand-dark">{order.label}</h1>
          <p className="text-2xl font-extrabold text-brand-dark mt-2">{formatRupiah(order.amount)}</p>
          {expired && <p className="text-sm font-bold text-orange-600 mt-2">Pembayaran sebelumnya sudah kedaluwarsa. Buat pembayaran baru.</p>}
        </div>
        <MethodPicker
          loading={pending}
          error={error}
          submitLabel="Buat Pembayaran"
          onSubmit={(method, bank) => {
            setError(null)
            start(async () => {
              const res = await startPayment(order.id, method, bank)
              if (res.error) return setError(res.error)
              setChanging(false)
              router.refresh()
            })
          }}
        />
      </div>
    )
  }

  // ───────── Menunggu pembayaran: QRIS / VA ─────────
  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-6">
      <div>
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Menunggu Pembayaran</p>
        <h1 className="font-heading font-bold text-xl text-brand-dark">{order.label}</h1>
        <p className="text-3xl font-extrabold text-brand-dark mt-2">{formatRupiah(order.amount)}</p>
      </div>

      {order.method === 'qris' && order.qrDataUrl && (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={order.qrDataUrl} alt="QRIS" className="w-64 h-64 mx-auto rounded-2xl border border-gray-100" />
          <p className="text-sm text-gray-500 font-medium mt-3">Scan dengan aplikasi m-banking atau e-wallet.</p>
        </div>
      )}

      {order.method === 'va' && order.vaNumber && (
        <div className="bg-brand-cream rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Virtual Account {vaBankName(order.bankCode)}</p>
          <p className="font-mono text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-wider mt-2 break-all">{order.vaNumber}</p>
          <button
            onClick={() => { navigator.clipboard?.writeText(order.vaNumber!); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-brand-pink"
          >
            <Copy className="w-4 h-4" /> {copied ? 'Tersalin!' : 'Salin nomor'}
          </button>
          <p className="text-xs text-gray-500 font-medium mt-3">Transfer tepat {formatRupiah(order.amount)} lewat ATM / m-banking.</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400">
        <Clock className="w-4 h-4 animate-pulse" /> Memeriksa status pembayaran otomatis…
      </div>
      {order.expiresAt && <p className="text-xs text-gray-400 font-medium">Berlaku sampai {fmtDate(order.expiresAt)}</p>}

      <button onClick={() => setChanging(true)} className="text-sm font-bold text-gray-400 hover:text-brand-pink">
        Ganti metode pembayaran
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="font-bold text-gray-400 uppercase text-[10px] tracking-widest pt-0.5">{label}</dt>
      <dd className="font-bold text-brand-dark text-right">{value}</dd>
    </div>
  )
}

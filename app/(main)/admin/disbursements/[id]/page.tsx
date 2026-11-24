import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/currency'
import StatusBadge from '../StatusBadge'
import ReceiptActions from './ReceiptActions'

export const dynamic = 'force-dynamic'

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) : '-'

export default async function DisbursementReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: r } = await supabase.from('disbursements').select('*').eq('id', id).maybeSingle()
  if (!r) notFound()

  const fee = r.fee_amount != null ? Number(r.fee_amount) : null

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none">
        <div className={`p-8 text-center ${r.status === 'success' ? 'bg-green-50' : r.status === 'failed' ? 'bg-red-50' : 'bg-brand-yellow/10'}`}>
          <h1 className="font-heading font-extrabold text-2xl text-brand-dark mb-2">
            {r.status === 'success' ? 'Transfer Berhasil' : r.status === 'failed' ? 'Transfer Gagal' : 'Menunggu Konfirmasi'}
          </h1>
          <StatusBadge status={r.status} />
          {r.status === 'pending' && (
            <p className="text-sm text-gray-600 font-medium mt-3">
              Hasil transfer belum pasti. Gunakan <b>Cek Status</b> — jangan kirim ulang sebelum status jelas.
            </p>
          )}
          {r.status === 'failed' && r.response_message && (
            <p className="text-sm text-red-600 font-medium mt-3">{r.response_message}</p>
          )}
        </div>

        <dl className="p-8 space-y-4 text-sm">
          <Row label="No. Transaksi" value={`#${r.id.slice(0, 8).toUpperCase()}`} />
          <Row label="Waktu" value={fmt(r.completed_at || r.created_at)} />
          <Row label="Penerima" value={r.recipient_name || r.account_name || '-'} />
          <Row label="Nama Rekening" value={r.account_name || '-'} />
          <Row label="Bank" value={r.bank_name || r.bank_code} />
          <Row label="No. Rekening" value={r.account_number} />
          {r.remarks && <Row label="Catatan" value={r.remarks} />}
          {r.gdc_reference_no && <Row label="Ref. GDC" value={r.gdc_reference_no} />}
          <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
            <Row label="Nominal Transfer" value={formatRupiah(Number(r.amount))} />
            {fee != null && <Row label="Biaya Transfer" value={formatRupiah(fee)} />}
            {fee != null && (
              <div className="flex items-center justify-between pt-2">
                <dt className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Total Terpotong</dt>
                <dd className="text-2xl font-extrabold text-brand-dark">{formatRupiah(Number(r.amount) + fee)}</dd>
              </div>
            )}
          </div>
        </dl>
      </div>

      <div className="print:hidden flex flex-col sm:flex-row gap-3">
        <ReceiptActions id={r.id} pending={r.status === 'pending'} />
        <Link href="/admin/disbursements" className="flex-1 text-center border border-gray-200 bg-white font-bold text-brand-dark py-3 rounded-2xl hover:bg-gray-50">
          Kembali ke Riwayat
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="font-bold text-gray-400 uppercase text-[10px] tracking-widest pt-0.5">{label}</dt>
      <dd className="font-bold text-brand-dark text-right break-all">{value}</dd>
    </div>
  )
}

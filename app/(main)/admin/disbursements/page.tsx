import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getDepositBalance } from '@/lib/gdcpay/snap'
import { formatRupiah } from '@/lib/currency'
import DisbursementForm from './DisbursementForm'
import StatusBadge from './StatusBadge'

export const dynamic = 'force-dynamic'

export default async function AdminDisbursementsPage() {
  const supabase = await createClient()

  const [{ data: mentors }, { data: rows }, balance] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email').eq('role', 'mentor').order('full_name'),
    supabase
      .from('disbursements')
      .select('id, created_at, recipient_name, account_name, bank_name, account_number, amount, fee_amount, status')
      .order('created_at', { ascending: false })
      .limit(50),
    getDepositBalance().catch(() => null),
  ])

  const available = balance?.accountInfos?.[0]?.availableBalance?.value
  const unavailable = balance?.responseCode !== '2001100' || available === undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">Honor Mentor</h1>
          <p className="text-brand-gray text-sm">Kirim honor ke rekening mentor lewat GDCPay (disbursement).</p>
        </div>
        <div className="bg-brand-darkblue text-white p-6 rounded-3xl shadow-lg flex items-center gap-4 min-w-[300px]">
          <div className="p-3 bg-white/10 rounded-xl"><Wallet className="w-6 h-6" /></div>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider">Saldo Deposit</p>
            <h3 className="font-heading font-bold text-2xl text-brand-yellow">
              {unavailable ? '—' : formatRupiah(Number(available))}
            </h3>
          </div>
        </div>
      </div>

      <DisbursementForm mentors={(mentors as any) ?? []} />

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-heading font-bold text-lg text-brand-dark">Riwayat Transfer</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400">
              <tr>
                <th className="text-left px-6 py-3">Waktu</th>
                <th className="text-left px-6 py-3">Penerima</th>
                <th className="text-left px-6 py-3">Rekening</th>
                <th className="text-right px-6 py-3">Nominal</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(rows ?? []).map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })}
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-dark">{r.recipient_name || r.account_name}</td>
                  <td className="px-6 py-4 text-gray-500">{r.bank_name} · {r.account_number}</td>
                  <td className="px-6 py-4 text-right font-bold text-brand-dark whitespace-nowrap">{formatRupiah(Number(r.amount))}</td>
                  <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/disbursements/${r.id}`} className="text-brand-pink font-bold hover:underline">Detail</Link>
                  </td>
                </tr>
              ))}
              {(rows ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada transfer.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

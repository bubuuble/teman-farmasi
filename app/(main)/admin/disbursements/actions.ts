'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { bankAccountInquiry, getTransferDetail, transferBank } from '@/lib/gdcpay/snap'
import { DISBURSE_BANKS, DISBURSE_MAX, DISBURSE_MIN, disburseBankName } from '@/lib/gdcpay/disbursement-options'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' || profile?.role === 'superadmin' ? user : null
}

function validate(bankCode: string, accountNumber: string, amount: number): string | null {
  if (!DISBURSE_BANKS.some((b) => b.code === bankCode)) return 'Bank tidak valid.'
  if (!/^\d{5,20}$/.test(accountNumber)) return 'Nomor rekening harus berupa angka (5–20 digit).'
  if (!Number.isInteger(amount) || amount < DISBURSE_MIN || amount > DISBURSE_MAX) {
    return `Nominal harus antara Rp ${DISBURSE_MIN.toLocaleString('id-ID')} dan Rp ${DISBURSE_MAX.toLocaleString('id-ID')}.`
  }
  return null
}

/** Langkah 1: cek rekening tujuan ke GDC (menampilkan nama pemilik rekening). */
export async function inquiryRecipient(input: {
  bankCode: string
  accountNumber: string
  amount: number
}): Promise<{ accountName?: string; error?: string }> {
  if (!(await requireAdmin())) return { error: 'Tidak diizinkan.' }
  const bad = validate(input.bankCode, input.accountNumber, input.amount)
  if (bad) return { error: bad }

  try {
    const r = await bankAccountInquiry({
      partnerReferenceNo: crypto.randomUUID(),
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      amount: input.amount,
    })
    if (r?.responseCode !== '2004200' || !r.beneficiaryAccountName) {
      return { error: `Rekening tidak dapat diverifikasi: ${r?.responseMessage || 'tidak diketahui'}` }
    }
    return { accountName: r.beneficiaryAccountName }
  } catch (e: any) {
    console.error('[Disbursement] Inquiry error:', e)
    return { error: 'Layanan pembayaran sedang bermasalah. Coba lagi sebentar.' }
  }
}

/**
 * Langkah 2: kirim transfer. requestId dibuat klien sekali per form (kunci idempotensi),
 * sehingga klik ganda tidak mengirim uang dua kali.
 * Aturan status: 2xx sukses -> success; 4xx -> failed (uang tidak keluar); 5xx/timeout -> pending
 * (hasil tidak pasti, WAJIB dicek manual lewat "Cek Status", jangan kirim ulang).
 */
export async function sendDisbursement(input: {
  requestId: string
  recipientId: string | null
  recipientName: string
  bankCode: string
  accountNumber: string
  amount: number
  remarks: string
}): Promise<{ id?: string; error?: string }> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Tidak diizinkan.' }
  if (!/^[0-9a-f-]{36}$/i.test(input.requestId)) return { error: 'Permintaan tidak valid.' }
  const bad = validate(input.bankCode, input.accountNumber, input.amount)
  if (bad) return { error: bad }

  // Verifikasi ulang di server — nama pemilik rekening tidak dipercaya dari klien.
  const inq = await inquiryRecipient({ bankCode: input.bankCode, accountNumber: input.accountNumber, amount: input.amount })
  if (inq.error || !inq.accountName) return { error: inq.error || 'Rekening tidak valid.' }

  const db = createAdminClient()
  const id = input.requestId

  // Catat DULU sebagai pending. PK = requestId, jadi permintaan ganda ditolak di sini.
  const { error: insErr } = await db.from('disbursements').insert({
    id,
    recipient_id: input.recipientId || null,
    recipient_name: input.recipientName || inq.accountName,
    bank_code: input.bankCode,
    bank_name: disburseBankName(input.bankCode),
    account_number: input.accountNumber,
    account_name: inq.accountName,
    amount: input.amount,
    remarks: input.remarks || null,
    status: 'pending',
    created_by: admin.id,
  })
  if (insErr) {
    return { error: insErr.code === '23505' ? 'Transfer ini sudah diproses. Cek riwayat.' : `Gagal mencatat transfer: ${insErr.message}` }
  }

  try {
    const r = await transferBank({
      partnerReferenceNo: id,
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      amount: input.amount,
      remarks: input.remarks || 'Honor mentor',
    })
    const code = String(r?.responseCode || '')
    const patch: Record<string, any> = {
      gdc_reference_no: r?.referenceNo || null,
      response_code: code || null,
      response_message: r?.responseMessage || null,
    }
    if (code === '2004300') {
      patch.status = 'success'
      patch.completed_at = new Date().toISOString()
      // Best-effort: ambil biaya transfer dari detail transaksi
      try {
        const d = await getTransferDetail({ originalReferenceNo: r.referenceNo, originalPartnerReferenceNo: id })
        const fee = d?.additionalInfo?.feeAmount?.value
        if (fee) patch.fee_amount = Number(fee)
      } catch {}
    } else if (code.startsWith('4')) {
      patch.status = 'failed'
      patch.completed_at = new Date().toISOString()
    } // selain itu tetap 'pending' (hasil tidak pasti)
    await db.from('disbursements').update(patch).eq('id', id)
  } catch (e: any) {
    console.error('[Disbursement] Transfer error (status dibiarkan pending):', e)
    await db.from('disbursements').update({ response_message: 'Tidak ada respons dari GDC. Cek status sebelum mengirim ulang.' }).eq('id', id)
  }

  revalidatePath('/admin/disbursements')
  return { id }
}

/** Cek ulang transfer yang masih pending ke GDC (transaction-history-detail). */
export async function checkDisbursementStatus(id: string): Promise<{ status?: string; message?: string; error?: string }> {
  if (!(await requireAdmin())) return { error: 'Tidak diizinkan.' }
  const db = createAdminClient()
  const { data: row } = await db.from('disbursements').select('id, status, gdc_reference_no, created_at').eq('id', id).maybeSingle()
  if (!row) return { error: 'Transfer tidak ditemukan.' }
  if (row.status !== 'pending') return { status: row.status }

  try {
    const d = await getTransferDetail({ originalReferenceNo: row.gdc_reference_no || '', originalPartnerReferenceNo: id })
    if (d?.responseCode === '4041301') {
      // Transaksi tidak tercatat di GDC. Beri jeda 2 menit agar transfer yang masih diproses tidak salah dianggap gagal.
      const ageMs = Date.now() - new Date(row.created_at).getTime()
      if (ageMs < 120_000) {
        return { status: 'pending', message: 'GDC belum mencatat transaksi ini. Tunggu sekitar 2 menit lalu cek lagi.' }
      }
      await db.from('disbursements').update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        response_code: '4041301',
        response_message: 'Transaksi tidak tercatat di GDC — uang tidak keluar. Aman dikirim ulang.',
      }).eq('id', id)
      revalidatePath('/admin/disbursements')
      return { status: 'failed' }
    }
    if (d?.responseCode !== '2001300') {
      return { status: 'pending', message: `Gagal membaca status dari GDC (${d?.responseMessage || d?.responseCode}).` }
    }
    const s = String(d.status || '').toUpperCase()
    if (s === 'SUCCESS') {
      await db.from('disbursements').update({
        status: 'success',
        completed_at: new Date().toISOString(),
        gdc_reference_no: d.referenceNo || row.gdc_reference_no,
        fee_amount: d.additionalInfo?.feeAmount?.value ? Number(d.additionalInfo.feeAmount.value) : null,
        response_code: '2004300',
        response_message: 'Success (dikonfirmasi via detail transaksi)',
      }).eq('id', id)
      revalidatePath('/admin/disbursements')
      return { status: 'success' }
    }
    if (s === 'FAILED') {
      await db.from('disbursements').update({ status: 'failed', completed_at: new Date().toISOString(), response_message: 'Gagal (dikonfirmasi via detail transaksi)' }).eq('id', id)
      revalidatePath('/admin/disbursements')
      return { status: 'failed' }
    }
    return { status: 'pending', message: `Status di GDC: ${s || 'belum diketahui'}.` }
  } catch (e: any) {
    return { error: 'Gagal menghubungi GDC. Coba lagi.' }
  }
}

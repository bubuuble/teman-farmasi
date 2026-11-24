import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTransferDetail } from '@/lib/gdcpay/snap'
import { authorizeCallback } from '@/lib/gdcpay/inbound'

/**
 * "URL Callback Withdraw" — notifikasi hasil transfer honor (disbursement) dari GDCPay.
 * POST /api/payment/gdcpay/notify-withdraw
 * - partnerReferenceNo = disbursements.id
 * - additionalInfo.latestTransactionStatus: 00 = SUCCESS, 06 = FAILED
 * Isi callback TIDAK dipercaya begitu saja: status dikonfirmasi ulang ke GDC (transaction-history-detail).
 * Hanya baris yang masih 'pending' yang diubah.
 */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    console.log('[GDCPay Webhook Withdraw Received]:', raw)

    if (!authorizeCallback('withdraw', req, raw)) {
      return NextResponse.json({ responseCode: '4010000', responseMessage: 'Unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(raw)
    const id = body.partnerReferenceNo
    if (!id) {
      return NextResponse.json({ responseCode: '4000000', responseMessage: 'Invalid Reference No' }, { status: 400 })
    }

    const db = createAdminClient()
    const { data: row } = await db.from('disbursements').select('id, status, gdc_reference_no').eq('id', id).maybeSingle()
    // Tidak dikenal / sudah final: tetap balas sukses supaya GDC berhenti mengulang.
    if (!row || row.status !== 'pending') {
      return NextResponse.json({ responseCode: '2000000', responseMessage: 'Successful' }, { status: 200 })
    }

    const claimed = body.additionalInfo?.latestTransactionStatus
    if (claimed !== '00' && claimed !== '06') {
      return NextResponse.json({ responseCode: '2000000', responseMessage: 'Successful' }, { status: 200 })
    }

    // Konfirmasi ulang ke GDC
    const d = await getTransferDetail({
      originalReferenceNo: row.gdc_reference_no || body.additionalInfo?.transactionId || '',
      originalPartnerReferenceNo: id,
    })
    const s = String(d?.status || '').toUpperCase()
    const now = new Date().toISOString()

    if (d?.responseCode === '2001300' && s === 'SUCCESS') {
      await db
        .from('disbursements')
        .update({
          status: 'success',
          completed_at: now,
          gdc_reference_no: d.referenceNo || row.gdc_reference_no,
          fee_amount: d.additionalInfo?.feeAmount?.value ? Number(d.additionalInfo.feeAmount.value) : null,
          response_code: '2004300',
          response_message: 'Success (callback withdraw, dikonfirmasi ke GDC)',
        })
        .eq('id', id)
        .eq('status', 'pending')
    } else if (d?.responseCode === '2001300' && s === 'FAILED') {
      await db
        .from('disbursements')
        .update({ status: 'failed', completed_at: now, response_message: 'Gagal (callback withdraw, dikonfirmasi ke GDC)' })
        .eq('id', id)
        .eq('status', 'pending')
    } else {
      console.warn(`[GDCPay Webhook Withdraw] ${id}: callback=${claimed} tapi konfirmasi GDC=${s || d?.responseCode}. Dibiarkan pending.`)
    }

    return NextResponse.json({ responseCode: '2000000', responseMessage: 'Successful' }, { status: 200 })
  } catch (error: any) {
    console.error('[GDCPay Webhook Withdraw Error]:', error)
    return NextResponse.json({ responseCode: '5000000', responseMessage: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { confirmOrderPaymentWithGdc } from '@/lib/gdcpay/orders'
import { authorizeCallback } from '@/lib/gdcpay/inbound'

/**
 * Webhook Notification untuk Pembayaran Virtual Account GDCPay
 * POST /api/payment/gdcpay/notify-va
 * Format callback: https://neo-docs.gdc.co.id/documentation#snap-callback-va
 * - trxId = ID transaksi partner (kita pakai orders.id)
 * - additionalInfo.latestTransactionStatus: 00 = SUCCESS, 06 = FAILED
 * Isi callback tidak dipercaya: pembayaran dikonfirmasi ulang ke GDC sebelum order ditandai lunas.
 */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    console.log('[GDCPay Webhook VA Received]:', raw)

    if (!authorizeCallback('va', req, raw)) {
      return NextResponse.json({ responseCode: '4010000', responseMessage: 'Unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(raw)
    const orderId = body.trxId || body.partnerReferenceNo
    if (!orderId) {
      return NextResponse.json({ responseCode: '4000000', responseMessage: 'Invalid Reference No' }, { status: 400 })
    }

    if (body.additionalInfo?.latestTransactionStatus === '00') {
      const status = await confirmOrderPaymentWithGdc(orderId)
      console.log(`[GDCPay Webhook] VA order ${orderId}: konfirmasi GDC -> ${status}`)
      if (status !== 'paid' && status !== 'unknown' && status !== 'cancelled') {
        // GDC belum membenarkan pembayaran (atau data order belum lengkap): minta GDC mengulang.
        return NextResponse.json({ responseCode: '5000000', responseMessage: 'Payment not confirmed yet' }, { status: 500 })
      }
    }

    return NextResponse.json({ responseCode: '2000000', responseMessage: 'Successful' }, { status: 200 })
  } catch (error: any) {
    console.error('[GDCPay Webhook Error]:', error)
    return NextResponse.json({ responseCode: '5000000', responseMessage: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

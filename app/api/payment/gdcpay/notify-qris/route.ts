import { NextRequest, NextResponse } from 'next/server'
import { markOrderPaid } from '@/lib/gdcpay/orders'

/**
 * Webhook Notification untuk Pembayaran QRIS GDCPay
 * POST /api/payment/gdcpay/notify-qris
 * Format callback: https://neo-docs.gdc.co.id/documentation#snap-callback-qris
 * - originalPartnerReferenceNo = partnerReferenceNo saat generate (kita pakai orders.id)
 * - latestTransactionStatus: 00 = SUCCESS, 06 = FAILED
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[GDCPay Webhook QRIS Received]:', JSON.stringify(body))

    const orderId = body.originalPartnerReferenceNo || body.partnerReferenceNo
    if (!orderId) {
      return NextResponse.json({ responseCode: '4000000', responseMessage: 'Invalid Reference No' }, { status: 400 })
    }

    if (body.latestTransactionStatus === '00') {
      const paid = body.paidAmount?.value ? Number(body.paidAmount.value) : undefined
      const result = await markOrderPaid(orderId, paid)
      console.log(`[GDCPay Webhook] QRIS order ${orderId}:`, JSON.stringify(result))
    }

    return NextResponse.json({ responseCode: '2000000', responseMessage: 'Successful' }, { status: 200 })
  } catch (error: any) {
    console.error('[GDCPay Webhook Error]:', error)
    return NextResponse.json({ responseCode: '5000000', responseMessage: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

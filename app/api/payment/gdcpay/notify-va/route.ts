import { NextRequest, NextResponse } from 'next/server'
import { markOrderPaid } from '@/lib/gdcpay/orders'

/**
 * Webhook Notification untuk Pembayaran Virtual Account GDCPay
 * POST /api/payment/gdcpay/notify-va
 * Format callback: https://neo-docs.gdc.co.id/documentation#snap-callback-va
 * - trxId = ID transaksi partner (kita pakai orders.id)
 * - additionalInfo.latestTransactionStatus: 00 = SUCCESS, 06 = FAILED
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[GDCPay Webhook VA Received]:', JSON.stringify(body))

    const orderId = body.trxId || body.partnerReferenceNo
    if (!orderId) {
      return NextResponse.json({ responseCode: '4000000', responseMessage: 'Invalid Reference No' }, { status: 400 })
    }

    if (body.additionalInfo?.latestTransactionStatus === '00') {
      const paid = body.paidAmount?.value ? Number(body.paidAmount.value) : undefined
      const result = await markOrderPaid(orderId, paid)
      console.log(`[GDCPay Webhook] VA order ${orderId}:`, JSON.stringify(result))
    }

    return NextResponse.json({ responseCode: '2000000', responseMessage: 'Successful' }, { status: 200 })
  } catch (error: any) {
    console.error('[GDCPay Webhook Error]:', error)
    return NextResponse.json({ responseCode: '5000000', responseMessage: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

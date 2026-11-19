import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Webhook Notification untuk Pembayaran Virtual Account GDCPay
 * POST /api/payment/gdcpay/notify-va
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[GDCPay Webhook VA Received]:', JSON.stringify(body))

    const partnerReferenceNo = body.partnerReferenceNo || body.trxId
    const isPaid = body.paymentStatus === 'PAID' || body.paymentStatus === '00' || body.responseCode === '2002500'

    if (!partnerReferenceNo) {
      return NextResponse.json({
        responseCode: '4000000',
        responseMessage: 'Invalid Reference No'
      }, { status: 400 })
    }

    if (isPaid) {
      const supabase = createAdminClient()

      // 1. Update status order menjadi 'paid'
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .update({
          status: 'paid'
        })
        .eq('id', partnerReferenceNo)
        .select('*')
        .single()

      if (!orderErr && order) {
        console.log(`[GDCPay Webhook] VA Order ${partnerReferenceNo} berhasil di-update menjadi PAID`)

        // 2. Daftarkan murid ke kelas jika ada class_id
        if (order.class_id && order.user_id) {
          await supabase.from('enrollments').upsert({
            class_id: order.class_id,
            student_id: order.user_id,
            status: 'active'
          }, { onConflict: 'class_id,student_id' })
        }
      }
    }

    return NextResponse.json({
      responseCode: '2002500',
      responseMessage: 'Success'
    }, { status: 200 })

  } catch (error: any) {
    console.error('[GDCPay Webhook Error]:', error)
    return NextResponse.json({
      responseCode: '5000000',
      responseMessage: error.message || 'Internal Server Error'
    }, { status: 500 })
  }
}

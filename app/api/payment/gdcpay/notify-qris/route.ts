import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Webhook Notification untuk Pembayaran QRIS GDCPay
 * POST /api/payment/gdcpay/notify-qris
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[GDCPay Webhook QRIS Received]:', JSON.stringify(body))

    // Ekstrak parameter dari SNAP BI notification
    const partnerReferenceNo = body.partnerReferenceNo || body.originalPartnerReferenceNo
    const latestTransactionStatus = body.latestTransactionStatus || body.transactionStatusDesc
    const amount = body.amount?.value || body.amount

    if (!partnerReferenceNo) {
      return NextResponse.json({
        responseCode: '4000000',
        responseMessage: 'Invalid Reference No'
      }, { status: 400 })
    }

    // Status sukses biasanya '00' atau 'SUCCESS'
    const isSuccess = latestTransactionStatus === '00' || latestTransactionStatus === 'SUCCESS' || body.responseCode === '2005200'

    if (isSuccess) {
      const supabase = createAdminClient()

      // 1. Update status order menjadi 'paid'
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .update({
          status: 'paid'
        })
        .eq('id', partnerReferenceNo)
        .select('*, profiles:user_id(*)')
        .single()

      if (!orderErr && order) {
        console.log(`[GDCPay Webhook] Order ${partnerReferenceNo} berhasil di-update menjadi PAID`)

        // 2. Jika order memiliki class_id, daftarkan murid ke kelas (enrollments)
        if (order.class_id && order.user_id) {
          await supabase.from('enrollments').upsert({
            class_id: order.class_id,
            student_id: order.user_id,
            status: 'active'
          }, { onConflict: 'class_id,student_id' })
          console.log(`[GDCPay Webhook] Student ${order.user_id} otomatis di-enroll ke kelas ${order.class_id}`)
        }
      }
    }

    // Response wajib SNAP BI acknowledgement
    return NextResponse.json({
      responseCode: '2005200',
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

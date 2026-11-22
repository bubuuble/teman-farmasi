import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enrollStudentToClass } from '@/lib/enrollment/auto-enroll'

/**
 * Webhook Notification untuk Pembayaran Virtual Account GDCPay
 * POST /api/payment/gdcpay/notify-va
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[GDCPay Webhook VA Received]:', JSON.stringify(body))

    // Format callback VA GDC: trxId = ID transaksi partner; status ada di additionalInfo.latestTransactionStatus
    // (00 = SUCCESS, 06 = FAILED). Lihat https://neo-docs.gdc.co.id/documentation#snap-callback-va
    const partnerReferenceNo = body.trxId || body.partnerReferenceNo
    const isPaid = body.additionalInfo?.latestTransactionStatus === '00'

    if (!partnerReferenceNo) {
      return NextResponse.json({
        responseCode: '4000000',
        responseMessage: 'Invalid Reference No'
      }, { status: 400 })
    }

    if (isPaid) {
      const supabase = createAdminClient()

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('*, classes(id, title)')
        .eq('id', partnerReferenceNo)
        .single()

      if (!orderErr && order) {
        // 1. Update status order menjadi 'paid'
        await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', partnerReferenceNo)

        console.log(`[GDCPay Webhook] VA Order ${partnerReferenceNo} berstatus PAID`)

        // 2. AUTO-ENROLL KE KELAS (Buat kelas jika belum ada, atau masuk kelas aktif)
        if (order.user_id) {
          const classTitle = order.classes?.title || order.notes || 'Kelas Farmasi Reguler'
          await enrollStudentToClass({
            userId: order.user_id,
            classId: order.class_id || undefined,
            classTitle: classTitle
          })
          console.log(`[GDCPay Webhook] Murid ${order.user_id} berhasil di-enroll otomatis!`)
        }
      }
    }

    return NextResponse.json({
      responseCode: '2000000',
      responseMessage: 'Successful'
    }, { status: 200 })

  } catch (error: any) {
    console.error('[GDCPay Webhook Error]:', error)
    return NextResponse.json({
      responseCode: '5000000',
      responseMessage: error.message || 'Internal Server Error'
    }, { status: 500 })
  }
}

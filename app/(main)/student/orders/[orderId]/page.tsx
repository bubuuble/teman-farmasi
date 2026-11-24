import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import PaymentPanel from './PaymentPanel'

export const dynamic = 'force-dynamic'

export default async function OrderPaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // RLS: siswa hanya bisa membaca order miliknya sendiri
  const { data: order } = await supabase
    .from('orders')
    .select(`id, created_at, amount, status, notes, program_label, payment_method, payment_bank_code,
             va_number, qr_content, payment_expires_at, paid_at, classes ( title )`)
    .eq('id', orderId)
    .maybeSingle()

  if (!order) notFound()

  const qrDataUrl = order.qr_content
    ? await QRCode.toDataURL(order.qr_content, { margin: 1, width: 320, errorCorrectionLevel: 'M' })
    : null

  return (
    <PaymentPanel
      order={{
        id: order.id,
        createdAt: order.created_at,
        amount: Number(order.amount),
        status: order.status,
        label: order.program_label || (order as any).classes?.title || order.notes || 'Pesanan',
        method: order.payment_method,
        bankCode: order.payment_bank_code,
        vaNumber: order.va_number,
        qrDataUrl,
        expiresAt: order.payment_expires_at,
        paidAt: order.paid_at,
      }}
    />
  )
}

import { createAdminClient } from '@/lib/supabase/admin'
import { enrollStudentToClass } from '@/lib/enrollment/auto-enroll'
import { checkQRISStatus, checkVAStatus } from '@/lib/gdcpay/snap'

type OrderRow = {
  id: string
  status: string
  amount: number
  student_id: string
  class_id: string | null
  notes: string | null
  payment_method: string | null
  gdc_reference_no: string | null
  gdc_external_id: string | null
  va_number: string | null
  classes?: { title: string } | null
}

/**
 * Tandai order LUNAS + auto-enroll murid. Idempotent: aman dipanggil berkali-kali
 * (webhook, polling status, retry dari GDC).
 * paidAmount (opsional): bila diberikan dan kurang dari tagihan, order TIDAK ditandai lunas.
 */
export async function markOrderPaid(orderId: string, paidAmount?: number) {
  const db = createAdminClient()

  const { data: order } = await db
    .from('orders')
    .select('id, status, amount, student_id, class_id, notes, classes(title)')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) return { ok: false as const, reason: 'order_not_found' }
  if (order.status === 'paid') return { ok: true as const, already: true }
  if (order.status === 'cancelled') return { ok: false as const, reason: 'order_cancelled' }

  if (paidAmount !== undefined && paidAmount + 0.5 < Number(order.amount)) {
    console.warn(`[GDCPay] Order ${orderId} dibayar kurang: ${paidAmount} < ${order.amount}`)
    return { ok: false as const, reason: 'underpaid' }
  }

  // Update bersyarat supaya hanya satu pemanggil yang "menang" bila ada callback ganda.
  const { data: updated } = await db
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('status', 'pending')
    .select('id')

  if (updated && updated.length > 0 && order.student_id) {
    const classTitle = (order as any).classes?.title || order.notes || 'Kelas Farmasi Reguler'
    try {
      await enrollStudentToClass({
        userId: order.student_id,
        classId: order.class_id || undefined,
        classTitle,
      })
    } catch (e: any) {
      console.error('[GDCPay] Gagal auto-enroll setelah pembayaran:', e.message)
    }
  }
  return { ok: true as const, already: false }
}

/**
 * Dipakai webhook: konfirmasi pembayaran langsung ke GDC (bukan percaya isi callback), lalu tandai lunas.
 * Mengembalikan 'paid' bila terkonfirmasi, selain itu status order saat ini ('unknown' bila order tidak ada).
 */
export async function confirmOrderPaymentWithGdc(orderId: string): Promise<string> {
  const db = createAdminClient()
  const { data: order } = await db
    .from('orders')
    .select('id, status, amount, student_id, class_id, notes, payment_method, gdc_reference_no, gdc_external_id, va_number')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return 'unknown'
  return syncOrderPayment(order as OrderRow)
}

/** Cek status ke GDC untuk order pending, dan tandai lunas bila sudah dibayar. Mengembalikan status order terbaru. */
export async function syncOrderPayment(order: OrderRow): Promise<string> {
  if (order.status !== 'pending') return order.status

  try {
    if (order.payment_method === 'qris' && order.gdc_reference_no && order.gdc_external_id) {
      const r = await checkQRISStatus({
        originalReferenceNo: order.gdc_reference_no,
        originalPartnerReferenceNo: order.id,
        originalExternalId: order.gdc_external_id,
      })
      if (r?.latestTransactionStatus === '00') {
        const paid = r.amount?.value ? Number(r.amount.value) : undefined
        await markOrderPaid(order.id, paid)
        return 'paid'
      }
    } else if (order.payment_method === 'va' && order.va_number && order.gdc_reference_no) {
      const r = await checkVAStatus({ virtualAccountNo: order.va_number, paymentRequestId: order.gdc_reference_no })
      if (r?.virtualAccountData?.paymentFlagStatus === '00') {
        const paid = r.virtualAccountData?.totalAmount?.value ? Number(r.virtualAccountData.totalAmount.value) : undefined
        await markOrderPaid(order.id, paid)
        return 'paid'
      }
    }
  } catch (e: any) {
    console.error('[GDCPay] Gagal sinkron status pembayaran:', e.message)
  }
  return order.status
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveCheckoutItem } from '@/lib/checkout-catalog'
import { ensureClassByTitle } from '@/lib/enrollment/auto-enroll'
import { createVirtualAccount, generateQRIS } from '@/lib/gdcpay/snap'
import { syncOrderPayment } from '@/lib/gdcpay/orders'
import { VA_BANKS, type PaymentMethod } from '@/lib/gdcpay/payment-options'

type Result = { error?: string; orderId?: string }

const QRIS_VALID_MINUTES = 30
const VA_VALID_HOURS = 24

async function requireStudent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Silakan login terlebih dahulu.' as const }
  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'student') return { error: 'Pembelian online hanya untuk akun siswa.' as const }
  return { user, fullName: profile.full_name as string | null }
}

/** Buat pembayaran GDC (QRIS / VA) untuk order milik siswa yang sedang login. */
export async function startPayment(orderId: string, method: PaymentMethod, bankCode?: string): Promise<Result> {
  const auth = await requireStudent()
  if ('error' in auth) return { error: auth.error }

  const db = createAdminClient()
  const { data: order } = await db
    .from('orders')
    .select('id, student_id, amount, status, payment_method, payment_expires_at')
    .eq('id', orderId)
    .maybeSingle()

  if (!order || order.student_id !== auth.user.id) return { error: 'Tagihan tidak ditemukan.' }
  if (order.status !== 'pending') return { error: 'Tagihan ini sudah tidak menunggu pembayaran.' }

  // Pembayaran yang sama & belum kedaluwarsa dipakai ulang (hindari QR/VA ganda).
  if (
    order.payment_method === method &&
    order.payment_expires_at &&
    new Date(order.payment_expires_at).getTime() > Date.now()
  ) {
    return { orderId }
  }

  const amount = Number(order.amount)
  if (!(amount > 0)) return { error: 'Nominal tagihan tidak valid.' }

  try {
    if (method === 'qris') {
      const r = await generateQRIS({ partnerReferenceNo: orderId, amount })
      if (r?.responseCode !== '2004700' || !r.qrContent) {
        console.error('[Checkout] Generate QRIS gagal:', JSON.stringify(r))
        return { error: `Gagal membuat QRIS: ${r?.responseMessage || 'tidak diketahui'}` }
      }
      await db.from('orders').update({
        payment_method: 'qris',
        payment_bank_code: null,
        gdc_reference_no: r.referenceNo,
        gdc_external_id: r._externalId,
        qr_content: r.qrContent,
        va_number: null,
        payment_expires_at: new Date(Date.now() + QRIS_VALID_MINUTES * 60_000).toISOString(),
      }).eq('id', orderId)
    } else {
      const bank = VA_BANKS.find((b) => b.code === bankCode)?.code ?? VA_BANKS[0].code
      const r = await createVirtualAccount({
        trxId: orderId,
        customerName: auth.fullName || 'Siswa Teman Farmasi',
        amount,
        bankCode: bank,
        validityHours: VA_VALID_HOURS,
      })
      const va = r?.virtualAccountData
      if (r?.responseCode !== '2002700' || !va?.virtualAccountNo) {
        console.error('[Checkout] Create VA gagal:', JSON.stringify(r))
        return { error: `Gagal membuat Virtual Account: ${r?.responseMessage || 'tidak diketahui'}` }
      }
      await db.from('orders').update({
        payment_method: 'va',
        payment_bank_code: bank,
        gdc_reference_no: va.additionalInfo?.referenceNo ?? null,
        gdc_external_id: r._externalId,
        va_number: va.virtualAccountNo,
        qr_content: null,
        payment_expires_at: new Date(Date.now() + VA_VALID_HOURS * 3600_000).toISOString(),
      }).eq('id', orderId)
    }
  } catch (e: any) {
    console.error('[Checkout] Error GDC:', e)
    return { error: 'Layanan pembayaran sedang bermasalah. Coba lagi sebentar.' }
  }

  return { orderId }
}

/** Checkout dari katalog (homepage/programs): buat order lalu langsung buat pembayarannya. */
export async function createCheckoutOrder(
  category: string,
  itemKey: string,
  method: PaymentMethod,
  bankCode?: string
): Promise<Result> {
  const auth = await requireStudent()
  if ('error' in auth) return { error: auth.error }

  const item = await resolveCheckoutItem(category, itemKey)
  if (!item) return { error: 'Program tidak ditemukan atau belum bisa dibeli online.' }

  const db = createAdminClient()
  const classId = await ensureClassByTitle(item.classTitle)

  // Sudah terdaftar & lunas di kelas ini? Tidak perlu beli lagi.
  const { data: enrolled } = await db
    .from('enrollments').select('id').eq('class_id', classId).eq('student_id', auth.user.id).maybeSingle()
  if (enrolled) return { error: 'Kamu sudah terdaftar di kelas ini.' }

  // Pakai ulang tagihan pending untuk kelas yang sama.
  const { data: pending } = await db
    .from('orders').select('id')
    .eq('student_id', auth.user.id).eq('class_id', classId).eq('status', 'pending')
    .order('created_at', { ascending: false }).limit(1)

  let orderId = pending?.[0]?.id as string | undefined
  if (!orderId) {
    const { data: created, error } = await db.from('orders').insert({
      student_id: auth.user.id,
      class_id: classId,
      amount: item.amount, // dari katalog server, bukan dari klien
      status: 'pending',
      notes: item.subtitle ? `${item.title} (${item.subtitle})` : item.title,
      program_label: item.subtitle ? `${item.title} - ${item.subtitle}` : item.title,
    }).select('id').single()
    if (error || !created) return { error: `Gagal membuat pesanan: ${error?.message}` }
    orderId = created.id
  }

  return startPayment(orderId!, method, bankCode)
}

/** Dipakai polling di halaman bayar: sinkron ke GDC bila pending, balikkan status terbaru. */
export async function refreshOrderStatus(orderId: string): Promise<{ status?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi berakhir.' }

  const db = createAdminClient()
  const { data: order } = await db
    .from('orders')
    .select('id, status, amount, student_id, class_id, notes, payment_method, gdc_reference_no, gdc_external_id, va_number')
    .eq('id', orderId)
    .maybeSingle()
  if (!order || order.student_id !== user.id) return { error: 'Tagihan tidak ditemukan.' }

  return { status: await syncOrderPayment(order as any) }
}

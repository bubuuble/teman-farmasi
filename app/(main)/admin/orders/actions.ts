// app/(main)/admin/orders/actions.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { enrollStudentToClass } from "@/lib/enrollment/auto-enroll"

export type ActionState = {
  error?: string
  success?: string
}

// 1. Buat Order Baru
export async function createOrder(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const studentId = formData.get('studentId') as string
  const classId = formData.get('classId') as string
  const amount = formData.get('amount') as string
  const notes = formData.get('notes') as string

  if (!studentId || !classId || !amount) {
    return { error: "Data tidak lengkap (Student, Kelas, dan Harga wajib diisi)" }
  }

  const { error } = await supabase.from('orders').insert({
    student_id: studentId,
    class_id: classId,
    amount: Number(amount),
    status: 'pending',
    notes: notes
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/orders')
  return { success: "Order berhasil dibuat!" }
}

// 2. Update Status Order (Dengan Auto-Enrollment saat Admin konfirmasi LUNAS)
export async function updateOrderStatus(orderId: string, newStatus: string, classId: string, studentId: string) {
  const adminDb = createAdminClient()

  // Update Status Order
  const { data: order, error } = await adminDb
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .select('*, classes(title)')
    .single()

  if (error) return { error: error.message }

  // Jika status diubah menjadi 'paid', otomatis enroll murid ke kelas
  if (newStatus === 'paid' && studentId) {
    try {
      const classTitle = order?.classes?.title || order?.notes || 'Kelas Farmasi Reguler'
      await enrollStudentToClass({
        userId: studentId,
        classId: classId || undefined,
        classTitle: classTitle
      })
      console.log(`[Admin Order Action] User ${studentId} otomatis di-enroll ke kelas ${classTitle}`)
    } catch (enrollErr: any) {
      console.error('[Admin Order Action] Gagal auto-enroll:', enrollErr.message)
    }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/student/classes')
  return { success: "Status pesanan diperbarui & murid otomatis didaftarkan ke kelas!" }
}

// 3. Hapus Order
export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  if (error) return { error: error.message }
  revalidatePath('/admin/orders')
  return { success: "Order dihapus" }
}

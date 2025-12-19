// app/(main)/admin/orders/actions.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
    return { error: "Data tidak lengkap (Siswa, Kelas, dan Harga wajib diisi)" }
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

// 2. Update Status Order
export async function updateOrderStatus(orderId: string, newStatus: string, classId: string, studentId: string) {
  const supabase = await createClient()

  // Update Status
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) return { error: error.message }

  // LOGIC PINTAR: Jika status jadi PAID, otomatis enroll siswa ke kelas
  if (newStatus === 'paid') {
    // Cek dulu udah enroll belum?
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .single()

    // Kalau belum, masukkan!
    if (!existing) {
      await supabase.from('enrollments').insert({
        class_id: classId,
        student_id: studentId,
        status: 'active'
      })
    }
  }

  revalidatePath('/admin/orders')
  return { success: "Status diperbarui" }
}

// 3. Hapus Order
export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  if (error) return { error: error.message }
  revalidatePath('/admin/orders')
  return { success: "Order dihapus" }
}
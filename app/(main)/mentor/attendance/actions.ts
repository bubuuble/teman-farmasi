'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type AttendanceData = {
  session_id: string
  student_id: string
  status: 'present' | 'late' | 'permission' | 'absent'
}

export async function saveAttendance(records: AttendanceData[]) {
  const supabase = await createClient()

  if (!records || records.length === 0) return { error: "Tidak ada data untuk disimpan" }

  const { error } = await supabase
    .from('attendance_records')
    .upsert(records, { onConflict: 'session_id, student_id' })

  if (error) {
    return { error: "Gagal menyimpan absensi: " + error.message }
  }

  revalidatePath('/mentor/attendance')
  return { success: "Data absensi berhasil disimpan!" }
}

export async function toggleSessionOpen(sessionId: string, isOpen: boolean) {
  const supabase = await createClient()
  
  // FIX: Definisikan tipe object secara eksplisit, jangan 'any'
  const updateData: { is_open: boolean; mentor_status?: 'present' } = { is_open: isOpen }
  
  if (isOpen) {
    updateData.mentor_status = 'present'
  }

  const { error } = await supabase
    .from('attendance_sessions')
    .update(updateData)
    .eq('id', sessionId)

  if (error) return { error: error.message }
  
  revalidatePath('/mentor/attendance')
  return { success: isOpen ? "Absensi Dibuka & Mentor Tercatat Hadir" : "Absensi Ditutup" }
}

export async function saveManualAttendance(sessionId: string, attendanceData: { studentId: string, status: string }[]) {
  const supabase = await createClient()

  // Gunakan upsert: jika sudah ada update, jika belum insert
  const records = attendanceData.map(item => ({
    session_id: sessionId,
    student_id: item.studentId,
    status: item.status,
    notes: 'Manual input by Mentor'
  }))

  const { error } = await supabase
    .from('attendance_records')
    .upsert(records, { onConflict: 'session_id, student_id' })

  if (error) return { error: error.message }

  revalidatePath('/admin/attendances/siswa')
  return { success: "Data absensi berhasil disimpan!" }
}

export async function toggleSessionStatus(sessionId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('attendance_sessions')
    .update({ is_open: !currentStatus })
    .eq('id', sessionId)

  if (error) return { error: error.message }
  revalidatePath('/mentor/attendance')
  return { success: `Link absensi sekarang ${!currentStatus ? 'Terbuka' : 'Tertutup'}` }
}

export async function updateSingleAttendance(sessionId: string, studentId: string, status: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('attendance_records')
    .upsert({
      session_id: sessionId,
      student_id: studentId,
      status: status,
      notes: 'Updated by Mentor'
    }, { onConflict: 'session_id, student_id' })

  if (error) return { error: error.message }
  revalidatePath('/admin/attendances/siswa')
  return { success: true }
}


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

  console.log('[SaveAttendance] Memulai save...')
  console.log('[SaveAttendance] Jumlah records:', records?.length || 0)
  console.log('[SaveAttendance] Records:', JSON.stringify(records, null, 2))

  if (!records || records.length === 0) {
    console.log('[SaveAttendance] Tidak ada data untuk disimpan')
    return { error: "Tidak ada data untuk disimpan" }
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(records, { onConflict: 'session_id, student_id' })
    .select()

  if (error) {
    console.error('[SaveAttendance] ERROR:', error.message)
    console.error('[SaveAttendance] Error Code:', error.code)
    console.error('[SaveAttendance] Error Details:', JSON.stringify(error, null, 2))
    return { error: "Gagal menyimpan absensi: " + error.message }
  }

  console.log('[SaveAttendance] Berhasil! Data:', data)
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

  console.log('[SaveManualAttendance] Memulai save...')
  console.log('[SaveManualAttendance] Session ID:', sessionId)
  console.log('[SaveManualAttendance] Jumlah data:', attendanceData.length)
  console.log('[SaveManualAttendance] Data:', JSON.stringify(attendanceData, null, 2))

  // Gunakan upsert: jika sudah ada update, jika belum insert
  const records = attendanceData.map(item => ({
    session_id: sessionId,
    student_id: item.studentId,
    status: item.status,
    notes: 'Manual input by Mentor'
  }))

  console.log('[SaveManualAttendance] Records untuk upsert:', JSON.stringify(records, null, 2))

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(records, { onConflict: 'session_id, student_id' })
    .select()

  if (error) {
    console.error('[SaveManualAttendance] ERROR:', error.message)
    console.error('[SaveManualAttendance] Error Code:', error.code)
    console.error('[SaveManualAttendance] Error Details:', JSON.stringify(error, null, 2))
    return { error: error.message }
  }

  console.log('[SaveManualAttendance] Berhasil! Data tersimpan:', data)
  revalidatePath('/admin/attendances/siswa')
  revalidatePath('/mentor/attendance')
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
  
  console.log('[UpdateAttendance] Memulai update...')
  console.log('[UpdateAttendance] Session ID:', sessionId)
  console.log('[UpdateAttendance] Student ID:', studentId)
  console.log('[UpdateAttendance] Status:', status)

  const recordData = {
    session_id: sessionId,
    student_id: studentId,
    status: status,
    notes: 'Updated by Mentor'
  }

  console.log('[UpdateAttendance] Data yang akan diupsert:', JSON.stringify(recordData, null, 2))

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(recordData, { onConflict: 'session_id, student_id' })
    .select()

  if (error) {
    console.error('[UpdateAttendance] ERROR:', error.message)
    console.error('[UpdateAttendance] Error Code:', error.code)
    console.error('[UpdateAttendance] Error Details:', JSON.stringify(error, null, 2))
    return { error: error.message }
  }

  console.log('[UpdateAttendance] Berhasil! Data:', data)
  revalidatePath('/admin/attendances/siswa')
  revalidatePath('/mentor/attendance')
  return { success: true }
}


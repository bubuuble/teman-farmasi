// app/(main)/admin/attendances/page.tsx
import { redirect } from 'next/navigation'

export default function AttendanceIndexPage() {
  // Langsung lempar ke halaman siswa saat menu sidebar diklik
  redirect('/admin/attendances/student')
}
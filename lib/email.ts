import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendSessionEmailParams {
  toEmails: string[]
  classTitle: string
  sessionTitle: string
  sessionDateTime: string
}

export async function sendNewSessionNotification({
  toEmails,
  classTitle,
  sessionTitle,
  sessionDateTime,
}: SendSessionEmailParams) {
  if (toEmails.length === 0) return { success: true, message: 'No recipients.' }

  // Format date and time nicely
  let formattedDate = sessionDateTime
  let formattedTime = ''
  try {
    const d = new Date(sessionDateTime)
    formattedDate = d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    formattedTime = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' WIB'
  } catch (e) {
    // Fallback
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Teman Farmasi <onboarding@resend.dev>',
      to: toEmails,
      subject: `[Teman Farmasi] Sesi Baru Dijadwalkan: ${sessionTitle} - ${classTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin: 0;">Teman Farmasi</h1>
            <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Platform Mentoring Apoteker Terbaik</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />
          
          <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Halo Rekan Apoteker,</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
            Mentor Anda baru saja menjadwalkan sesi belajar baru untuk kelas yang Anda ikuti. Berikut adalah detail jadwal sesinya:
          </p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 120px; vertical-align: top;">Nama Kelas</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600; vertical-align: top;">: ${classTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Nama Sesi</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600; vertical-align: top;">: ${sessionTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Hari & Tanggal</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600; vertical-align: top;">: ${formattedDate}</td>
              </tr>
              ${formattedTime ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Waktu / Jam</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600; vertical-align: top;">: ${formattedTime}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
            Silakan masuk ke Dashboard Teman Farmasi untuk mengakses tautan pertemuan (Zoom/Meet) dan melakukan presensi saat kelas berlangsung.
          </p>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://teman-farmasi-web.vercel.app'}" 
               style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;"
            >
              Buka Dashboard Kelas
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-top: 24px; margin-bottom: 16px;" />
          <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
            Ini adalah email otomatis dari platform Teman Farmasi. Jangan membalas email ini secara langsung.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending email via Resend:', error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    console.error('Failed to send session notification email:', err)
    return { error: err.message }
  }
}

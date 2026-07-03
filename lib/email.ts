import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendSessionEmailParams {
  toEmails: string[]
  classTitle: string
  sessionTitle: string
  sessionDateTime: string
  zoomLink?: string | null
  isRevision?: boolean
  sessionNumber?: number
  totalSessions?: string
}

export async function sendNewSessionNotification({
  toEmails,
  classTitle,
  sessionTitle,
  sessionDateTime,
  zoomLink,
  isRevision = false,
  sessionNumber,
  totalSessions,
}: SendSessionEmailParams) {
  if (toEmails.length === 0) return { success: true, message: 'No recipients.' }

  // Format date nicely
  let formattedDate = sessionDateTime
  try {
    const d = new Date(sessionDateTime)
    formattedDate = d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (e) {
    // Fallback
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://temanfarmasi.com'

  let sessionNumberRow = ''
  if (sessionNumber) {
    sessionNumberRow = `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Pertemuan</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 600; vertical-align: top;">: Ke-${sessionNumber} dari ${totalSessions || '-'} Pertemuan</td>
              </tr>
    `
  }

  let zoomRow = ''
  if (zoomLink) {
    zoomRow = `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Link Sesi</td>
                <td style="padding: 6px 0; color: #0d9488; font-weight: 600; vertical-align: top;">: <a href="${zoomLink}" style="color: #0d9488; text-decoration: underline;">${zoomLink}</a></td>
              </tr>
    `
  }

  const introText = isRevision
    ? 'Mentor Anda baru saja memperbarui detail jadwal untuk sesi belajar berikut. Silakan periksa kembali detail terbarunya:'
    : 'Mentor Anda baru saja menjadwalkan sesi belajar baru untuk kelas yang Anda ikuti. Berikut adalah detail jadwal sesinya:'

  const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin: 0;">Teman Farmasi</h1>
            <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Platform Mentoring Apoteker Terbaik</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />
          
          <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Halo Student,</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
            ${introText}
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
              ${sessionNumberRow}
              ${zoomRow}
            </table>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
            Silakan masuk ke Dashboard Teman Farmasi untuk mengakses tautan pertemuan (Zoom/Meet) dan melakukan presensi saat kelas berlangsung.
          </p>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${appUrl}" 
               style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block; margin-right: 8px; margin-bottom: 8px;"
            >
              Buka Dashboard Kelas
            </a>
            ${zoomLink ? `
            <a href="${zoomLink}" 
               style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block; margin-bottom: 8px;"
            >
              Gabung Pertemuan
            </a>
            ` : ''}
          </div>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-top: 24px; margin-bottom: 16px;" />
          <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
            Ini adalah email otomatis dari platform Teman Farmasi. Jangan membalas email ini secara langsung.
          </p>
        </div>
  `

  const subjectPrefix = isRevision ? 'REVISI JADWAL SESI' : 'Sesi Baru Dijadwalkan'

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Teman Farmasi <onboarding@resend.dev>',
      to: toEmails,
      subject: `[Teman Farmasi] ${subjectPrefix}: ${sessionTitle} - ${classTitle}`,
      html: htmlContent,
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

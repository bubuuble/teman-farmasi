import { NextRequest, NextResponse } from 'next/server'
import { callbackEnforced, issueInboundToken, TOKEN_TTL_SECONDS } from '@/lib/gdcpay/inbound'

/**
 * "URL Token B2B" yang diisi di dashboard GDC.
 * GDC memanggil endpoint ini untuk mendapat token, lalu memakainya sebagai Bearer saat mengirim callback.
 * POST /api/payment/gdcpay/token
 * Respons mengikuti format SNAP: 2007300 = sukses.
 *
 * Mode log: token tetap diterbitkan walau header tidak lengkap (hanya dicatat),
 * karena kunci/skema signature dari sisi GDC belum terkonfirmasi.
 */
export async function POST(req: NextRequest) {
  const clientKey = req.headers.get('x-client-key') || req.headers.get('client-key') || ''
  const hasSignature = !!req.headers.get('x-signature')
  const hasTimestamp = !!req.headers.get('x-timestamp')
  console.log(
    `[GDCPay Token B2B] requested clientKey=${clientKey ? 'present' : 'missing'} signature=${hasSignature} timestamp=${hasTimestamp}`
  )

  if (callbackEnforced() && (!clientKey || !hasSignature || !hasTimestamp)) {
    return NextResponse.json({ responseCode: '4007300', responseMessage: 'Invalid mandatory field' }, { status: 400 })
  }

  return NextResponse.json(
    {
      responseCode: '2007300',
      responseMessage: 'Successful',
      accessToken: issueInboundToken(),
      tokenType: 'Bearer',
      expiresIn: String(TOKEN_TTL_SECONDS),
    },
    { status: 200 }
  )
}

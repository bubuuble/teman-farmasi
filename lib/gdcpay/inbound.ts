import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { gdcpayConfig, generateSymmetricSignature } from '@/lib/gdcpay/snap'

/**
 * Autentikasi callback MASUK dari GDCPay (VA, QRIS, Withdraw).
 *
 * Alur SNAP: GDC meminta token ke "URL Token B2B" milik kita, lalu memanggil callback
 * dengan `Authorization: Bearer <token>` + `X-SIGNATURE`.
 *
 * Mode LOG (default): hasil validasi hanya dicatat di log, callback TIDAK ditolak.
 * Set GDCPAY_CALLBACK_ENFORCE=true untuk menolak callback yang gagal validasi
 * (aktifkan setelah terbukti di sandbox bahwa callback asli lolos).
 */

export const TOKEN_TTL_SECONDS = 900

export const callbackEnforced = () => process.env.GDCPAY_CALLBACK_ENFORCE === 'true'

const b64url = (buf: Buffer | string) => Buffer.from(buf).toString('base64url')

function tokenSecret(): string {
  // Dipisah dari clientSecret mentah supaya token tidak bisa dipakai di tempat lain.
  return crypto.createHash('sha256').update(`gdcpay-inbound:${gdcpayConfig.clientSecret}`).digest('hex')
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', tokenSecret()).update(payload).digest('base64url')
}

/** Buat token B2B milik kita (stateless, ditandatangani HMAC, kedaluwarsa 15 menit). */
export function issueInboundToken(): string {
  const payload = b64url(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS, n: crypto.randomUUID() }))
  return `${payload}.${sign(payload)}`
}

export function verifyInboundToken(token: string): boolean {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = sign(payload)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export type InboundAuthResult = { bearerOk: boolean; signatureOk: boolean; reasons: string[] }

/**
 * Validasi header callback. `rawBody` harus string mentah dari request (bukan hasil JSON.stringify ulang).
 * Signature diperiksa dengan skema simetris SNAP (HMAC-SHA512, client secret); docs GDC belum
 * memastikan skema ini berlaku untuk callback, jadi hasilnya hanya dicatat sampai terbukti.
 */
export function checkInboundAuth(req: NextRequest, rawBody: string): InboundAuthResult {
  const reasons: string[] = []

  const auth = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  const bearerOk = !!token && verifyInboundToken(token)
  if (!bearerOk) reasons.push(token ? 'bearer_invalid_or_expired' : 'bearer_missing')

  const timestamp = req.headers.get('x-timestamp') || ''
  const signature = req.headers.get('x-signature') || ''
  let signatureOk = false
  if (signature && timestamp) {
    const expected = generateSymmetricSignature({
      httpMethod: 'POST',
      endpointUrl: new URL(req.url).pathname,
      accessToken: token,
      requestBody: rawBody,
      timestamp,
      clientSecret: gdcpayConfig.clientSecret,
    })
    signatureOk = expected === signature
  }
  if (!signatureOk) reasons.push(signature ? 'signature_mismatch' : 'signature_missing')

  return { bearerOk, signatureOk, reasons }
}

/**
 * Catat hasil validasi. Mengembalikan true bila callback boleh diproses:
 * selalu true di mode log; di mode enforce hanya bila Bearer valid.
 * (Signature belum diwajibkan karena skemanya belum terkonfirmasi.)
 */
export function authorizeCallback(label: string, req: NextRequest, rawBody: string): boolean {
  const r = checkInboundAuth(req, rawBody)
  const status = r.bearerOk && r.signatureOk ? 'OK' : `FAIL(${r.reasons.join(',')})`
  console.log(`[GDCPay Callback Auth] ${label}: ${status} enforce=${callbackEnforced()} path=${new URL(req.url).pathname}`)
  return callbackEnforced() ? r.bearerOk : true
}

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

/**
 * Konfigurasi GDCPay dari Environment
 */
export const gdcpayConfig = {
  baseUrl: process.env.GDCPAY_BASE_URL || 'https://neo-sandbox-api.gdc.co.id/snap',
  clientId: process.env.GDCPAY_CLIENT_ID || '',
  clientSecret: process.env.GDCPAY_CLIENT_SECRET || '',
  partnerId: process.env.GDCPAY_PARTNER_ID || '',
  apiKey: process.env.GDCPAY_API_KEY || '',
  secretKey: process.env.GDCPAY_SECRET_KEY || '',
  getPrivateKey: () => {
    // Coba baca dari file jika ada
    const keyPath = process.env.GDCPAY_PRIVATE_KEY_PATH || 'credentials/gdcpay/gdcpay_private_key.pem'
    const resolved = path.resolve(keyPath)
    if (fs.existsSync(resolved)) {
      return fs.readFileSync(resolved, 'utf8')
    }
    // Fallback dari env var string langsung (misal untuk deployment Vercel)
    if (process.env.GDCPAY_PRIVATE_KEY) {
      return process.env.GDCPAY_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
    throw new Error('GDCPay Private Key tidak ditemukan di server.')
  }
}

/**
 * Format timestamp ISO 8601 dengan timezone offset (+07:00 WIB)
 * Standar SNAP BI: YYYY-MM-DDTHH:mm:ss+07:00
 */
export function getSnapTimestamp(): string {
  const now = new Date()
  const offsetMinutes = 7 * 60 // WIB UTC+7
  const localTime = new Date(now.getTime() + offsetMinutes * 60 * 1000)
  const iso = localTime.toISOString().replace('Z', '+07:00')
  return iso
}

/**
 * Generate Asymmetric Signature (SHA256withRSA)
 * String to sign: stringToSign = client_id + "|" + X-TIMESTAMP
 */
export function generateAsymmetricSignature(clientId: string, timestamp: string, privateKeyPem: string): string {
  const stringToSign = `${clientId}|${timestamp}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(stringToSign)
  signer.end()
  return signer.sign(privateKeyPem, 'base64')
}

/**
 * Generate Symmetric Signature (HMAC-SHA512)
 * String to sign: HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + Lowercase(Hex(SHA256(Minify(RequestBody)))) + ":" + X-TIMESTAMP
 */
export function generateSymmetricSignature({
  httpMethod,
  endpointUrl,
  accessToken,
  requestBody,
  timestamp,
  clientSecret
}: {
  httpMethod: string
  endpointUrl: string
  accessToken: string
  requestBody: any
  timestamp: string
  clientSecret: string
}): string {
  // Minify JSON body
  const bodyString = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody || {})
  const bodyHashHex = crypto.createHash('sha256').update(bodyString).digest('hex').toLowerCase()

  const stringToSign = `${httpMethod.toUpperCase()}:${endpointUrl}:${accessToken}:${bodyHashHex}:${timestamp}`

  return crypto
    .createHmac('sha512', clientSecret)
    .update(stringToSign)
    .digest('base64')
}

/**
 * 1. Mendapatkan B2B Access Token dari GDCPay
 * Endpoint: POST /v1.0/access-token/b2b
 */
export async function getB2BAccessToken(customClientId?: string): Promise<{
  responseCode: string
  responseMessage: string
  accessToken?: string
  tokenType?: string
  expiresIn?: number
}> {
  const clientId = customClientId || gdcpayConfig.clientId
  const timestamp = getSnapTimestamp()
  const privateKey = gdcpayConfig.getPrivateKey()
  const signature = generateAsymmetricSignature(clientId, timestamp, privateKey)

  const url = `${gdcpayConfig.baseUrl.replace(/\/$/, '')}/v1.0/access-token/b2b`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-TIMESTAMP': timestamp,
    'X-CLIENT-KEY': clientId,
    'Client-Key': clientId,
    'X-SIGNATURE': signature
  }

  const body = {
    grantType: 'client_credentials'
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  const json = await res.json()
  return json
}

/**
 * 2. Generate QRIS Dynamic
 * Endpoint: POST /v1.0/qr/qr-mpm-generate
 */
export async function generateQRIS({
  partnerReferenceNo,
  amount,
  validityPeriod = 1800, // 30 menit
  merchantName = 'Teman Farmasi'
}: {
  partnerReferenceNo: string
  amount: number
  validityPeriod?: number
  merchantName?: string
}) {
  const tokenData = await getB2BAccessToken()
  if (!tokenData.accessToken) {
    throw new Error(`Gagal mendapatkan token GDCPay: ${tokenData.responseMessage}`)
  }

  const endpointUrl = '/v1.0/qr/qr-mpm-generate'
  const timestamp = getSnapTimestamp()
  const externalId = Date.now().toString()

  const requestBody = {
    partnerReferenceNo,
    amount: {
      value: amount.toFixed(2),
      currency: 'IDR'
    },
    merchantName,
    validityPeriod: new Date(Date.now() + validityPeriod * 1000).toISOString()
  }

  const signature = generateSymmetricSignature({
    httpMethod: 'POST',
    endpointUrl,
    accessToken: tokenData.accessToken,
    requestBody,
    timestamp,
    clientSecret: gdcpayConfig.clientSecret
  })

  const url = `${gdcpayConfig.baseUrl.replace(/\/$/, '')}${endpointUrl}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenData.accessToken}`,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-PARTNER-ID': gdcpayConfig.partnerId,
      'X-EXTERNAL-ID': externalId
    },
    body: JSON.stringify(requestBody)
  })

  return await res.json()
}

/**
 * 3. Create Virtual Account
 * Endpoint: POST /v1.0/transfer-va/create-va
 */
export async function createVirtualAccount({
  partnerReferenceNo,
  customerName,
  customerEmail,
  amount,
  bankCode = 'BCA', // BCA, MANDIRI, BRI, BNI
  validityHours = 24
}: {
  partnerReferenceNo: string
  customerName: string
  customerEmail?: string
  amount: number
  bankCode?: string
  validityHours?: number
}) {
  const tokenData = await getB2BAccessToken()
  if (!tokenData.accessToken) {
    throw new Error(`Gagal mendapatkan token GDCPay: ${tokenData.responseMessage}`)
  }

  const endpointUrl = '/v1.0/transfer-va/create-va'
  const timestamp = getSnapTimestamp()
  const externalId = Date.now().toString()

  const expiryDate = new Date(Date.now() + validityHours * 3600 * 1000).toISOString()

  const requestBody = {
    partnerReferenceNo,
    customerName,
    customerEmail,
    bankCode,
    totalAmount: {
      value: amount.toFixed(2),
      currency: 'IDR'
    },
    expiredDate: expiryDate
  }

  const signature = generateSymmetricSignature({
    httpMethod: 'POST',
    endpointUrl,
    accessToken: tokenData.accessToken,
    requestBody,
    timestamp,
    clientSecret: gdcpayConfig.clientSecret
  })

  const url = `${gdcpayConfig.baseUrl.replace(/\/$/, '')}${endpointUrl}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenData.accessToken}`,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-PARTNER-ID': gdcpayConfig.partnerId,
      'X-EXTERNAL-ID': externalId
    },
    body: JSON.stringify(requestBody)
  })

  return await res.json()
}

/**
 * 4. Check Status QRIS
 * Endpoint: POST /v1.0/qr/qr-mpm-query
 */
export async function checkQRISStatus(partnerReferenceNo: string) {
  const tokenData = await getB2BAccessToken()
  if (!tokenData.accessToken) throw new Error('Token error')

  const endpointUrl = '/v1.0/qr/qr-mpm-query'
  const timestamp = getSnapTimestamp()
  const requestBody = { partnerReferenceNo }

  const signature = generateSymmetricSignature({
    httpMethod: 'POST',
    endpointUrl,
    accessToken: tokenData.accessToken,
    requestBody,
    timestamp,
    clientSecret: gdcpayConfig.clientSecret
  })

  const res = await fetch(`${gdcpayConfig.baseUrl.replace(/\/$/, '')}${endpointUrl}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenData.accessToken}`,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-PARTNER-ID': gdcpayConfig.partnerId,
      'X-EXTERNAL-ID': Date.now().toString()
    },
    body: JSON.stringify(requestBody)
  })

  return await res.json()
}


/**
 * Generic SNAP caller yang mengembalikan request + response lengkap (untuk dokumentasi UAT).
 * - skipAuth      : untuk endpoint access-token (tanpa Bearer / symmetric signature)
 * - signatureOverride / accessTokenOverride : untuk skenario negatif (signature salah, token expired)
 */
export async function callSnap({
  endpoint,
  body,
  accessToken,
  signatureOverride,
  clientIdOverride,
  skipAuth = false,
  signEndpointPrefix = ''
}: {
  endpoint: string
  body: any
  accessToken?: string
  signatureOverride?: string
  clientIdOverride?: string
  skipAuth?: boolean
  signEndpointPrefix?: string
}) {
  const url = `${gdcpayConfig.baseUrl.replace(/\/$/, '')}${endpoint}`
  const timestamp = getSnapTimestamp()
  const bodyString = JSON.stringify(body)
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-TIMESTAMP': timestamp }

  if (skipAuth) {
    const clientId = clientIdOverride || gdcpayConfig.clientId
    headers['X-CLIENT-KEY'] = clientId
    headers['X-SIGNATURE'] =
      signatureOverride ?? generateAsymmetricSignature(clientId, timestamp, gdcpayConfig.getPrivateKey())
  } else {
    headers['Authorization'] = `Bearer ${accessToken}`
    headers['X-PARTNER-ID'] = gdcpayConfig.partnerId
    headers['X-EXTERNAL-ID'] = Date.now().toString() + Math.floor(Math.random() * 1000)
    headers['CHANNEL-ID'] = '95221'
    headers['X-SIGNATURE'] =
      signatureOverride ??
      generateSymmetricSignature({
        httpMethod: 'POST',
        endpointUrl: signEndpointPrefix + endpoint,
        accessToken: accessToken || '',
        requestBody: bodyString,
        timestamp,
        clientSecret: gdcpayConfig.clientSecret
      })
  }

  const res = await fetch(url, { method: 'POST', headers, body: bodyString })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { json = text }

  return {
    request: { method: 'POST', url, headers, body },
    response: { httpStatus: res.status, body: json }
  }
}

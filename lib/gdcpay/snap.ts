import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

/**
 * Konfigurasi GDCPay dari Environment
 * Docs: https://neo-docs.gdc.co.id/documentation
 */
export const gdcpayConfig = {
  baseUrl: process.env.GDCPAY_BASE_URL || 'https://neo-sandbox-api.gdc.co.id/snap',
  clientId: process.env.GDCPAY_CLIENT_ID || '',
  clientSecret: process.env.GDCPAY_CLIENT_SECRET || '',
  partnerId: process.env.GDCPAY_PARTNER_ID || '',
  apiKey: process.env.GDCPAY_API_KEY || '',
  secretKey: process.env.GDCPAY_SECRET_KEY || '',
  // Dua akun berbeda di dashboard partner GDC (format contoh: 000219913419):
  // - paymentAccount : untuk transaksi masuk (VA, QRIS, OTC)
  // - depositAccount : untuk disbursement (bank inquiry, transfer bank, balance)
  paymentAccount: process.env.GDCPAY_PAYMENT_ACCOUNT || '',
  depositAccount: process.env.GDCPAY_DEPOSIT_ACCOUNT || '',
  // MID QRIS, didapat setelah NMID diajukan (Pengaturan > Bisnis Saya > NMID) dan di-ACC GDC
  merchantId: process.env.GDCPAY_MERCHANT_ID || '',
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
export function getSnapTimestamp(now: Date = new Date()): string {
  const offsetMinutes = 7 * 60 // WIB UTC+7
  const localTime = new Date(now.getTime() + offsetMinutes * 60 * 1000)
  return localTime.toISOString().replace('Z', '+07:00')
}

/**
 * Generate Asymmetric Signature (SHA256withRSA)
 * String to sign: client_key + "|" + X-TIMESTAMP
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
 * String to sign: METHOD:PATH:ACCESS_TOKEN:lowercase(hex(sha256(minify(body)))):X-TIMESTAMP
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
  // JSON.stringify tanpa spasi = minified
  const bodyString = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody || {})
  const bodyHashHex = crypto.createHash('sha256').update(bodyString).digest('hex').toLowerCase()

  const stringToSign = `${httpMethod.toUpperCase()}:${endpointUrl}:${accessToken}:${bodyHashHex}:${timestamp}`

  return crypto.createHmac('sha512', clientSecret).update(stringToSign).digest('base64')
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
  const signature = generateAsymmetricSignature(clientId, timestamp, gdcpayConfig.getPrivateKey())

  const res = await fetch(`${gdcpayConfig.baseUrl.replace(/\/$/, '')}/v1.0/access-token/b2b`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-TIMESTAMP': timestamp,
      'X-CLIENT-KEY': clientId,
      'Client-Key': clientId,
      'X-SIGNATURE': signature
    },
    body: JSON.stringify({ grantType: 'client_credentials' })
  })

  return await res.json()
}

/**
 * Helper: header + signature untuk endpoint transaksional SNAP
 */
async function snapPost(endpointUrl: string, requestBody: any) {
  const tokenData = await getB2BAccessToken()
  if (!tokenData.accessToken) {
    throw new Error(`Gagal mendapatkan token GDCPay: ${tokenData.responseMessage}`)
  }

  const timestamp = getSnapTimestamp()
  const externalId = crypto.randomUUID()
  const bodyString = JSON.stringify(requestBody)
  const signature = generateSymmetricSignature({
    httpMethod: 'POST',
    endpointUrl,
    accessToken: tokenData.accessToken,
    requestBody: bodyString,
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
      'X-EXTERNAL-ID': externalId,
      'CHANNEL-ID': '95223'
    },
    body: bodyString
  })

  const json = await res.json()
  // externalId dikembalikan karena dibutuhkan untuk query status QRIS (originalExternalId)
  return { ...json, _externalId: externalId }
}

/**
 * 2. Generate QRIS Dynamic
 * Endpoint: POST /v1.0/qr/qr-mpm-generate
 */
export async function generateQRIS({ partnerReferenceNo, amount }: { partnerReferenceNo: string; amount: number }) {
  return snapPost('/v1.0/qr/qr-mpm-generate', {
    partnerReferenceNo,
    amount: { value: amount.toFixed(2), currency: 'IDR' },
    ...(gdcpayConfig.merchantId ? { merchantId: gdcpayConfig.merchantId } : {}),
    additionalInfo: { accountNumber: gdcpayConfig.paymentAccount }
  })
}

/**
 * 3. Create Virtual Account (Close Payment / dynamic)
 * Endpoint: POST /v1.0/transfer-va/create-va
 */
export async function createVirtualAccount({
  trxId,
  customerName,
  amount,
  bankCode = '022', // sandbox GDC: hanya 022 yang aktif untuk VA dynamic (auto-paid)
  validityHours = 24
}: {
  trxId: string // UUID dari sistem partner (pakai orders.id)
  customerName: string
  amount: number
  bankCode?: string
  validityHours?: number
}) {
  return snapPost('/v1.0/transfer-va/create-va', {
    virtualAccountName: customerName,
    expiredDate: getSnapTimestamp(new Date(Date.now() + validityHours * 3600 * 1000)),
    trxId,
    // C = Close Payment (VA Dynamic, nominal terkunci), O = Open Payment (VA Static). Auto-paid sandbox: C + bank 022
    virtualAccountTrxType: process.env.GDCPAY_VA_TYPE || 'C',
    totalAmount: { value: amount.toFixed(2), currency: 'IDR' },
    additionalInfo: { accountNumber: gdcpayConfig.paymentAccount, bankCode }
  })
}

/**
 * 4. Check Status QRIS
 * Endpoint: POST /v1.0/qr/qr-mpm-query
 */
export async function checkQRISStatus({
  originalReferenceNo,
  originalPartnerReferenceNo,
  originalExternalId
}: {
  originalReferenceNo: string
  originalPartnerReferenceNo: string
  originalExternalId: string
}) {
  return snapPost('/v1.0/qr/qr-mpm-query', {
    originalReferenceNo,
    originalPartnerReferenceNo,
    originalExternalId,
    serviceCode: '47',
    additionalInfo: {}
  })
}

/**
 * 5. Check Status Virtual Account
 * Endpoint: POST /v1.0/transfer-va/status
 */
export async function checkVAStatus({
  virtualAccountNo,
  paymentRequestId
}: {
  virtualAccountNo: string
  paymentRequestId: string // = virtualAccountData.additionalInfo.referenceNo dari response create VA
}) {
  return snapPost('/v1.0/transfer-va/status', { virtualAccountNo, paymentRequestId, inquiryRequestId: '' })
}

/**
 * Generic SNAP caller yang mengembalikan request + response lengkap (untuk dokumentasi UAT).
 * - skipAuth                             : untuk endpoint access-token (tanpa Bearer / symmetric signature)
 * - signatureOverride / clientIdOverride : untuk skenario negatif (signature salah, client ID salah)
 */
export async function callSnap({
  endpoint,
  body,
  accessToken,
  signatureOverride,
  clientIdOverride,
  skipAuth = false
}: {
  endpoint: string
  body: any
  accessToken?: string
  signatureOverride?: string
  clientIdOverride?: string
  skipAuth?: boolean
}) {
  const url = `${gdcpayConfig.baseUrl.replace(/\/$/, '')}${endpoint}`
  const timestamp = getSnapTimestamp()
  const bodyString = JSON.stringify(body)
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-TIMESTAMP': timestamp }

  if (skipAuth) {
    const clientId = clientIdOverride || gdcpayConfig.clientId
    headers['Client-Key'] = clientId
    headers['X-CLIENT-KEY'] = clientId
    headers['X-SIGNATURE'] =
      signatureOverride ?? generateAsymmetricSignature(clientId, timestamp, gdcpayConfig.getPrivateKey())
  } else {
    headers['Authorization'] = `Bearer ${accessToken}`
    headers['X-PARTNER-ID'] = gdcpayConfig.partnerId
    headers['X-EXTERNAL-ID'] = crypto.randomUUID()
    headers['CHANNEL-ID'] = '95223'
    headers['X-SIGNATURE'] =
      signatureOverride ??
      generateSymmetricSignature({
        httpMethod: 'POST',
        endpointUrl: endpoint,
        accessToken: accessToken || '',
        requestBody: bodyString,
        timestamp,
        clientSecret: gdcpayConfig.clientSecret
      })
  }

  const res = await fetch(url, { method: 'POST', headers, body: bodyString })
  const text = await res.text()
  let json: any
  try {
    json = JSON.parse(text)
  } catch {
    json = text
  }

  return {
    request: { method: 'POST', url, headers, body },
    response: { httpStatus: res.status, body: json }
  }
}

/* ───────────── Disbursement (akun DEPOSIT) ───────────── */

/** Saldo akun deposit. Endpoint: POST /v1.0/balance-inquiry */
export async function getDepositBalance() {
  return snapPost('/v1.0/balance-inquiry', {
    partnerReferenceNo: crypto.randomUUID(),
    accountNo: gdcpayConfig.depositAccount,
    additionalInfo: {}
  })
}

/** Cek rekening tujuan sebelum transfer. Endpoint: POST /v1.0/emoney/bank-account-inquiry */
export async function bankAccountInquiry({
  partnerReferenceNo,
  bankCode,
  accountNumber,
  amount
}: {
  partnerReferenceNo: string
  bankCode: string
  accountNumber: string
  amount: number
}) {
  return snapPost('/v1.0/emoney/bank-account-inquiry', {
    partnerReferenceNo,
    customerNumber: gdcpayConfig.depositAccount,
    amount: { value: amount.toFixed(2), currency: 'IDR' },
    beneficiaryAccountNumber: accountNumber,
    additionalInfo: { beneficiaryBankCode: bankCode, remarks: 'Inquiry honor mentor' }
  })
}

/** Transfer ke rekening bank. Endpoint: POST /v1.0/emoney/transfer-bank */
export async function transferBank({
  partnerReferenceNo,
  bankCode,
  accountNumber,
  amount,
  sessionId = '',
  remarks = ''
}: {
  partnerReferenceNo: string // UUID unik per transfer; dipakai sebagai kunci idempotensi
  bankCode: string
  accountNumber: string
  amount: number
  sessionId?: string
  remarks?: string
}) {
  return snapPost('/v1.0/emoney/transfer-bank', {
    partnerReferenceNo,
    customerNumber: gdcpayConfig.depositAccount,
    accountType: '',
    beneficiaryAccountNumber: accountNumber,
    beneficiaryBankCode: bankCode,
    amount: { value: amount.toFixed(2), currency: 'IDR' },
    sessionId,
    additionalInfo: { remarks }
  })
}

/** Detail transaksi keluar (WITHDRAWAL). Endpoint: POST /v1.0/transaction-history-detail */
export async function getTransferDetail({
  originalReferenceNo,
  originalPartnerReferenceNo
}: {
  originalReferenceNo: string
  originalPartnerReferenceNo: string
}) {
  return snapPost('/v1.0/transaction-history-detail', {
    originalReferenceNo,
    originalPartnerReferenceNo,
    additionalInfo: { accountNumber: gdcpayConfig.depositAccount, accountType: 'active_account', type: 'WITHDRAWAL' }
  })
}

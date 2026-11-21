/**
 * SCRIPT UAT RUNNER GDCPAY (18 test case, sesuai "Test Case API .xlsx")
 * Jalankan: bun run scripts/run-gdcpay-uat.mjs
 * Hasil lengkap (request + response) disimpan ke credentials/gdcpay/uat-results.json
 */
import fs from 'fs'
import { callSnap, gdcpayConfig } from '../lib/gdcpay/snap.ts'

const OUT = process.env.UAT_OUT || 'credentials/gdcpay/uat-results.json'
const results = {}
const ts = Date.now()
const amt = (n) => ({ value: n.toFixed(2), currency: 'IDR' })

// Rekening/VA uji (ubah lewat env bila GDC memberi data khusus sandbox)
const SRC_ACCOUNT = process.env.UAT_SOURCE_ACCOUNT || gdcpayConfig.partnerId
const BENEF_ACCOUNT = process.env.UAT_BENEF_ACCOUNT || '1234567890'
const BENEF_BANK = process.env.UAT_BENEF_BANK || '014' // BCA
const PARTNER_SVC_ID = process.env.UAT_PARTNER_SERVICE_ID || '   12345'
const VA_NO = process.env.UAT_VA_NO || `${PARTNER_SVC_ID}${String(ts).slice(-8)}`

async function tc(id, expected, fn) {
  console.log(`\n--- [${id}] ---`)
  try {
    const r = await fn()
    const code = r.response.body?.responseCode
    const pass = code === expected
    results[id] = { expected, actualCode: code, pass, ...r }
    console.log('HTTP', r.response.httpStatus, JSON.stringify(r.response.body))
    console.log(`Expected ${expected} -> ${pass ? '✅ PASS' : '⚠️ BEDA'}`)
  } catch (e) {
    results[id] = { expected, pass: false, error: e.message }
    console.error('Error:', e.message)
  }
}

async function token() {
  const r = await callSnap({ endpoint: '/v1.0/access-token/b2b', body: { grantType: 'client_credentials' }, skipAuth: true })
  return { r, accessToken: r.response.body?.accessToken }
}

async function main() {
  console.log('Base URL:', gdcpayConfig.baseUrl)

  let accessToken
  await tc('TC.001', '2007300', async () => {
    const t = await token()
    accessToken = t.accessToken
    return t.r
  })
  await tc('TC.002', '4017300', () =>
    callSnap({ endpoint: '/v1.0/access-token/b2b', body: { grantType: 'client_credentials' }, skipAuth: true, clientIdOverride: 'dummy-invalid-client-id' }))
  await tc('TC.003', '4017300', () =>
    callSnap({ endpoint: '/v1.0/access-token/b2b', body: { grantType: 'client_credentials' }, skipAuth: true, signatureOverride: Buffer.from('invalid-signature').toString('base64') }))

  const call = (endpoint, body, extra = {}) => callSnap({ endpoint, body, accessToken, ...extra })

  await tc('TC.004', '2001100', () => call('/v1.0/balance-inquiry', { partnerReferenceNo: `UAT-BAL-${ts}`, accountNo: SRC_ACCOUNT }))

  const inquiryBody = (bank) => ({ partnerReferenceNo: `UAT-INQ-${ts}`, customerNumber: BENEF_ACCOUNT, beneficiaryBankCode: bank, beneficiaryAccountNo: BENEF_ACCOUNT })
  await tc('TC.005', '2004200', () => call('/v1.0/emoney/bank-account-inquiry', inquiryBody(BENEF_BANK)))
  await tc('TC.006', '5004201', () => call('/v1.0/emoney/bank-account-inquiry', inquiryBody('999')))
  await tc('TC.007', '4014201', () => call('/v1.0/emoney/bank-account-inquiry', inquiryBody(BENEF_BANK), { accessTokenOverride: 'expired-token', accessToken: 'expired-token' }))

  const trfBody = (n, bank = BENEF_BANK) => ({
    partnerReferenceNo: `UAT-TRF-${ts}-${Math.floor(Math.random() * 1e4)}`,
    amount: amt(n),
    beneficiaryAccountNo: BENEF_ACCOUNT,
    beneficiaryBankCode: bank,
    sourceAccountNo: SRC_ACCOUNT,
    transactionDate: new Date().toISOString().replace('Z', '+07:00')
  })
  await tc('TC.008', '2004300', () => call('/v1.0/emoney/transfer-bank', trfBody(10000)))
  await tc('TC.009', '4004300', () => call('/v1.0/emoney/transfer-bank', trfBody(1)))
  await tc('TC.010', '5004301', () => call('/v1.0/emoney/transfer-bank', trfBody(10000, '999')))
  await tc('TC.011', '4034314', () => call('/v1.0/emoney/transfer-bank', trfBody(999999999999)))

  const qrRef = `UAT-QRIS-${ts}`
  await tc('TC.012', '2004700', () =>
    call('/v1.0/qr/qr-mpm-generate', {
      partnerReferenceNo: qrRef,
      amount: amt(10000),
      merchantId: gdcpayConfig.partnerId,
      terminalId: 'TFARMASI01',
      validityPeriod: new Date(Date.now() + 1800 * 1000).toISOString().replace('Z', '+07:00')
    }))
  await tc('TC.013', '2005100', () =>
    call('/v1.0/qr/qr-mpm-query', {
      originalPartnerReferenceNo: qrRef,
      originalReferenceNo: results['TC.012']?.response?.body?.referenceNo || '',
      serviceCode: '47',
      merchantId: gdcpayConfig.partnerId
    }))

  const vaBody = (over = {}) => ({
    partnerServiceId: PARTNER_SVC_ID,
    customerNo: VA_NO.trim().slice(-8),
    virtualAccountNo: VA_NO,
    virtualAccountName: 'Siswa Test Farmasi',
    virtualAccountEmail: 'test@temanfarmasi.com',
    trxId: `UAT-VA-${ts}`,
    totalAmount: amt(50000),
    expiredDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('Z', '+07:00'),
    additionalInfo: { bankCode: 'BCA' },
    ...over
  })
  await tc('TC.014', '2002700', () => call('/v1.0/transfer-va/create-va', vaBody()))
  await tc('TC.015', '4002700', () => call('/v1.0/transfer-va/create-va', vaBody({ virtualAccountNo: '', totalAmount: amt(0), trxId: `UAT-VA-BAD-${ts}` })))
  await tc('TC.016', '2002600', () =>
    call('/v1.0/transfer-va/status', {
      partnerServiceId: PARTNER_SVC_ID,
      customerNo: VA_NO.trim().slice(-8),
      virtualAccountNo: VA_NO,
      inquiryRequestId: `UAT-VA-${ts}`
    }))

  const now = new Date()
  const from = new Date(now.getTime() - 7 * 24 * 3600 * 1000)
  const fmt = (d) => d.toISOString().replace('Z', '+07:00')
  await tc('TC.017', '2001200', () =>
    call('/v1.0/transaction-history-list', { fromDateTime: fmt(from), toDateTime: fmt(now), pageSize: '10', pageNumber: '1' }))
  await tc('TC.018', '2001300', () =>
    call('/v1.0/otc/payment/status', { partnerReferenceNo: `UAT-TRF-${ts}`, originalPartnerReferenceNo: `UAT-TRF-${ts}` }))

  fs.mkdirSync('credentials/gdcpay', { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
  const ok = Object.values(results).filter((r) => r.pass).length
  console.log(`\n=== Selesai: ${ok}/${Object.keys(results).length} sesuai expected. Detail: ${OUT} ===`)
}

main()

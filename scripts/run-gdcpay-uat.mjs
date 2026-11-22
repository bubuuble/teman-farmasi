/**
 * SCRIPT UAT RUNNER GDCPAY (18 test case, sesuai "Test Case API .xlsx")
 * Body request mengikuti https://neo-docs.gdc.co.id/documentation (SNAP B2B)
 *
 * Jalankan: bun run scripts/run-gdcpay-uat.mjs
 * Hasil lengkap (request + response) disimpan ke credentials/gdcpay/uat-results.json
 *
 * Env tambahan yang dibutuhkan:
 *   GDCPAY_ACCOUNT_NUMBER  nomor rekening deposit partner (mis. 000219913419)
 *   UAT_BENEF_ACCOUNT      rekening tujuan uji (default 123123123, sesuai contoh docs)
 *   UAT_BENEF_BANK         kode bank tujuan (default 014 = BCA)
 */
import fs from 'fs'
import crypto from 'crypto'
import { callSnap, gdcpayConfig, getSnapTimestamp } from '../lib/gdcpay/snap.ts'

const OUT = process.env.UAT_OUT || 'credentials/gdcpay/uat-results.json'
const results = {}
const uuid = () => crypto.randomUUID()
const amt = (n) => ({ value: n.toFixed(2), currency: 'IDR' })
const inHours = (h) => getSnapTimestamp(new Date(Date.now() + h * 3600 * 1000))

const ACCOUNT = gdcpayConfig.accountNumber
const BENEF_ACCOUNT = process.env.UAT_BENEF_ACCOUNT || '123123123'
const BENEF_BANK = process.env.UAT_BENEF_BANK || '014'

async function tc(id, expected, fn) {
  console.log(`\n--- [${id}] ---`)
  try {
    const r = await fn()
    const code = r.response.body?.responseCode
    const pass = code === expected
    results[id] = { expected, actualCode: code, pass, ...r }
    console.log('HTTP', r.response.httpStatus, JSON.stringify(r.response.body).slice(0, 400))
    console.log(`Expected ${expected} -> ${pass ? '✅ PASS' : '⚠️ BEDA'}`)
    return r
  } catch (e) {
    results[id] = { expected, pass: false, error: e.message }
    console.error('Error:', e.message)
  }
}

async function main() {
  console.log('Base URL:', gdcpayConfig.baseUrl)
  if (!ACCOUNT) console.warn('⚠️  GDCPAY_ACCOUNT_NUMBER belum di-set; banyak endpoint akan menolak request.')

  let accessToken
  const tokenBody = { grantType: 'client_credentials' }
  const t1 = await tc('TC.001', '2007300', () => callSnap({ endpoint: '/v1.0/access-token/b2b', body: tokenBody, skipAuth: true }))
  accessToken = t1?.response?.body?.accessToken
  await tc('TC.002', '4017300', () => callSnap({ endpoint: '/v1.0/access-token/b2b', body: tokenBody, skipAuth: true, clientIdOverride: 'dummy-invalid-client-id' }))
  await tc('TC.003', '4017300', () => callSnap({ endpoint: '/v1.0/access-token/b2b', body: tokenBody, skipAuth: true, signatureOverride: Buffer.from('invalid-signature').toString('base64') }))

  const call = (endpoint, body, extra = {}) => callSnap({ endpoint, body, accessToken, ...extra })

  // TC.004 Balance inquiry
  await tc('TC.004', '2001100', () => call('/v1.0/balance-inquiry', { partnerReferenceNo: uuid(), accountNo: ACCOUNT, additionalInfo: {} }))

  // TC.005-007 Bank account inquiry
  const inquiry = (bank) => ({
    partnerReferenceNo: uuid(),
    customerNumber: ACCOUNT,
    amount: amt(10000),
    beneficiaryAccountNumber: BENEF_ACCOUNT,
    additionalInfo: { beneficiaryBankCode: bank, remarks: 'UAT inquiry' }
  })
  await tc('TC.005', '2004200', () => call('/v1.0/emoney/bank-account-inquiry', inquiry(BENEF_BANK)))
  await tc('TC.006', '5004201', () => call('/v1.0/emoney/bank-account-inquiry', inquiry('999')))
  await tc('TC.007', '4014201', () => call('/v1.0/emoney/bank-account-inquiry', inquiry(BENEF_BANK), { accessToken: 'expired-token' }))

  // TC.008-011 Transfer bank
  const transfer = (n, bank = BENEF_BANK) => ({
    partnerReferenceNo: uuid(),
    customerNumber: ACCOUNT,
    accountType: '',
    beneficiaryAccountNumber: BENEF_ACCOUNT,
    beneficiaryBankCode: bank,
    amount: amt(n),
    sessionId: '',
    additionalInfo: { remarks: 'UAT transfer' }
  })
  await tc('TC.008', '2004300', () => call('/v1.0/emoney/transfer-bank', transfer(10000)))
  await tc('TC.009', '4004300', () => call('/v1.0/emoney/transfer-bank', transfer(1)))
  await tc('TC.010', '5004301', () => call('/v1.0/emoney/transfer-bank', transfer(10000, '999')))
  await tc('TC.011', '4034314', () => call('/v1.0/emoney/transfer-bank', transfer(999999999999)))

  // TC.012-013 QRIS
  const qrRef = uuid()
  const qrBody = {
    partnerReferenceNo: qrRef,
    amount: amt(10000),
    ...(gdcpayConfig.merchantId ? { merchantId: gdcpayConfig.merchantId } : {}),
    additionalInfo: { accountNumber: ACCOUNT }
  }
  const qrExternalId = uuid()
  const qr = await tc('TC.012', '2004700', () => call('/v1.0/qr/qr-mpm-generate', qrBody))
  await tc('TC.013', '2005100', () =>
    call('/v1.0/qr/qr-mpm-query', {
      originalReferenceNo: qr?.response?.body?.referenceNo || '',
      originalPartnerReferenceNo: qrRef,
      // originalExternalId = X-EXTERNAL-ID yang dikirim saat generate QRIS
      originalExternalId: qr?.request?.headers?.['X-EXTERNAL-ID'] || qrExternalId,
      serviceCode: '47',
      additionalInfo: {}
    }))

  // TC.014-016 Virtual Account
  const vaTrx = uuid()
  const vaBody = (over = {}) => ({
    virtualAccountName: 'Siswa Test Farmasi',
    expiredDate: inHours(24),
    trxId: vaTrx,
    virtualAccountTrxType: 'C',
    totalAmount: amt(50000),
    additionalInfo: { accountNumber: ACCOUNT, bankCode: '014' },
    ...over
  })
  const va = await tc('TC.014', '2002700', () => call('/v1.0/transfer-va/create-va', vaBody()))
  // Gagal: field wajib kosong + nominal tidak valid
  await tc('TC.015', '4002700', () => call('/v1.0/transfer-va/create-va', vaBody({ virtualAccountName: '', trxId: uuid(), totalAmount: amt(0) })))
  const vaData = va?.response?.body?.virtualAccountData || {}
  await tc('TC.016', '2002600', () =>
    call('/v1.0/transfer-va/status', {
      virtualAccountNo: vaData.virtualAccountNo || '',
      paymentRequestId: vaData.additionalInfo?.referenceNo || '',
      inquiryRequestId: ''
    }))

  // TC.017 Transaction history list (maks. rentang 7 hari)
  const now = new Date()
  await tc('TC.017', '2001200', () =>
    call('/v1.0/transaction-history-list', {
      fromDateTime: getSnapTimestamp(new Date(now.getTime() - 6 * 24 * 3600 * 1000)),
      toDateTime: getSnapTimestamp(now),
      pageSize: 25,
      pageNumber: 1,
      additionalInfo: { accountNumber: ACCOUNT, accountType: 'account', type: 'RECEIVE_MONEY', status: '' }
    }))

  // TC.018 (endpoint di Excel: v1.0/otc/payment/status) -> butuh OTC dibuat dulu (langkah pendukung, bukan TC)
  const otcRef = uuid()
  const otcCreate = await call('/v1.0/otc/payment/create', {
    partnerReferenceNo: otcRef,
    channel: 'indomaret',
    billName: 'Siswa Test Farmasi',
    amount: amt(50000),
    expiredDate: inHours(24),
    additionalInfo: { accountNumber: ACCOUNT }
  })
  results['_prereq_otc_create'] = otcCreate
  await tc('TC.018', '2001300', () =>
    call('/v1.0/otc/payment/status', {
      partnerReferenceNo: otcRef,
      referenceNo: otcCreate.response.body?.referenceNo || ''
    }))

  fs.mkdirSync('credentials/gdcpay', { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
  const tcs = Object.entries(results).filter(([k]) => k.startsWith('TC.'))
  const ok = tcs.filter(([, r]) => r.pass).length
  console.log(`\n=== Selesai: ${ok}/${tcs.length} sesuai expected. Detail: ${OUT} ===`)
}

main()

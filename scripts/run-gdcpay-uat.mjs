/**
 * SCRIPT UAT RUNNER GDCPAY
 * Jalankan script ini begitu tim GDCPay memberikan Base URL Sandbox:
 * bun run scripts/run-gdcpay-uat.mjs
 */

import { getB2BAccessToken, generateQRIS, createVirtualAccount, checkQRISStatus } from '../lib/gdcpay/snap.ts'

async function runUAT() {
  console.log('🚀 Memulai UAT Test Suite GDCPay (Standar SNAP BI)...\n')

  // TC.001: Token Valid
  console.log('--- [TC.001] Token B2B (Valid Credentials) ---')
  try {
    const res = await getB2BAccessToken()
    console.log('Request  : POST /v1.0/access-token/b2b')
    console.log('Response :', JSON.stringify(res, null, 2))
    console.log('Expected : responseCode: 2007300, responseMessage: Success')
    console.log('Status   :', res.responseCode === '2007300' ? '✅ PASS' : '⚠️ CEK RESPONSE')
  } catch (err) {
    console.error('Error TC.001:', err.message)
  }

  // TC.002: Token Invalid Client ID
  console.log('\n--- [TC.002] Token B2B (Invalid Client ID) ---')
  try {
    const res = await getB2BAccessToken('dummy-invalid-client-id')
    console.log('Request  : POST /v1.0/access-token/b2b (Invalid Client ID)')
    console.log('Response :', JSON.stringify(res, null, 2))
    console.log('Expected : responseCode: 4017300, Unauthorized [Unknown Client]')
    console.log('Status   :', res.responseCode === '4017300' ? '✅ PASS' : '⚠️ CEK RESPONSE')
  } catch (err) {
    console.error('Error TC.002:', err.message)
  }

  // TC.012: Generate QRIS
  console.log('\n--- [TC.012] Generate QRIS Dynamic ---')
  try {
    const trxId = 'UAT-QRIS-' + Date.now()
    const res = await generateQRIS({
      partnerReferenceNo: trxId,
      amount: 10000,
      merchantName: 'Teman Farmasi UAT'
    })
    console.log('Request  : POST /v1.0/qr/qr-mpm-generate')
    console.log('Response :', JSON.stringify(res, null, 2))
    console.log('Expected : responseCode: 2004700, Success')
    console.log('Status   :', res.responseCode === '2004700' ? '✅ PASS' : '⚠️ CEK RESPONSE')
  } catch (err) {
    console.error('Error TC.012:', err.message)
  }

  // TC.014: Create Virtual Account
  console.log('\n--- [TC.014] Create Virtual Account ---')
  try {
    const trxId = 'UAT-VA-' + Date.now()
    const res = await createVirtualAccount({
      partnerReferenceNo: trxId,
      customerName: 'Siswa Test Farmasi',
      amount: 50000,
      bankCode: 'BCA'
    })
    console.log('Request  : POST /v1.0/transfer-va/create-va')
    console.log('Response :', JSON.stringify(res, null, 2))
    console.log('Expected : responseCode: 2002700, Success')
    console.log('Status   :', res.responseCode === '2002700' ? '✅ PASS' : '⚠️ CEK RESPONSE')
  } catch (err) {
    console.error('Error TC.014:', err.message)
  }
}

runUAT()

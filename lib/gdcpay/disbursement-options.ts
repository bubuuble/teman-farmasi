// Opsi disbursement. Aman diimpor dari client component.
// Kode bank sandbox GDC: 002 / 008 / 013 / 014 (rekening dummy).
export const DISBURSE_BANKS = [
  { code: '014', name: 'Bank Central Asia (BCA)' },
  { code: '008', name: 'Bank Mandiri' },
  { code: '002', name: 'Bank BRI' },
  { code: '013', name: 'Bank Permata' },
] as const

// Batas nominal per transfer dari GDC (sandbox: min 10.000, max 50.000.000)
export const DISBURSE_MIN = 10_000
export const DISBURSE_MAX = 50_000_000

export function disburseBankName(code: string | null | undefined) {
  return DISBURSE_BANKS.find((b) => b.code === code)?.name ?? (code ? `Bank ${code}` : '-')
}

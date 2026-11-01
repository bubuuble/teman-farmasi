/**
 * Format a number to Indonesian Rupiah currency string.
 * Deterministic formatting to avoid SSR / Client hydration mismatches:
 * Uses explicit thousand separator dots and no fractional digits ('Rp 100.000').
 */
export function formatRupiah(amount: number | null | undefined): string {
  const val = Math.round(Number(amount) || 0)
  const formatted = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `Rp ${formatted}`
}

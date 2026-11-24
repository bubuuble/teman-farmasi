// Opsi pembayaran yang ditampilkan ke siswa. Aman diimpor dari client component.
// VA Static (layanan kami) baru terverifikasi jalan di sandbox untuk bank 002 (BRI).
// Tambahkan 013 (Permata) / 022 (CIMB Niaga) di sini setelah dites dan aktif di GDC.
export const VA_BANKS = [{ code: '002', name: 'Bank BRI' }] as const

export type PaymentMethod = 'qris' | 'va'

export function vaBankName(code: string | null | undefined) {
  return VA_BANKS.find((b) => b.code === code)?.name ?? (code ? `Bank ${code}` : 'Bank')
}

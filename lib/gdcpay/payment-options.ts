// Opsi pembayaran yang ditampilkan ke siswa. Aman diimpor dari client component.
// VA Dynamic/Close (nominal terkunci) terverifikasi jalan + auto-paid di sandbox untuk bank 022 saja.
// Bank lain (013 / 002 / 014 / 008) ditolak sandbox: Bank Not Supported By Switch / Invalid Routing.
export const VA_BANKS = [{ code: '022', name: 'Bank CIMB Niaga' }] as const

export type PaymentMethod = 'qris' | 'va'

export function vaBankName(code: string | null | undefined) {
  return VA_BANKS.find((b) => b.code === code)?.name ?? (code ? `Bank ${code}` : 'Bank')
}

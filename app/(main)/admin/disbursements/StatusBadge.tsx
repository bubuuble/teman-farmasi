const STYLES: Record<string, { label: string; cls: string }> = {
  success: { label: 'Berhasil', cls: 'bg-green-50 text-green-600 border-green-100' },
  failed: { label: 'Gagal', cls: 'bg-red-50 text-red-600 border-red-100' },
  pending: { label: 'Menunggu Konfirmasi', cls: 'bg-brand-yellow/20 text-brand-dark border-brand-yellow/30' },
}

export default function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.pending
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${s.cls}`}>
      {s.label}
    </span>
  )
}

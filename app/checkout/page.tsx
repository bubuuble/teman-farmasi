import Link from 'next/link'
import { redirect } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import { createClient } from '@/lib/supabase/server'
import { resolveCheckoutItem } from '@/lib/checkout-catalog'
import { formatRupiah } from '@/lib/currency'
import CheckoutForm from './CheckoutForm'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ cat?: string; item?: string }> }) {
  const { cat = '', item: itemKey = '' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const next = `/checkout?cat=${encodeURIComponent(cat)}&item=${encodeURIComponent(itemKey)}`
    redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  const item = cat && itemKey ? await resolveCheckoutItem(cat, itemKey) : null

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="pt-32 pb-24 px-6 max-w-2xl mx-auto font-sans">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tighter mb-2">Checkout</h1>
        <p className="text-gray-500 font-medium mb-8">Selesaikan pembayaran untuk langsung terdaftar di kelas.</p>

        {!item ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center">
            <p className="font-bold text-brand-dark mb-4">Program tidak ditemukan atau belum bisa dibeli online.</p>
            <Link href="/programs?cat=ukai" className="text-brand-pink font-extrabold">Lihat program lain →</Link>
          </div>
        ) : profile?.role !== 'student' ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center">
            <p className="font-bold text-brand-dark">Pembelian online hanya tersedia untuk akun siswa.</p>
            <p className="text-sm text-gray-500 mt-2">Kamu login sebagai {profile?.role || 'pengguna lain'}. Silakan masuk dengan akun siswa.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Pesanan</p>
              <h2 className="font-heading font-bold text-xl text-brand-dark">{item.title}</h2>
              {item.subtitle && <p className="text-gray-500 font-medium">{item.subtitle}</p>}
              <div className="flex items-end justify-between border-t border-gray-100 mt-6 pt-6">
                <div>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Total</p>
                  <p className="text-2xl font-extrabold text-brand-dark">{formatRupiah(item.amount)}</p>
                </div>
                <p className="text-xs text-gray-400 font-bold">Atas nama {profile?.full_name || user.email}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Metode Pembayaran</p>
              <CheckoutForm category={cat} itemKey={itemKey} />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}

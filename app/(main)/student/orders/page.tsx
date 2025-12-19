// app/(main)/student/orders/page.tsx

import { createClient } from "@/lib/supabase/server"
import { Receipt, CreditCard, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

// --- DEFINISI TIPE DATA ---
type StudentOrder = {
  id: string
  created_at: string
  amount: number
  status: string
  notes: string | null
  classes: {
    title: string
  } | null
}

export default async function StudentOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Fetch data order milik siswa ini
  const { data: rawOrders } = await supabase
    .from('orders')
    .select(`
      id, created_at, amount, status, notes,
      classes ( title )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  const orders = rawOrders as unknown as StudentOrder[]

  // 2. Hitung statistik sederhana
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const totalPending = pendingOrders.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="space-y-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-heading font-bold text-4xl text-brand-dark">Riwayat Pembayaran</h1>
          <p className="text-gray-500 font-medium mt-2">Pantau status tagihan dan pendaftaran kelas Anda di sini.</p>
        </div>

        {totalPending > 0 && (
          <div className="bg-brand-pink/10 border border-brand-pink/20 p-6 rounded-[32px] flex items-center gap-5 shadow-sm">
            <div className="w-12 h-12 bg-brand-pink text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-pink/20">
               <AlertCircle className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-brand-pink uppercase tracking-[0.15em]">Total Tagihan Pending</p>
               <p className="text-2xl font-bold text-brand-dark">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPending)}
               </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Box: Instruksi Pembayaran (Statis) */}
      {pendingOrders.length > 0 && (
         <div className="bg-brand-darkblue rounded-[40px] p-10 text-white flex flex-col lg:flex-row items-center gap-8 shadow-2xl shadow-brand-darkblue/20 relative overflow-hidden">
            <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center shrink-0 relative z-10">
               <CreditCard className="w-10 h-10 text-brand-yellow" />
            </div>
            <div className="flex-1 text-center lg:text-left relative z-10">
               <h3 className="font-bold text-2xl mb-2">Cara Melakukan Pembayaran</h3>
               <p className="text-blue-100 text-base leading-relaxed">
                  Silakan lakukan transfer sesuai nominal tagihan ke rekening resmi <b className="text-brand-yellow">BCA 123456789 a/n Teman Farmasi</b>. 
                  Kirim bukti transfer ke WhatsApp Admin untuk aktivasi kelas secara instan.
               </p>
            </div>
            <Link 
               href="https://wa.me/628123456789" 
               target="_blank"
               className="bg-brand-yellow text-brand-dark px-10 py-4 rounded-2xl font-bold text-base hover:bg-white transition-all shadow-lg relative z-10 whitespace-nowrap"
            >
               Konfirmasi via WA
            </Link>
            
            {/* Decorative */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl"></div>
         </div>
      )}

      {/* List Orders */}
      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8">
            
            <div className="flex items-center gap-6">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110
                  ${order.status === 'paid' ? 'bg-green-50 text-green-600' : 
                    order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-brand-cream text-brand-pink'}`}
               >
                  <Receipt className="w-8 h-8" />
               </div>
               
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                     <StatusBadge status={order.status} />
                  </div>
                  <h3 className="font-bold text-brand-dark text-xl group-hover:text-brand-pink transition-colors">
                     {order.classes?.title || "Kelas Tidak Ditemukan"}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-2 font-medium">
                     <Clock className="w-4 h-4 text-brand-pink" />
                     {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
               </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-6 md:pt-0 border-gray-50">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nominal Tagihan</p>
               <p className="text-2xl font-heading font-bold text-brand-dark">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.amount)}
               </p>
               {order.notes && (
                  <span className="text-[10px] text-gray-400 italic bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                     Note: {order.notes}
                  </span>
               )}
            </div>

          </div>
        ))}

        {orders.length === 0 && (
           <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Receipt className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="font-bold text-brand-dark text-lg">Belum ada tagihan</h3>
              <p className="text-gray-400 text-sm mt-2">Order yang dibuat oleh admin akan muncul di sini.</p>
           </div>
        )}
      </div>

    </div>
  )
}

// Sub-komponen Badge Status agar lebih rapi
function StatusBadge({ status }: { status: string }) {
   switch (status) {
      case 'paid':
         return (
            <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
               <CheckCircle2 className="w-3 h-3" /> Lunas
            </span>
         )
      case 'cancelled':
         return (
            <span className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-100">
               <XCircle className="w-3 h-3" /> Batal
            </span>
         )
      default:
         return (
            <span className="flex items-center gap-1.5 bg-brand-yellow/20 text-brand-dark px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-yellow/30">
               <Clock className="w-3 h-3" /> Menunggu Pembayaran
            </span>
         )
   }
}
import { createClient } from "@/lib/supabase/server"
import { CreditCard } from "lucide-react"
import CreateOrderForm from "./CreateOrderForm"
import OrderActions from "./OrderActions"
import ExportButton from "./ExportButton"

// Definisikan Tipe Data Order Lengkap (Hasil Join)
type OrderWithDetail = {
  id: string
  created_at: string
  amount: number
  status: string
  notes: string | null
  student_id: string
  class_id: string
  // Data dari relasi profiles (student)
  profiles: {
    full_name: string | null
    email: string
  } | null
  // Data dari relasi classes
  classes: {
    title: string
  } | null
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // 1. Ambil Data Order + Relasi
  const { data: rawOrders } = await supabase
    .from('orders')
    .select(`
      *,
      profiles:student_id ( full_name, email ),
      classes:class_id ( title )
    `)
    .order('created_at', { ascending: false })

  // Casting data agar sesuai tipe (Supabase return type kadang perlu ditegaskan)
  const orders = rawOrders as unknown as OrderWithDetail[]

  // 2. Data untuk Dropdown Form
  const { data: students } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'student')
  const { data: classes } = await supabase.from('classes').select('id, title, price')

  // Hitung Total Pendapatan
  const totalRevenue = orders
    ?.filter(o => o.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0) || 0

  return (
    <div className="space-y-6">
      
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-brand-dark">Keuangan & Order</h1>
          <p className="text-brand-gray text-sm">Kelola tagihan dan pembayaran student.</p>
        </div>
        
        {/* Card Revenue */}
        <div className="bg-brand-darkblue text-white p-6 rounded-3xl shadow-lg flex items-center gap-4 min-w-[300px]">
            <div className="p-3 bg-white/10 rounded-xl">
                <CreditCard className="w-6 h-6" />
            </div>
            <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">Total Pendapatan</p>
                <h3 className="font-heading font-bold text-2xl text-brand-yellow">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue)}
                </h3>
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
         {/* Tombol Export */}
         <ExportButton orders={orders} />
         
         <CreateOrderForm 
            students={students || []} 
            classes={classes || []} 
         />
      </div>

      {/* Tabel Orders */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream/50 text-brand-dark border-b border-brand-gray/10">
                <th className="p-6 font-heading font-bold text-sm">ID / Tanggal</th>
                <th className="p-6 font-heading font-bold text-sm">Student</th>
                <th className="p-6 font-heading font-bold text-sm">Kelas</th>
                <th className="p-6 font-heading font-bold text-sm">Nominal</th>
                <th className="p-6 font-heading font-bold text-sm text-right">Status & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* PERBAIKAN: Gunakan tipe OrderWithDetail di map */}
              {orders?.map((order: OrderWithDetail) => (
                <tr key={order.id} className="hover:bg-brand-cream/20 transition-colors">
                  <td className="p-6">
                    <div className="text-xs text-brand-gray mb-1">#{order.id.slice(0, 8)}</div>
                    <div className="font-bold text-brand-dark text-sm">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-bold text-brand-dark">{order.profiles?.full_name || "Student Dihapus"}</div>
                    <div className="text-xs text-brand-gray">{order.profiles?.email || "-"}</div>
                  </td>
                  <td className="p-6">
                    <span className="bg-brand-blue/10 text-brand-dark px-3 py-1 rounded-lg text-xs font-semibold">
                        {order.classes?.title || "Kelas Dihapus"}
                    </span>
                  </td>
                  <td className="p-6 font-heading font-bold text-brand-dark">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.amount)}
                    {order.notes && (
                        <div className="text-[10px] text-gray-400 mt-1 italic">Note: {order.notes}</div>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <OrderActions order={order} />
                  </td>
                </tr>
              ))}

              {(!orders || orders.length === 0) && (
                <tr>
                    <td colSpan={5} className="p-12 text-center text-brand-gray">Belum ada transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
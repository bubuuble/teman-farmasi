import AdminSidebar from '../../components/admin/Sidebar'
import AdminHeader from '../../components/admin/Header'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-cream flex font-sans">
      {/* Sidebar Fixed */}
      <AdminSidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        
        {/* Header Sticky */}
        <AdminHeader />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
        
      </div>
    </div>
  )
}
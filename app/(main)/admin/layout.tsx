import AdminSidebar from '../../components/admin/Sidebar'
import AdminHeader from '../../components/admin/Header'
import { AdminProvider } from '../../components/admin/AdminProvider'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-brand-cream flex font-sans">
        {/* Sidebar Collapsible */}
        <AdminSidebar />

        {/* Main Content Wrapper */}
        <div className="flex-1 ml-0 lg:ml-64 flex flex-col min-h-screen">
          
          {/* Header Sticky */}
          <AdminHeader />

          {/* Dynamic Page Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
          
        </div>
      </div>
    </AdminProvider>
  )
}
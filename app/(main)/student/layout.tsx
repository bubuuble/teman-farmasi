import StudentSidebar from '../../components/student/Sidebar'
import StudentHeader from '../../components/student/Header'

export const dynamic = 'force-dynamic'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-cream flex font-sans">
      {/* Sidebar Fixed */}
      <StudentSidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        
        {/* Header Sticky */}
        <StudentHeader />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  )
}
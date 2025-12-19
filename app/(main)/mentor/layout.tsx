import MentorSidebar from '../../components/mentors/Sidebar'
import MentorHeader from '../../components/mentors/Header'

export const dynamic = 'force-dynamic'

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-cream flex font-sans">
      {/* Sidebar Fixed */}
      <MentorSidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        
        {/* Header Sticky */}
        <MentorHeader />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
        
      </div>
    </div>
  )
}
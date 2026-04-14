import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllMentors } from '@/lib/sanity-queries';
import PageWithSpinner from "../components/PageWithSpinner";
import MentorsGrid from './MentorsGrid';
export const revalidate = 60; // Revalidate setiap 60 detik

export default async function MentorsPage() {
  return (
    <PageWithSpinner>
      <MentorsContent />
    </PageWithSpinner>
  );
}

async function MentorsContent() {
  const allMentors = await getAllMentors();
  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      {/* Header */}
      <div className="pt-40 pb-16 px-6 text-center max-w-3xl mx-auto">
         <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-4">
            Kenali Para Ahli Kami
         </h1>
         <p className="text-gray-500 text-lg">
            Belajar dari apoteker dan peneliti berpengalaman yang berdedikasi untuk kesuksesan Anda.
         </p>
      </div>

      {/* Mentor Cards with Modal */}
      <MentorsGrid mentors={allMentors} />

      <Footer />
    </main>
  );
}
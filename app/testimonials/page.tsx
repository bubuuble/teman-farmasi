import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";
import PageWithSpinner from "../components/PageWithSpinner";
import { getAllTestimonials } from '@/lib/sanity-queries';

export const revalidate = 60;

export default async function TestimonialsPage() {
  return (
    <PageWithSpinner>
      <TestimonialsContent />
    </PageWithSpinner>
  );
}

async function TestimonialsContent() {
  const testimonials = await getAllTestimonials();

  return (
    <main className="min-h-screen bg-brand-cream">
      <Navbar />
      
      {/* Header Halaman */}
      <div className="pt-40 pb-16 px-6 text-center max-w-4xl mx-auto">
         <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-dark mb-4">
            Kisah Sukses Mahasiswa
         </h1>
         <p className="text-gray-500 text-lg">
            Bukti nyata dari teman-teman yang telah berhasil menyelesaikan riset dan publikasi bersama kami.
         </p>
         <div className="w-24 h-1.5 bg-brand-yellow mx-auto mt-8 rounded-full"></div>
      </div>

      {/* Konten Utama */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        {/* PENTING: Gunakan isFullPage agar menjadi grid dan tidak miring-miring */}
        <Testimonials testimonials={testimonials} isFullPage={true} />
      </section>

      <Footer />
    </main>
  );
}
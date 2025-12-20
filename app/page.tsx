import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Programs from "./components/Programs";
import Mentors from "./components/Mentors";
import Testimonials from "./components/Testimonials";
import Blog from "./components/Blog";
import Footer from "./components/Footer";
import Link from "next/link";
import { FaArrowRight, FaWhatsapp } from "react-icons/fa";
import {
  getFeaturedBlogPosts,
  getFeaturedPrograms,
  getFeaturedMentors,
  getFeaturedTestimonials,
  getHeroContent,
} from "@/lib/sanity-queries";

export const revalidate = 60; // Revalidate setiap 60 detik

export default async function Home() {
  // Fetch featured content for homepage
  const [
    heroContent,
    featuredPrograms,
    featuredMentors,
    featuredTestimonials,
    featuredBlogs,
  ] = await Promise.all([
    getHeroContent(),
    getFeaturedPrograms(),
    getFeaturedMentors(),
    getFeaturedTestimonials(),
    getFeaturedBlogPosts(),
  ]);

  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-pink selection:text-brand-dark">
      <Navbar />
      <Hero content={heroContent} />
      <Categories />

      {/* Programs Preview */}
      <div className="relative">
        <Programs programs={featuredPrograms} />
        {/* Button: Pink */}
        <div className="text-center pb-12 -mt-4 relative z-10">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 bg-brand-pink text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-lg"
          >
            Lihat Semua Program <FaArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Mentors Preview */}
      <div className="relative border-t border-brand-pink/10">
        <Mentors mentors={featuredMentors} />
        {/* Button: Yellow Outline */}
        <div className="text-center pb-12 -mt-16 relative z-10">
          <Link
            href="/mentors"
            className="inline-flex items-center gap-2 border-2 border-brand-yellow text-brand-dark px-8 py-3 rounded-full font-bold text-sm hover:bg-brand-yellow hover:text-white transition-all"
          >
            Kenali Semua Mentor <FaArrowRight size={12} />
          </Link>
        </div>
      </div>

      <Testimonials testimonials={featuredTestimonials} />

      {/* Blog Preview */}
      <div className="relative">
        <Blog posts={featuredBlogs} />
        {/* Button: Text Link with Pink Hover */}
        <div className="text-center pb-20 -mt-16 relative z-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand-dark font-bold border-b-2 border-brand-dark hover:text-brand-pink hover:border-brand-pink transition-colors"
          >
            Baca Lebih Banyak Cerita <FaArrowRight size={12} />
          </Link>
        </div>

        {/* WhatsApp CTA Section */}
        <section className="text-darkblue py-16 px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap untuk Belajar?</h2>
          <p className="text-lg mb-8 opacity-90">
            Bergabung dengan ribuan pelajar lainnya dan mulai perjalanan
            pembelajaran Anda
          </p>
            <div className="bg-brand-pink p-8 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all duration-300 group inline-block">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-dark text-2xl mb-2 shadow-sm group-hover:scale-110 transition-transform">
              <FaWhatsapp />
            </div>
            <h3 className="font-bold text-2xl text-brand-dark mb-2">
              Chat via WhatsApp
            </h3>
            <p className="text-brand-dark/80 mb-6">
              Respons tercepat untuk pertanyaan cepat tentang pendaftaran.
            </p>
            <a
              href="https://wa.me/your-number"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-brand-dark px-6 py-3 rounded-full font-bold text-sm hover:bg-brand-dark hover:text-white transition-all shadow-md"
            >
              Chat Sekarang
            </a>
            </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

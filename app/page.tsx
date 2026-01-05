// app/page.tsx

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Mentors from "./components/Mentors";
import Testimonials from "./components/Testimonials";
import Blog from "./components/Blog";
import Footer from "./components/Footer";
import Link from "next/link";

// Optimasi Ikon
import { FaArrowRight, FaWhatsapp, FaGraduationCap, FaFlask, FaPenNib } from "react-icons/fa6";

import {
  getFeaturedBlogPosts,
  getFeaturedMentors,
  getFeaturedTestimonials,
  getHeroContent,
} from "@/lib/sanity-queries";

export const revalidate = 60; // Revalidate setiap 60 detik

export default async function Home() {
  // Fetch data secara paralel untuk performa maksimal
  const [
    heroContent,
    featuredMentors,
    featuredTestimonials,
    featuredBlogs,
  ] = await Promise.all([
    getHeroContent(),
    getFeaturedMentors(),
    getFeaturedTestimonials(),
    getFeaturedBlogPosts(),
  ]);

  return (
    <main className="min-h-screen bg-brand-cream selection:bg-brand-pink selection:text-white">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <Hero content={heroContent} />
      
      {/* 2. CATEGORIES SECTION */}
      <Categories />

      {/* 3. 3 PILAR PROGRAM UTAMA (REDESIGN) */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-brand-dark mb-4 tracking-tighter">
             Bimbingan Spesialisasi <span className="text-brand-pink underline decoration-brand-yellow/50 underline-offset-8">Eksklusif</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
             Ekosistem riset dan akademik terlengkap yang dirancang khusus untuk mahasiswa farmasi di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           
           {/* PILAR 1: PHARMACORE */}
           <div className="bg-brand-yellow rounded-[3rem] p-10 shadow-sm border border-brand-yellow/30 flex flex-col hover:shadow-2xl transition-all group hover:-translate-y-2 duration-500">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-inner text-brand-dark group-hover:bg-brand-darkblue group-hover:text-white transition-colors duration-500">
                 <FaGraduationCap size={32} />
              </div>
              <h3 className="font-heading font-bold text-3xl text-brand-dark mb-4 tracking-tighter uppercase leading-tight">
                PharmaCore <br/> Class
              </h3>
              <p className="text-brand-dark/70 font-bold text-sm mb-8 flex-1 leading-relaxed">
                 Kelas pendampingan Mata Kuliah Farmasi (Basic Science, Chemistry, Pharmaceutics, dll) berbasis blok.
              </p>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-dark/5">
                 <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Mulai Dari</p>
                 <div className="flex justify-between items-end">
                    <p className="text-xl font-extrabold text-brand-dark leading-none">Rp 99.900</p>
                    <Link href="/programs?cat=pharmacore" className="p-3 bg-brand-dark text-white rounded-xl hover:bg-brand-pink transition-all shadow-md active:scale-95">
                       <FaArrowRight size={14} />
                    </Link>
                 </div>
              </div>
           </div>

           {/* PILAR 2: PHARMAPUBLISH */}
           <div className="bg-brand-darkblue rounded-[3rem] p-10 shadow-sm border border-white/10 flex flex-col hover:shadow-2xl transition-all group hover:-translate-y-2 duration-500 text-white relative overflow-hidden">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner text-brand-yellow group-hover:bg-brand-yellow group-hover:text-brand-dark transition-colors duration-500">
                 <FaPenNib size={32} />
              </div>
              <h3 className="font-heading font-bold text-3xl mb-4 tracking-tighter uppercase leading-tight text-brand-yellow">
                PharmaPublish <br/> Academy
              </h3>
              <p className="text-white/60 font-bold text-sm mb-8 flex-1 leading-relaxed">
                 Persiapan manuskrip jurnal untuk publikasi ilmiah farmasi tingkat nasional (SINTA) maupun internasional.
              </p>
              <div className="bg-white rounded-3xl p-6 shadow-sm relative z-10">
                 <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Mulai Dari</p>
                 <div className="flex justify-between items-end">
                    <p className="text-xl font-extrabold text-brand-dark leading-none">Rp. 300.000</p>
                    <Link href="/programs?cat=publish" className="p-3 bg-brand-darkblue text-white rounded-xl hover:bg-brand-pink transition-all shadow-md active:scale-95">
                       <FaArrowRight size={14} />
                    </Link>
                 </div>
              </div>
           </div>

           {/* PILAR 3: PHARMA RESEARCH */}
           <div className="bg-brand-pink rounded-[3rem] p-10 shadow-sm border border-brand-pink/30 flex flex-col hover:shadow-2xl transition-all group hover:-translate-y-2 duration-500 text-white relative overflow-hidden">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-inner text-white group-hover:bg-white group-hover:text-brand-pink transition-colors duration-500">
                 <FaFlask size={32} />
              </div>
              <h3 className="font-heading font-bold text-3xl mb-4 tracking-tighter uppercase leading-tight relative z-10">
                Pharma Research <br/> Mentoring
              </h3>
              <p className="text-white/80 font-bold text-sm mb-8 flex-1 leading-relaxed relative z-10">
                 Bimbingan privat riset & skripsi dari penentuan judul, outline, analisis data hingga simulasi sidang.
              </p>
              <div className="bg-white rounded-3xl p-6 shadow-sm relative z-10">
                 <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Mulai Dari</p>
                 <div className="flex justify-between items-end">
                    <p className="text-xl font-extrabold text-brand-dark leading-none">Rp. 165.000</p>
                    <Link href="/programs?cat=research" className="p-3 bg-brand-pink text-white rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand-pink/30 active:scale-95">
                       <FaArrowRight size={14} />
                    </Link>
                 </div>
              </div>
              <div className="absolute right-[-20%] top-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
           </div>

        </div>

        {/* Bandingkan Button */}
        <div className="text-center mt-16">
          <Link
            href="/programs?cat=pharmacore"
            className="inline-flex items-center gap-3 bg-white border-2 border-brand-dark text-brand-dark px-10 py-4 rounded-full font-extrabold text-sm hover:bg-brand-dark hover:text-white transition-all shadow-md active:scale-95"
          >
            Pelajari Lebih Lanjut <FaArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 4. MENTORS PREVIEW */}
      <div className="relative border-t border-brand-pink/5">
        <Mentors mentors={featuredMentors} />
        <div className="text-center pb-24 -mt-16 relative z-10">
          <Link
            href="/mentors"
            className="inline-flex items-center gap-2 border-2 border-brand-yellow text-brand-dark px-8 py-3 rounded-full font-extrabold text-sm hover:bg-brand-yellow hover:text-white transition-all shadow-sm active:scale-95"
          >
            Kenali Tim Mentor Ahli <FaArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* 5. TESTIMONIALS (WITH BRIDGING) */}
      <section className="py-24 bg-brand-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Bridging Section */}
          <div className="text-center mb-10">
            <h3 className="text-brand-pink font-bold text-sm tracking-[0.2em] uppercase mb-4">
              Real Chat, Real Results
            </h3>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-dark max-w-2xl mx-auto leading-tight">
              Bukan Sekadar Testimoni, Tapi <br/> 
              <span className="text-brand-darkblue">Bukti Obrolan Asli Mahasiswa</span>
            </h2>
            <div className="w-20 h-1.5 bg-brand-yellow mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Testimonials dalam bentuk Bukit */}
          <div className="relative">
            {/* Background Light Glow untuk efek fokus pada bukit */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-64 bg-brand-yellow/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <Testimonials testimonials={featuredTestimonials} isFullPage={false} />
          </div>

          <div className="text-center">
            <Link
              href="/testimonials"
              className="inline-flex items-center gap-2 text-brand-dark/50 hover:text-brand-pink font-bold text-sm transition-all group"
            >
              Lihat Obrolan sukses lainnya 
              <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. WHATSAPP CTA (REDESIGN MEWAH) */}
      <section className="py-24 px-6 bg-brand-cream">
        <div className="max-w-5xl mx-auto bg-brand-pink rounded-[4rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-12">
            <div className="relative z-10 flex-1 text-center md:text-left">
                <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/10">
                  Konsultasi Pendaftaran
                </span>
                <h2 className="font-heading text-4xl md:text-6xl font-extrabold mb-6 tracking-tighter leading-tight">
                  Tanya Dulu <br/> Biar <span className="text-brand-yellow">Yakin!</span>
                </h2>
                <p className="text-white/80 text-lg font-bold mb-10 leading-relaxed">
                  Bingung pilih paket yang mana? Chat Admin untuk konsultasi gratis mengenai topik riset Anda hari ini.
                </p>
                <a
                  href="https://wa.me/6288955876210"
                  target="_blank"
                  className="inline-flex items-center gap-4 bg-white text-brand-dark px-12 py-5 rounded-[2rem] font-extrabold text-xl hover:bg-brand-darkblue hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95 transform"
                >
                  <FaWhatsapp size={28} className="text-green-500" /> Chat Sekarang
                </a>
            </div>
            
            {/* Visual Decoration */}
            <div className="relative shrink-0 hidden md:block">
              <div className="w-64 h-64 bg-white/10 rounded-[4rem] rotate-12 flex items-center justify-center border border-white/20 shadow-inner">
                 <FaWhatsapp size={140} className="opacity-20 text-white" />
              </div>
              <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-brand-yellow/20 rounded-full blur-2xl"></div>
            </div>
            
            <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      <Footer />
    </main>
  );
}